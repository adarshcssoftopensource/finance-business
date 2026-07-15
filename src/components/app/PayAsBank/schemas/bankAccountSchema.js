export const bankAccountSchema = {
  type: "object",
  required: ["accountNumber", "routingNumber", "accountType", "accountHolderName", 'attestation', "attestationAgreement"],
  properties: {
    accountNumber: {
      type: "string",
      title: "Account Number",
      minLength: 4,
      maxLength: 17
    },
    routingNumber: {
      type: "string",
      title: "Routing Number",
      pattern: "^\\d{9}$"
    },
    accountType: {
      type: "string",
      title: "Account Type",
      enum: ["checking", "savings"],
      enumNames: ["Checking", "Savings"]
    },
    accountHolderName: {
      type: "string",
      title: "Account Holder’s Name"
    },
    attestation: {
      isLabelHide: true,
      type: "boolean",
      type: 'boolean',
      title: 'Terms and Conditions',
      primaryText: "I acknowledge and agree to the ",
      secondaryText: "ACH Authorization — Payment Terms & Conditions.",
      termsContent: `<div>
              <h3>ACH Authorization – Payment Terms & Conditions</h3>
              <p>You authorize Finance to process ACH payments, refunds, and adjustments to and from your bank account.</p>
              
              <h4>1. Authorization & Consent</h4>
              <p>By agreeing to these terms, you:</p>
              <ul>
                <li>Authorize Finance to initiate ACH transactions for payments, refunds, and adjustments.</li>
                <li>Confirm that the linked bank account belongs to you and that you have the authority to provide this authorization.</li>
                <li>Consent to these transactions in accordance with NACHA rules and applicable laws.</li>
              </ul>

              <h4>2. Duration & Cancellation</h4>
              <p>This authorization remains active until:</p>
              <ul>
                <li>You update your payment preferences, or</li>
                <li>You request cancellation by emailing payments@Finance.com, allowing Finance reasonable time to process the request.</li>
              </ul>

              <h4>3. Error Resolution & Adjustments</h4>
              <ul>
                <li>If an incorrect ACH debit or credit occurs, Finance is authorized to make necessary adjustments.</li>
                <li>You agree to promptly notify Finance of any errors to ensure timely resolution.</li>
              </ul>

              <h4>4. Compliance & Liability</h4>
              <ul>
                <li>You agree to maintain sufficient funds in your account to cover transactions.</li>
                <li>Finance is not responsible for any fees due to insufficient funds, overdrafts, or rejected payments.</li>
              </ul>

              <p><strong>By proceeding, you acknowledge that you have read, understood, and agreed to these ACH Authorization Payment Terms & Conditions.</strong></p>
            </div>`
    },
    attestationAgreement: {
      isLabelHide: true,
      type: "boolean",
      type: 'boolean',
      title: 'ACH Origination Agreement',
      primaryText: "I acknowledge and agree to the",
      secondaryText: "ACH Origination Agreement.",
      termsContent: `
        <div>
  <h3>ACH Origination Agreement</h3>
  <p>The ACH Network enables you to process debit and credit transactions from U.S. bank account holders. By using Finance to access the ACH Network, you agree to the terms outlined below. These terms form part of the Finance Services Agreement.
</p>
  <h4>1. NACHA Rules</h4>
  <p>You must follow the <a class="font-weight-bold" href="https://nachaoperatingrulesonline.org/pubchange" target="_blank"><u> NACHA Operating Rules</u> </a> when submitting ACH transactions.</p>
  
  <h4>2. Authorizations: </h4>
  <p> As the Originator of ACH transactions, you confirm that you have the necessary customer authorizations and approvals. You accept responsibility for ensuring that all transaction information provided to Finance is accurate, timely, and complete. Finance is not liable for issues arising from unauthorized transactions or inaccuracies.
</p>
  
  <h4>3. Funds, Limits, and Charges</h4>
  <p>Funds will be made available according to agreed settlement timings. Limits may apply, and fees for ACH origination, returns, and related services will be billed by Finance.</p>
  
  <h4>4. Termination and Suspension</h4>
  <p>Finance may suspend or terminate your access to the ACH Network for violating NACHA rules, exceeding return limits, or if requested by an ODFI Bank.</p>
  
  <h4>5. Compliance Information</h4>
  <p>You must promptly provide any information requested to ensure compliance with NACHA rules. Failure to do so may result in suspension or termination.</p>
  
  <h4>6. Warranty</h4>
  <p>You guarantee that your transactions comply with U.S. regulations and do not cause Finance, its service providers, or ODFI Banks to violate any laws.</p>
  
  <h4>7. Nested Third-Party Senders</h4>
  <p>You are not allowed to process ACH transactions as a Nested Third Party Sender through Finance.</p>
  
  <p><strong>By proceeding, you acknowledge that you have read, understood, and agreed to the ACH Origination Agreement.</strong></p>
</div>

      `
    },
  }
}; 