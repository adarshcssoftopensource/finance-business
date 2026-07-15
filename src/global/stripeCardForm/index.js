import React from 'react';
import {
 Elements, StripeProvider 
} from 'react-stripe-elements';
import CardForm from './cardForm'
import { getStripeKey } from '../../utils/common'

const Index=(props)=> {
 return (
  <StripeProvider apiKey={getStripeKey()}>
   <Elements>
    <CardForm {...props}/>
   </Elements>
  </StripeProvider>
 );
}

export default Index;