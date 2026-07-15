import React, { useCallback, useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import paymentService from '../../api/paymentService';
import { fetchPlaidLinkToken as fetchBankingPlaidLinkToken } from '../../api/bankingServices';

/** Must match PLAID_REDIRECT_URI (backend) and Plaid Dashboard → Allowed redirect URIs exactly. */
const getRedirectUri = () => {
  const configured = process.env.REACT_APP_PLAID_OAUTH_REDIRECT_URI?.trim();
  if (configured) return configured.replace(/\/$/, '');
  const origin = (process.env.REACT_APP_WEB_URL || window.location.origin).replace(/\/$/, '');
  return `${origin}/plaid/oauth`;
};

const extractLinkToken = (response) =>
  response?.data?.link_token
  || response?.data?.data?.link_token
  || response?.link_token
  || null;

/**
 * Plaid Link via link_token (public_key is deprecated and removed from the Plaid Dashboard).
 */
export default function PlaidLinkTokenButton({
  children,
  onSuccess,
  onExit,
  institutionId,
  className,
  style,
  disabled,
  api = 'onboarding',
  asWrapper = false,
}) {
  const [linkToken, setLinkToken] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadToken = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const payload = { redirectUri: getRedirectUri(), institutionId };
      const response =
        api === 'banking'
          ? await fetchBankingPlaidLinkToken(payload)
          : await paymentService.fetchPlaidLinkToken(payload);
      const token = extractLinkToken(response);
      if (!token) throw new Error('Plaid link token missing from server response');
      setLinkToken(token);
    } catch (err) {
      setLoadError(err);
      setLinkToken(null);
    } finally {
      setLoading(false);
    }
  }, [api, institutionId]);

  useEffect(() => {
    loadToken();
  }, [loadToken]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
    onExit,
  });

  const handleClick = (e) => {
    if (asWrapper && e.target !== e.currentTarget) return;
    e.preventDefault();
    if (ready) open();
  };

  if (asWrapper) {
    return (
      <div
        role="presentation"
        className={className}
        style={{ ...style, cursor: ready && !loading ? 'pointer' : 'not-allowed', opacity: loading ? 0.6 : 1 }}
        onClick={handleClick}
      >
        {children}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={className}
      style={style}
      disabled={disabled || loading || !ready || !!loadError}
      onClick={() => open()}
    >
      {loading ? 'Loading…' : children}
    </button>
  );
}
