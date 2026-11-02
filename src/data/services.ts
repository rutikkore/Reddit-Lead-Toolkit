// ---------------------------------------------------------------------------
// NoLegalPaisa Service Catalog — structured TypeScript data
//
// Source of truth: docs/SERVICE_CATALOG.md
// Do NOT add or remove services without updating that document first.
// To extend a service (add keywords, description, etc.) edit only this file.
// Application logic must remain decoupled from catalog content.
// ---------------------------------------------------------------------------

import type { ServiceCategory } from '../types'

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  // -------------------------------------------------------------------------
  // 1. Legal Services & Litigation
  // -------------------------------------------------------------------------
  {
    id: 'legal-services',
    name: 'Legal Services & Litigation',
    services: [
      {
        id: 'legal-notice',
        name: 'Legal Notice — Send/Reply',
        categoryId: 'legal-services',
        targetCustomers: ['Individual', 'MSME', 'Startup'],
        keywords: ['legal notice', 'send notice', 'received notice', 'reply to notice', 'lawyer notice'],
      },
      {
        id: 'legal-drafting',
        name: 'Legal Drafting & Agreements',
        categoryId: 'legal-services',
        targetCustomers: ['Individual', 'MSME', 'Startup'],
        keywords: ['draft agreement', 'contract drafting', 'legal document', 'MOU', 'NDA drafting'],
      },
      {
        id: 'legal-document-review',
        name: 'Legal Document Review',
        categoryId: 'legal-services',
        targetCustomers: ['Individual', 'MSME', 'Startup'],
        keywords: ['document review', 'review contract', 'check agreement', 'legal review'],
      },
      {
        id: 'file-defend-case',
        name: 'File or Defend a Case',
        categoryId: 'legal-services',
        targetCustomers: ['Individual', 'MSME'],
        keywords: ['file case', 'court case', 'civil suit', 'defend case', 'litigation'],
      },
      {
        id: 'consumer-complaint',
        name: 'Consumer Complaint',
        categoryId: 'legal-services',
        targetCustomers: ['Individual'],
        keywords: ['consumer complaint', 'consumer forum', 'consumer court', 'NCDRC', 'defective product complaint'],
      },
      {
        id: 'virtual-legal-counsel',
        name: 'Virtual Legal Counsel',
        categoryId: 'legal-services',
        targetCustomers: ['Individual', 'MSME', 'Startup'],
        keywords: ['virtual lawyer', 'online legal advice', 'legal consultation', 'ask a lawyer'],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 2. Business Incorporation & Entity Registration
  // -------------------------------------------------------------------------
  {
    id: 'business-incorporation',
    name: 'Business Incorporation & Entity Registration',
    services: [
      {
        id: 'private-limited-company',
        name: 'Incorporate a Private Limited Company',
        categoryId: 'business-incorporation',
        targetCustomers: ['Startup', 'MSME'],
        keywords: ['private limited company', 'pvt ltd registration', 'incorporate company', 'Pvt Ltd', 'company registration'],
      },
      {
        id: 'llp-registration',
        name: 'Register an LLP',
        categoryId: 'business-incorporation',
        targetCustomers: ['MSME', 'Startup'],
        keywords: ['LLP registration', 'limited liability partnership', 'register LLP', 'LLP India'],
      },
      {
        id: 'subsidiary-registration',
        name: 'Register a Subsidiary',
        categoryId: 'business-incorporation',
        targetCustomers: ['Startup', 'MSME'],
        keywords: ['subsidiary company', 'register subsidiary', 'wholly owned subsidiary', 'foreign subsidiary India'],
      },
      {
        id: 'producer-company',
        name: 'Register a Producer Company',
        categoryId: 'business-incorporation',
        targetCustomers: ['MSME'],
        keywords: ['producer company', 'farmer producer company', 'FPC registration'],
      },
      {
        id: 'opc-registration',
        name: 'Register a One Person Company (OPC)',
        categoryId: 'business-incorporation',
        targetCustomers: ['Individual'],
        keywords: ['OPC', 'one person company', 'single person company registration'],
      },
      {
        id: 'partnership-firm',
        name: 'Register a Partnership Firm',
        categoryId: 'business-incorporation',
        targetCustomers: ['MSME'],
        keywords: ['partnership firm', 'register partnership', 'partnership deed'],
      },
      {
        id: 'sole-proprietorship',
        name: 'Register a Sole Proprietorship',
        categoryId: 'business-incorporation',
        targetCustomers: ['Individual', 'MSME'],
        keywords: ['sole proprietorship', 'proprietorship registration', 'single owner business'],
      },
      {
        id: 'huf-registration',
        name: 'HUF Registration',
        categoryId: 'business-incorporation',
        targetCustomers: ['Individual'],
        keywords: ['HUF', 'Hindu undivided family', 'HUF tax', 'create HUF'],
      },
      {
        id: 'ngo-registration',
        name: 'NGO Registration',
        categoryId: 'business-incorporation',
        targetCustomers: ['Individual', 'MSME'],
        keywords: ['NGO registration', 'Section 8 company', 'trust registration', 'society registration', 'non-profit India'],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 3. Startup & Entrepreneurship Support
  // -------------------------------------------------------------------------
  {
    id: 'startup-support',
    name: 'Startup & Entrepreneurship Support',
    services: [
      {
        id: 'startup-registration',
        name: 'Register your Start-up',
        categoryId: 'startup-support',
        targetCustomers: ['Startup'],
        keywords: ['startup registration', 'DPIIT startup', 'register startup India'],
      },
      {
        id: 'startup-toolkit',
        name: 'Startup Toolkit',
        categoryId: 'startup-support',
        targetCustomers: ['Startup'],
        keywords: ['startup toolkit', 'startup legal documents', 'startup compliance checklist'],
      },
      {
        id: 'fundraising-support',
        name: 'Fundraising Support',
        categoryId: 'startup-support',
        targetCustomers: ['Startup'],
        keywords: ['fundraising', 'raise funding', 'angel investor', 'VC funding', 'term sheet', 'investor agreement'],
      },
      {
        id: 'startup-india-registration',
        name: 'Startup India Registration',
        categoryId: 'startup-support',
        targetCustomers: ['Startup'],
        keywords: ['Startup India', 'DPIIT recognition', 'startup India certificate'],
      },
      {
        id: 'founders-exit',
        name: "Founder's Exit",
        categoryId: 'startup-support',
        targetCustomers: ['Startup'],
        keywords: ["founder exit", 'co-founder dispute', 'exit from company', 'buyout founder shares'],
      },
      {
        id: 'startup-closure',
        name: 'Startup & Company Closure',
        categoryId: 'startup-support',
        targetCustomers: ['Startup', 'MSME'],
        keywords: ['close company', 'wind up company', 'strike off company', 'company closure'],
      },
      {
        id: 'digital-signature',
        name: 'Digital Signature',
        categoryId: 'startup-support',
        targetCustomers: ['Individual', 'MSME', 'Startup'],
        keywords: ['digital signature', 'DSC', 'e-signature', 'digital signature certificate'],
      },
      {
        id: 'website-development',
        name: 'Website Development',
        categoryId: 'startup-support',
        targetCustomers: ['Startup', 'MSME'],
        keywords: ['website development', 'build website for business', 'startup website'],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 4. Taxation, Accounting & Corporate Compliance
  // -------------------------------------------------------------------------
  {
    id: 'taxation-compliance',
    name: 'Taxation, Accounting & Corporate Compliance',
    services: [
      {
        id: 'itr-filing',
        name: 'Income Tax Return Filing',
        categoryId: 'taxation-compliance',
        targetCustomers: ['Individual', 'MSME', 'Startup'],
        keywords: ['ITR filing', 'income tax return', 'file ITR', 'tax return India', 'income tax'],
      },
      {
        id: 'tds-tcs-filing',
        name: 'TDS/TCS Return Filing',
        categoryId: 'taxation-compliance',
        targetCustomers: ['MSME', 'Startup'],
        keywords: ['TDS return', 'TCS return', 'TDS filing', 'Form 24Q', 'Form 26Q'],
      },
      {
        id: 'gst-registration',
        name: 'GST Registration',
        categoryId: 'taxation-compliance',
        targetCustomers: ['Individual', 'MSME', 'Startup'],
        keywords: ['GST registration', 'GSTIN', 'GST number', 'apply for GST', 'GST certificate'],
      },
      {
        id: 'gst-return-filing',
        name: 'GST Return Filing',
        categoryId: 'taxation-compliance',
        targetCustomers: ['MSME', 'Startup'],
        keywords: ['GST return', 'GSTR-1', 'GSTR-3B', 'file GST return', 'GST compliance'],
      },
      {
        id: 'annual-accounting',
        name: 'Annual Accounting Services',
        categoryId: 'taxation-compliance',
        targetCustomers: ['MSME', 'Startup'],
        keywords: ['bookkeeping', 'annual accounts', 'accounting services', 'balance sheet', 'P&L statement'],
      },
      {
        id: 'posh-compliance',
        name: 'POSH Compliance',
        categoryId: 'taxation-compliance',
        targetCustomers: ['MSME', 'Startup'],
        keywords: ['POSH Act', 'sexual harassment policy', 'internal complaints committee', 'ICC', 'POSH compliance'],
      },
      {
        id: 'changes-private-limited',
        name: 'Changes in Private Limited Companies',
        categoryId: 'taxation-compliance',
        targetCustomers: ['MSME', 'Startup'],
        keywords: ['change director', 'add director', 'change company address', 'alter MOA AOA', 'share transfer'],
      },
      {
        id: 'changes-llp',
        name: 'Changes in LLPs',
        categoryId: 'taxation-compliance',
        targetCustomers: ['MSME'],
        keywords: ['change LLP partner', 'LLP amendment', 'LLP address change'],
      },
      {
        id: 'business-entity-conversion',
        name: 'Business Entity Conversion',
        categoryId: 'taxation-compliance',
        targetCustomers: ['MSME', 'Startup'],
        keywords: ['convert proprietorship to company', 'convert LLP to company', 'entity conversion'],
      },
      {
        id: 'secretarial-audit',
        name: 'Secretarial Audit',
        categoryId: 'taxation-compliance',
        targetCustomers: ['MSME', 'Startup'],
        keywords: ['secretarial audit', 'company secretarial compliance', 'MCA compliance'],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 5. Intellectual Property & Innovation Protection
  // -------------------------------------------------------------------------
  {
    id: 'intellectual-property',
    name: 'Intellectual Property & Innovation Protection',
    services: [
      {
        id: 'copyright-registration',
        name: 'Copyright Registration',
        categoryId: 'intellectual-property',
        targetCustomers: ['Individual', 'Startup'],
        keywords: ['copyright registration', 'protect copyright', 'copyright infringement', 'register copyright'],
      },
      {
        id: 'patent-registration',
        name: 'Patent Registration',
        categoryId: 'intellectual-property',
        targetCustomers: ['Individual', 'Startup'],
        keywords: ['patent registration', 'file patent', 'patent application India', 'invention patent'],
      },
      {
        id: 'trademark-registration',
        name: 'Trademark Registration',
        categoryId: 'intellectual-property',
        targetCustomers: ['Individual', 'MSME', 'Startup'],
        keywords: ['trademark registration', 'TM registration', 'brand name protection', 'trademark India', 'logo trademark'],
      },
      {
        id: 'design-registration',
        name: 'Design Registration',
        categoryId: 'intellectual-property',
        targetCustomers: ['Individual', 'MSME', 'Startup'],
        keywords: ['design registration', 'industrial design', 'product design protection'],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 6. Licences, Government Registrations & Approvals
  // -------------------------------------------------------------------------
  {
    id: 'licences-registrations',
    name: 'Licences, Government Registrations & Approvals',
    services: [
      {
        id: 'iec-code',
        name: 'Import Export Code (IEC)',
        categoryId: 'licences-registrations',
        targetCustomers: ['MSME', 'Startup'],
        keywords: ['IEC code', 'import export code', 'DGFT registration', 'export licence India'],
      },
      {
        id: 'msme-udyam',
        name: 'MSME / Udyam Registration',
        categoryId: 'licences-registrations',
        targetCustomers: ['MSME'],
        keywords: ['MSME registration', 'Udyam registration', 'udyam certificate', 'MSME certificate'],
      },
      {
        id: 'real-estate-agent',
        name: 'Real Estate Agent Registration',
        categoryId: 'licences-registrations',
        targetCustomers: ['Individual', 'MSME'],
        keywords: ['RERA registration', 'real estate agent licence', 'property agent registration'],
      },
      {
        id: 'legal-metrology',
        name: 'Legal Metrology Licence',
        categoryId: 'licences-registrations',
        targetCustomers: ['MSME'],
        keywords: ['legal metrology licence', 'weights and measures licence', 'packaged commodity rules'],
      },
      {
        id: 'drug-cosmetics-licence',
        name: 'Retail Drug & Cosmetics Licence',
        categoryId: 'licences-registrations',
        targetCustomers: ['MSME'],
        keywords: ['drug licence', 'pharmacy licence', 'cosmetic licence', 'drug store registration'],
      },
      {
        id: 'ayurvedic-licence',
        name: 'Ayurvedic Retail & Manufacturing Licence',
        categoryId: 'licences-registrations',
        targetCustomers: ['MSME'],
        keywords: ['ayurvedic licence', 'ayurvedic manufacturing licence', 'ayurvedic product registration'],
      },
      {
        id: 'gem-vendor',
        name: 'GeM Vendor Registration',
        categoryId: 'licences-registrations',
        targetCustomers: ['MSME', 'Startup'],
        keywords: ['GeM registration', 'government e-marketplace', 'sell to government', 'GeM seller'],
      },
      {
        id: 'psara-licence',
        name: 'PSARA Licence',
        categoryId: 'licences-registrations',
        targetCustomers: ['MSME'],
        keywords: ['PSARA licence', 'private security agency', 'security agency registration'],
      },
      {
        id: 'fssai-licence',
        name: 'FSSAI Licence',
        categoryId: 'licences-registrations',
        targetCustomers: ['Individual', 'MSME'],
        keywords: ['FSSAI licence', 'food licence', 'food business registration', 'FSSAI registration', 'food safety'],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 7. Online Dispute Resolution (ODR)
  // -------------------------------------------------------------------------
  {
    id: 'odr',
    name: 'Online Dispute Resolution (ODR)',
    services: [
      {
        id: 'online-dispute-resolution',
        name: 'Online Dispute Resolution',
        categoryId: 'odr',
        targetCustomers: ['Individual', 'MSME', 'Startup'],
        keywords: ['online dispute resolution', 'ODR', 'settle dispute online', 'dispute resolution platform'],
      },
      {
        id: 'online-mediation',
        name: 'Online Mediation',
        categoryId: 'odr',
        targetCustomers: ['Individual', 'MSME'],
        keywords: ['online mediation', 'mediation India', 'mediator', 'civil mediation'],
      },
      {
        id: 'online-arbitration',
        name: 'Online Arbitration',
        categoryId: 'odr',
        targetCustomers: ['MSME', 'Startup'],
        keywords: ['online arbitration', 'arbitration India', 'arbitration clause', 'commercial arbitration'],
      },
      {
        id: 'online-negotiation',
        name: 'Online Negotiation',
        categoryId: 'odr',
        targetCustomers: ['Individual', 'MSME', 'Startup'],
        keywords: ['online negotiation', 'negotiation support', 'business negotiation'],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 8. Specialised Legal & Regulatory Solutions
  // -------------------------------------------------------------------------
  {
    id: 'specialised-solutions',
    name: 'Specialised Legal & Regulatory Solutions',
    services: [
      {
        id: 'third-party-litigation-funding',
        name: 'Third Party Litigation Funding',
        categoryId: 'specialised-solutions',
        targetCustomers: ['Individual', 'MSME'],
        keywords: ['litigation funding', 'third party funding', 'fund lawsuit', 'case funding'],
      },
      {
        id: 'dpdp-compliance',
        name: 'DPDP Compliance',
        categoryId: 'specialised-solutions',
        targetCustomers: ['MSME', 'Startup'],
        keywords: ['DPDP compliance', 'data protection India', 'Digital Personal Data Protection Act', 'data privacy compliance'],
      },
      {
        id: 'due-diligence',
        name: 'Due Diligence',
        categoryId: 'specialised-solutions',
        targetCustomers: ['Startup', 'MSME'],
        keywords: ['due diligence', 'legal due diligence', 'business due diligence', 'acquisition due diligence'],
      },
      {
        id: 'legal-protection-companies',
        name: 'Legal Protection Plan for Companies & LLPs',
        categoryId: 'specialised-solutions',
        targetCustomers: ['MSME', 'Startup'],
        keywords: ['legal protection plan', 'company legal plan', 'legal retainer for business'],
      },
      {
        id: 'legal-protection-individuals',
        name: 'Legal Protection Plan for Individuals & Families',
        categoryId: 'specialised-solutions',
        targetCustomers: ['Individual'],
        keywords: ['legal protection plan individual', 'family legal plan', 'personal legal subscription'],
      },
      {
        id: 'nri-helpdesk',
        name: 'NRI Help Desk',
        categoryId: 'specialised-solutions',
        targetCustomers: ['Individual'],
        keywords: ['NRI legal help', 'NRI India property', 'NRI tax', 'non-resident Indian legal'],
      },
      {
        id: 'rti-application',
        name: 'RTI Application Filing',
        categoryId: 'specialised-solutions',
        targetCustomers: ['Individual'],
        keywords: ['RTI application', 'right to information', 'file RTI', 'RTI India'],
      },
      {
        id: 'financial-calculators',
        name: 'Financial, Tax & Statutory Calculators',
        categoryId: 'specialised-solutions',
        targetCustomers: ['Individual', 'MSME', 'Startup'],
        keywords: ['tax calculator', 'GST calculator', 'income tax calculator', 'EMI calculator'],
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Derived helpers — keep application logic decoupled from raw catalog shape
// ---------------------------------------------------------------------------

/** Flat list of all services across all categories */
export const ALL_SERVICES = SERVICE_CATEGORIES.flatMap((cat) => cat.services)

/** Quick lookup: serviceId → Service */
export const SERVICE_BY_ID = Object.fromEntries(
  ALL_SERVICES.map((svc) => [svc.id, svc])
)

/** Quick lookup: categoryId → ServiceCategory */
export const CATEGORY_BY_ID = Object.fromEntries(
  SERVICE_CATEGORIES.map((cat) => [cat.id, cat])
)

