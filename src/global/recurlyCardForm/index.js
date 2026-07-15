import React from 'react';
import { RecurlyProvider, Elements } from '@recurly/react-recurly';
import CardForm from './cardForm'

const Index = (props) => {
  const recurlyPublicKey = process.env.REACT_APP_RECURLY_PUBLIC_KEY;
  return (
    <RecurlyProvider publicKey={recurlyPublicKey}>
      <Elements>
        <CardForm {...props} />
      </Elements>
    </RecurlyProvider>
  );
}

export default Index;