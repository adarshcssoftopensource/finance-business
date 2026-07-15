import {
  STATIC_AUTH_TOKEN,
  STATIC_BUSINESS,
  STATIC_BUSINESS_ID,
  STATIC_BUSINESS_NAME,
  STATIC_LOGIN_EMAIL,
  STATIC_USER,
} from './static-auth'

const currency = {
  code: 'USD',
  name: 'US Dollar',
  symbol: '$',
  displayName: 'USD - $',
  decimalPlaces: 2,
}

/** Shape expected by setCurrencyList / CurrencyWrapper (array of countries with currencies). */
const countryCurrencyList = [
  {
    id: 231,
    name: 'United States',
    sortname: 'US',
    alpha2Code: 'US',
    code: 'US',
    currencies: [currency],
  },
  {
    id: 38,
    name: 'Canada',
    sortname: 'CA',
    alpha2Code: 'CA',
    code: 'CA',
    currencies: [
      {
        code: 'CAD',
        name: 'Canadian Dollar',
        symbol: 'CA$',
        displayName: 'CAD - CA$',
        decimalPlaces: 2,
      },
    ],
  },
  {
    id: 230,
    name: 'United Kingdom',
    sortname: 'GB',
    alpha2Code: 'GB',
    code: 'GB',
    currencies: [
      {
        code: 'GBP',
        name: 'British Pound',
        symbol: '£',
        displayName: 'GBP - £',
        decimalPlaces: 2,
      },
    ],
  },
  {
    id: 14,
    name: 'Australia',
    sortname: 'AU',
    alpha2Code: 'AU',
    code: 'AU',
    currencies: [
      {
        code: 'AUD',
        name: 'Australian Dollar',
        symbol: 'A$',
        displayName: 'AUD - A$',
        decimalPlaces: 2,
      },
    ],
  },
  {
    id: 101,
    name: 'India',
    sortname: 'IN',
    alpha2Code: 'IN',
    code: 'IN',
    currencies: [
      {
        code: 'INR',
        name: 'Indian Rupee',
        symbol: '₹',
        displayName: 'INR - ₹',
        decimalPlaces: 2,
      },
    ],
  },
]

const demoCountries = countryCurrencyList.map(({ currencies, ...c }) => ({
  ...c,
  currencies,
}))

const meta = (total = 2) => ({ total, pageNo: 1, pageSize: 10, count: total })

const customers = [
  {
    _id: 'cust1',
    id: 'cust1',
    customerName: 'Jordan Lee',
    email: 'jordan.lee@email.com',
    companyName: 'Lee Consulting',
    currency,
    outstandingAmount: 1200,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'cust2',
    id: 'cust2',
    customerName: 'Sam Patel',
    email: 'sam.patel@email.com',
    companyName: 'Patel Retail',
    currency,
    outstandingAmount: 450,
    createdAt: new Date().toISOString(),
  },
]

const vendors = [
  {
    _id: 'vend1',
    id: 'vend1',
    vendorName: 'Office Supplies Co',
    email: 'billing@officesupplies.com',
    currency,
  },
  {
    _id: 'vend2',
    id: 'vend2',
    vendorName: 'Cloud Hosting Inc',
    email: 'accounts@cloudhost.com',
    currency,
  },
]

const products = [
  {
    _id: 'prod1',
    id: 'prod1',
    name: 'Website Design',
    description: 'Custom website package',
    price: 1500,
    buyPrice: 0,
    currency,
    isActive: true,
    taxes: [],
    sell: { allowed: true, price: 1500, account: null },
    buy: { allowed: false, price: 0, account: null },
  },
  {
    _id: 'prod2',
    id: 'prod2',
    name: 'Monthly Retainer',
    description: 'Support retainer',
    price: 500,
    buyPrice: 200,
    currency,
    isActive: true,
    taxes: [],
    sell: { allowed: true, price: 500, account: null },
    buy: { allowed: true, price: 200, account: null },
  },
]

