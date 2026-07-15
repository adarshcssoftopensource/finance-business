import React, { Component, Fragment } from 'react';
import CenterSpinner from '../../../../../global/CenterSpinner';

class ShowPreview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      renderInvoiceTemplate: '',
      iframeHeight: 800
    };
  }

  componentDidMount() {
    const { userSettings, invoiceInput, businessInfo, selectedCustomer } = this.props;

    const sumofTax =
      invoiceInput.amountBreakup.taxTotal.length > 0
        ? invoiceInput.amountBreakup.taxTotal.reduce((a, b) => a + b.amount, 0)
        : 0;
    const processingTipAmount = invoiceInput.amountBreakup.tip || 0;
    const totalWithTax = sumofTax + invoiceInput.amountBreakup.subTotal + processingTipAmount || 0;
    invoiceInput.amountBreakup['totalWithTax'] = totalWithTax;

    const data = {
      invoice: {
        ...invoiceInput,
        businessId: businessInfo,
        userId: userSettings.userId,
        uuid: userSettings.uuid,
        _id: userSettings._id,
        customer: selectedCustomer
          ? selectedCustomer
          : { customerName: "You've not added a customer." }
      },
      salesSetting: {
        ...userSettings,
        colours: {
          shadeColour: '#cccccc',
          textColour: '#1c252c',
          titleColour: '#1c252c99'
        }
      }
    };

    this.generateTemplateHtml(data);
  }

  generateTemplateHtml = (data) => {
    this.setState({ loading: true });

    const { invoice } = data;
    const { customer, amountBreakup } = invoice;
    console.log(amountBreakup, "amountBreakup");

    // ── Business fields from actual data structure ──
    const business = typeof invoice.businessId === 'object' && invoice.businessId !== null
      ? invoice.businessId
      : {};
    const businessName = business.organizationName || business.businessName || business.name || '';
    const countryName = business.address?.country?.name || business.country?.name || '';
    const stateName = business.address?.state?.name || '';
    const businessAddress = [stateName, countryName].filter(Boolean).join(', ');
    const businessEmail = business.email || business.communication?.email || '';
    const businessPhone = business.phone || business.communication?.phone || '';

    // ── Customer fields ──
    const customerName = customer.customerName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || '—';
    const customerPhone = customer.communication?.phone || customer.phone || '';
    const customerEmail = customer.email || '';
    const customerCity = customer.addressBilling?.city || '';
    const customerPostal = customer.addressBilling?.postal || '';

    // ── Format ISO dates ──
    const formatDate = (dateStr) => {
      if (!dateStr) return '—';
      const d = new Date(dateStr);
      return isNaN(d.getTime())
        ? dateStr
        : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // ── Currency symbol ──
    const symbol = invoice.currency?.symbol || customer.currency?.symbol || '$';

    // ── Item rows using actual field names: column1, column3, column4 ──
    const itemRows = (invoice.items || [])
      .map((item) => {
        const name = item.column1 || item.name || '—';
        const desc = item.column2 || '';
        const qty = item.column3 || 1;
        const price = parseFloat(item.column4 || 0);
        const amt = parseFloat(item.amount || (price * qty) || 0);
        return `
        <tr>
          <td class="item-name">
            ${name}
            ${desc ? `<div class="item-desc">${desc}</div>` : ''}
          </td>
          <td class="center">${qty}</td>
          <td class="right">${symbol}${price.toFixed(2)}</td>
          <td class="right bold">${symbol}${amt.toFixed(2)}</td>
        </tr>`;
      }).join('');

    // ── Tax rows — taxName is a nested object ──
    const taxRows = (amountBreakup.taxTotal || [])
      .map((tax) => {
        const taxLabel = tax.taxName?.name || tax.name || tax.taxName?.abbreviation || 'Tax';
        const taxRate = tax.rate ? ` (${tax.rate}%)` : '';
        return `
      <div class="summary-line">
        <span class="label">${taxLabel}${taxRate}:</span>
        <span class="value">${symbol}${parseFloat(tax.amount || 0).toFixed(2)}</span>
      </div>`;
      }).join('');

    const tipRow = amountBreakup.tip > 0
      ? `<div class="summary-line">
         <span class="label">Tip:</span>
         <span class="value">${symbol}${parseFloat(amountBreakup.tip).toFixed(2)}</span>
       </div>` : '';

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8"/>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
          background: #ffffff;
          font-size: 13px;
          color: #2c3e50;
        }

        .invoice-card {
          background: #fff;
          width: 100%;
          min-height: 950px;
        }

        /* ── Header ── */
        .inv-header {
          text-align: center;
          padding: 36px 40px 24px;
          border-bottom: 2px solid #e8ecf0;
        }
        .inv-header h1 {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: 4px;
          color: #1a252f;
          text-transform: uppercase;
        }
        .inv-header .biz-name {
          font-size: 15px;
          font-weight: 600;
          color: #2c3e50;
          margin-top: 6px;
        }
        .inv-header .biz-sub {
          font-size: 12px;
          color: #8a9bb0;
          margin-top: 3px;
          line-height: 1.7;
        }

        /* ── Info Grid ── */
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          padding: 22px 32px;
          border-bottom: 1px solid #e8ecf0;
        }
        .info-col:first-child { padding-right: 24px; border-right: 1px solid #e8ecf0; }
        .info-col:last-child { padding-left: 24px; }
        .info-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #8a9bb0;
          margin-bottom: 8px;
        }
        .cust-name {
          font-size: 15px;
          font-weight: 700;
          color: #1a252f;
          margin-bottom: 5px;
        }
        .detail {
          font-size: 12px;
          color: #6b7c93;
          line-height: 1.9;
        }
        .meta-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          padding: 4px 0;
        }
        .meta-row span:first-child { color: #8a9bb0; }
        .meta-row span:last-child { font-weight: 600; color: #1a252f; }

        /* ── Status badge ── */
        .status-badge {
          display: inline-block;
          margin-top: 10px;
          padding: 3px 12px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          background: #fff8e1;
          color: #f59e0b;
          border: 1px solid #fde68a;
        }

        /* ── Table ── */
        .table-wrap { }
        table.items { width: 100%; border-collapse: collapse; }
        table.items thead tr { background: #4caf50; }
        table.items th {
          padding: 13px 20px;
          text-align: left;
          font-size: 12px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.3px;
        }
        table.items th.center { text-align: center; }
        table.items th.right { text-align: right; }

        table.items tbody tr { border-bottom: 1px solid #f0f4f8; }
        table.items tbody tr:last-child { border-bottom: none; }
        table.items tbody tr:hover { background: #f7fdf7; }
        table.items td { padding: 14px 20px; }
        table.items td.item-name { font-weight: 600; color: #1a252f; }
        .item-desc { font-size: 11px; color: #8a9bb0; font-weight: 400; margin-top: 2px; }
        table.items td.center { text-align: center; color: #4a5568; }
        table.items td.right { text-align: right; color: #4a5568; }
        table.items td.bold { font-weight: 700; color: #1a252f; text-align: right; }

        /* ── Totals ── */
        .totals-wrap {
          padding: 20px 32px 24px;
          display: flex;
          justify-content: flex-end;
          border-top: 1px solid #e8ecf0;
        }
        .totals-table { width: 290px; }
        .summary-line {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          font-size: 13px;
        }
        .summary-line .label { color: #6b7c93; font-weight: 500; }
        .summary-line .value { font-weight: 600; color: #2c3e50; }
        .total-divider { border: none; border-top: 1.5px solid #1a252f; margin: 8px 0; }
        .total-final {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 15px;
          font-weight: 800;
          color: #1a252f;
        }
        .amount-due-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 14px;
          margin-top: 10px;
          background: #f0faf0;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          color: #2e7d32;
          border: 1.5px solid #c8e6c9;
        }

        /* ── Notes ── */
        .notes-wrap {
          padding: 20px 32px;
          border-top: 1px solid #e8ecf0;
        }
        .notes-title {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #8a9bb0;
          margin-bottom: 10px;
        }
        .notes-wrap ol {
          padding-left: 18px;
          color: #6b7c93;
          font-size: 12px;
          line-height: 2.1;
        }

        /* ── Footer ── */
        .thankyou {
          text-align: center;
          padding: 16px 24px 4px;
          font-size: 12px;
          color: #a0b0c0;
          font-style: italic;
          border-top: 1px solid #e8ecf0;
        }
        .download-wrap {
          padding: 18px 32px 32px;
          text-align: center;
        }
        .download-btn {
          background: #2979ff;
          color: #fff;
          border: none;
          border-radius: 50px;
          padding: 14px 52px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 16px rgba(41,121,255,0.3);
          font-family: inherit;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .download-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(41,121,255,0.4);
        }
        @media print { .download-wrap { display: none; } }
      </style>
    </head>
    <body>
      <div class="invoice-card">

        <!-- Header -->
        <div class="inv-header">
          <h1>Invoice</h1>
          <div class="biz-name">${businessName}</div>
          <div class="biz-sub">
            ${businessAddress}
            ${businessEmail ? '<br/>' + businessEmail : ''}
            ${businessPhone ? '<br/>' + businessPhone : ''}
          </div>
        </div>

        <!-- Info Grid -->
        <div class="info-grid">
          <!-- Left: Customer -->
          <div class="info-col">
            <div class="info-label">Bill To</div>
            <div class="cust-name">${customerName}</div>
            <div class="detail">
              ${customerPhone ? '+' + customerPhone + '<br/>' : ''}
              ${customerEmail ? customerEmail + '<br/>' : ''}
              ${customerCity ? customerCity + (customerPostal ? ' ' + customerPostal : '') : ''}
            </div>
          </div>

          <!-- Right: Invoice Meta -->
          <div class="info-col">
            <div class="info-label">Invoice Details</div>
            <div class="meta-row">
              <span>Invoice Number:</span>
              <span>${invoice.invoiceNumber || '—'}</span>
            </div>
            ${invoice.purchaseOrder ? `
            <div class="meta-row">
              <span>P.O/S.O Number:</span>
              <span>${invoice.purchaseOrder}</span>
            </div>` : ''}
            <div class="meta-row">
              <span>Invoice Date:</span>
              <span>${formatDate(invoice.invoiceDate)}</span>
            </div>
            ${invoice.dueDate ? `
            <div class="meta-row">
              <span>Payment Due:</span>
              <span>${formatDate(invoice.dueDate)}</span>
            </div>` : ''}
            <div class="meta-row">
              <span>Amount Due:</span>
              <span>${symbol}${parseFloat(amountBreakup.totalWithTax || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <!-- Items Table -->
        <div class="table-wrap">
          <table class="items">
            <thead>
              <tr>
                <th>${invoice.itemHeading?.column1?.name || 'Items'}</th>
                <th class="center">${invoice.itemHeading?.column2?.name || 'Quantity'}</th>
                <th class="right">${invoice.itemHeading?.column3?.name || 'Price'}</th>
                <th class="right">${invoice.itemHeading?.column4?.name || 'Amount'}</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>
        </div>

        <!-- Totals -->
        <div class="totals-wrap">
          <div class="totals-table">
            <div class="summary-line">
              <span class="label">Subtotal:</span>
              <span class="value">${symbol}${parseFloat(amountBreakup.subTotal || 0).toFixed(2)}</span>
            </div>
            ${taxRows}
            ${tipRow}
            <hr class="total-divider"/>
            <div class="total-final">
              <span>Total:</span>
              <span>${symbol}${parseFloat(amountBreakup.totalWithTax || 0).toFixed(2)}</span>
            </div>
            <div class="amount-due-row">
              <span>Amount Due (${invoice.currency?.code || 'USD'}):</span>
              <span>${symbol}${parseFloat(amountBreakup.totalWithTax || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="notes-wrap">
          <div class="notes-title">Notes</div>
          <ol>
            <li>This invoice is system-generated &amp; doesn't require a signature.</li>
            <li>Services provided are non-refundable.</li>
            ${invoice.notes ? `<li>${invoice.notes}</li>` : ''}
            ${invoice.footer ? `<li>${invoice.footer}</li>` : ''}
          </ol>
        </div>

        <!-- Thank you + Download -->
        <div class="thankyou">Thank you for your business! We appreciate your trust in us.</div>
        <div class="download-wrap">
          <button class="download-btn" onclick="window.print()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download
          </button>
        </div>

      </div>
    </body>
    </html>
  `;

    this.setState({ renderInvoiceTemplate: html, loading: false }, () =>
      this.handleResize()
    );
  };

  onLoad = () => {
    this.iframeRef.contentWindow.addEventListener('resize', this.handleResize);
    this.handleResize();
  };

  handleResize = () => {
    if (
      this.iframeRef &&
      this.iframeRef.contentWindow &&
      this.iframeRef.contentWindow.document
    ) {
      const { body, documentElement } = this.iframeRef.contentWindow.document;
      const iframeHeight = Math.max(
        body.clientHeight,
        body.offsetHeight,
        body.scrollHeight,
        documentElement.clientHeight,
        documentElement.offsetHeight,
        documentElement.scrollHeight
      );
      if (iframeHeight !== this.state.iframeHeight) this.setState({ iframeHeight });
    }
  };

  render() {
    const { loading } = this.state;
    return (
      <Fragment>
        <div className="alert-action alert-info mt-4 mb-4">
          <div className="alert-icon">
            <svg className="Icon" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 19a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm0-2a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm0-11a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 3a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0v-4a1 1 0 0 1 1-1z" />
            </svg>
          </div>
          <div className="alert-content">
            <div className="alert-desc">
              This is a preview of your invoice. Switch back to Edit if you need to make changes.
            </div>
          </div>
        </div>

        {loading ? (
          <CenterSpinner />
        ) : (
          <iframe
            className="templateIframe"
            onLoad={this.onLoad}
            ref={(e) => { this.iframeRef = e; }}
            style={{ width: '820px', height: `${this.state.iframeHeight}px` }}
            srcDoc={this.state.renderInvoiceTemplate}
            frameBorder="0"
            scrolling="no"
          />
        )}
      </Fragment>
    );
  }
}

export default ShowPreview;