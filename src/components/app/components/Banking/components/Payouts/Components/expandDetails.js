import React from 'react';
import { toMoney } from "../../../../../../../utils/GlobalFunctions";
import BankCard from './bankCard';
import PayoutTransactions from './payoutTransactions';
import { getCommonFormatedDate } from "../../../../../../../utils/common";

const expandDetails = ({ data }) => {
    return (
        <div>
            {data && (<div className="details-wrapper">
                <div className={`row m-0 detail-row d-flex align-items-center details-bg-${data.status.toLowerCase()}`} >
                    <div className="col-4 ps-0">
                        <div className="detail_title"><span className="dt-icon" ><i className="fa fa-hashtag"></i></span> Payout ID</div>
                        <div className="detail_value">{data.displayId}</div>
                    </div>
                    {/* <div className="col-3">
                    <div className="detail_title"><span className="dt-icon" ><i className="fas fa-dollar-sign"></i></span> Fees</div>
                    <div className="detail_value">
                        {data.currency ? data.currency.symbol : ""}{toMoney(data.fee ? data.fee:0)}
                    </div>
                </div> */}
                    <div className="col-4">
                        <div className="detail_title"><span className="dt-icon" ><i className="fa fa-credit-card"></i></span> Payment</div>
                        <div className="detail_value">
                            {data.currency ? data.currency.symbol : ""}{toMoney(data.amount ? data.amount : 0)}
                        </div>
                    </div>
                    <div className="col-4 px-0">
                        <BankCard card={data.destinationAccountDetail} />
                    </div>
                </div>
                {data.payments && data.payments.length > 0 && <div className="payout-transactions px-3 py-2">
                    <div className="transaction-in-payout">{data.payments.length} transaction in this payout</div>
                    <PayoutTransactions data={data.payments} />
                </div>}
            </div>)}
        </div>
    )
}

export default expandDetails;