const invoices = [
  {
    _id: 'inv1',
    id: 'inv1',
    idToOpen: 'inv1',
    invoiceNumber: 'INV-1001',
    displayName: 'INV-1001 — Jordan Lee',
    status: 'sent',
    action: 'Record a payment',
    invoiceDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    lastSent: new Date(Date.now() - 86400000 * 4).toISOString(),
    sentDate: new Date(Date.now() - 86400000 * 4).toISOString(),
    totalAmount: 1200,
    dueAmount: 1200,
    dueAmountInHomeCurrency: 1200,
    totalAmountInHomeCurrency: 1200,
    amount: 1200,
    balance: 1200,
    exchangeRate: 1,
    skipped: false,
    currency,
    report: { lastViewedOn: null, viewCount: 0 },
    customer: {
      id: 'cust1',
      _id: 'cust1',
      customerName: 'Jordan Lee',
      email: 'jordan.lee@email.com',
      firstName: 'Jordan',
      lastName: 'Lee',
    },
    business: STATIC_BUSINESS,
    businessId: { _id: 'biz1', currency },
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'inv2',
    id: 'inv2',
    idToOpen: 'inv2',
    invoiceNumber: 'INV-1002',
    displayName: 'INV-1002 — Sam Patel',
    status: 'draft',
    action: 'Send',
    invoiceDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 14).toISOString(),
    lastSent: null,
    sentDate: null,
    totalAmount: 450,
    dueAmount: 450,
    dueAmountInHomeCurrency: 450,
    totalAmountInHomeCurrency: 450,
    amount: 450,
    balance: 450,
    exchangeRate: 1,
    skipped: false,
    currency,
    report: { lastViewedOn: null, viewCount: 0 },
    customer: {
      id: 'cust2',
      _id: 'cust2',
      customerName: 'Sam Patel',
      email: 'sam.patel@email.com',
      firstName: 'Sam',
      lastName: 'Patel',
    },
    business: STATIC_BUSINESS,
    businessId: { _id: 'biz1', currency },
    createdAt: new Date().toISOString(),
  },
]

const estimates = [
  {
    _id: 'est1',
    id: 'est1',
    estimateNumber: 'EST-2001',
    status: 'sent',
    estimateDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 86400000 * 14).toISOString(),
    totalAmount: 2200,
    totalAmountInHomeCurrency: 2200,
    currency,
    businessId: { _id: 'biz1', currency },
    customer: { id: 'cust1', customerName: 'Jordan Lee', email: 'jordan.lee@email.com' },
  },
  {
    _id: 'est2',
    id: 'est2',
    estimateNumber: 'EST-2002',
    status: 'saved',
    estimateDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    expiryDate: new Date(Date.now() + 86400000 * 10).toISOString(),
    totalAmount: 800,
    totalAmountInHomeCurrency: 800,
    currency,
    businessId: { _id: 'biz1', currency },
    customer: { id: 'cust2', customerName: 'Sam Patel', email: 'sam.patel@email.com' },
  },
]

const bills = [
  {
    _id: 'bill1',
    id: 'bill1',
    idToOpen: 'bill1',
    billNumber: 'BILL-3001',
    displayName: 'BILL-3001 — Office Supplies',
    amount: 320,
    dueAmount: 320,
    totalAmount: 320,
    status: 'unpaid',
    billDate: new Date(Date.now() - 86400000 * 10).toISOString(),
    currency,
    vendor: { id: 'vend1', vendorName: 'Office Supplies Co' },
    dueDate: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    _id: 'bill2',
    id: 'bill2',
    idToOpen: 'bill2',
    billNumber: 'BILL-3002',
    displayName: 'BILL-3002 — Cloud Hosting',
    amount: 99,
    dueAmount: 99,
    totalAmount: 99,
    status: 'unpaid',
    billDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    currency,
    vendor: { id: 'vend2', vendorName: 'Cloud Hosting Inc' },
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
  },
]

const taxes = [
  {
    _id: 'tax1',
    abbreviation: 'VAT',
    name: 'VAT',
    rate: 10,
    description: 'Value Added Tax',
    isRecoverable: true,
    isCompound: false,
  },
  {
    _id: 'tax2',
    abbreviation: 'Sales',
    name: 'Sales Tax',
    rate: 8.25,
    description: 'Sales Tax',
    isRecoverable: false,
    isCompound: false,
  },
]

