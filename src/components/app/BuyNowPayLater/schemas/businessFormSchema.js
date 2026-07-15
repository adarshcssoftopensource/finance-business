export const businessFormSchema = {
  type: 'object',
  properties: {
    businessName: {
      type: 'string',
      title: 'Business Name'
    },
    businessType: {
      type: 'string',
      title: 'Business Type',
      enum: ['sole_proprietorship', 'partnership', 'corporation', 'llc'],
      enumNames: ['Sole Proprietorship', 'Partnership', 'Corporation', 'LLC']
    },
    taxNumber: {
      type: 'string',
      title: 'Tax Number'
    },
    idNumber: {
      type: 'string',
      title: 'ID Number'
    }
  }
};
