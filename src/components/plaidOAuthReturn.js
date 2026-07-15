import { Redirect } from 'react-router-dom';

/** OAuth banks return here; forward to banking with Plaid query params preserved. */
export default function PlaidOAuthReturn() {
  return <Redirect to={`/app/banking/bankconnections${window.location.search}`} />;
}
