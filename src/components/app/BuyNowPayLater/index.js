import React from 'react';
import OnboardingForm from './OnboardingForm';
import './styles.css';
import DisplayBanner from '../../common/DisplayBanner';
import { useSelector } from 'react-redux';

const BuyNowPayLater = () => {
  const paymentSettings = useSelector(state => state.paymentSettings);
  const isBnplActive = paymentSettings?.data?.legalData?.bnplProviderData?.isActive;

  return (
    <div className="content-wrapper__main">
      {(isBnplActive) && (
        <DisplayBanner
          key="buy_now_pay_later_banner"
          isSticky
          data={{
            uuid: 'buy_now_pay_later',
            accentColor: '#0ea90e',
            description: 'You are already enrolled for Pay by Financing',
            actionButton: {
              text: 'Go to Payments',
              targetToExternal: false,
              redirectTo: '/app/payments'
            }
          }}
        />
      )}
      <div className="py-header--title">
        <h2 className="py-heading--title" style={{ textAlign: 'center', marginBottom: 10 }}>
        To activate the ‘Pay by Financing’ feature, please review the following Terms and Conditions.
        </h2>
      </div>
      <div className={'content-wrapper__small'}>
        <OnboardingForm />
      </div>
    </div>
  );
};

export default BuyNowPayLater;
