import React, { Component } from 'react';
import ExpandDetails from './Components/expandDetails';
import { connect } from 'react-redux';
import { getPayoutDetailsByID } from '../../../../../../actions/payoutActions';
import CenterSpinner from '../../../../../../global/CenterSpinner';
import history from '../../../../../../customHistory';

class PayoutDetails extends Component {
    componentDidMount() {
        const { match: { params } } = this.props;
        const { paymemntSettings: { data } } = this.props
        if (data && data.isSetupDone && data.isConnected && data.isVerified.payment &&
            data.isVerified.payout && data.isOnboardingApplicable && params.id) {
            this.props.getPayout(params.id);
        } else {
            history.push('app/banking/payouts')
        }
    }

    render() {
        const { loading, data } = this.props.payoutDetail;
        return (
            <div className="content-wrapper__main payoutdetails">
                <header className="py-header--page flex">
                    <div className="py-header--title">
                        <h1 className="py-heading--title">Payout Detail</h1>
                    </div>
                </header>
                {loading ? <CenterSpinner /> :
                    <div className="p-3">
                        <ExpandDetails data={data ? data.payout : null} />
                    </div>
                }
                {/* <TablePayout {...this.props} {...this.props.payouts} /> */}
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        paymemntSettings: state.paymentSettings,
        payoutDetail: state.payoutDetail
    }
}
const mapDispatchToProps = dispatch => {
    return {
        getPayout: (body) => {
            dispatch(getPayoutDetailsByID(body))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PayoutDetails);