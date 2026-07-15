import {
  AttestationMask,
  BusinessIncorporationDateMask,
  BusinessPhoneMask,
  BusinessTypeInputMask,
  CopyInputMask,
  DisplayMask,
  DobMask,
  Numberformatmask,
  Numbermask,
  TermsAndConditionMask,
  WebsiteMask,
  CollapsibleTermsWidget
} from './components';

const uiSchema = {
  businessType: {
    'ui:widget': BusinessTypeInputMask
  },
  telephone: {
    'ui:widget': BusinessPhoneMask
  },
  personalPhone: {
    'ui:widget': BusinessPhoneMask
  },
  statement: {
    displayName: {
      'ui:widget': DisplayMask
    }
  },
  merchantAgreementAccepted: {
    'ui:widget': TermsAndConditionMask
  },
  attestation: {
    'ui:widget': AttestationMask
  },
  attestationAgreement : {
    'ui:widget': AttestationMask
  },
  providerAgreementAccepted: {
    'ui:widget': TermsAndConditionMask
  },
  dob: {
    'ui:widget': DobMask
  },
  businessIncorporationDate: {
    'ui:widget': BusinessIncorporationDateMask
  },
  idNumber: {
    'ui:widget': Numbermask
  },
  taxNumber: {
    'ui:widget': Numbermask
  },
  annualCardVolume: {
    'ui:widget': Numberformatmask
  },
  averageTransactionAmount: {
    'ui:widget': Numberformatmask
  },
  projectedMonthlyTransactionVolume: {
    'ui:widget': Numberformatmask
  },
  maxTransactionAmount: {
    'ui:widget': Numberformatmask
  },
  website: {
    'ui:widget': WebsiteMask
  },
  representative: {
    dob: {
      'ui:widget': DobMask
    },
    personalPhone: {
      'ui:widget': BusinessPhoneMask
    }
  },
  director: {
    dob: {
      'ui:widget': DobMask
    },
    personalPhone: {
      'ui:widget': BusinessPhoneMask
    }
  },
  executive: {
    dob: {
      'ui:widget': DobMask
    },
    personalPhone: {
      'ui:widget': BusinessPhoneMask
    }
  },
  webhookUrl: {
    'ui:widget': CopyInputMask
  },
  businessInfo: {
    idNumber: {
      'ui:widget': Numbermask
    },
    taxNumber: {
      'ui:widget': Numbermask
    },
    dob: {
      'ui:widget': DobMask
    },
  },
  bankAccount: {
    attestation: {
      'ui:widget': CollapsibleTermsWidget,
      // 'ui:options': {
      //   primaryText: "I acknowledge and agree to the",
      //   secondaryText: "Terms and Conditions",
      //   termsContent: `
      //     <h3>ACH Authorization – Payment Terms & Conditions</h3>
      //     <p>You authorize Finance to process ACH payments, refunds, and adjustments to and from your bank account.</p>
          
      //     <h4>1. Authorization & Consent</h4>
      //     <p>By agreeing to these terms, you:</p>
      //     <ul>
      //       <li>Authorize Finance to initiate ACH transactions for payments, refunds, and adjustments.</li>
      //       <li>Confirm that the linked bank account belongs to you and that you have the authority to provide this authorization.</li>
      //       <li>Consent to these transactions in accordance with NACHA rules and applicable laws.</li>
      //     </ul>
      //     <!-- ... rest of your terms content ... -->
      //   `
      // }
    },
    attestationAgreement: {
      'ui:widget': CollapsibleTermsWidget
    }
  }

};

const uiSchema1 = {
  items: {
    personalPhone: {
      'ui:widget': BusinessPhoneMask
    },
    dob: {
      'ui:widget': DobMask
    },
    idNumber: {
      'ui:widget': Numbermask
    }
  }
};
export { uiSchema, uiSchema1 };
