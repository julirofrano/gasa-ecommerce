import type { OdooRPCResponse, OdooAuthResponse } from "./types";

export class OdooConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OdooConnectionError";
  }
}

export class OdooClient {
  private url: string;
  private db: string;
  private username: string;
  private password: string;
  private uid: number | null = null;
  private companyId: number | null = null;
  private requestId = 0;

  constructor() {
    this.url = process.env.ODOO_URL || "";
    this.db = process.env.ODOO_DB || "";
    this.username = process.env.ODOO_USERNAME || "";
    this.password = process.env.ODOO_PASSWORD || "";

    if (!this.url || !this.db || !this.username || !this.password) {
      throw new Error(
        "Odoo configuration missing. Check ODOO_URL, ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD environment variables.",
      );
    }
  }

  async authenticate(): Promise<OdooAuthResponse> {
    const response = await this.safeFetch(
      `${this.url}/web/session/authenticate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "call",
          params: {
            db: this.db,
            login: this.username,
            password: this.password,
          },
          id: this.getNextId(),
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Odoo authentication failed: ${response.statusText}`);
    }

    const data: OdooRPCResponse<OdooAuthResponse> = await response.json();

    if (data.error) {
      const detail =
        data.error.data?.message || data.error.message || "Unknown error";
      throw new Error(`Odoo authentication error: ${detail}`);
    }

    if (!data.result || !data.result.uid) {
      throw new Error("Odoo authentication failed: invalid credentials");
    }

    this.uid = data.result.uid;
    this.companyId = data.result.company_id;
    return data.result;
  }

  async getCompanyId(): Promise<number> {
    if (!this.companyId) {
      await this.authenticate();
    }
    return this.companyId!;
  }

  /**
   * Execute an RPC call via the /jsonrpc endpoint (execute_kw).
   * Works on all Odoo versions including 19.
   */
  async call<T = unknown>(
    model: string,
    method: string,
    args: unknown[] = [],
    kwargs: Record<string, unknown> = {},
  ): Promise<T> {
    if (!this.uid) {
      await this.authenticate();
    }

    const { context: extraContext, ...restKwargs } = kwargs;
    const mergedContext = {
      lang: "es_AR",
      tz: "America/Argentina/Buenos_Aires",
      ...(extraContext as Record<string, unknown> | undefined),
    };

    const response = await this.safeFetch(`${this.url}/jsonrpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "call",
        params: {
          service: "object",
          method: "execute_kw",
          args: [
            this.db,
            this.uid,
            this.password,
            model,
            method,
            args,
            {
              context: mergedContext,
              ...restKwargs,
            },
          ],
        },
        id: this.getNextId(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Odoo RPC call failed: ${response.statusText}`);
    }

    const data: OdooRPCResponse<T> = await response.json();

    if (data.error) {
      const detail =
        data.error.data?.message || data.error.message || "Unknown error";
      // Re-authenticate on session/access errors
      if (data.error.code === 100 || detail.toLowerCase().includes("session")) {
        this.uid = null;
        await this.authenticate();
        return this.call<T>(model, method, args, kwargs);
      }
      throw new Error(`Odoo RPC error: ${detail}`);
    }

    if (data.result === undefined) {
      throw new Error("Odoo RPC returned no result");
    }

    return data.result;
  }

  async search(
    model: string,
    domain: unknown[] = [],
    limit?: number,
    offset?: number,
    order?: string,
  ): Promise<number[]> {
    return this.call<number[]>(model, "search", [domain], {
      limit,
      offset,
      order,
    });
  }

  async read<T = unknown>(
    model: string,
    ids: number[],
    fields?: string[],
  ): Promise<T[]> {
    return this.call<T[]>(model, "read", [ids], { fields });
  }

  async searchRead<T = unknown>(
    model: string,
    domain: unknown[] = [],
    fields?: string[],
    limit?: number,
    offset?: number,
    order?: string,
  ): Promise<T[]> {
    return this.call<T[]>(model, "search_read", [domain], {
      fields,
      limit,
      offset,
      order,
    });
  }

  async create(
    model: string,
    values: Record<string, unknown>,
  ): Promise<number> {
    return this.call<number>(model, "create", [values]);
  }

  async write(
    model: string,
    ids: number[],
    values: Record<string, unknown>,
  ): Promise<boolean> {
    return this.call<boolean>(model, "write", [ids, values]);
  }

  async unlink(model: string, ids: number[]): Promise<boolean> {
    return this.call<boolean>(model, "unlink", [ids]);
  }

  /**
   * Fetch a PDF report from Odoo's report controller.
   * Authenticates a web session, then GETs /report/pdf/<reportName>/<recordId>.
   */
  async fetchReportPdf(
    reportName: string,
    recordId: number,
  ): Promise<ArrayBuffer> {
    // Authenticate to obtain a session cookie
    const authRes = await this.safeFetch(
      `${this.url}/web/session/authenticate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "call",
          params: {
            db: this.db,
            login: this.username,
            password: this.password,
          },
          id: this.getNextId(),
        }),
      },
    );

    if (!authRes.ok) {
      throw new Error(`Odoo auth for report failed: ${authRes.statusText}`);
    }

    const sessionCookie = authRes.headers
      .getSetCookie()
      .find((c) => c.startsWith("session_id="));

    if (!sessionCookie) {
      throw new Error("No session cookie received from Odoo");
    }

    const pdfRes = await this.safeFetch(
      `${this.url}/report/pdf/${reportName}/${recordId}`,
      { headers: { Cookie: sessionCookie } },
    );

    if (!pdfRes.ok) {
      throw new Error(`Odoo report download failed: ${pdfRes.statusText}`);
    }

    return pdfRes.arrayBuffer();
  }

  private async safeFetch(url: string, init: RequestInit): Promise<Response> {
    try {
      return await fetch(url, init);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new OdooConnectionError(
        `No se pudo conectar con Odoo (${this.url}): ${message}`,
      );
    }
  }

  private getNextId(): number {
    return ++this.requestId;
  }
}

export const odooClient = new OdooClient();
