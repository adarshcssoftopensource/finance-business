export const PROVIDER_NAME = {
  PROVIDER_PAYYIT : "payyit",
  PROVIDER_FINIX : "finix",
  PORVIDER_STRIPE : "stripe",
  PROVIDER_WEPAY: "wepay",
  PROVIDER_PAYPAL: "paypal",
  PROVIDER_TILLED: "tilled",
  PROVIDER_CHECKOUT: 'checkout',
  PROVIDER_PAYARC: 'payarc',
  PROVIDER_JUSTIFI: 'justifi',
  PROVIDER_ECRYPT: 'ecrypt',
  PROVIDER_ADYEN: 'adyen',
}

export const PAYOUT_DISABLE = {
  [PROVIDER_NAME.PROVIDER_PAYPAL]: true,
  [PROVIDER_NAME.PROVIDER_ECRYPT]: true,
  [PROVIDER_NAME.PROVIDER_ADYEN]: true,
};
