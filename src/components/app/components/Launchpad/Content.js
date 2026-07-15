import React from 'react';
import decorDocumentAdd from "../../../../assets/decor--document-add.png"
import decorDocumentInvoice from "../../../../assets/decor--document-invoice.png"
import decorPaymentsCreditCard from "../../../../assets/decor--payments-credit-card.png"
import decorCustomize from "../../../../assets/decor--customize.png"
import decorAddUser from  "../../../../assets/decor--add-user.png"
import decorShoppingCart from  "../../../../assets/decor--shopping-cart.png"
import decorRecurringInvoices from "../../../../assets/decor--recurring-invoices.png"
import decorRecordPayments from "../../../../assets/decor--record-payments.png"
import decorImportData from "../../../../assets/decor--import-data.png"
import decorAddSales from "../../../../assets/decor--add-sales.png"
import decorScanRepeipts from "../../../../assets/decor--scan-repeipts.png"
import decorCustomizaedAccounts from "../../../../assets/decor--customizaed-accounts.png"
import decorHireAnExpert from "../../../../assets/decor--hire-an-expert.png"

export const invoicing = {
  heading: 'Professional invoicing',
  info: 'It’s more than just a way to say "pay me"',
  subHeading: 'The care and detail you put into invoicing can do wonders for your brand and future business. Take these quick actions to show customers the best you have to offer.',
  items: [
    {
      link: '/app/estimates/add',
      icon: (<img src={decorDocumentAdd} alt="Create estimates" />),
      label: 'Create estimates',
    },
    {
      link: '/app/invoices/add',
      icon: (<img src={decorDocumentInvoice} alt="Create invoices" />),
      label: 'Create invoices',
    },
    {
      link: '/app/payments',
      icon: (<img src={decorPaymentsCreditCard} alt="Accept payments" />),
      label: 'Accept payments',
    },
    {
      link: '/app/setting/invoice-customization',
      icon: (<img src={decorCustomize} alt="Adjust defaults" />),
      label: 'Adjust defaults',
    },
    {
      link: '/app/sales/customer/add',
      icon: (<img src={decorAddUser} alt="Add customers" />),
      label: 'Add customers',
    },
    {
      link: '/app/sales/products/add',
      icon: (<img src={decorShoppingCart} alt="Add products & services" />),
      label: 'Add products & services',
    },
    {
      link: '/app/recurring/add',
      icon: (<img src={decorRecurringInvoices} alt="Recurring invoices" />),
      label: 'Recurring Invoices',
    },
    {
      modal: 'RecordPayment',
      icon: (<img src={decorRecordPayments} alt="Record payments" />),
      label: 'Record payments',
    },
  ]
};

export const bookkeeping = {
  heading: 'Better bookkeeping',
  info: 'Get a clear view of your finances',
  subHeading: 'Bookkeeping doesn\'t have to be daunting — say hello to simpler tax filing and deeper insights. Our machine learning and automation do the heavy lifting as you handle these quick actions.',
  items: [
    {
      link: '#',
      icon: (<img src={decorImportData} alt="Import data automatically" />),
      label: 'Import data automatically',
    },
    {
      link: '#',
      icon: (<img src={decorRecordPayments} alt="Manage transactions" />),
      label: 'Manage transactions',
    },
    {
      link: '#',
      icon: (<img src={decorScanRepeipts} alt="Scan receipts" />),
      label: 'Scan receipts',
    },
    {
      link: '#',
      icon: (<img src={decorAddSales} alt="Add sales tax" />),
      label: 'Add sales tax',
    },
    {
      link: '#',
      icon: (<img src={decorCustomizaedAccounts} alt="Customize accounts" />),
      label: 'Customize accounts',
    },
    {
      link: '#',
      icon: (<img src={decorHireAnExpert} alt="Hire an expert" />),
      label: 'Hire an expert',
    },
  ]
};