import React, { useState, useEffect } from 'react';
import SubscriptionPlanCard from '../../../../../../global/subscriptionPlanCard';
import { getPlans } from '../../../../../../api/plansService';
import { openGlobalSnackbar } from '../../../../../../actions/snackBarAction';
import CenterSpinner from '../../../../../../global/CenterSpinner';
import { connect, useDispatch, useSelector } from 'react-redux';
import history from '../../../../../../customHistory';
import { _displayDate } from '../../../../../../utils/globalMomentDateFunc';
import { getActiveSubscriptionPlan } from '../../../../../../actions/subscriptionActions';

const Index = (props) => {
    const activeSubscriptionPlan = useSelector(state => state?.subscriptionReducer?.activeSubscription)
    const activePlan = activeSubscriptionPlan?.upcoming ? activeSubscriptionPlan?.upcoming.planId._id : activeSubscriptionPlan?.current ? activeSubscriptionPlan?.current.planId._id : '';
    const upcomingDate = activeSubscriptionPlan?.upcoming ? activeSubscriptionPlan?.upcoming.upcomingActivationDate : null;
    const [plans, setPlans] = useState(null)
    const [loading, setLoading] = useState(false)
    const [planPeriod, setPlanPeriod] = useState('monthly')
    const dispatch = useDispatch()

    useEffect(() => {
        initialFun()
    }, [planPeriod])

    const initialFun = async () => {
        setLoading(true)
        const plansResponse = await getPlans(planPeriod)
        setPlans(plansResponse.data)
        setLoading(false)
        dispatch(getActiveSubscriptionPlan())
    }


    const updatePlan = (id) => {
        if (id) {
            if (activePlan == id) {
                props.showSnackbar(`You are already subscribed to this plan ${upcomingDate ? `and it'll start on ${_displayDate(upcomingDate, 'MMMM DD YYYY')}` : ''}`)
            } else {
                history.push(`/app/setting/subscription-update/${id}?planPeriod=${planPeriod}`)
            }
        } else {
            props.showSnackbar("Select a plan to continue.")
        }
    }

    return (
        <div className="py-page__content pricing-plan-area w-100" >
            {!plans ?
            <div className="m-auto">
                <CenterSpinner />
            </div>
            :
            <div className="content-wrapper__main" >
                <div className="row">
                    <div class="py-header--title mt-0 mb-4 pb-2 col-8">
                        <h2 class="py-heading--title">Modify Plan</h2>
                    </div>
                    {/* Commenting Temporarily - Will need to uncomment later after a few weeks when we implement yearly subscriptions */}
                    {/* <div className='row'>
                        <div class="price-tabs">
                            <ul className={planPeriod === 'yearly' ? 'yearly-active' : 'monthly-active'}>
                                <li>
                                    <button type="button" onClick={() => setPlanPeriod('yearly')} className="yearly">Yearly</button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPlanPeriod('monthly')
                                        }}
                                        className="monthly"
                                    >
                                        Monthly
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div> */}
                    <div className="price-items row mx-n2" >
                        {loading && <CenterSpinner />}
                        {!loading && plans && plans.map((plan) => (<div className="col-sm-6 col-lg-3 cursor-pointer px-2 mb-4" key={plan._id} >
                            <SubscriptionPlanCard
                                isActive={activePlan === plan._id}
                                plan={plan}
                                updatePlan={updatePlan}
                                planPeriod={planPeriod}
                            />
                        </div>))}
                    </div>
                </div>
            </div>}
        </div>
    );
}


const mapPropsToState = ({ businessReducer }) => ({
    businessInfo: businessReducer.selectedBusiness,
});
const mapDispatchToProps = dispatch => {
    return {
        showSnackbar: (message, error) => {
            dispatch(openGlobalSnackbar(message, error))
        }
    }
}

export default connect(mapPropsToState, mapDispatchToProps)(Index)