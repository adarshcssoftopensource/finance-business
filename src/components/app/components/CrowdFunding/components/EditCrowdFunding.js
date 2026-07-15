import React from 'react'
import { Button, Label, Spinner } from 'reactstrap'
import { privacyPolicy, terms } from '../../../../../utils/GlobalFunctions'

const EditCrowdFunding = props => {
  const {
    handleBack,
    handleTerms,
    agreement,
    buttonLoading,
    handleSubmitPeyme,
    handleTabSwitch
  } = props
  return (
    <div>
      <div className="peyme-box-wrapper">
        <button className="peyme-back" onClick={() => handleBack('add')}>
          <i className="fas fa-arrow-left" />
        </button>
        <div className='peyme-review-box'>
          {handleTabSwitch()}
        </div>
        <div className="peyme-review-box">
          <div className="py-form-field__element">
            <Label className="py-checkbox">
              <input
                type="checkbox"
                name="agreement"
                onChange={handleTerms}
              />
              <span className="py-form__element__faux" />
              <span className="py-form__element__label">
                I agree to the{' '}
                <a href={terms()} target="_blank">
                  Terms &amp; Conditions
                </a>{' '}
                and{' '}
                <a href={privacyPolicy()} target="_blank">
                  Privacy Policy
                </a>{' '}
                of the Finance platform.
              </span>
            </Label>
          </div>
          <Button
            disabled={!agreement}
            color="primary"
            onClick={handleSubmitPeyme}
            className="peyme-action"
          >
            {buttonLoading ? (
              <Spinner size="sm" color="default" />
            ) : (
              'Ready to use'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default EditCrowdFunding
