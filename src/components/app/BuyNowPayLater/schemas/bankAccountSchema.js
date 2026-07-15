export const bankAccountSchema = {
  type: 'object',
  properties: {
    accountNumber: {
      type: 'string',
      title: 'Account Number'
    },
    routingNumber: {
      type: 'string',
      title: 'Routing Number'
    },
    accountType: {
      type: 'string',
      title: 'Account Type',
      enum: ['checking', 'savings'],
      enumNames: ['Checking', 'Savings']
    }
  }
};
