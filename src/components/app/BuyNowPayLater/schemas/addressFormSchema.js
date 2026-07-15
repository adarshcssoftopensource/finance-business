export const addressFormSchema = {
  type: 'object',
  properties: {
    addressLine1: {
      type: 'string',
      title: 'Address Line 1'
    },
    addressLine2: {
      type: 'string',
      title: 'Address Line 2'
    },
    city: {
      type: 'string',
      title: 'City'
    },
    state: {
      type: 'string',
      title: 'State'
    },
    postalCode: {
      type: 'string',
      title: 'Postal Code'
    }
  }
};
