import React, { Fragment, useEffect, useState } from 'react';
import Cards from '../../../../../global/Card';
import { getAmountToDisplay } from '../../../../../utils/GlobalFunctions';
import { NavLink } from 'react-router-dom';
import * as PaymentIcon from '../../../../../global/PaymentIcon';

const arrows = {
    imgArrowRefund: `${process.env.REACT_APP_CDN_URL}/static/web-assets/arrow_left.svg`,
    imgArrowSuccess: `${process.env.REACT_APP_CDN_URL}/static/web-assets/arrow_success.svg`,
    imgArrowDeclined: `${process.env.REACT_APP_CDN_URL}/static/web-assets/arrow_declined.svg`,
    imgArrowLeft: `${process.env.REACT_APP_CDN_URL}/static/web-assets/arrow_left.svg`,
    imgArrowProcess: `${process.env.REACT_APP_CDN_URL}/static/web-assets/progress-arrow.svg`,
    imgArrowLeftProcess: `${process.env.REACT_APP_CDN_URL}/static/web-assets/progress-arrow-left.svg`
}

const hideAccountCard = {
  'ecrypt': true,
  'nmi': true,
};

export const PaymentDetails = ({ row, classes, account,businessInfo, ...props }) => {
    const [arrow, setArrow] = useState(null);
    const {provider} = businessInfo || {};
    useEffect(() => {
        if (row.status == 'FAILED' || row.status == 'DECLINED') {
            setArrow(arrows.imgArrowDeclined)
        } else if (row.status == 'REFUNDED') {
            setArrow(arrows.imgArrowRefund)
        } else if (row.payout && row.payout.isPaid && row.status == 'SUCCESS') {
            setArrow(arrows.imgArrowSuccess)
        } else if ((row.payout && !row.payout.isPaid && row.status == 'PENDING')) {
            setArrow(arrows.imgArrowProcess)
        } else if (row.status == 'SUCCESS'){
            setArrow(arrows.imgArrowSuccess)
        } else if ((row.status == 'INITIATED')) {
            setArrow(arrows.imgArrowLeftProcess)
        }
    }, [])

    const renderAmountDetails = () => {
        if (row.refund.isRefunded && row.status == "SUCCESS") {
            return (
                <div>
                    <div className="d-flex justify-content-between pt-3 mb-4">
                        <div><strong>Refund</strong></div>
                        <div><NavLink to={`/app/payments/${row.id}/refunds`}>View</NavLink> {getAmountToDisplay(row.currency, row.refund.totalAmount || 0)} </div>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                        <div><strong>You get</strong></div>
                        <div> <span className="pe-2"><strike> {getAmountToDisplay(row.currency, !!row.amountBreakup ? row.amountBreakup.net : row.amount)}</strike></span>
                        <strong>{getAmountToDisplay(row.currency, !!row.amountBreakup ? row.amountBreakup.net - row.refund.totalAmount || 0 : row.amount - row.refund.totalAmount || 0)}</strong></div>
                    </div>
                </div>
            )
        }else if (row.isRefund && row.status == "REFUNDED") {
            return (
                <div>
                    <div className="d-flex justify-content-between">
                        <div>Your customer gets</div>
                        <div> {getAmountToDisplay(row.currency, !!row.amountBreakup ? row.amountBreakup.net : row.amount)}</div>
                    </div>
                </div>
            )
        } else if (row.status == "REFUNDED") {
            return (
                <div>
                    <div className="d-flex justify-content-between pt-3 mb-4">
                        <div><strong>You get</strong></div>
                        <div><strong> (Refunded) <strike>{getAmountToDisplay(row.currency, (row.amountBreakup.total - row.amountBreakup.fee))}</strike></strong></div>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                        <div>Refund</div>
                        <div><NavLink to={`/app/payments/${row.id}/refunds`}>View</NavLink> {getAmountToDisplay(row.currency, row.amountBreakup.total)} </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="d-flex justify-content-between pt-3">
                    <div><strong>You get</strong></div>
                    <div><strong>{getAmountToDisplay(row.currency, !!row.amountBreakup ? (row.amountBreakup.total - row.amountBreakup.fee) : row.amount)} </strong></div>
                </div>
            )
        }
    }

    const renderBankCard = (data, isOwn) => {
        return (
            <div className="payment-cards__item">
                {isOwn && <span className="py-text py-text--hint">Your account</span>}
              <div className={`${classes.myAccount} py-payment-card py-payment__bank`}
                   >
                    {data ? <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%'
                    }}>
                        {data?.icon ?
                            <div className="py-payment__bank-icon">
                                <img src={PaymentIcon[data?.icon]} width='35px' />
                            </div> :
                            <div className="py-payment__bank-icon">
                                <i className="fal fa-university"></i>
                            </div>
                        }
                      <div>
                        <span
                          className="py-payment__bank-name m-1">{data.bankName || data.name}</span>
                        {(data.mask || data.number) &&
                          <div className="py-payment__bank-number">ending
                            in {data.mask || data.number}</div>}
                      </div>
                    </div> : <div className="py-payment__bank-number">Not connected</div>}
                    {/* {isOwn && <div className="py-payment__bank__link">
                        <NavLink to={`/app/banking/payout-detail/mockId`} className="py-text--link">View payout</NavLink>
                    </div>} */}
                </div>
            </div>
        )
    }

    const renderWallet = () => {
        return (
            <div className="payment-cards__item">
                <div className={`${classes.myAccount} py-payment-card py-payment__bank`}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%'
                    }}>
                        <div className="py-payment__bank-icon">
                            <i className="fal fa-wallet"></i>
                        </div>
                      <div>
                        <span className="py-payment__bank-name m-1">Paid with Wallet</span>
                      </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="payments-list__item--body">

          <div className="payment-list__item-amount"
               style={{ width: hideAccountCard[provider] ? '100%' : 'auto' }}>
                {
                    !!row.amountBreakup ? (
                        <Fragment>
                            <div className="d-flex justify-content-between mb-4">
                                <div>Amount</div>
                                <div> {getAmountToDisplay(row.currency, row.amountBreakup.total)} </div>
                            </div>
                            {
                                !!row.amountBreakup.fee && (
                                    <div className="d-flex justify-content-between mb-2">
                                        <div>Fee {!!row.amountBreakup.feePaidByCustomer ? '(Paid by customer)' : ''}</div>
                                        <div> {getAmountToDisplay(row.currency, row.amountBreakup.fee)} </div>
                                    </div>
                                )
                            }
                            {renderAmountDetails()}

                        </Fragment>
                    ) : (
                            <div>
                                <div className="d-flex justify-content-between pt-3 mb-4">
                                    <div><strong>Your customer gets</strong></div>
                                    <div><strong> {getAmountToDisplay(row.currency, (row.amount))}</strong></div>
                                </div>
                            </div>
                        )
                }
            </div>
            <div className="payment-cards__container">
                <div className="payment-cards__item">
                    <span className="py-text py-text--hint">Your customer's payment method</span>
                    {row.methodToDisplay == 'bank' || row.methodToDisplay == 'sezzle'
                        ? <span>{renderBankCard(row.methodToDisplay == 'sezzle' ? {name: row.customer, icon:'sezzle'}: {...row.bank}, false)}</span>
                        : row.methodToDisplay === 'wallet'
                        ? <span>{renderWallet()}</span>
                        : <Cards
                            number={(row.methodToDisplay !== 'bank' && row.methodToDisplay !== 'sezzle') ? row.card && row.card.number : row.bank && row.bank.number}
                            name={(row.methodToDisplay !== 'bank' && row.methodToDisplay !== 'sezzle') ? row.card && row.card.cardHolderName : row.bank && row.bank.name}
                            issuer={row.paymentIcon}
                            method={(row.methodToDisplay !== 'bank' && row.methodToDisplay !== 'sezzle') ? row.card : row.bank}
                            preview={true}
                        />
                    }
                </div>

              {hideAccountCard[provider] ? '' :
                <>
                  <div className="payment-cards__indicator">
                    <img
                      src={arrow}
                    />
                  </div>

                  {renderBankCard(row.ownAccount, true)}
                </>
              }
            </div>
        </div>
    )
}
