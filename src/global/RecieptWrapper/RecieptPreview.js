import React, { Fragment } from 'react';
import { get as _get } from 'lodash';
// import { RecieptFooter } from './RecieptFooter';
import CenterSpinner from '../CenterSpinner';
import { toMoney } from '../../utils/GlobalFunctions';
import { _displayDate } from '../../utils/globalMomentDateFunc';
import PoweredBy from "../../components/common/PoweredBy";

export const RecieptPreview = ({ invoiceData, businessInfo, receiptData, userInfo, salesSettings, readonly }) => {

    const isAddressAvailable = businessInfo.address && (businessInfo.address.addressLine1
        || businessInfo.address.addressLine2 || businessInfo.address.city || businessInfo.address.postal || businessInfo.address.state) ? true : false;

    return (
        <Fragment>
            {!!invoiceData && !!businessInfo && !!receiptData ? (<table width="640" align="center" border="0" cellpadding="0" cellspacing="0" className="child_one">
                <tbody>
                    <tr>
                        <td align="center">
                            {salesSettings && salesSettings.companyLogo && <table width="570" align="center" border="0" cellpadding="0" cellspacing="0"
                                className="child-table-two">
                                <tbody>
                                    <tr>
                                        <td align="center" className="child-table-two-td">
                                            <table width="570" align="center" cellpadding="0" cellspacing="0" border="0"
                                                className="child-table-three">
                                                <tbody>
                                                    <tr>
                                                        <td align="center" className="child-table-three-td">
                                                            <a href="javascript:" className="main-logo" ><img
                                                                src={salesSettings.companyLogo}
                                                                alt="Finance" className="a-common-style" /></a>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>}
                            <table width="570" align="center" border="0" cellpadding="0" cellspacing="0"
                                className="second-child-table">
                                <tbody>
                                    <tr>
                                        <td align="center" className="second-child-table-td">
                                            <table width="570" align="center" cellpadding="0" cellspacing="0" border="0"
                                                className="second-child-table-first-table">
                                                <tbody>
                                                    <tr>
                                                        <td align="center" className="second-child-table-first-table-td">
                                                            Payment receipt
                                                </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <table width="570" align="center" cellpadding="0" cellspacing="0" border="0"
                                                className="second-child-table-second-table">
                                                <tbody>
                                                    <tr>
                                                        <td align="center" className="second-child-table-second-table-td">
                                                            {invoiceData.title} {invoiceData.invoiceNumber}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table width="570" align="center" border="0" cellpadding="0" cellspacing="0"
                                className="third-child-table">
                                <tbody>
                                    <tr>
                                        <td align="left" className="third-child-table-td">
                                            <table width="570" align="center" cellpadding="0" cellspacing="0" border="0"
                                                className="third-child-table-first-inner-table">
                                                <tbody>
                                                    <tr>
                                                        <td width="100" className="third-child-table-first-inner-table-td td-1">
                                                            Paid on</td>
                                                        <td width="10" className="third-child-table-first-inner-table-td td-2">
                                                            :</td>
                                                        <td width="460" className="third-child-table-first-inner-table-td td-3">
                                                            {receiptData
                                                                ? _displayDate(receiptData.paymentDate, 'MMMM DD, YYYY')
                                                                : ""}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td width="100" className="third-child-table-first-inner-table-td td-4">
                                                            Company</td>
                                                        <td width="10" className="third-child-table-first-inner-table-td td-5">
                                                            :</td>
                                                        <td width="460" className="third-child-table-first-inner-table-td td-6">
                                                            {businessInfo.organizationName || ''}</td>
                                                    </tr>
                                                    {
                                                        isAddressAvailable ?
                                                            <tr>
                                                                <td width="100" className="third-child-table-first-inner-table-td td-7">
                                                                    Address</td>
                                                                <td width="10" className="third-child-table-first-inner-table-td td-8">
                                                                    :</td>
                                                                <td width="460" className="third-child-table-first-inner-table-td td-9">
                                                                    {businessInfo.address && (<Fragment>
                                                                        {businessInfo.address.addressLine1 || ""}&nbsp;
                                                                        {businessInfo.address.addressLine2 || ""}&nbsp;
                                                                        {businessInfo.address.city || ""}&nbsp;
                                                                        {businessInfo.address.state ? businessInfo.address.state.name ? businessInfo.address.state.name : "" : ""}&nbsp;
                                                                        {businessInfo.address.postal}
                                                                    </Fragment>)}

                                                                </td>
                                                            </tr>
                                                        : null
                                                    }
                                                    {businessInfo.communication && businessInfo.communication.phone && <tr>
                                                        <td width="100" className="third-child-table-first-inner-table-td td-13">
                                                            Phone</td>
                                                        <td width="10" className="third-child-table-first-inner-table-td td-14">
                                                            :</td>
                                                        <td width="460" className="third-child-table-first-inner-table-td td-15">
                                                            {businessInfo.communication.phone || ''}
                                                        </td>
                                                    </tr>}
                                                    {businessInfo.communication && businessInfo.communication.mobile && <tr>
                                                        <td width="100" className="third-child-table-first-inner-table-td td-16">
                                                            Telephone</td>
                                                        <td width="10" className="third-child-table-first-inner-table-td td-17">
                                                            :</td>
                                                        <td width="460" className="third-child-table-first-inner-table-td td-18">
                                                            {businessInfo.communication.mobile || ''}
                                                        </td>
                                                    </tr>}
                                                    {businessInfo.communication && businessInfo.communication.website && <tr>
                                                        <td width="100" className="third-child-table-first-inner-table-td td-19">
                                                            Website</td>
                                                        <td width="10" className="third-child-table-first-inner-table-td td-20">
                                                            :</td>
                                                        <td width="460" className="third-child-table-first-inner-table-td td-21">
                                                            {businessInfo.communication.website || ""}
                                                        </td>
                                                    </tr>}
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table width="570" align="center" border="0" cellpadding="0" cellspacing="0"
                                className="fourth-child-table">
                                <tbody>
                                    <tr>
                                        <td align="left" className="td-50">
                                            {!readonly && <table width="570" align="center" cellpadding="0" cellspacing="0" border="0"
                                                className="fourth-child-table-inner-first-table">
                                                <tbody>
                                                    <tr>
                                                        <td className="third-child-table-first-inner-table-td td-22">
                                                            Hi {invoiceData.customer.customerName}{" "}, <br /> <br />
                                                                        Here's your payment receipt for {invoiceData.title} <b>{invoiceData.invoiceNumber}</b> for
                                                                       &nbsp;<b>{invoiceData.currency ? invoiceData.currency.symbol : ""}{receiptData ? toMoney(receiptData.amount) : ""}{" "}</b> {invoiceData.currency ? invoiceData.currency.code : ""}.<br />
                                                                       You can always view your receipt online, at: &nbsp;
                                                                       <a target='_blank' href={`${process.env.REACT_APP_WEB_URL}/${invoiceData.receiptFor === 'peyme' ? 'peyme' : invoiceData.receiptFor === 'checkout' ? 'checkout' : 'invoice'}/${invoiceData.uuid}/public/reciept-view/readonly/${receiptData.uuid}`}>{`${process.env.REACT_APP_WEB_URL}/reciept-view/readonly/${receiptData.uuid}`}</a><br /> <br />
                                                                        If you have any questions, please let us know.<br /> <br />
                                                                        Thanks,<br />
                                                            {businessInfo.organizationName}
                                                        </td>
                                                    </tr>

                                                </tbody>
                                            </table>}
                                            <table width="570" align="center" cellpadding="0" cellspacing="0" border="0"
                                                className={`fourth-child-table-inner-second-table ${readonly ? 'mt-5' : ''}`}>
                                                <tbody>
                                                    <tr>
                                                        <td align="center" className="third-child-table-first-inner-table-td td-23">
                                                            Payment amount: <b>{invoiceData.currency ? invoiceData.currency.symbol : ""}{receiptData ? toMoney(receiptData.amount) : ""}{" "}
                                                                {invoiceData.currency ? invoiceData.currency.code : ""}</b></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <table width="570" align="center" cellpadding="0" cellspacing="0" border="0"
                                                className="fourth-child-table-inner-third-table">
                                                <tbody>
                                                    <tr>
                                                        <td align="center" className="third-child-table-first-inner-table-td td-24">
                                                            Expires on: <b>{receiptData
                                                                ? _displayDate(receiptData.paymentDate, 'MMMM DD, YYYY')
                                                                : ""}</b></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            {!readonly && <table width="190" align="center" cellpadding="0" cellspacing="0" border="0"
                                                className="fourth-child-table-inner-fourth-table">
                                                <tbody>
                                                    <tr>
                                                        {
                                                            invoiceData.receiptFor === 'peyme' ?
                                                                <td align="center" className="td-25">
                                                                    <a href="javascript:" onClick={() => { window.open(`${process.env.REACT_APP_PUBLIC_BASE_URL}/for/${invoiceData.invoiceNumber}`) }} target="_blank">View Finance.Me</a>
                                                                </td>
                                                            : invoiceData.receiptFor === 'checkout' ?
                                                                <td align="center" className="td-25">
                                                                    <a href="javascript:" onClick={() => { window.open(`${process.env.REACT_APP_PUBLIC_BASE_URL}/checkout/${invoiceData.uuid}`) }} target="_blank">Checkout</a>
                                                                </td>
                                                            : invoiceData.receiptFor === 'funding' ?
                                                                <td align="center" className="td-25">
                                                                    <a href="javascript:" onClick={() => { window.open(`${process.env.REACT_APP_PUBLIC_BASE_URL}/cf/${invoiceData.invoiceNumber}`) }} target="_blank">View Give</a>
                                                                </td>
                                                            : invoiceData.receiptFor === 'invoice' ?
                                                                <td align="center" className="td-25">
                                                                    <a href="javascript:" onClick={() => { window.open(`${process.env.REACT_APP_PUBLIC_BASE_URL}/invoice/${invoiceData.uuid}`) }} target="_blank">View invoice</a>
                                                                </td>
                                                            : null
                                                        }
                                                    </tr>
                                                </tbody>
                                            </table>}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <PoweredBy affiliateRef={_get(invoiceData, "businessId.affiliateRef", "")} />
                        </td>
                    </tr>
                </tbody></table>) : <CenterSpinner />}
        </Fragment>)
}