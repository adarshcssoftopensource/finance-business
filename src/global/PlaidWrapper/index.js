import React from 'react';
import paymentService from '../../api/paymentService';
import PlaidLinkTokenButton from './PlaidLinkTokenButton';

const Index = (props) => {
  const onSuccess = async (token) => {
    if (!token) return;
    try {
      props.handleLoading(true);
      const response = await paymentService.connectBank(token);
      props.handleLoading(false);
      if (response?.statusCode === 200) {
        const accounts = response.data?.connectedBank?.accounts;
        if (accounts?.length > 0) {
          props.getAccounts(accounts);
        } else {
          props.onShowSnackbar('Accounts not found', true);
        }
      } else {
        props.onShowSnackbar(response?.message || 'Connection failed', true);
      }
    } catch (err) {
      props.handleLoading(false);
      props.onShowSnackbar('Something went wrong, please try again later.', false);
    }
  };

  return (
    <PlaidLinkTokenButton
      api="onboarding"
      className={props.className || 'w-100 px-3 btn btn-primary btn-block'}
      style={{
        outline: 0,
        border: 0,
        padding: '12px 30px',
        background: 'var(--bs-btn-bg)',
        borderRadius: 100,
        ...props.style,
      }}
      onSuccess={onSuccess}
    >
      {props.buttonText}
    </PlaidLinkTokenButton>
  );
};

export default Index;
