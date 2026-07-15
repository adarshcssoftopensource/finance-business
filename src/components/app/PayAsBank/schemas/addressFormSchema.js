export const addressFormSchema = {
  type: 'object',
  required: [
    'businessAddressLine1',
    'city',
    'state',
    'zip'
  ],
  properties: {
    businessAddressLine1: {
      type: 'string',
      'title': 'Business Address Line 1',
      'maxLength': 35
    },
    businessAddressLine2: {
      type: 'string',
      'title': 'Business Address Line 1',
      'maxLength': 35
    },
    city: {
      type: 'string',
      title: 'City'
    },
    state: {
      type: 'string',
      title: 'State'
    },
    zip: {
      type: 'string',
      title: 'Postal Code',
      'maxLength': 7
    }
  }
}; 