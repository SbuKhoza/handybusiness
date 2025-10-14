# Multi-Tenant Template Deployment Guide

This template automatically detects which tenant's data to display based on the domain or subdomain. No environment variables are needed.

## Deployment Options

### Option 1: Custom Domain (Recommended for Production)

1. Deploy your template app to your hosting provider (Vercel, Netlify, etc.)
2. In the CMS Superadmin Dashboard, create a tenant and specify their custom domain (e.g., `clientbusiness.com`)
3. Point the client's domain DNS to your deployed app
4. The app will automatically detect the tenant from the domain

**Example:**
- Client domain: `clientbusiness.com`
- Tenant ID in Firestore: `abc123`
- Domain mapping in Firestore: `domains/clientbusiness.com` → `{ tenantId: "abc123" }`

### Option 2: Subdomain

1. Deploy your template app to your hosting provider
2. Create a wildcard subdomain DNS record (e.g., `*.yourdomain.com`)
3. Use the tenant ID as the subdomain (e.g., `abc123.yourdomain.com`)
4. The app will automatically extract the tenant ID from the subdomain

**Example:**
- Subdomain: `abc123.yourdomain.com`
- Tenant ID: `abc123`

### Option 3: Local Development

1. Run the template app locally (`npm run dev`)
2. On first load, you'll be prompted to enter a tenant ID
3. The tenant ID is saved in localStorage for subsequent visits
4. To switch tenants, clear localStorage or enter a new ID when prompted

**Testing different tenants:**
\`\`\`javascript
// In browser console
localStorage.setItem('dev_tenant_id', 'your-tenant-id-here')
// Refresh the page
\`\`\`

## Firestore Structure

The system uses the following Firestore structure:

\`\`\`
tenants/
  {tenantId}/
    - businessName, email, phone, address, customDomain
    data/
      - homepage, logo, navbarColors, servicesHeader
    services/
      {serviceId}/
        - title, description, etc.

domains/
  {domain}/
    - tenantId, domain, createdAt
\`\`\`

## How It Works

1. **Domain Detection**: The app reads `window.location.hostname`
2. **Custom Domain Lookup**: Checks Firestore `domains` collection for a matching domain
3. **Subdomain Extraction**: If no custom domain found, extracts tenant ID from subdomain
4. **Tenant Validation**: Verifies the tenant exists and is active
5. **Data Loading**: All components read from the detected tenant's Firestore path

## Security Notes

- Each tenant's data is completely isolated in Firestore
- Use Firestore Security Rules to enforce tenant isolation
- The tenant ID is read-only once detected from the domain
- Custom domains are validated against Firestore before use
