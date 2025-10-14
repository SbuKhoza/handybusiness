import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../firebase/config"

/**
 * Detects tenant ID from the current domain or subdomain
 * Priority:
 * 1. Custom domain mapping (e.g., clientbusiness.com -> tenantId)
 * 2. Subdomain extraction (e.g., client1.myapp.com -> client1)
 * 3. Localhost fallback for development
 */
export async function detectTenantId() {
  const hostname = window.location.hostname

  // Development fallback - check localStorage for testing
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    const devTenantId = localStorage.getItem("dev_tenant_id")
    if (devTenantId) {
      console.log("[v0] Using development tenant ID from localStorage:", devTenantId)
      return devTenantId
    }
    // Prompt user to set tenant ID for local development
    const tenantId = prompt("Enter tenant ID for local development:")
    if (tenantId) {
      localStorage.setItem("dev_tenant_id", tenantId)
      return tenantId
    }
    throw new Error("No tenant ID provided for local development")
  }

  // Try to find custom domain mapping in Firestore
  try {
    const domainsQuery = query(collection(db, "domains"), where("domain", "==", hostname))
    const domainsSnapshot = await getDocs(domainsQuery)

    if (!domainsSnapshot.empty) {
      const domainDoc = domainsSnapshot.docs[0]
      const tenantId = domainDoc.data().tenantId
      console.log("[v0] Found tenant ID from custom domain:", tenantId)
      return tenantId
    }
  } catch (error) {
    console.error("[v0] Error checking custom domain mapping:", error)
  }

  // Extract from subdomain (e.g., client1.myapp.com -> client1)
  const parts = hostname.split(".")
  if (parts.length >= 3) {
    const subdomain = parts[0]
    // Verify this tenant exists
    try {
      const tenantDoc = await getDoc(doc(db, "tenants", subdomain))
      if (tenantDoc.exists()) {
        console.log("[v0] Found tenant ID from subdomain:", subdomain)
        return subdomain
      }
    } catch (error) {
      console.error("[v0] Error verifying subdomain tenant:", error)
    }
  }

  throw new Error(`Unable to detect tenant ID from domain: ${hostname}`)
}

/**
 * Validates that a tenant exists and is active
 */
export async function validateTenant(tenantId) {
  try {
    const tenantDoc = await getDoc(doc(db, "tenants", tenantId))
    if (!tenantDoc.exists()) {
      throw new Error(`Tenant ${tenantId} does not exist`)
    }

    const tenantData = tenantDoc.data()
    if (tenantData.status === "inactive") {
      throw new Error(`Tenant ${tenantId} is inactive`)
    }

    return tenantData
  } catch (error) {
    console.error("[v0] Error validating tenant:", error)
    throw error
  }
}
