import history from '../customHistory'
import React from 'react'
import { get } from 'lodash'
import { _formatDate } from './globalMomentDateFunc'
import { getLocationIP } from '../api/ipInfo'
import { store } from '../Store'

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const monthsShort = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]
const APP_BASE_URL = process.env.REACT_APP_WEB_URL
const INVOICE_PUBLIC_URL = `${process.env.REACT_APP_PUBLIC_BASE_URL}/invoice/`
const INVOICE_PRIVATE_URL = '/app/invoices/view/'

const PUBLIC_STATEMENT_BASE_URL =
  process.env.REACT_APP_WEB_URL + '/app/statements/preview/'
const STRIPE_PK_KEY = process.env.REACT_APP_STRIPE_PK_KEY
const salt = 'strongsalt'

export const stringToSalt = (str) => {
  let textToChars = (str) => str.split('').map((c) => c.charCodeAt(0))
  let byteHex = (n) => ('0' + Number(n).toString(36)).substr(-2)
  let applySaltToChar = (code) =>
    textToChars(salt).reduce((a, b) => a ^ b, code)

  str = str
    .split('')
    .map(textToChars)
    .map(applySaltToChar)
    .map(byteHex)
    .join('')

  return str
}

export const saltToString = (str) => {
  let textToChars = (str) => str.split('').map((c) => c.charCodeAt(0))
  let saltChars = textToChars(salt)
  let applySaltToChar = (code) =>
    textToChars(salt).reduce((a, b) => a ^ b, code)

  let encoded = str
    .match(/.{1,2}/g)
    .map((hex) => parseInt(hex, 16))
    .map(applySaltToChar)
    .map((charCode) => String.fromCharCode(charCode))
    .join('')

  return encoded
}

export const getUniqueID = () => {
  return [...Array(10)]
    .map((i) => (~~(Math.random() * 36)).toString(36))
    .join('')
}

export const getFeatureFlags = (flag, flagKey) => {
  if (!localStorage.getItem('featureFlags')) {
    return true
  }
  const featureFlags = JSON.parse(localStorage.getItem('featureFlags'))
  if (featureFlags) {
    let featureFlag = 'false'
    if (flagKey) {
      featureFlag = featureFlags?.[flag]?.[flagKey] || true
    } else {
      featureFlag = featureFlags?.[flag] || true
    }
    return featureFlag === 'true'
      ? true
      : featureFlag === 'false'
      ? false
      : featureFlag
  }
  return true // No feature flags available then all feature should work as it is
}

export const getFeatureFlagsFromStore = (flagKey, value) => {
  if (store) {
    const { getState } = store
    const { settings: { featureFlags } = {} } = getState()
    return get(featureFlags, flagKey, 'true') === value
  }
  return false
}

export const getShareLink = (ID) => {
  const _UUID = getUniqueID()
  return APP_BASE_URL + getEncryptedString(ID)
}

export const getAppBaseURL = (ID) => {
  return APP_BASE_URL
}

export const getInvoicePublicURL = (ID) => {
  return INVOICE_PUBLIC_URL + ID
}

export const getInvoicePrivateURL = (ID) => {
  return INVOICE_PRIVATE_URL + ID
}

export const getStatementShareBaseURL = (ID) => {
  return PUBLIC_STATEMENT_BASE_URL
}

export const getEncryptedString = (str) => {
  let myCipher = stringToSalt(str)
  return myCipher
}

export const getDecryptedString = (str) => {
  let myCipher = saltToString(
    '2c7a2e2f2a2f7c7c2a7b2e7b2c282b7f7c212f2a2b287d21'
  )
  return myCipher
}

export const getStripeKey = () => {
  return STRIPE_PK_KEY
}

