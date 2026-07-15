import React, { useState, useEffect } from 'react';
import { Spinner } from 'reactstrap'
import { getAmountToDisplay } from '../../utils/GlobalFunctions';
import Icon from '../../components/common/Icon';
import { applyCoupon } from '../../api/subscriptionService'
import FormValidationError from '../FormValidationError'
import symbolsIcon from "../../assets/icons/product/symbols.svg";

const Summary = (props) => {
  const [isApplied, setIsApplied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [couponCode, setCouponCode] = useState(null)
  const [couponData, setCouponData] = useState(null)
  const [totalAmount, setTotalAmount] = useState(null)
  const [discountedGot, setDiscountedGot] = useState(0)
  const [msg, setMessage] = useState({})
  const { price, _id } = props.selectedPlan

  useEffect(() => {
    setTotalAmount(props.selectedPlan.price)
  }, [props.selectedPlan])

  const applySubscriptionCoupon = async () => {
    try {
      if (!couponCode) {
        setMessage({ message: "enter coupon code", type: 'error' })
      } else {
        setLoading(true)
        const businessId = localStorage.getItem('businessId')
        const response = await applyCoupon({ couponCode, planId: _id, businessId })
        if (response.data.applied) {
          const { data } = response
          const { selectedPlan } = props
          if (data.couponType === 'percent_off') {
            const discount = selectedPlan.price * data.discountedAmount / 100
            setTotalAmount(selectedPlan.price - discount)
            setDiscountedGot(discount)
          } else {
            setTotalAmount(selectedPlan.price - data.discountedAmount)
            setDiscountedGot(data.discountedAmount)
          }
          props.setCoupon(couponCode)
          setCouponData(data)
          setMessage({ message: "coupon applied", type: 'success' })
        } else {
          setMessage({ message: response.message, type: 'error' })
        }
        setLoading(false)
      }
    } catch (error) {
      setLoading(false)
      setMessage({ message: error.message, type: 'error' })
    }
  }

  const removeDiscount = () => {
    setIsApplied(false)
    setDiscountedGot(0)
    props.setCoupon(null)
    setCouponData(null)
    setCouponCode(null)
    setMessage({})
    setTotalAmount(props.selectedPlan.price)
  }

  return (
    <div className="checkout-calc" >
      <table className="calc-table" >
        <tr>
          <td>Subtotal:</td>
          <td>{getAmountToDisplay({ symbol: '$' }, price)}</td>
        </tr>
        {couponData && couponData.discountedAmount && isApplied ?
          <tr>
            <td> {couponData.couponCode} ({couponData.couponType === 'percent_off' ? `${couponData.discountedAmount}%` : `${getAmountToDisplay({ symbol: '$' }, couponData.discountedAmount)}`} off):</td>
            <td>
              <button type="button" onClick={removeDiscount} className="cancel-button"><Icon className="Icon gray" xlinkHref={`${symbolsIcon}#cancel`} /></button>
                {getAmountToDisplay({ symbol: '$' }, -discountedGot)}
            </td>
          </tr> :
          <tr>
            <td>Coupon discount:</td>
            {!isApplied ? <td><a href="javascript:void(0)" onClick={() => setIsApplied(true)}>Apply coupon</a></td> :
              <td>
                <div className="coupon-input" >
                  <input
                    type="text"
                    id="couponCode"
                    name="couponCode"
                    placeholder="Promo code"
                    defaultValue={couponCode}
                    value={couponCode}
                    onChange={e => {
                      setMessage({})
                      setCouponCode(e.target.value)
                    }} />
                  <button type="button" disabled={loading} onClick={() => applySubscriptionCoupon()} className="accept">
                    {loading ?
                      <Spinner size="sm" style={{ height: '20px', width: '20px' }} color="default" />
                      :
                      <Icon className="Icon" xlinkHref={`${symbolsIcon}#check-alt`} />
                    }
                  </button>
                  <button type="button" onClick={() => {
                    setMessage({})
                    setIsApplied(false)
                  }} className="cancel"><Icon className="Icon gray" xlinkHref={`${symbolsIcon}#cancel`} /></button>
                </div>
                {msg.message && <FormValidationError message={msg.message} err={msg.type === 'success' ? false : true} showError={true} />}
              </td>}
          </tr>
        }
        <tr>
          <td><b>Total:</b></td>
          <td key={totalAmount}><b>{getAmountToDisplay({ symbol: '$' }, totalAmount)}</b></td>
        </tr>
      </table>
    </div>
  );
}

export default Summary;