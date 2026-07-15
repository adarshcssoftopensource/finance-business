import React from 'react'
import SuccessSvg from '../../../../../../global/SuccessSvg'
import { NavLink } from 'react-router-dom'

const OnboardingSuccessPage = () => {
  return (
    <div className="text-center">
        <SuccessSvg />
        <div className="py-heading--subtitle mb-2">
        {' '}
        Your customers can now pay you online.{' '}
        </div>
        <div className="py-heading--subtitle mt-0">
        And they'll love you for it.
        </div>
        <div>
        <NavLink className="btn btn-primary" to="/app/payments/">
            Continue
        </NavLink>
        </div>
    </div>
  )
}

export default OnboardingSuccessPage;