const receipts = [
  {
    _id: 'rcpt1',
    id: 'rcpt1',
    receiptNumber: 'RCP-1001',
    status: 'draft',
    source: 'Upload',
    receiptDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    totalAmount: 48.5,
    currency,
    vendor: { id: 'vend1', vendorName: 'Office Supplies Co' },
    fileUrl: '#',
    previewUrl: '',
    notes: 'Office supplies',
    amountBreakup: {
      subTotal: 48.5,
      taxTotal: 0,
      taxes: [],
    },
    taxes: [],
  },
  {
    _id: 'rcpt2',
    id: 'rcpt2',
    receiptNumber: 'RCP-1002',
    status: 'posted',
    source: 'Email',
    receiptDate: new Date(Date.now() - 86400000 * 7).toISOString(),
    totalAmount: 19.99,
    currency,
    vendor: { id: 'vend2', vendorName: 'Cloud Hosting Inc' },
    fileUrl: '#',
    previewUrl: '',
    notes: 'Software subscription',
    amountBreakup: {
      subTotal: 19.99,
      taxTotal: 0,
      taxes: [],
    },
    taxes: [],
  },
]

const chartValues = [
  {
    displayName: 'Jan',
    inFlow: 12000,
    outFlow: 8000,
    netChange: 4000,
    income: 15000,
    expense: 9000,
    amount: 2200,
    percentage: 40,
    column1: 3200,
    column2: 9800,
    currency,
  },
  {
    displayName: 'Feb',
    inFlow: 14000,
    outFlow: 7500,
    netChange: 6500,
    income: 16000,
    expense: 8500,
    amount: 3100,
    percentage: 60,
    column1: 4100,
    column2: 11200,
    currency,
  },
  {
    displayName: 'Mar',
    inFlow: 11000,
    outFlow: 9200,
    netChange: 1800,
    income: 13000,
    expense: 10000,
    amount: 1800,
    percentage: 35,
    column1: 2800,
    column2: 10500,
    currency,
  },
]

const bankAccounts = [
  {
    _id: 'bank1',
    institute: { name: 'Chase', _id: 'inst1' },
    accounts: [
      {
        _id: 'acc1',
        name: 'Business Checking',
        mask: '4321',
        type: 'depository',
        balances: { current: 24850.55, available: 24500 },
        currency,
      },
      {
        _id: 'acc2',
        name: 'Business Savings',
        mask: '8899',
        type: 'depository',
        balances: { current: 51000, available: 51000 },
        currency,
      },
    ],
    lastUpdated: new Date().toISOString(),
  },
]

const payments = [
  {
    _id: 'pay1',
    id: 'pay1',
    uuid: 'pay-uuid-1',
    amount: 1200,
    status: 'success',
    method: 'card',
    methodToDisplay: 'Visa •••• 4242',
    paymentIcon: 'visa',
    paymentDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    paymentType: 'Invoice',
    invoice: 'inv1',
    invoiceId: 'inv1',
    amountBreakup: {
      total: 1200,
      tip: 0,
      tax: 0,
      fee: 36,
      net: 1164,
    },
    note: '',
    account: null,
    ownAccount: false,
    refund: { isRefunded: false, totalAmount: 0 },
    other: null,
    card: { brand: 'visa', last4: '4242' },
    bank: null,
    currency,
    customer: {
      firstName: 'Jordan',
      lastName: 'Lee',
      email: 'jordan.lee@email.com',
    },
    payout: { isPaid: false },
    failureReason: '',
    riskScore: 0,
    requests: [],
    rewardPoints: 0,
  },
  {
    _id: 'pay2',
    id: 'pay2',
    uuid: 'pay-uuid-2',
    amount: 450,
    status: 'failed',
    method: 'card',
    methodToDisplay: 'Mastercard •••• 4444',
    paymentIcon: 'mastercard',
    paymentDate: new Date(Date.now() - 86400000).toISOString(),
    paymentType: 'Invoice',
    invoice: 'inv2',
    invoiceId: 'inv2',
    amountBreakup: {
      total: 450,
      tip: 0,
      tax: 0,
      fee: 0,
      net: 0,
    },
    note: '',
    account: null,
    ownAccount: false,
    refund: { isRefunded: false, totalAmount: 0 },
    other: null,
    card: { brand: 'mastercard', last4: '4444' },
    bank: null,
    currency,
    customer: {
      firstName: 'Sam',
      lastName: 'Patel',
      email: 'sam.patel@email.com',
    },
    payout: { isPaid: false },
    failureReason: 'Card declined',
    riskScore: 0,
    requests: [],
    rewardPoints: 0,
  },
]

