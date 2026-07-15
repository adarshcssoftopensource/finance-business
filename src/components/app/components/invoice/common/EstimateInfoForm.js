import React, { Component ,Fragment } from 'react'
import {
  _setCurrency,
  _showExchangeRate,
  getAmountToDisplay
} from '../../../../../utils/GlobalFunctions'
import { Form, FormGroup, Input, Label, Table, Spinner, Button } from "reactstrap";
import SelectBox from "../../../../../utils/formWrapper/SelectBox";
import DatepickerWrapper from "../../../../../utils/formWrapper/DatepickerWrapper";
import CustomizeHeader from "../../invoice/common/CustomizeHeader";

class EstimateInfoForm extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    let {
      estimatePayload,
      closeHeader,
      onHeaderChange,
      itemHeading,
      itemsHtml,
      addALine,
      businessInfo,
      showExchange,
      openHeader,
      currencySymbol,
      btnLoad
    } = this.props;

    return (
      <div>
      <div className="py-box estimate__form__builder py-box--small">
      <CustomizeHeader
        invoice={estimatePayload}
        openHeader={openHeader}
        onClose={closeHeader}
        onSave={onHeaderChange}
      />
      <Table hover className="py-table m-0" required>
        <colgroup></colgroup>
        <thead className="py-table__header">
          <tr className="py-table__row">
            <th className="py-table__cell estimate_form_item">
              {itemHeading.hideItem ? (
                <img className="eye_logo" src="/assets/eye.png" />
              ) : (
                ''
              )}
              {itemHeading.column1.name}
            </th>
            <th className="py-table__cell estimate_form_description">
              Description
            </th>
            <th className="py-table__cell estimate_form_quantity">
              {itemHeading.hideQuantity ? (
                <img className="eye_logo" src="/assets/eye.png" />
              ) : (
                ''
              )}
              {itemHeading.column2.name}
            </th>
            <th className="py-table__cell estimate_form_price">
              {itemHeading.hidePrice ? (
                <img className="eye_logo" src="/assets/eye.png" />
              ) : (
                ''
              )}
              {itemHeading.column3.name}
            </th>
            <th className="py-table__cell estimate_form_taxes">Tax</th>
            <th
              className="py-table__cell estimate_form_amount"
              style={{ textAlign: 'right' }}
            >
              {itemHeading.hideAmount ? (
                <img className="eye_logo" src="/assets/eye.png" />
              ) : (
                ''
              )}
              {/* <img className="eye_logo" src="/assets/eye.png" />{" "}<br /> */}
              {itemHeading.column4.name}
            </th>
            <th className="py-table__cell" />
          </tr>
        </thead>
        <tbody>{itemsHtml(currencySymbol)}</tbody>
      </Table>
      <Table className="table-no-border tableCalculation">
        <tbody>
          <tr className="py-table__row noBorder">
            <td className="py-table__cell" style={{ textAlign: 'left' }}>
              <a
                href="javascript:void(0)"
                onClick={addALine}
                className="estimate__form__add_new py-text--link"
              >
                <svg
                  viewBox="0 0 20 20"
                  className="py-svg-icon me-2"
                  id="add"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10 19a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm1-10V5.833c0-.46-.448-.833-1-.833s-1 .373-1 .833V9H5.833C5.373 9 5 9.448 5 10s.373 1 .833 1H9v3.167c0 .46.448.833 1 .833s1-.373 1-.833V11h3.167c.46 0 .833-.448.833-1s-.373-1-.833-1H11zm-1 8c4.067 0 7-2.933 7-7s-2.933-7-7-7-7 2.933-7 7 2.933 7 7 7z"></path>
                </svg>
                <span>Add a line</span>
              </a>
            </td>
            <td className="py-table__cell" className="label">
              <span>Subtotal:</span>
            </td>
            <td className="py-table__cell" className="amount">
              <span>
                {getAmountToDisplay(
                  estimatePayload &&
                    !!estimatePayload.currency &&
                    estimatePayload.currency,
                  estimatePayload.amountBreakup.subTotal
                )}
              </span>
            </td>
            <td className="py-table__cell__action"></td>
          </tr>
          {estimatePayload.amountBreakup.taxTotal.length
            ? estimatePayload.amountBreakup.taxTotal.map((item, index) => {
                return (
                  <Fragment key={index}>
                    <tr className="py-table__row noBorder">
                      <td className="py-table__cell">&nbsp; </td>
                      <td
                        className="py-table__cell"
                        className="label"
                        style={{ textAlign: 'right' }}
                      >
                        <span>
                          {typeof item.taxName === 'object'
                            ? `${item.taxName.abbreviation}${
                                item.taxName.other.showTaxNumber
                                  ? ` (${item.taxName.taxNumber}):`
                                  : ':'
                              }`
                            : `${item.taxName}:`}
                        </span>
                      </td>
                      <td className="py-table__cell" className="amount">
                        <span>
                          {getAmountToDisplay(
                            estimatePayload &&
                              !!estimatePayload.currency &&
                              estimatePayload.currency,
                            item.amount
                          )}
                        </span>
                      </td>
                    </tr>
                  </Fragment>
                )
              })
            : null}
          <tr className="totalSection">
            <td className="py-table__cell">&nbsp;</td>
            <td className="py-table__cell" className="label">
              <span>
                {`Total (${
                  _setCurrency(
                    estimatePayload.currency && estimatePayload.currency,
                    businessInfo.currency
                  ).code
                })`}
                :
              </span>
            </td>
            <td className="py-table__cell" className="amount">
              <span>
                {getAmountToDisplay(
                  estimatePayload &&
                    !!estimatePayload.currency &&
                    estimatePayload.currency,
                  estimatePayload.amountBreakup.total
                )}
              </span>
            </td>
          </tr>
          {showExchange && (
            <tr className="totalSection">
              <td className="py-table__cell">&nbsp;</td>
              <td className="py-table__cell" className="label">
                <span>
                  <small>
                    {`Total (${businessInfo.currency.code} at ${estimatePayload.exchangeRate})`}
                    :
                  </small>
                </span>
              </td>
              <td className="py-table__cell" className="amount">
                <span>
                  <small>
                    {getAmountToDisplay(
                      businessInfo.currency,
                      estimatePayload.totalAmountInHomeCurrency
                    )}
                  </small>
                </span>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
    <div className="py-box--footer">
      <Button
        color="primary"
        className="width100"
        type="submit"
        disabled={btnLoad}
        // onClick={this.estimateFormSumbit}
      >{ btnLoad ? <Spinner color="default" size="sm" /> : 'Save'}</Button>
    </div>
    </div>
    )
  }
}

export default EstimateInfoForm
