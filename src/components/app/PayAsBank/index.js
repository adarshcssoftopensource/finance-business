import React from 'react';
import OnboardingForm from './OnboardingForm';
import './styles.css';
import DisplayBanner from '../../common/DisplayBanner';
import { useSelector } from 'react-redux';

const PayAsBank = () => {
  const paymentSettings = useSelector(state => state.paymentSettings);
  const isPayByBankEnabled = paymentSettings?.data?.legalData?.isPayByBankEnabled;

  return (
    <div className="content-wrapper__main">
      {isPayByBankEnabled && (
        <DisplayBanner
          key="pay_by_bank_banner"
          isSticky
          data={{
            uuid: 'pay_by_bank',
            accentColor: '#0ea90e',
            description: 'You are already enrolled for Pay By Bank',
            actionButton: {
              text: 'Go to Payments',
              targetToExternal: false,
              redirectTo: '/app/payments'
            }
          }}
        />
      )}
      <div className="py-header--title"><h2 className="py-heading--title"
                                            style={{ textAlign: 'center', marginBottom: 20 }}>Submit Your Business & Bank Details to Enable Pay by Bank</h2></div>
      <div className={'content-wrapper__small'}>
        <OnboardingForm />
      </div>
    </div>
  )
    ;
};

export default PayAsBank;