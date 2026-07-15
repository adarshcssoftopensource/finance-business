import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitBnplOnboarding } from '../../../actions/paymentAction';
import './styles/OnboardingForm.scss';

const OnboardingForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const paymentSettings = useSelector(state => state.paymentSettings);
  const isBnplActive = paymentSettings?.data?.legalData?.bnplProviderData?.isActive;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if(isBnplActive || isLoading) return;
    try {
      const payload = {}; // Add necessary payload data here
      const result = await dispatch(submitBnplOnboarding(payload));
      if (result.success) {
        // Handle success case
      } else {
        // Handle error case
      }
    } catch (error) {
      console.error('Error submitting BNPL onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="onboarding-form-container">
      <div className="py-box py-box--xlarge">
        <div className="py-form-field">
          <div className="terms-conditions-bnpl">
            <h3>Overview</h3>
            <p>Finance offers Customer Financing, allowing your customers to finance their purchases. When this option is selected, a financing fee of <strong>9.4% + 49¢ per transaction</strong> is applied.</p>
            <h3>Who Pays the Fee?</h3>
            <ul>
              <li>The <strong>customer</strong> pays the financing fee when choosing the “Pay by Financing” option on <strong>invoices, checkout links, and Finance.Me Lynk</strong>.</li>
              <li>You, the merchant, incur <strong>0% in additional costs</strong>.</li>
            </ul>
            <h3>How It Works</h3>
            <ol>
              <li><strong>Customer selects “Pay by Financing”</strong> – This option appears on invoices, checkout links, and Finance.Me Lynk.</li>
              <li><strong>Fee is Applied</strong> – The financing fee (9.4% + 49¢) is automatically added to the customer’s total.</li>
              <li><strong>Weekly Payouts</strong> – Payments made through customer financing are dispersed once per week to your bank account on file.</li>
            </ol>
            <h3>Enabling Customer Financing</h3>
            <p>By enabling this feature, you agree to these terms as outlined in Finance's 
              {/* <a href="https://www.payyit.com/terms" target="_blank">Terms & Conditions</a> */}
              <a target="_blank">Terms & Conditions</a>
              .</p>
          </div>
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isLoading || isBnplActive}
            >
              {isLoading ? 'Activating...' : 'Activate Customer Financing'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingForm;
