const DEFAULT_TENANT_SLUG = import.meta.env.VITE_DEFAULT_TENANT_SLUG || 'mubis-demo';

const cleanValue = (value) => String(value ?? '').trim();

const normalizeText = (value) =>
  cleanValue(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const normalizeToken = (value) => normalizeText(value).replace(/[^a-z0-9]/g, '');

const uniqueValues = (values) => [...new Set(values.filter(Boolean))];

const getTenantSlug = (tenant) =>
  cleanValue(tenant?.slug || tenant?.tenantSlug || tenant?.id);

const getEmailDomain = (email) => {
  const [, domain = ''] = cleanValue(email).toLowerCase().split('@');
  return domain;
};

const getEmailDomainRoot = (email) => {
  const domain = getEmailDomain(email);
  return domain.split('.').filter(Boolean)[0] || '';
};

const getTenantTerms = (tenant) =>
  uniqueValues([
    tenant?.slug,
    tenant?.tenantSlug,
    tenant?.name,
    tenant?.displayName,
    tenant?.company,
    tenant?.companyName,
    tenant?.domain,
    tenant?.host,
    tenant?.hostname,
    ...(Array.isArray(tenant?.domains) ? tenant.domains : []),
    ...(Array.isArray(tenant?.emailDomains) ? tenant.emailDomains : []),
    ...(Array.isArray(tenant?.allowedDomains) ? tenant.allowedDomains : []),
  ]);

const findTenantByEmail = (tenants, email) => {
  const domain = normalizeText(getEmailDomain(email));
  const domainRoot = normalizeToken(getEmailDomainRoot(email));

  if (!domain && !domainRoot) {
    return '';
  }

  const matches = tenants.filter((tenant) => {
    const terms = getTenantTerms(tenant);

    return terms.some((term) => {
      const normalizedTerm = normalizeText(term);
      const normalizedToken = normalizeToken(term);

      if (domain && (normalizedTerm === domain || normalizedTerm.endsWith(`.${domain}`))) {
        return true;
      }

      if (domainRoot && (normalizedToken === domainRoot || normalizedToken.includes(domainRoot))) {
        return true;
      }

      return false;
    });
  });

  return matches.length === 1 ? getTenantSlug(matches[0]) : '';
};

const findDefaultTenant = (tenants) => {
  const tenant = tenants.find((item) => item?.isDefault || item?.default || item?.is_default);
  return tenant ? getTenantSlug(tenant) : '';
};

export const resolveTenantSlug = ({ selectedTenantSlug, tenants = [], email } = {}) => {
  const explicitTenant = cleanValue(selectedTenantSlug);
  if (explicitTenant) {
    return explicitTenant;
  }

  if (tenants.length === 1) {
    return getTenantSlug(tenants[0]);
  }

  const emailTenant = findTenantByEmail(tenants, email);
  if (emailTenant) {
    return emailTenant;
  }

  const defaultTenant = findDefaultTenant(tenants);
  if (defaultTenant) {
    return defaultTenant;
  }

  if (tenants.length > 0) {
    return getTenantSlug(tenants[0]);
  }

  return cleanValue(DEFAULT_TENANT_SLUG);
};

export { DEFAULT_TENANT_SLUG };