export const getDateMMddyyyy = (date) => {
  let d = new Date(date)
  return monthsShort[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear()
}

export const getDateyyyymmdd = (date) => {
  let d = new Date(date)
  return (
    d.getFullYear() +
    '-' +
    ('0' + (d.getMonth() + 1)).slice(-2) +
    '-' +
    ('0' + d.getDate()).slice(-2)
  )
}

export const getCommonFormatedDate = (date) => {
  return _formatDate(date)
}

export const toDisplayDate = (
  date,
  showTime = false,
  format = 'YYYY-MM-DD',
  showTz = false,
  tzFormat = 'ha z'
) => {
  format = showTime && format == 'YYYY-MM-DD' ? 'YYYY-MM-DD HH:mm' : format
  let dateFinal = _formatDate(date, format)
  // if(showTz){
  //     dateFinal.tz(tzFormat)
  // }
  return dateFinal
}

export const getInvoiceFilterQuery = (
  customer,
  startDate,
  endDate,
  isShowUndepaid
) => {
  return {
    statementInput: {
      customerId: customer,
      startDate: getDateyyyymmdd(startDate),
      endDate: getDateyyyymmdd(endDate),
      scope: isShowUndepaid == true ? 'unpaid' : 'both',
    },
  }
}

export const toCommas = (value) => {
  if (!value) {
    return '0.00'
  }
  value = parseFloat(value).toFixed(2)
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const toDollar = (value, symbol = '$') => {
  return symbol + toCommas(value)
}

export const getPrice = (str) => {
  str = str.substr(1)
  return (str = str.replace(/,/g, ''))
}

export const convertToPrice = (num) => {
  const finalNumber = num?.replace(',', '')
  return parseFloat(Math.round(finalNumber * 100) / 100).toFixed(2)
}

export const isEmpty = (obj) => {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false
    }
  }
  return true
}

export const getStatusClassName = (status, commonClasses) => {
  if (status === 'Online') {
    return commonClasses + ' badge-success'
  } else if (status === 'Offline') {
    return commonClasses + ' badge-off'
  } else if (status === 'Draft') {
    return commonClasses + ' badge-gray'
  } else {
    return commonClasses + ' badge-info'
  }
}

export const getBillingStatus = (status) => {
  if (status === 'Success') {
    return 'success'
  } else if (status === 'Failed' || status === 'Debited') {
    return 'danger'
  } else if (status === 'Credited' || status === 'Refunded') {
    return 'info'
  }
}

export const getCountryById = (id, countries) => {
  var result = countries.find((obj) => {
    return obj.id == id
  })
  return result
    ? {
        id: result.id,
        name: result.name,
      }
    : {
        id: 101,
        name: 'India',
      }
}

export const getRegionById = (id, states) => {
  var result = states.find((obj) => {
    return obj.id == id
  })
  return result
    ? {
        id: result.id,
        name: result.name,
      }
    : {
        id: -1,
        name: '',
      }
}

export const setCountries = (countries) => {
  return countries && countries.length ? (
    countries.map((item, i) => {
      return (
        <option key={i} value={item.id}>
          {' '}
          {item.name}
        </option>
      )
    })
  ) : (
    <option key={-1} value={0}>
      {' '}
      {'None'}
    </option>
  )
}

export const setCountryStates = (countryStates) => {
  return countryStates && countryStates.length > 0 ? (
    countryStates.map((item, i) => {
      return (
        <option key={i} value={item.id}>
          {item.name}
        </option>
      )
    })
  ) : (
    <option key={-1} value={0} disabled>
      {'None'}
    </option>
  )
}

export const removeQueryStringUrl = () => {
  return history.push({
    pathname: window.location.pathname.split('?')[0],
    search: '',
  })
}

export const addQueryStringUrl = (qString) => {
  return history.push({
    pathname: window.location.pathname,
    search: qString,
  })
}

export const getQueryStringUrl = (splitStr) => {
  return window.location.search.split(splitStr)[1]
}

export const calculateBusinessProcessingFee = (
  businessFee,
  amount,
  method = 'card'
) => {
  let proceFee = 0
  const card = businessFee.find((el) => el.type === method)
  if (card && Object.keys(card.international_fee).length > 0) {
    proceFee = parseFloat(
      parseFloat(
        amount / (1 - card.international_fee.dynamic) +
          card.international_fee.fixed
      ) - parseFloat(amount)
    ).toFixed(2)
  }
  return parseFloat(proceFee)
}

