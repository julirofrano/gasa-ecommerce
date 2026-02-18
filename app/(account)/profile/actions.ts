"use server";

import { revalidatePath } from "next/cache";
import { getRequiredSession, getCommercialPartnerId } from "@/lib/auth/session";
import {
  getPartner,
  createPartnerAddress,
  createCompanyContact,
  updatePartner,
  deletePartnerAddress,
} from "@/lib/odoo/partners";
import type { OdooPartner } from "@/lib/odoo/types";
import { verifyPartnerPassword, setPartnerPassword } from "@/lib/odoo/portal";

interface AddressData {
  name: string;
  street: string;
  street2?: string;
  city: string;
  zip: string;
  phone?: string;
  state?: string;
}

/** Resolve the company ID for the current user */
async function getCompanyId(): Promise<number> {
  const session = await getRequiredSession();
  return getCommercialPartnerId(session);
}

/** Verify an address belongs to the user's company */
async function verifyOwnership(
  addressId: number,
  companyId: number,
): Promise<OdooPartner> {
  const address = await getPartner(addressId);
  if (!address || address.parent_id?.[0] !== companyId) {
    throw new Error("Dirección no encontrada o no autorizada.");
  }
  return address;
}

export async function createContact(data: {
  name: string;
  function?: string;
  email?: string;
  phone?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const companyId = await getCompanyId();
    await createCompanyContact(companyId, data);
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al crear el contacto.",
    };
  }
}

export async function updateContact(
  contactId: number,
  data: {
    name: string;
    function?: string;
    email?: string;
    phone?: string;
  },
): Promise<{ success: boolean; error?: string }> {
  try {
    const companyId = await getCompanyId();
    await verifyOwnership(contactId, companyId);
    await updatePartner(contactId, {
      name: data.name,
      function: data.function || "",
      email: data.email || "",
      phone: data.phone || "",
    });
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al actualizar el contacto.",
    };
  }
}

export async function createAddress(
  type: "delivery" | "invoice",
  data: AddressData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const companyId = await getCompanyId();
    await createPartnerAddress(companyId, type, {
      name: data.name,
      street: data.street,
      street2: data.street2,
      city: data.city,
      zip: data.zip,
      phone: data.phone,
    });
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al crear la dirección.",
    };
  }
}

export async function updateAddress(
  addressId: number,
  data: AddressData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const companyId = await getCompanyId();
    await verifyOwnership(addressId, companyId);
    await updatePartner(addressId, {
      name: data.name,
      street: data.street,
      street2: data.street2,
      city: data.city,
      zip: data.zip,
      phone: data.phone,
    });
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al actualizar la dirección.",
    };
  }
}

/** Duplicate an address as the other type (keeps the original) */
export async function convertAddressType(
  addressId: number,
  newType: "delivery" | "invoice",
): Promise<{ success: boolean; error?: string }> {
  try {
    const companyId = await getCompanyId();
    const address = await verifyOwnership(addressId, companyId);
    await createPartnerAddress(companyId, newType, {
      name: address.name,
      street: address.street || "",
      street2: address.street2,
      city: address.city || "",
      zip: address.zip || "",
      phone: address.phone,
      stateId: address.state_id?.[0],
      countryId: address.country_id?.[0],
    });
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al duplicar la dirección.",
    };
  }
}

/** Copy the address fields to the parent partner (Dirección Principal) */
export async function setMainAddress(
  addressId: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const companyId = await getCompanyId();
    const address = await verifyOwnership(addressId, companyId);
    await updatePartner(companyId, {
      street: address.street || "",
      street2: address.street2 || "",
      city: address.city || "",
      zip: address.zip || "",
      phone: address.phone || "",
      state_id: address.state_id?.[0] || false,
      country_id: address.country_id?.[0] || false,
    });
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al establecer dirección principal.",
    };
  }
}

export async function deleteAddress(
  addressId: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const companyId = await getCompanyId();
    await verifyOwnership(addressId, companyId);
    await deletePartnerAddress(addressId);
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al eliminar la dirección.",
    };
  }
}

export async function updatePassword(
  currentPassword: string | null,
  newPassword: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (newPassword.length < 8) {
      return {
        success: false,
        error: "La contraseña debe tener al menos 8 caracteres.",
      };
    }

    const session = await getRequiredSession();

    // Verify current password if provided
    if (currentPassword) {
      const verified = await verifyPartnerPassword(
        session.user.partnerId,
        currentPassword,
      );
      if (!verified) {
        return {
          success: false,
          error: "La contraseña actual es incorrecta.",
        };
      }
    }

    await setPartnerPassword(session.user.partnerId, newPassword);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al actualizar la contraseña.",
    };
  }
}