const paymentSetting = {
  isOnboardingApplicable: true,
  isOnlinePaymentEnabled: true,
  isCardPaymentEnabled: true,
  isBankPaymentEnabled: true,
  isConnected: true,
  isSetupDone: true,
  bankingSetupSkipped: true,
  provider: 'stripe',
  providerName: 'stripe',
  paymentsMode: 'live',
  onboardingStatus: 'completed',
  isProviderSwitched: false,
  accept_card: true,
  accept_bank: false,
  preferred_mode: 'card',
  enabled: true,
  isVerified: { payment: true, kyc: true },
  legalData: {
    isPayByBankEnabled: false,
    isBnplEnabled: false,
    isOnlinePaymentEnabled: true,
  },
  statement: {
    displayName: 'FINANCE STUDIO',
  },
  paymentButtons: {
    payWithPaypal: false,
    payLaterWithPaypal: false,
    payWithVenmo: false,
  },
  charges: {
    expressSupported: false,
    expressEnabled: false,
    card_charge_message: '2.9% + $0.30 per successful card charge',
    bank_charge_message: '0.8% per ACH payment (capped at $5)',
    messages: [
      {
        heading: 'Faster payments',
        body: 'Get paid up to 3x faster with online checkout.',
      },
      {
        heading: 'Professional invoices',
        body: 'Let customers pay securely by card in one click.',
      },
      {
        heading: 'Automatic tracking',
        body: 'Payment status updates as soon as funds clear.',
      },
    ],
  },
  payoutSetting: {},
}

const processingFee = [
  {
    type: 'card',
    name: 'Visa / Mastercard',
    passFee: { dynamic: 0.029, fixed: 0.3 },
    international_passFee: { dynamic: 0.039, fixed: 0.3 },
  },
  {
    type: 'amex',
    name: 'American Express',
    passFee: { dynamic: 0.035, fixed: 0.3 },
    international_passFee: { dynamic: 0.04, fixed: 0.3 },
  },
]

const featureFlags = {
  reports: {
    enabled: 'true',
    profitAndLoss: 'true',
    cashFlow: 'true',
    expenses: 'true',
    sales: 'true',
  },
  debitCard: { enable: 'false' },
  reward: { view: 'true' },
  subscriptions: { create: 'true', update: 'true' },
  settings: { veriff: 'false', isOnboardingAllowed: 'true' },
  auth: { register: 'true' },
  payAsBank: { enabled: 'true' },
}

const subscriptionPlan = {
  current: {
    _id: 'sub1',
    title: 'Growth',
    name: 'Growth',
    planLevel: 2,
    status: 'active',
    nextInvoiceDate: new Date(Date.now() + 86400000 * 20).toISOString(),
    planId: {
      _id: 'plan-growth',
      title: 'Growth',
      name: 'Growth',
      planLevel: 2,
      price: 29,
      recurring: 'month',
    },
    trial: {
      isTrial: false,
      endDate: null,
    },
    card: {
      brand: 'visa',
      cardNumber: '4242',
    },
  },
  upcoming: null,
  plans: [
    {
      _id: 'plan-starter',
      title: 'Starter',
      name: 'Starter',
      planLevel: 1,
      price: 0,
      recurring: 'month',
    },
    {
      _id: 'plan-growth',
      title: 'Growth',
      name: 'Growth',
      planLevel: 2,
      price: 29,
      recurring: 'month',
    },
  ],
}

