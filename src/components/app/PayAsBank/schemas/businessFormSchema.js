export const businessFormSchema = {
  type: "object",
  required: ["legalName", "businessType", "taxNumber", "businessAddressLine1", "city", "state", "zip", "firstName", "lastName"],
  properties: {
    legalName: {
      type: "string",
      title: "Legal Business Name",
      minLength: 2
    },
    firstName: {
      type: "string",
      title: "First Name",
      minLength: 2
    },
    lastName: {
      type: "string", 
      title: "Last Name",
      minLength: 2
    },
    businessType: {
      type: "string",
      title: "Business Type",  // Changed from "Legal Business Name" since this is for business type
      minLength: 2,
      enum: [
        "sole_proprietorship",
        "partnership",
        "limited_liability_partnership",
        "limited_liability_company",
        "c_corporation",
        "s_corporation",
        "nonprofit_corporation"
      ],
      enumNames: [
        "Sole Proprietorship",
        "Partnership",
        "Limited Liability Partnership",
        "Limited Liability Company",
        "C Corporation",
        "S Corporation",
        "Nonprofit Organization"
      ]
    },
    taxNumber:  {
      "type": "string",
      "title": "Tax Identification Number (EIN)",
      "mask": "999-99-9999",
      "placeholder": "000-00-0000"
    },
    idNumber: {
      "type": "string",
      "title": "Social Security Number (SSN)",
      "mask": "999-99-9999",
      "placeholder": "000-00-0000"
    },
    dob: {
      "type": "string",
      "title": "Date of Birth"
    },
    businessAddressLine1: {
      type: 'string',
      'title': 'Business Address Line 1',
      'maxLength': 35
    },
    businessAddressLine2: {
      type: 'string',
      'title': 'Business Address Line 2',
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