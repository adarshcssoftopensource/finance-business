import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Form from '@rjsf/core';
import { combinedFormSchema } from './schemas/combinedFormSchema';
import { CustomFieldTemplate } from './components/CustomFields';
import { fetchPaymentSettings } from '../../../actions/paymentSettings';
import { getBusinessMcc } from '../../../actions/utilityAction';
import { submitPayByBankOnboarding } from '../../../actions/paymentAction';
import countryStates from './utils/country-states.json';
import { uiSchema } from '../components/PaymentOnBoarding/onBoarding/common/ui-schema';
import './styles/OnboardingForm.scss';

// Add this helper function at the top of your component
const makeFieldsReadOnly = (schema, isDisabled) => {
  if (!schema) return {};
  
  return Object.keys(schema).reduce((acc, key) => {
    if (typeof schema[key] === 'object') {
      acc[key] = makeFieldsReadOnly(schema[key], isDisabled);
    } else if (key === 'ui:widget' || key === 'ui:placeholder' || key === 'ui:help') {
      acc[key] = schema[key];
    } else {
      acc[key] = schema[key];
    }
    acc['ui:readonly'] = isDisabled;
    return acc;
  }, {});
};

const OnboardingForm = () => {
  const [formData, setFormData] = useState({
    businessInfo: {
      businessType: '',
      firstName: '',
      lastName: '',
      idNumber: '',
      dob: '',
      taxNumber : '',
    },
    address: {},
    bankAccount: {},
    country: ''
  });

  const [stateOptions, setStateOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dynamicSchema, setDynamicSchema] = useState(combinedFormSchema);

  useEffect(() => {
    const businessType = formData.businessInfo?.businessType;
  
    let updatedSchema = { ...combinedFormSchema };
  
    const { properties } = updatedSchema;
    const { businessInfo } = properties;
  

    let filteredProperties = { ...businessInfo.properties };
  
    if (!businessType) {
      delete filteredProperties.taxNumber;
      delete filteredProperties.idNumber;
    } else {
      const propertyToRemove =
        businessType === "sole_proprietorship" ? "taxNumber" : "idNumber";
      delete filteredProperties[propertyToRemove];
    }
  
    updatedSchema = {
      ...updatedSchema,
      properties: {
        ...properties,
        businessInfo: {
          ...businessInfo,
          properties: filteredProperties,
        },
      },
    };
  
    updatedSchema = {
      ...updatedSchema,
      properties: {
        ...updatedSchema.properties,
        businessInfo: {
          ...updatedSchema.properties.businessInfo,
          properties: {
            ...updatedSchema.properties.businessInfo.properties,
            state: {
              type: "string",
              title: "State",
              enum: stateOptions.map((state) => state.name),
              enumNames: stateOptions.map((state) => state.name),
            },
          },
        },
      },
    };
  
    setDynamicSchema(updatedSchema);
  }, [formData.businessInfo?.businessType, stateOptions]);


  const dispatch = useDispatch();
  const paymentSettings = useSelector(state => state.paymentSettings);
  const isPayByBankEnabled = paymentSettings?.data?.legalData?.isPayByBankEnabled;
  const onboardingStatus = paymentSettings?.data?.legalData?.bankProviderData?.onboardingStatus;

  const selectedBusiness = useSelector(state =>  state.businessReducer?.selectedBusiness);

  useEffect(() => {
    const loadData = async () => {
      await dispatch(fetchPaymentSettings());
      await dispatch(getBusinessMcc());
    };

    loadData();
  }, [dispatch]);

  useEffect(() => {
    if (selectedBusiness?.country?.id) {
      const statesList = addStateArray(selectedBusiness.country.id);
      setStateOptions(statesList);
    }
  }, [selectedBusiness]);

  useEffect(() => {
    if (paymentSettings.data) {
      const { legalData, business } = paymentSettings.data;
      const bankAccount = legalData?.bankProviderData?.bankAccounts?.[0] || legalData?.bankAccount || {};
      setFormData({
        businessInfo: {
          businessType: legalData?.businessType || '',
          legalName: legalData?.legalName || selectedBusiness?.legalName || '',
          taxNumber: legalData?.taxNumber || '',
          taxIdType: legalData?.taxIdType || 'tin', // Prefill taxIdType
          businessAddressLine1: legalData?.address?.addressLine1 || selectedBusiness?.address?.addressLine1 || '',
          businessAddressLine2: legalData?.address?.addressLine2 || selectedBusiness?.address?.addressLine2 || '',
          city: legalData?.address?.city || selectedBusiness?.address?.city || '',
          state: legalData?.address?.state?.name || selectedBusiness?.address?.state?.name || '',
          zip: legalData?.address?.postal || selectedBusiness?.address?.postal || '',
          firstName: legalData?.owner?.firstName || '',
          lastName: legalData?.owner?.lastName || '',
          idNumber: legalData?.taxNumber || '',
          dob: legalData?.owner?.dob || '',
        },
        bankAccount: {
          accountNumber: bankAccount?.accountNumber || legalData?.manualBankAccount?.accountNumber || '',
          routingNumber: bankAccount?.routingNumber || legalData?.manualBankAccount?.routingNumber || '',
          accountType: bankAccount?.accountType || legalData?.manualBankAccount?.accountType || '',
          accountHolderName: bankAccount?.accountHolderName || legalData?.manualBankAccount?.nickName || '',
          attestation: legalData.bankProviderData?.attestation || false,
          attestationAgreement : legalData.bankProviderData?.attestationAgreement || false
        },
        country: business?.country || selectedBusiness?.country?.id || '',
      });

      if (business?.country || selectedBusiness?.country?.id) {
        const countryId = business?.country || selectedBusiness?.country?.id;
        setStateOptions(addStateArray(countryId));
      }
    }
  }, [paymentSettings, selectedBusiness]);

  useEffect(() => {
    if (formData.country) {
      setStateOptions(addStateArray(formData.country));
    }
  }, [formData.country]);

  const addStateArray = (countryId) => {
    if (countryStates[countryId]) {
      return countryStates[countryId]; // Return entire state objects array
    }
    return [];
  };

  const handleSubmit = async (e) => {
    if(isLoading || isPayByBankEnabled || onboardingStatus !== 'not_started') return;
    setIsLoading(true);

    try {
      const selectedState = stateOptions.find(
        state => state.name === formData.businessInfo.state
      );

      const businessType = formData.businessInfo?.businessType;

      const taxIdType = (businessType === "sole_proprietorship") 
      ? "tin" 
      : "ein";


      const taxNumber = (businessType === "sole_proprietorship") 
      ? formData.businessInfo.idNumber
      : formData.businessInfo.taxNumber;

      const payload = {
        legalName: formData.businessInfo.legalName,
        businessType: formData.businessInfo.businessType,
        taxNumber: taxNumber,
        taxIdType: taxIdType,
        firstName: formData.businessInfo.firstName,
        lastName: formData.businessInfo.lastName,
        dob: formData.businessInfo.dob,
        address: {
          addressLine1: formData.businessInfo.businessAddressLine1,
          addressLine2: formData.businessInfo.businessAddressLine2,
          city: formData.businessInfo.city,
          state: selectedState || {
            name: formData.businessInfo.state,
            id: selectedState?.id,
            country_id: selectedState?.country_id,
            iso: selectedState?.iso,
            alpha2_code: selectedState?.alpha2_code
          },
          postal: formData.businessInfo.zip
        },
        bankAccount: {
          accountType: formData.bankAccount.accountType,
          accountNumber: formData.bankAccount.accountNumber,
          routingNumber: formData.bankAccount.routingNumber,
          accountHolderName: formData.bankAccount.accountHolderName,
        },
        attestation: formData.bankAccount.attestation
      };
   
      const result = await dispatch(submitPayByBankOnboarding(payload));

      setIsLoading(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsLoading(false);
    }
  };

  const transformErrors = (errors) => {
    return errors.map(error => {
      if (error.name === 'pattern') {
        error.message = `${error?.property?.replace(".", "")} is not valid`
      }
      if (error.name === 'oneOf' || error.name === 'enum') error.message = ''
      return error
    })
  }

  const validate = (formData, errors) => {
    if(formData && formData.merchantAgreementAccepted === false){
      errors.merchantAgreementAccepted.addError("Accept Terms and Condition.")
    }
    if(formData && formData.annualCardVolume < formData.maxTransactionAmount){
      errors.maxTransactionAmount.addError("The projected maximum transactional amount cannot exceed projected annual transactional volume.")
    }
    if(formData && formData.idNumber && formData.idNumber.includes("_")){
        errors.idNumber.addError("should not be shorter than 9 characters")
    }
    if(formData && formData.taxNumber && formData.taxNumber.includes("_")){
      errors.taxNumber.addError("should not be shorter than 9 characters")
    }
    if(formData && formData.telephone && formData.telephone.length < 9) {
      errors.telephone.addError("Phone number is not valid")
    }
    if(formData && formData.personalPhone && formData.personalPhone.length < 9) {
      errors.personalPhone.addError("Phone number is not valid")
    }
    if (formData && (formData.bankAccount.attestation === false || formData.bankAccount.attestationAgreement === false)) {
      errors.bankAccount.attestationAgreement.addError("You must acknowledge and agree to proceed.");
    }
    return errors;
  }

 

  return (
    <>
    <div className="onboarding-form-container">
      <div className="py-box py-box--xlarge">
        <div className="py-form-field">
          <Form
            schema={dynamicSchema }
            formData={formData}
            className="onboarding-form-wrapper"
            onChange={data => setFormData(data.formData)}
            FieldTemplate={CustomFieldTemplate}
            disabled={isLoading || isPayByBankEnabled || onboardingStatus !== 'not_started'}
            uiSchema={makeFieldsReadOnly(uiSchema, isLoading || isPayByBankEnabled || onboardingStatus !== 'not_started')}
            showErrorList={false}
            noHtml5Validate={true}
            validate={validate}
            transformErrors={transformErrors}
            onSubmit={handleSubmit}
          >
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={isLoading || isPayByBankEnabled || onboardingStatus !== 'not_started'}>
                {isLoading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
    </>
  );
};

export default OnboardingForm;