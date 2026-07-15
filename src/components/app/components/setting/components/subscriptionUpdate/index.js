import React from 'react';
import SubscriptionCheckoutDetails from '../../../../../../global/subscriptionCheckoutDetails'

const Index = ({ match }) => {
    return (
        <div className="py-page__content pricing-plan-area w-100" >
            <div className="content-wrapper__main__fixed" >
                <SubscriptionCheckoutDetails
                    from="update"
                    planId={match.params.planId}
                />
            </div>
        </div>
    );
}


export default Index