const billingHistory = [
  {
    _id: 'billpay1',
    subscriptionId: 'sub1',
    paymentId: 'pay_sub_1',
    status: 'Success',
    paymentDate: new Date(Date.now() - 86400000 * 30).toISOString(),
    startDate: new Date(Date.now() - 86400000 * 30).toISOString(),
    endDate: new Date(Date.now()).toISOString(),
    remarks: 'Growth plan — monthly',
    planTitle: 'Growth',
    recurring: 'month',
    isTrail: false,
    card: { brand: 'visa', cardNumber: '4242' },
    amount: 29,
  },
  {
    _id: 'billpay2',
    subscriptionId: 'sub1',
    paymentId: 'pay_sub_2',
    status: 'Success',
    paymentDate: new Date(Date.now() - 86400000 * 60).toISOString(),
    startDate: new Date(Date.now() - 86400000 * 60).toISOString(),
    endDate: new Date(Date.now() - 86400000 * 30).toISOString(),
    remarks: 'Growth plan — monthly',
    planTitle: 'Growth',
    recurring: 'month',
    isTrail: false,
    card: { brand: 'visa', cardNumber: '4242' },
    amount: 29,
  },
]

function pathOnly(url = '') {
  try {
    if (url.startsWith('http')) return new URL(url).pathname
  } catch {
    /* ignore */
  }
  return (url || '').split('?')[0] || ''
}

function envelope(data, extras = {}) {
  return {
    statusCode: 200,
    status: 200,
    success: true,
    message: 'Success',
    data,
    accessToken: STATIC_AUTH_TOKEN,
    refreshToken: STATIC_AUTH_TOKEN,
    token: STATIC_AUTH_TOKEN,
    businesses: [{ ...STATIC_BUSINESS }],
    selectedBusiness: { ...STATIC_BUSINESS },
    user: { ...STATIC_USER },
    ...extras,
  }
}

/**
 * URL-aware static API responses for demo mode (no backend).
 */