export const profileSidebarLinksArray = [
  {
    name: 'Personal Information',
    link: `/app/accounts`,
  },
  {
    name: 'Emails & Connected Accounts',
    link: `/app/accounts/email-connected`,
  },
  {
    name: 'Password',
    link: `/app/accounts/password`,
  },
  {
    name: 'Email Notifications',
    link: `/app/accounts/email-notification`,
  },
  {
    name: 'Businesses',
    link: `/app/accounts/business`,
  },
  {
    name: 'Verification',
    link: `/app/accounts/verification`,
    isHidden: !getFeatureFlagsFromStore('settings.veriff', 'true'),
  },
  {
    name: 'Sessions',
    link: `/app/accounts/sessions`,
  },
  {
    name: 'Security',
    link: `/app/accounts/security`,
  },
]

export const documentTypes = [
  {
    label: 'LLC Filing Receipt',
    value: 'llc_filing_receipt',
  },
  {
    label: 'Social Insurance Number Card',
    value: 'social_insurance_number_card',
  },
  {
    label: 'Tax Statement',
    value: 'tax_statement',
  },
  {
    label: 'Secretary Of State',
    value: 'secretary_of_state',
  },
  {
    label: 'Evidence Of Name Change',
    value: 'evidence_of_name_change',
  },
  {
    label: 'Canada Revenue Agency',
    value: 'canada_revenue_agency',
  },
  {
    label: 'Trust Agreement',
    value: 'trust_agreement',
  },
  {
    label: 'Corporate Annual Gov Filing',
    value: 'corporate_annual_gov_filing',
  },
  {
    label: 'Drivers License',
    value: 'drivers_license',
  },
  {
    label: 'Foreign Passport',
    value: 'foreign_passport',
  },
  {
    label: 'Tracking',
    value: 'tracking',
  },
  {
    label: 'Canada Public Company',
    value: 'canada_public_company',
  },
  {
    label: 'Corporate Amalgamation Agreement',
    value: 'corporate_amalgamation_agreement',
  },
  {
    label: 'Electoral Register Entry',
    value: 'electoral_register_entry',
  },
  {
    label: 'Proof Of Credit',
    value: 'proof_of_credit',
  },
  {
    label: 'Evidence Of Authority',
    value: 'evidence_of_authority',
  },
  {
    label: 'Tax Exemption Letter',
    value: 'tax_exemption_letter',
  },
  {
    label: 'Web Referral',
    value: 'web_referral',
  },
  {
    label: 'Certified Copy Of Court Order',
    value: 'certified_copy_of_court_order',
  },
  {
    label: 'Equifax Uk',
    value: 'equifax_uk',
  },
  {
    label: 'Limited Partnership Certificate',
    value: 'limited_partnership_certificate',
  },
  {
    label: 'Written Rebuttal',
    value: 'written_rebuttal',
  },
  {
    label: 'Government Business Letterhead',
    value: 'government_business_letterhead',
  },
  {
    label: 'Filed Audited Accounts',
    value: 'filed_audited_accounts',
  },
  {
    label: 'Other Evidence Of Filings',
    value: 'other_evidence_of_filings',
  },
  {
    label: 'Canadian Health Card',
    value: 'canadian_health_card',
  },
  {
    label: 'Partnership Agreement',
    value: 'partnership_agreement',
  },
  {
    label: 'Contract',
    value: 'contract',
  },
  {
    label: 'Change Of Address',
    value: 'change_of_address',
  },
  {
    label: 'Trulioo',
    value: 'trulioo',
  },
  {
    label: 'Vendor Contract Agreement',
    value: 'vendor_contract_agreement',
  },
  {
    label: 'Government Id',
    value: 'government_id',
  },
  {
    label: 'Quick Name Check Search',
    value: 'quick_name_check_search',
  },
  {
    label: 'Alberta Province',
    value: 'alberta_province',
  },
  {
    label: 'Person Report',
    value: 'person_report',
  },
  {
    label: 'Itemized Receipt',
    value: 'itemized_receipt',
  },
  {
    label: 'Contracting License Or Insurance Document',
    value: 'contracting_license_or_insurance_document',
  },
  {
    label: 'Charity License',
    value: 'charity_license',
  },
  {
    label: 'Not Applicable',
    value: 'not_applicable',
  },
  {
    label: 'Certificate Of Incorporation',
    value: 'certificate_of_incorporation',
  },
  {
    label: 'Charity Navigator',
    value: 'charity_navigator',
  },
  {
    label: 'Mortgage Statement',
    value: 'mortgage_statement',
  },
  {
    label: 'Current Residence Lease Contract',
    value: 'current_residence_lease_contract',
  },
  {
    label: 'Other',
    value: 'other',
  },
  {
    label: 'Social Security Benefit Notice',
    value: 'social_security_benefit_notice',
  },
  {
    label: 'Evidence Of Registration Of Regulated Funds',
    value: 'evidence_of_registration_of_regulated_funds',
  },
  {
    label: 'Open Source Research',
    value: 'open_source_research',
  },
  {
    label: 'Paystub',
    value: 'paystub',
  },
  {
    label: 'Hoa Statement',
    value: 'hoa_statement',
  },
  {
    label: 'Insurance Declaration Page',
    value: 'insurance_declaration_page',
  },
  {
    label: 'Proof Of Supervision By Gov',
    value: 'proof_of_supervision_by_gov',
  },
  {
    label: 'Charge Back',
    value: 'charge_back',
  },
  {
    label: 'State Gov Agency For Business',
    value: 'state_gov_agency_for_business',
  },
  {
    label: 'Identity Card Northern Ireland',
    value: 'identity_card_northern_ireland',
  },
  {
    label: 'Corporate Profile Report',
    value: 'corporate_profile_report',
  },
  {
    label: 'Certificate Of Existence',
    value: 'certificate_of_existence',
  },
  {
    label: 'Canadian Citizenship',
    value: 'canadian_citizenship',
  },
  {
    label: 'Divorce Decree',
    value: 'divorce_decree',
  },
  {
    label: 'State Registrar Of Legal Entities',
    value: 'state_registrar_of_legal_entities',
  },
  {
    label: 'Bankruptcy Trustee',
    value: 'bankruptcy_trustee',
  },
  {
    label: 'Negative Media Searches',
    value: 'negative_media_searches',
  },
  {
    label: 'Sec Annual Report',
    value: 'sec_annual_report',
  },
  {
    label: 'Aml Representation Letter',
    value: 'aml_representation_letter',
  },
  {
    label: 'Operating Agreement',
    value: 'operating_agreement',
  },
  {
    label: 'Bank Statement',
    value: 'bank_statement',
  },
  {
    label: 'Charity Registration Number',
    value: 'charity_registration_number',
  },
  {
    label: 'Current Lease Contract',
    value: 'current_lease_contract',
  },
  {
    label: 'Certificate Of Association',
    value: 'certificate_of_association',
  },
  {
    label: 'Employment Authorization Card',
    value: 'employment_authorization_card',
  },
  {
    label: 'Executor Of Estate',
    value: 'executor_of_estate',
  },
  {
    label: 'Evidence Of Registration',
    value: 'evidence_of_registration',
  },
  {
    label: 'Current Utility Bill',
    value: 'current_utility_bill',
  },
  {
    label: 'Military Orders',
    value: 'military_orders',
  },
  {
    label: 'Correspondence',
    value: 'correspondence',
  },
  {
    label: 'Building Society Statement',
    value: 'building_society_statement',
  },
  {
    label: 'Business Report',
    value: 'business_report',
  },
  {
    label: 'Inland Revenue Tax Assessment',
    value: 'inland_revenue_tax_assessment',
  },
  {
    label: 'Quebec Company Registration',
    value: 'quebec_company_registration',
  },
  {
    label: 'Insurance Document',
    value: 'insurance_document',
  },
  {
    label: 'Certification Of Compliance',
    value: 'certification_of_compliance',
  },
  {
    label: 'Credit Card Statement',
    value: 'credit_card_statement',
  },
  {
    label: 'Other Government Source',
    value: 'other_government_source',
  },
  {
    label: 'Current Business Lease Contract',
    value: 'current_business_lease_contract',
  },
  {
    label: 'Certificate Of Status',
    value: 'certificate_of_status',
  },
  {
    label: 'Na Canada',
    value: 'na_canada',
  },
  {
    label: 'Certificate Of Limited Partnership',
    value: 'certificate_of_limited_partnership',
  },
  {
    label: 'Item Description',
    value: 'item_description',
  },
  {
    label: 'Certificate Of Authority',
    value: 'certificate_of_authority',
  },
  {
    label: 'Refund Policy',
    value: 'refund_policy',
  },
  {
    label: 'Birth Certificate',
    value: 'birth_certificate',
  },
  {
    label: 'Certificate Of Organization',
    value: 'certificate_of_organization',
  },
  {
    label: 'Permanent Resident Card',
    value: 'permanent_resident_card',
  },
  {
    label: 'Saq A',
    value: 'saq_a',
  },
  {
    label: 'Insurance Bill',
    value: 'insurance_bill',
  },
  {
    label: 'Saq D',
    value: 'saq_d',
  },
  {
    label: 'Social Security Card',
    value: 'social_security_card',
  },
  {
    label: 'Irs 501c3 Determination',
    value: 'irs_501c3_determination',
  },
  {
    label: 'Insurance Card',
    value: 'insurance_card',
  },
  {
    label: 'Passport',
    value: 'passport',
  },
  {
    label: 'Affiliation',
    value: 'affiliation',
  },
  {
    label: 'Identity Card By Eoni',
    value: 'identity_card_by_eoni',
  },
  {
    label: 'Evidence Of Exchange',
    value: 'evidence_of_exchange',
  },
  {
    label: 'Return Policy',
    value: 'return_policy',
  },
  {
    label: 'Other Supporting Docs',
    value: 'other_supporting_docs',
  },
  {
    label: 'Certificate Of Trust',
    value: 'certificate_of_trust',
  },
  {
    label: 'Military Id',
    value: 'military_id',
  },
  {
    label: 'Hud Statement',
    value: 'hud_statement',
  },
  {
    label: 'Opencorps',
    value: 'opencorps',
  },
  {
    label: 'National Identity Card',
    value: 'national_identity_card',
  },
  {
    label: 'Financials',
    value: 'financials',
  },
  {
    label: 'Sec Current Filing Report',
    value: 'sec_current_filing_report',
  },
  {
    label: 'Invoice Outreach',
    value: 'invoice_outreach',
  },
  {
    label: 'Council Tax Statement',
    value: 'council_tax_statement',
  },
  {
    label: 'Current Bank Statement',
    value: 'current_bank_statement',
  },
  {
    label: 'Articles Amendment',
    value: 'articles_amendment',
  },
  {
    label: 'Benefits Card',
    value: 'benefits_card',
  },
  {
    label: 'Evidence Of Corporate Registration',
    value: 'evidence_of_corporate_registration',
  },
  {
    label: 'Experian Prove Id',
    value: 'experian_prove_id',
  },
  {
    label: 'Tribal Or Bureau Of Indian Affairs Id',
    value: 'tribal_or_bureau_of_indian_affairs_id',
  },
  {
    label: 'Companies House',
    value: 'companies_house',
  },
  {
    label: 'Evidence Of Nonprofit Registration',
    value: 'evidence_of_nonprofit_registration',
  },
  {
    label: 'Matricula Consular Card',
    value: 'matricula_consular_card',
  },
  {
    label: 'Certificate Of Liability Insurance',
    value: 'certificate_of_liability_insurance',
  },
  {
    label: 'Vehicle Registration',
    value: 'vehicle_registration',
  },
  {
    label: 'National Center For Education',
    value: 'national_center_for_education',
  },
  {
    label: 'Proof Of Registration',
    value: 'proof_of_registration',
  },
  {
    label: 'Merchant Processing Statement',
    value: 'merchant_processing_statement',
  },
  {
    label: 'Saq A Ep',
    value: 'saq_a_ep',
  },
  {
    label: 'Order Of Creation',
    value: 'order_of_creation',
  },
  {
    label: 'Llc Agreement',
    value: 'llc_agreement',
  },
  {
    label: 'Other Government Issued Photo Id',
    value: 'other_government_issued_photo_id',
  },
  {
    label: 'Irs Confirmation Of Tin',
    value: 'irs_confirmation_of_tin',
  },
  {
    label: 'Sentri Card',
    value: 'sentri_card',
  },
  {
    label: 'Current Local Tax Bill',
    value: 'current_local_tax_bill',
  },
  {
    label: 'Schedule Q',
    value: 'schedule_q',
  },
  {
    label: 'Cancelation Request',
    value: 'cancelation_request',
  },
  {
    label: 'Firearms Certificate',
    value: 'firearms_certificate',
  },
  {
    label: 'Passport Card',
    value: 'passport_card',
  },
  {
    label: 'Signed Contract',
    value: 'signed_contract',
  },
  {
    label: 'Banking License',
    value: 'banking_license',
  },
  {
    label: 'Certificate Of Naturalization',
    value: 'certificate_of_naturalization',
  },
  {
    label: 'Miscellaneous Compliance Doc',
    value: 'miscellaneous_compliance_doc',
  },
  {
    label: 'Fee Disclosure',
    value: 'fee_disclosure',
  },
  {
    label: 'Articles Of Association',
    value: 'articles_of_association',
  },
  {
    label: 'Articles Of Incorporation',
    value: 'articles_of_incorporation',
  },
  {
    label: 'Any Other Government Issued Photo Id',
    value: 'any_other_government_issued_photo_id',
  },
  {
    label: 'Business Tax Document',
    value: 'business_tax_document',
  },
  {
    label: 'Aml Questionnaire',
    value: 'aml_questionnaire',
  },
  {
    label: 'Dun And Bradstreet',
    value: 'dun_and_bradstreet',
  },
  {
    label: 'Ip Logins',
    value: 'ip_logins',
  },
  {
    label: 'Politically Exposed Person Specialized Due Diligence',
    value: 'politically_exposed_person_specialized_due_diligence',
  },
  {
    label: 'Marriage Certificate',
    value: 'marriage_certificate',
  },
  {
    label: 'Advise And Consult Responses',
    value: 'advise_and_consult_responses',
  },
  {
    label: 'Business License Certificate',
    value: 'business_license_certificate',
  },
  {
    label: 'Certificate Of Domestication',
    value: 'certificate_of_domestication',
  },
  {
    label: 'Letter From Social Security',
    value: 'letter_from_social_security',
  },
  {
    label: 'Miscellaneous Charge Network Compliance Doc',
    value: 'miscellaneous_charge_network_compliance_doc',
  },
  {
    label: 'Evidence Of Regulation',
    value: 'evidence_of_regulation',
  },
  {
    label: 'Dba Registration',
    value: 'dba_registration',
  },
  {
    label: 'Certificate Of Formation',
    value: 'certificate_of_formation',
  },
  {
    label: 'Evidence Of License',
    value: 'evidence_of_license',
  },
  {
    label: 'Mortgage Closing Document',
    value: 'mortgage_closing_document',
  },
  {
    label: 'Certificate Of Citizenship',
    value: 'certificate_of_citizenship',
  },
  {
    label: 'Form Adv',
    value: 'form_adv',
  },
  {
    label: 'Canada Business Registry',
    value: 'canada_business_registry',
  },
  {
    label: 'Nova Scotia Province',
    value: 'nova_scotia_province',
  },
  {
    label: 'Certificate Of Good Standing',
    value: 'certificate_of_good_standing',
  },
  {
    label: 'Limited Partnership Charter Letter',
    value: 'limited_partnership_charter_letter',
  },
  {
    label: 'Invoice',
    value: 'invoice',
  },
  {
    label: 'Prince Edward Island Province',
    value: 'prince_edward_island_province',
  },
  {
    label: 'Lexis Nex',
    value: 'lexis_nex',
  },
]

