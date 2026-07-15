import React, { Fragment, useEffect, useState } from 'react'
import {
  Row,
  Col,
  Input,
  InputGroup,
  Form,
  FormGroup,
  InputGroupText,
  Button,
  Modal,
  Label,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap'
import { FormControl } from 'react-bootstrap'
import Cards from '../../../../../global/Card'
import {
  _setCurrency,
} from '../../../../../utils/GlobalFunctions'
import SelectBox from '../../../../../utils/formWrapper/SelectBox';
import { fetchBusinessCheckoutFee } from '../../../../../api/CheckoutService'
import { calculateBusinessProcessingFee } from '../../../../../utils/common'
import { Spinner } from 'reactstrap';
import FormValidationError from '../../../../../global/FormValidationError';
import GetRedirectUrl from '../common/paymentTypeRedirection'

const refundReasons = [
  { label: 'Customer complaint', value: "Customer complaint" },
  { label: 'Duplicate payment', value: "Duplicate payment" },
  { label: 'Other', value: "Other" },
];

export const RefundModal = props => {
  const [reason, setReason] = useState(null)
  const [reasonErr, setReasonErr] = useState(false)
  const [amountErr, setAmountErr] = useState(false)
  const [refundType, setRefundType] = useState('full')
  const [includeProcessingFee, setIncludeProcessingFee] = useState(false)
  const [amount, setAmount] = useState((parseFloat(props.data.amountBreakup && props.data.amountBreakup.total) - parseFloat(props.data.refund.totalAmount)).toFixed(2))
  const [refundAmount, setRefundAmount] = useState((parseFloat(props.data.amountBreakup && props.data.amountBreakup.total) - parseFloat(props.data.refund.totalAmount)).toFixed(2))
  const [notes, setNotes] = useState('')
  const [businessFee, setBusinessFee] = useState([])

  useEffect(() => {
    // if (businessFee.length === 0) return; // Removed logic

    if (refundType === 'full') {
      getFinalRefundAmount('full', true, null, 'refundType');
    } else if (refundType === 'base' || refundType === 'tip') {
      getFinalRefundAmount(refundType, includeProcessingFee, amount, 'refundType');
    }
  }, [refundType]);

  useEffect(() => {
    fetchBusinessFee();
  }, []);

  const fetchBusinessFee = async () => {
    let feeResponse = (await fetchBusinessCheckoutFee()).data.processingFee;
    setBusinessFee(feeResponse);
  }

  const getFinalRefundAmount = (type, includeFeeArg, inputAmount, changedField) => {
    const { amountBreakup, refund = {} } = props.data;

    const remainingTotal =
      parseFloat(amountBreakup.total || 0) - parseFloat(refund.totalAmount || 0);

    const remainingNet =
      parseFloat(amountBreakup.net || 0) - parseFloat(refund.baseAmount || 0);

    const remainingTip =
      parseFloat(amountBreakup.tip || 0) - parseFloat(refund.tipAmount || 0);

    if (type === "full") {
      const isPaidBusiness = !amountBreakup?.feePaidByCustomer;
      if (isPaidBusiness) {
        setAmount(remainingTotal.toFixed(2));
        setRefundAmount(remainingTotal.toFixed(2));
        setIncludeProcessingFee(false);
      } else {
        setAmount((remainingNet + remainingTip).toFixed(2));
        setRefundAmount(remainingTotal.toFixed(2));
        setIncludeProcessingFee(true);
      }
      return;
    }

    let baseAmountToRefund = 0;
    let tipAmountToRefund = 0;

    if (type === "base") {
      baseAmountToRefund = parseFloat(inputAmount || 0);
    } else if (type === "tip") {
      tipAmountToRefund = parseFloat(inputAmount || 0);
    }

    const baseAmountOnly = baseAmountToRefund + tipAmountToRefund;

    let processingFee = 0;

    if (includeFeeArg && baseAmountOnly > 0) {
      const totalFee = parseFloat(amountBreakup.fee || 0);
      const totalNet = parseFloat(amountBreakup.net || 0);

      if (totalFee > 0 && totalNet > 0) {
        processingFee = (baseAmountToRefund / totalNet) * totalFee;
      }
    }

    const finalRefundAmount = baseAmountOnly + processingFee;

    setAmount(baseAmountOnly.toFixed(2));
    setRefundAmount(finalRefundAmount.toFixed(2));
    setIncludeProcessingFee(includeFeeArg);
  };

  const handleChange = (name, value) => {
    if (name === 'amount') {
      getFinalRefundAmount(refundType, includeProcessingFee, value, name)
      if (!value) {
        setRefundAmount(parseFloat(0).toFixed(2))
      }
    } else if (name === 'refundType') {
      getFinalRefundAmount(value, false, amount, name)
    } else if (name === 'includeProcessingFee') {
      getFinalRefundAmount(refundType, value, amount, name)
    }
  }

  const handleSubmit = () => {
    if (!Number(amount)) {
      setAmountErr(true)
      return
    }
    if (!reason) {
      setReasonErr(true)
      return;
    }


    if (!amountErr && !reasonErr) {
      const payload = {
        paymentId: props.data.id,
        amount: parseFloat(amount),
        includeProcessingFee,
        refundAmount: parseFloat(refundAmount),
        type: refundType,
        reason,
        notes,
      }
      props.postRefund(payload, props.data.index)
    }
  }

  return (
    <Fragment>
      <Modal isOpen={props.open} toggle={props.handleRefundModalClose} centered>
        <ModalHeader
          toggle={props.handleRefundModalClose}
          className="py-modal__header__title"
        >
          <span>Refund to {props.data.customer}</span>
        </ModalHeader>
        <ModalBody className="Refund-Modal__body">
          <Row className='mb-3'>
            <Col sm="4 text-end">
              <Label className='mt-1'>
                Refund Type
              </Label>
            </Col>
            <Col sm="7">
              <label htmlFor="refundFull" className="py-radio d-block">
                <input
                  type="radio"
                  name="refundType"
                  value="full"
                  defaultChecked
                  id="refundFull"
                  onChange={() => {
                    handleChange('refundType', 'full')
                    setRefundType('full')
                  }}
                />
                <span className="py-form__element__faux"></span>
                <span className="py-form__element__label">Refund full amount</span>
              </label>
              <label htmlFor="refundBase" className="py-radio d-block">
                <input
                  type="radio"
                  name="refundType"
                  value="base"
                  id="refundBase"
                  onChange={() => {
                    handleChange('refundType', 'base')
                    setRefundType('base')
                  }}
                />
                <span className="py-form__element__faux"></span>
                <span className="py-form__element__label">Refund custom amount</span>
              </label>
              {props.data && props.data.amountBreakup && props.data.amountBreakup.tip > 0 &&
                <label htmlFor="refundTip" className="py-radio d-block">
                  <input
                    type="radio"
                    name="refundType"
                    value="tip"
                    id="refundTip"
                    onChange={() => {
                      handleChange('refundType', 'tip')
                      setRefundType('tip')
                    }}
                  />
                  <span className="py-form__element__faux"></span>
                  <span className="py-form__element__label">Refund tip amount</span>
                </label>
              }
            </Col>
          </Row>
          {/* {props.data.amountBreakup.feePaidByCustomer &&
            <Row className='mb-4'>
              <Col sm="4 text-end">
                <Label htmlFor="includeProcessingFee" className='mt-1'>
                  Include Processing Fee
                </Label>
              </Col>
              <Col sm="7">
                <label htmlFor="includeProcessingFee" className="py-switch mb-1 mt-1">
                  <input
                    type="checkbox"
                    id="includeProcessingFee"
                    name="includeProcessingFee"
                    autoComplete="nope"
                    className="py-toggle__checkbox"
                    checked={refundType === 'full' || includeProcessingFee}
                    disabled={refundType === 'full'}
                    onChange={(e) => {
                      handleChange('includeProcessingFee', e.target.checked)
                      setIncludeProcessingFee(e.target.checked)
                    }}
                  />
                  <span className="py-toggle__handle"></span>
                </label>
              </Col>
            </Row>
          } */}
          <Row className='mb-3'>
            <Col sm="4 text-end">
              <Label htmlFor="refundAmountLabel" className='mt-1'>
                Refund amount
              </Label>
            </Col>
            <Col sm="7">
              <InputGroup>
                <FormGroup className="box-symble-field">
                  <InputGroup>
                    <InputGroupText
                      className={`prependAddon-input-card`}
                    >
                      {props.data.currency.symbol}
                    </InputGroupText>
                    {'   '}
                    <Input
                      onChange={e => {
                        handleChange('amount', e.target.value)
                        setAmount(e.target.value)
                        e.target.value && setAmountErr(false)
                      }}
                      value={amount}
                      type="number"
                      name="amount"
                      step="any"
                      id="refundAmountLabel"
                      disabled={refundType === 'full'}
                      className={
                        props.editMountRefund
                          ? 'invoiceDisabled'
                          : ''
                      }
                    />
                  </InputGroup>
                  <FormValidationError
                    showError={amountErr}
                  />
                </FormGroup>
              </InputGroup>
            </Col>
          </Row>
          <Row className='mb-3'>
            <Col sm="4 text-end">
              <Label>
                Final Amount to be refunded:
              </Label>
            </Col>
            <Col sm="7">
              {props.data.currency.symbol}{refundAmount}
            </Col>
          </Row>
          <Row className='mb-3'>
            <Col sm="4 text-end">
              <Label>
                Payment method
              </Label>
            </Col>
            <Col sm="7">
              <GetRedirectUrl row={props.data} className="py-text--link" />
            </Col>
          </Row>
          {props.data.method !== 'alipay' &&
            <Row className='mb-4'>
              <Col sm="4 text-end">
                <Label className='mt-1'>
                  Customer paid by
                </Label>
              </Col>
              <Col sm="7">
                {props.data.method == 'bank' ?
                  <div className={` py-payment-card py-payment__bank text-white`}>
                    <div className="py-payment__bank-icon">
                      <i className="fal fa-university"></i>
                    </div>
                    {props.data.bank && <div>
                      <div className="py-payment__bank-name">{props.data.bank.name}</div>
                      {props.data.bank.number && <div className="py-payment__bank-number">ending in {props.data.bank.number}</div>}
                    </div>}

                  </div>
                  : <Cards
                    number={
                      props.data.methodToDisplay !== 'bank'
                        ? props.data.card && props.data.card.number
                        : props.data.bank && props.data.bank.number
                    }
                    name={
                      props.data.methodToDisplay !== 'bank'
                        ? props.data?.card?.cardHolderName
                        : props.data.bank?.name
                    }
                    issuer={props.data.paymentIcon}
                    preview={true}
                    method={props.data.method}
                  />}
              </Col>
            </Row>
          }
          <Row className='mb-3'>
            <Col sm="4 text-end">
              <Label>
                Reason
              </Label>
            </Col>
            <Col sm="7">
              <SelectBox
                style={{ maxWidth: '320px' }}
                getOptionLabel={(value) => (value["label"])}
                getOptionValue={(value) => (value["value"])}
                isOptionSelected={(value) => {
                  return value["value"] === reason
                }}
                placeholder="Please select a reason"
                id={'refund_reason'}
                aria-required={true}
                name="reason"
                onChange={(e) => {
                  setReason(e.value);
                  setReasonErr(false);
                  handleChange('reason', e.value)
                }
                }
                options={refundReasons}
              />
              <FormValidationError
                showError={reasonErr}
              />
            </Col>
          </Row>
          <Row>
            <Col sm="4 text-end">
              <Label className='mt-1'>
                Notes to self
              </Label>
            </Col>
            <Col sm="7">
              <FormControl
                id="refund_notes"
                as="textarea"
                rows="4"
                value={notes}
                aria-label="SSN"
                className="py-form__element__large"
                aria-describedby="basic-addon1"
                onChange={e => {
                  handleChange('notes', e)
                  setNotes(e.target.value)
                }}
              />
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <GetRedirectUrl row={props.data} viewButton="viewButton" />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >Refund {props.loading && (<Spinner size="sm" color="default" />)}</Button>
        </ModalFooter>
      </Modal>
    </Fragment>
  )
}
