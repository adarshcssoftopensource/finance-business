import React from 'react'
import {Switch, Route, withRouter} from 'react-router-dom'
import MainRoute from '../../../../components/app/MainRoute'
import Payment from '.';
import OnBoarding from './components/onBoarding/';
import PaymentOnboarding from '../PaymentOnBoarding/index'
import ExpressOnBoarding from './components/expressOnBoarding/';
import ViewPayment from './components/viewPayment';
import ViewRefund from './components/viewRefund';
import KycError from './components/KycError';
import OnBoardPhoneVerification from './components/onBoardPhoneVerification'
import DisputeDetails from './components/DisputeDetails'
import {connect} from "react-redux";
import {Button} from "reactstrap";

const TwoFactorAuthMessage = withRouter(({history, userID}) => (
    <div className="content-wrapper__main__fixed text-center vh-100 d-flex align-items-center">
        <div className="py-status-page">
            <div className="py-box">
                <div className="py-box--content">
                    <h1 className="py-heading--title mb-4">Please enable two factor authentication first.</h1>
                    <Button color="primary" onClick={() => history.push(`/app/accounts/security`)}>
                        Enable two factor authentication
                    </Button>
                </div>
            </div>
        </div>
    </div>
))

function PaymentRoutes({
    url,
}) {
    return (
      <Switch>
          <MainRoute exact path={`${url}`} component={Payment} />
          {/* <MainRoute exact path={`${url}/onboarding`} component={OnBoarding} /> */}
          <MainRoute exact path={`${url}/onboarding`} component={PaymentOnboarding} />
          <MainRoute exact path={`${url}/express-onboarding`} component={ExpressOnBoarding} />
          <MainRoute exact path={`${url}/kyc`} component={KycError} />
          <MainRoute exact path={`${url}/verify-phone`} component={OnBoardPhoneVerification} />
          {/* Route for details of refunds under particular Payment by payment ID  */}
          <MainRoute exact path={`${url}/:id/refunds`} component={ViewRefund} />
          {/* Route for view refund detail by refund ID  */}
          <MainRoute exact path={`${url}/refunds/:id`} component={ViewRefund} />
          {/* Route for details of original Payment  */}
          <MainRoute exact path={`${url}/view-payment/:id`} component={ViewPayment} />
          <MainRoute exact path={`${url}/disputes/:id`} component={DisputeDetails} />
          {/* <Route component={NotFound} /> */}
      </Switch>
    );
};

const mapStateToProps = state => {
    return {
        twoFAuthEnabled: !!state?.userData?.user?.twoFAuth?.enabled,
        userID: state?.userData?.user?._id,
        isUserDataLoading: state?.userData?.loading
    }
}
export default connect(mapStateToProps, null)(PaymentRoutes)