export const getDeviceInfo = async () => {
  let nVer = navigator.appVersion
  let nAgt = navigator.userAgent
  let browserName = navigator.appName
  let fullVersion = '' + parseFloat(navigator.appVersion)
  let majorVersion = parseInt(navigator.appVersion, 10)
  let nameOffset, verOffset, ix
  // In Opera, the true version is after "OPR" or after "Version"
  if ((verOffset = nAgt.indexOf('OPR')) != -1) {
    browserName = 'Opera'
    fullVersion = nAgt.substring(verOffset + 4)
    if ((verOffset = nAgt.indexOf('Version')) != -1) {
      fullVersion = nAgt.substring(verOffset + 8)
    }
  }
  // In MS Edge, the true version is after "Edg" in userAgent
  else if ((verOffset = nAgt.indexOf('Edg')) != -1) {
    browserName = 'Microsoft Edge'
    fullVersion = nAgt.substring(verOffset + 4)
  }
  // In MSIE, the true version is after "MSIE" in userAgent
  else if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
    browserName = 'Microsoft Internet Explorer'
    fullVersion = nAgt.substring(verOffset + 5)
  }
  // In Chrome, the true version is after "Chrome"
  else if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
    browserName = 'Chrome'
    fullVersion = nAgt.substring(verOffset + 7)
  }
  // In Safari, the true version is after "Safari" or after "Version"
  else if ((verOffset = nAgt.indexOf('Safari')) != -1) {
    browserName = 'Safari'
    fullVersion = nAgt.substring(verOffset + 7)
    if ((verOffset = nAgt.indexOf('Version')) != -1) {
      fullVersion = nAgt.substring(verOffset + 8)
    }
  }
  // In Firefox, the true version is after "Firefox"
  else if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
    browserName = 'Firefox'
    fullVersion = nAgt.substring(verOffset + 8)
  }
  // In most other browsers, "name/version" is at the end of userAgent
  else if (
    (nameOffset = nAgt.lastIndexOf(' ') + 1) <
    (verOffset = nAgt.lastIndexOf('/'))
  ) {
    browserName = nAgt.substring(nameOffset, verOffset)
    fullVersion = nAgt.substring(verOffset + 1)
    if (browserName.toLowerCase() == browserName.toUpperCase()) {
      browserName = navigator.appName
    }
  }
  // trim the fullVersion string at semicolon/space if present
  if ((ix = fullVersion.indexOf(';')) != -1) {
    fullVersion = fullVersion.substring(0, ix)
  }
  if ((ix = fullVersion.indexOf(' ')) != -1) {
    fullVersion = fullVersion.substring(0, ix)
  }

  majorVersion = parseInt('' + fullVersion, 10)
  if (isNaN(majorVersion)) {
    fullVersion = '' + parseFloat(navigator.appVersion)
    majorVersion = parseInt(navigator.appVersion, 10)
  }

  let osName = 'Unknown OS'
  if (navigator.appVersion.indexOf('Win') != -1) osName = 'Windows'
  if (navigator.appVersion.indexOf('Mac') != -1) osName = 'MacOS'
  if (navigator.appVersion.indexOf('X11') != -1) osName = 'UNIX'
  if (navigator.appVersion.indexOf('Linux') != -1) osName = 'Linux'
  const loc = await getLocationIP()
  return {
    osName,
    browserName,
    appVersion: fullVersion,
    location: loc?.country_code ?? 'Unknown',
    platform: 'browser',
  }
}
