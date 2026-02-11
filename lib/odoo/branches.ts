import { odooClient } from "./client";
import type { OdooCompany } from "./types";
import type { Branch } from "@/types";

const COMPANY_FIELDS = [
  "id",
  "name",
  "street",
  "city",
  "state_id",
  "zip",
  "phone",
] as const;

function mapOdooCompanyToBranch(company: OdooCompany): Branch {
  return {
    id: company.id,
    name: company.name,
    address: company.street || "",
    city: company.city || "",
    state: company.state_id ? company.state_id[1] : "",
    zipCode: company.zip || "",
    phone: company.phone || "",
  };
}

export async function getBranches(): Promise<Branch[]> {
  const companies = await odooClient.searchRead<OdooCompany>(
    "res.company",
    [],
    [...COMPANY_FIELDS],
  );
  return companies.map(mapOdooCompanyToBranch);
}

export async function getBranchById(id: number): Promise<Branch | null> {
  const results = await odooClient.read<OdooCompany>(
    "res.company",
    [id],
    [...COMPANY_FIELDS],
  );
  if (!results.length) return null;
  return mapOdooCompanyToBranch(results[0]);
}