export function buildStaticResponse(url = '', method = 'GET', body = null) {
  const path = pathOnly(url)
  const verb = (method || 'GET').toUpperCase()
  const payload = typeof body === 'string'
    ? (() => { try { return JSON.parse(body) } catch { return {} } })()
    : (body || {})

  // Feature flags
  if (path.includes('/globals') || path.includes('/feature') || path.includes('/flags')) {
    return envelope(featureFlags)
  }

  // Processing fees before generic payment settings (path contains /settings/payment)
  if (path.includes('processing-fee') || path.includes('pass-fee')) {
    return envelope({ processingFee })
  }

  // Payment settings
  if (path.includes('payment-setting') || path.includes('paymentSetting') || path.includes('/settings/payment')) {
    return envelope({ paymentSetting })
  }

  // Sales / invoice customization settings
  if (path.includes('/settings/sales') || path.includes('/settings/salesSetting')) {
    return envelope({
      salesSetting: {
        businessId: STATIC_BUSINESS_ID,
        template: 'contemporary',
        companyLogo: '',
        displayLogo: false,
        accentColour: '#1a73e8',
        invoiceSetting: {
          defaultPaymentTerm: { key: 'dueOnReceipt', value: 'Due upon receipt' },
          defaultTitle: 'Invoice',
          defaultSubTitle: '',
          defaultFooter: '',
          defaultMemo: '',
        },
        estimateSetting: {
          defaultTitle: 'Estimate',
          defaultSubTitle: '',
          defaultFooter: '',
          defaultMemo: '',
        },
        itemHeading: {
          column1: { name: 'Items', shouldShow: true },
          column2: { name: 'Quantity', shouldShow: true },
          column3: { name: 'Price', shouldShow: true },
          column4: { name: 'Amount', shouldShow: true },
          hideItem: false,
          hideDescription: false,
          hideQuantity: false,
          hidePrice: false,
          hideAmount: false,
        },
      },
    })
  }

  // Subscriptions — specific paths before generic /subscription
  if (path.includes('/billings') || path.includes('/billing')) {
    return envelope(billingHistory)
  }
  if (path.includes('/subscriptions/me/cards') || path.includes('/subscriptions/me/subscription')) {
    return envelope(subscriptionPlan)
  }
  if (path.includes('/subscription') || path.includes('/subscriptions')) {
    return envelope(subscriptionPlan)
  }

  // Dashboard
  if (path.includes('/dashboard/cashflow') || path.includes('/dashboard/profit') || path.includes('/dashboard/income')) {
    return envelope({ values: chartValues, currency, headings: ['Category', 'This month', 'YTD'], tip: 'Demo net income' })
  }
  if (path.includes('/dashboard/expense')) {
    return envelope({ values: chartValues, currency })
  }
  if (path.includes('/dashboard/payable') || path.includes('/dashboard/owing')) {
    return envelope({ data: invoices.map(i => ({ displayName: i.displayName, amount: i.amount, currency })) })
  }
  if (path.includes('/dashboard/overdue')) {
    return envelope(path.includes('bills') ? bills : invoices)
  }
  if (path.includes('/dashboard/bank/accounts')) {
    return envelope(bankAccounts)
  }
  if (path.includes('/dashboard')) {
    return envelope({ values: chartValues, currency, data: invoices })
  }

  // Domain lists — specific routes before generic id matches
  if (path.includes('/invoices/count') || path.includes('/invoices/createinvoicenumber') || path.includes('/invoices/dashboard')) {
    return envelope({
      invoiceCount: { total: invoices.length, unpaid: 1, draft: 1, sent: 1, viewed: 0, overdue: 1 },
      invoiceNumber: 'INV-1003',
      invoiceDashboardData: {
        currency,
        overdue: 1200,
        due: 450,
        paidThisMonth: 980,
      },
      statusCount: { unpaid: 1, draft: 1, all: 2 },
    })
  }
  if (path.includes('/invoices') && !path.match(/\/invoices\/[^/]+$/)) {
    return envelope({ invoices, meta: meta(invoices.length) })
  }
  if (path.match(/\/invoices\/[^/]+$/)) {
    const id = path.split('/').pop()
    const invoice = invoices.find(i => i._id === id || i.id === id) || invoices[0]
    return envelope({ invoice })
  }

  if (path.includes('/estimates') && !path.match(/\/estimates\/[^/]+$/)) {
    return envelope({ estimates, meta: meta(estimates.length) })
  }
  if (path.match(/\/estimates\/[^/]+$/)) {
    return envelope({ estimate: estimates[0] })
  }

  if (path.includes('/customers') && !path.match(/\/customers\/[^/]+$/)) {
    return envelope({ customers, meta: meta(customers.length) })
  }
  if (path.match(/\/customers\/[^/]+$/) || path.includes('/customers/slim')) {
    return envelope({ customer: customers[0], customers })
  }

  if (path.includes('/vendors')) {
    return envelope({ vendors, meta: meta(vendors.length), vendor: vendors[0] })
  }

  if (path.includes('/products') || path.includes('/product')) {
    return envelope({ products, meta: meta(products.length), product: products[0] })
  }

  if (path.includes('/taxes')) {
    return envelope({ taxes, meta: meta(taxes.length), tax: taxes[0] })
  }

  if (path.includes('/bills')) {
    return envelope({
      bills: bills.map(b => ({
        ...b,
        dueAmount: b.dueAmount ?? b.amount,
        totalAmount: b.totalAmount ?? b.amount,
        vendor: b.vendor || { vendorName: 'Vendor' },
      })),
      meta: meta(bills.length),
      bill: bills[0],
    })
  }

  if (path.includes('/receipts')) {
    return envelope({ receipts, meta: meta(receipts.length), receipt: receipts[0] })
  }

  if (path.includes('/payments')) {
    return envelope({
      payments,
      refunds: [],
      meta: meta(payments.length),
      data: payments,
      verification: { isVerified: true },
    })
  }

  if (path.includes('/checkouts')) {
    return envelope({ checkouts: [], meta: meta(0) })
  }

  if (path.includes('/recurring/count')) {
    return envelope({ invoiceCount: { draft: 0, active: 0, total: 0 } })
  }
  if (path.includes('/recurring')) {
    return envelope({ invoices: [], meta: meta(0), invoiceCount: { draft: 0, active: 0, total: 0 } })
  }

  if (path.includes('/peyme') || path.includes('/payyitme')) {
    return envelope({
      peyme: {
        _id: 'peyme1',
        slug: 'finance-studio',
        title: STATIC_BUSINESS_NAME,
        name: STATIC_BUSINESS_NAME,
        isActive: true,
        amountLimit: 5000,
        mediaType: 'image',
        description: 'Pay Finance Studio',
        imageUrl: '',
        isDeleted: false,
        shouldAskProcessingFee: false,
        isRequestTip: false,
        isBillingAddress: false,
        isShippingAddress: false,
        isCustomLimitSet: false,
        isMemo: false,
        memoLabel: 'What is this payment for?',
        business: {
          ...STATIC_BUSINESS,
          currency,
        },
        publicView: {
          shareableLinkUrl: 'http://localhost:3000/for/finance-studio',
          qrCodeUrl: '',
        },
        report: {
          viewCount: 42,
          paymentCount: 2,
          totalAmountReceived: 1650,
        },
      },
    })
  }

  if (path.includes('/delegate')) {
    return envelope({
      delegateUsers: [
        {
          _id: 'biz-user-finance',
          firstName: 'Alex',
          lastName: 'Morgan',
          email: STATIC_LOGIN_EMAIL,
          status: 'accepted',
          position: 'Owner',
          acl: { role: 'Owner', permissions: STATIC_USER.acl.permissions },
        },
        {
          _id: 'delegate-editor-1',
          firstName: 'Jamie',
          lastName: 'Chen',
          email: 'jamie.chen@email.com',
          status: 'accepted',
          position: 'Accountant/Bookkeeper',
          acl: { role: 'Editor', permissions: STATIC_USER.acl.permissions },
        },
      ],
    })
  }

  if (path.includes('/roles')) {
    return envelope([
      {
        _id: 'role-admin',
        name: 'Admin',
        suitableFor: 'Full access to manage your business',
        image: '',
      },
      {
        _id: 'role-editor',
        name: 'Editor',
        suitableFor: 'Can create and edit records',
        image: '',
      },
      {
        _id: 'role-viewer',
        name: 'Viewer',
        suitableFor: 'Read-only access',
        image: '',
      },
    ])
  }

  if (path.includes('/emails')) {
    return envelope({
      emails: [
        {
          _id: 'email1',
          email: STATIC_LOGIN_EMAIL,
          status: 'verified',
          isPrimary: true,
        },
      ],
    })
  }

  if (path.includes('/funding') || path.includes('/crowdfunding') || path.includes('/give')) {
    return envelope({
      funding: {
        _id: 'fund1',
        slug: 'community-give',
        mediaType: 'image',
        amountLimit: 10000,
        title: 'Community Give',
        description: 'Support our community fund',
        isActive: true,
        imageUrl: '',
        shouldAskProcessingFee: false,
        isRequestTip: false,
        isRecurringFundingAllowed: true,
        isOneTimePaymentScheduleAllowed: true,
        isCustomLimitSet: false,
        isMemo: false,
        memoLabel: 'What is this payment for?',
        business: {
          ...STATIC_BUSINESS,
          currency,
        },
        publicView: {
          shareableLinkUrl: 'http://localhost:3000/give/community-give',
          qrCodeUrl: '',
        },
        report: {
          viewCount: 18,
          paymentCount: 3,
          totalAmountReceived: 750,
        },
      },
      campaigns: [],
      meta: meta(0),
    })
  }

  // Business countries must run before generic /business
  if (path.includes('/businesses/countries') || path.includes('/business/countries')) {
    return envelope({ countries: demoCountries })
  }

  if (path.includes('/mcc')) {
    return envelope({
      mcc: [
        { mcc: '5734', type: 'Computer Software Stores' },
        { mcc: '7392', type: 'Management, Consulting and Public Relations Services' },
        { mcc: '5812', type: 'Eating Places and Restaurants' },
        { mcc: '5411', type: 'Grocery Stores and Supermarkets' },
        { mcc: '5651', type: 'Family Clothing Stores' },
        { mcc: '7011', type: 'Lodging — Hotels, Motels, Resorts' },
        { mcc: '8011', type: 'Doctors and Physicians' },
        { mcc: '8021', type: 'Dentists and Orthodontists' },
        { mcc: '8111', type: 'Legal Services and Attorneys' },
        { mcc: '8299', type: 'Schools and Educational Services' },
        { mcc: '8398', type: 'Charitable and Social Service Organizations' },
        { mcc: '8999', type: 'Professional Services (Not Elsewhere Classified)' },
      ],
    })
  }

  if (path.includes('/business')) {
    return envelope({
      businesses: {
        ownerAccess: [{ ...STATIC_BUSINESS }],
        guestAccess: [],
      },
      business: { ...STATIC_BUSINESS },
      selectedBusiness: { ...STATIC_BUSINESS },
    })
  }

  if (path.includes('/banking') || path.includes('/bank')) {
    return envelope(bankAccounts)
  }

  if (path.includes('/session')) {
    return envelope({
      session: { valid: true },
      devices: [],
      allUserSession: [
        {
          userId: STATIC_USER._id,
          _id: 'session1',
          refreshToken: STATIC_AUTH_TOKEN,
          isActive: true,
          deviceInfo: { browser: 'Chrome', os: 'Linux' },
        },
      ],
    })
  }

  if (path.includes('/banner')) {
    return envelope({ banners: [] })
  }

  // Currencies API returns a bare array of country-shaped objects (see setCurrencyList)
  if (path.includes('/currencies')) {
    return countryCurrencyList
  }

  // Countries API is read as (await fetchCountries()).countries
  if (path.match(/\/countries\/[^/]+\/?$/)) {
    return {
      statusCode: 200,
      data: { states: [{ id: 1, name: 'California' }, { id: 2, name: 'New York' }] },
      states: [{ id: 1, name: 'California' }, { id: 2, name: 'New York' }],
    }
  }
  if (path.includes('/countries')) {
    return {
      statusCode: 200,
      countries: demoCountries,
      list: [],
      data: { countries: demoCountries },
    }
  }

  // Create business (expects 201 + data.business)
  if ((path.includes('/businesses') || path.match(/\/business\/?$/)) && verb === 'POST' && !path.includes('/countries')) {
    const input = payload.businessInput || payload
    const orgName = input.organizationName || input.name || 'New Demo Business'
    const created = {
      ...STATIC_BUSINESS,
      _id: `biz-${Date.now()}`,
      organizationName: orgName,
      name: orgName,
      organizationType: input.organizationType || STATIC_BUSINESS.organizationType,
      businessType: input.businessType || '',
      country: input.country || STATIC_BUSINESS.country,
      currency: input.currency || STATIC_BUSINESS.currency,
      isPrimary: false,
    }
    return {
      statusCode: 201,
      status: 201,
      success: true,
      message: 'Business created successfully',
      data: { business: created },
      accessToken: STATIC_AUTH_TOKEN,
      refreshToken: STATIC_AUTH_TOKEN,
      token: STATIC_AUTH_TOKEN,
    }
  }

  // Mutations: accept anything
  if (verb !== 'GET') {
    return envelope({
      success: true,
      business: { ...STATIC_BUSINESS },
      ...STATIC_BUSINESS,
      invoice: invoices[0],
      customer: customers[0],
    })
  }

  // Default catch-all
  return envelope({
    data: invoices,
    values: chartValues,
    items: invoices,
    list: invoices,
    invoices,
    customers,
    products,
    bills,
    vendors,
    payments,
    meta: meta(2),
    headings: ['Category', 'This month', 'YTD'],
    tip: 'Demo data',
    currency,
    paymentSetting,
    processingFee,
    count: 2,
    total: 2,
  })
}

export function applyStaticMockAdapter(client, options = {}) {
  const { isBlob = false } = options

  client.interceptors.request.use(config => {
    config.adapter = async cfg => {
      if (isBlob) {
        const mockPdfBuffer = new TextEncoder().encode('%PDF-1.4 static mock export')
        return {
          data: mockPdfBuffer.buffer,
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'application/pdf' },
          config: cfg,
          request: {},
        }
      }

      const url = cfg.url || cfg.baseURL || ''
      const mockBody = buildStaticResponse(url, cfg.method, cfg.data)
      return {
        data: mockBody,
        status: mockBody?.statusCode || 200,
        statusText: 'OK',
        headers: {},
        config: cfg,
        request: {},
      }
    }
    return config
  })

  return client
}
