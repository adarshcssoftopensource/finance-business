import { businessFormSchema } from './businessFormSchema';
import { addressFormSchema } from './addressFormSchema';
import { bankAccountSchema } from './bankAccountSchema';

export const combinedFormSchema = {
  type: 'object',
  title: 'Business Information',
  properties: {
    businessInfo: {
      title: 'Business Information',
      "isLabelHide": true,
      ...businessFormSchema,
    },
  /*  address: {
      title: 'Address',
      "isLabelHide": true,

    },*/
    bankAccount: {
      title: 'Bank Account Details',
      // "isLabelHide": true,
      ...bankAccountSchema
    }
  }
};