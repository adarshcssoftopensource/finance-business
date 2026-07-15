import React, { Fragment, PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { Container } from 'reactstrap';
import history from '../../../../customHistory';
import queryString from 'query-string';

import {
  getAllPayments,
  getAllRefunds,
  getOnboardingStatus,
  getPayoutBalance,
  postNewRefund
} from '../../../../actions/paymentAction';
import { openGlobalSnackbar } from '../../../../actions/snackBarAction';
import { fetchPaymentSettings } from '../../../../actions/paymentSettings';
import PaymentInit from './components/onBoardingInit';
import PaymentRecords from './components/paymentRecords';
import CenterSpinner from '../../../../global/CenterSpinner';
import { getQueryStringUrl } from '../../../../utils/common';
import { PAYOUT_DISABLE } from '../../../../utils/Provider.const';
import DisplayBanner from '../../../common/DisplayBanner';

const styles = theme => ({});

class Payment extends PureComponent {
  state = {
    filter: {
      startDate: '',
      endDate: '',
      text: '',
      pageNo: 1
    },
    loadListData: true
  };

  async componentDidMount() {
    const { businessInfo } = this.props;
    await this.props.getPaymentSettings();
    if (!this.props.isPeyme && !this.props.isCrowdFunding) {
      document.title = businessInfo
        ? `Finance - ${businessInfo.organizationName} - Payments`
        : 'Finance - Payments';
    }

    if (this.props.paymentIntermediateData) {
      history.push('/app/payments/onboarding');
    }
    if (this.props.isPeyme) {
      this._fetchPayments(this.state.filter);
    }
  }

  async componentDidUpdate(prevProps) {
    const { data } = this.props.paymemntSettings;
    if (data.isVerified && data.isVerified.payment && this.state.loadListData) {
      this.setState({ loadListData: false });
      const queryFilter = {};
      if (this.props.location) {
        const query = queryString.parse(this.props.location.search);
        if (query.startDate) {
          queryFilter.startDate = query.startDate;
        }
        if (query.endDate) {
          queryFilter.endDate = query.endDate;
        }
        if (query.text) {
          queryFilter.text = query.text;
        }
        let queryData = Object.entries(query)
          .map(([key, val]) => `${key}=${val}`)
          .join('&');
        const pathname = this.props.location.pathname;
        history.push({
          pathname,
          search: queryData
        });
      }
      this._fetchPayments({ ...this.state.filter, ...queryFilter });
    }
    if (prevProps.refreshPayment !== this.props.refreshPayment) {
      this._fetchPayments(this.state.filter);
    }
  }

  _fetchPayments = filter => {
    if (this.props.isPeyme) {
      const { pageNo } = this.state.filter;
      const data = {
        peymeId: this.props.peymeName,
        pageNo
      };
      this.props.getPayment(data);
    } else if (this.props.isCrowdFunding) {
      const { pageNo } = this.state.filter;
      const data = {
        fundingId: this.props.crowdFundingName,
        pageNo
      };
      this.props.getPayment(data);
    } else if (this.props.location.search.includes('?checkoutId=')) {
      const { pageNo } = this.state;
      const data = {
        checkoutId: this.props.location.search.split('?checkoutId=')[1],
        pageNo: filter.pageNo ? filter.pageNo : pageNo
      };
      this.props.getPayment(data);
    } else if (this.props.location.search.includes('?pageNo=')) {
      const { pageNo } = this.state;
      const data = {
        pageNo: getQueryStringUrl('?pageNo=')
      };
      this.props.getPayment(data);
    } else {
      this.props.getPayment(filter);
    }
    this.setState({ filter: filter });
  };

  redirectToOnBoarding() {
    history.push('/app/payments/onboarding');
  }

  redirectToExpressOnBoarding() {
    history.push('/app/payments/express-onboarding');
  }

  redirectToKYCError() {
    history.push('/app/payments/kyc');
  }

  render() {
    const statusParams = (!this.props.isPeyme && !this.props.isCrowdFunding) && new URLSearchParams(this.props.location.search);
    const {
      paymentList,
      refundList,
      statusCode,
      paymentMeta,
      refundMeta,
      payoutBalance,
      paymemntSettings: {
        data,
        loading
      },
      message
    } = this.props;

    if (loading) {
      return (
        <Container className="mrT50 text-center">
          <CenterSpinner />
        </Container>
      );
    } else if (data && (!data.isConnected || !data.isOnboardingApplicable) && !data?.legalData?.isPayByBankEnabled && !data?.legalData?.isBnplEnabled) {
      return <PaymentInit {...this.props} />;
    }
    else if (data && data.isConnected && !data.isSetupDone && data?.charges?.expressSupported && data?.charges?.expressEnabled && !data?.legalData?.isPayByBankEnabled && !data?.legalData?.isBnplEnabled) {
      return <Fragment>{this.redirectToExpressOnBoarding()}</Fragment>;
    }
    else if (data && data.isConnected && !data?.isVerified?.payment && !data.isSetupDone && !data.isProviderSwitched && !data?.legalData?.isPayByBankEnabled && !data?.legalData?.isBnplEnabled) {
      return <Fragment>{this.redirectToOnBoarding()}</Fragment>;
    }
    else if (data && data.onboardingStatus === 'rejected' && !data.isProviderSwitched && !data?.legalData?.isPayByBankEnabled && !data?.legalData?.isBnplEnabled) {
      return <Fragment>{this.redirectToOnBoarding()}</Fragment>;
    } else if (data && data.providerName === 'stripe' && data.onboardingStatus === 'need_verification') {
      return <Fragment>{this.redirectToKYCError()}</Fragment>;
    }
    // Handle showing payments tab instead of showing Loader even if the payment is not enabled
    else
      // if (
      //   (!Array.isArray(paymentList) || paymentList.length >= 0) &&
      //   statusCode === 200 && data && data.isSetupDone && data.isVerified.payment
      // )
    {
      const isLoading = data?.isVerified?.payment ? !this.props.paymentDataLoaded : false;
      const tab = statusParams && statusParams.get('status') ? `payments.${statusParams.get('status')}` : this.props.match ? this.props.match.params.status : '';
      const isPayoutHidden = false; // PAYOUT_DISABLE[this.props?.businessInfo?.provider];

      const isCardPaymentNotEnabled=
        (data && data.isConnected && !data.isVerified.payment && !data.isSetupDone && !data.isProviderSwitched)
        || data && data.onboardingStatus === 'rejected' && !data.isProviderSwitched
        || data && (!data.isConnected || !data.isOnboardingApplicable);

      return (
        <>
          <PaymentRecords
            data={paymentList?.length ? paymentList : []}
            paymentMeta={paymentMeta}
            refundMeta={refundMeta}
            refundList={refundList}
            fetchData={this._fetchPayments}
            getRefund={this.props.getRefund}
            tabSelected={isPayoutHidden && tab === `payments.payout` ? 'payments.success' : tab}
            filter={this.state.filter}
            isPeyme={this.props.isPeyme}
            isCrowdFunding={this.props.isCrowdFunding}
            isLoaing={isLoading}
            bankingSetupSkipped={data.bankingSetupSkipped}
            getPayoutBalance={this.props.getPayoutBalance}
            payoutBalance={payoutBalance}
            showSnackbar={this.props.showSnackbar}
            payoutSetting={data.payoutSetting}
          />
        </>
      );
    }
    // else {
    //   return (
    //     <Container className="mrT50 text-center">
    //       <CenterSpinner />
    //     </Container>
    //   )
    // }
  }
}

const mapStateToProps = state => {

  return {
    paymentList: state.paymentReducer.paymentRecords,
    refundList: state.paymentReducer.refundRecords,
    paymentMeta: state.paymentReducer.paymentData ? state.paymentReducer.paymentData.meta : null,
    paymentIntermediateData: state.paymentReducer.paymentIntermediateData,
    paymentDataLoaded: state.paymentReducer.paymentDataLoaded,
    statusCode: state.paymentReducer.statusCode,
    message: state.paymentReducer.message,
    businessInfo: state.businessReducer.selectedBusiness,
    paymemntSettings: state.paymentSettings,
    refundMeta: state.paymentReducer.refundMeta,
    payoutBalance: state.paymentReducer.payoutBalance
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getPayment: body => {
      dispatch(getAllPayments(body));
    },
    getRefund: body => {
      dispatch(getAllRefunds(body));
    },
    fetchOnBoarding: () => {
      dispatch(getOnboardingStatus());
    },
    postRefund: body => {
      dispatch(postNewRefund(body));
    },
    getPaymentSettings: body => {
      dispatch(fetchPaymentSettings(body));
    },
    getPayoutBalance: body => {
      dispatch(getPayoutBalance(body));
    },
    showSnackbar: (message, error) => {
      dispatch(openGlobalSnackbar(message, error));
    }
  };
};

export default compose(
  withStyles(styles, { name: 'Payment' }),
  connect(mapStateToProps, mapDispatchToProps)
)(Payment);
