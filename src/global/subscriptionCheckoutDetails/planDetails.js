import React, { useState, useEffect } from 'react';
import { Spinner, Tooltip } from 'reactstrap';
import history from '../../customHistory'

const PlanDetails = ({ from, plans, getSelectedPlan, isLoading, getCardDetails, planId, buttonText, businessInfo, planType, selectedPlan, planPeriod, setPlanPeriod }) => {
  const [tooltipOpen, setTooltipOpen] = useState({})
  const [isDowngrade, setIsDowngrade] = useState(false)
  const [existingPlan, setExistingPlan] = useState(null)
  const isUpdatePlanPage = Boolean(from === 'update');

  useEffect(() => {
    const getRecommended = plans.find((plan) => selectedPlan?.planLevel ? selectedPlan?.planLevel == plan.planLevel : planId ? plan._id === planId : plan.isRecomended)
    if (plans && businessInfo && businessInfo.subscription && businessInfo.subscription.planId) {
      const getExistingPlanLevel = plans.find((plan) => plan._id === businessInfo.subscription.planId)
      setExistingPlan(getExistingPlanLevel)
      setIsDowngrade(getRecommended?.planLevel < getExistingPlanLevel?.planLevel)
    }
    getSelectedPlan(getRecommended)
  }, [plans, planPeriod])

  const handleChange = (e) => {
    const getChangedPlan = plans.find((plan) => plan.title === e.target.value)
    getSelectedPlan(getChangedPlan)
    setSelectedPlan(getChangedPlan)
  }

  const handleToggle = (target) => {
    setTooltipOpen({
      [target]: !tooltipOpen[target]
    })
  };

  return (
    <div className="price-box">
      {/* {!isUpdatePlanPage &&
        <ul className="d-flex nav nav-pills mb-3" id="pills-tab" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${planPeriod === 'monthly' ? 'active' : ''}`}
              id="pills-monthly-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-monthly"
              type="button"
              role="tab"
              aria-controls="pills-monthly"
              onClick={() => setPlanPeriod('monthly')}
            >
              Monthly
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${planPeriod === 'yearly' ? 'active' : ''}`}
              id="pills-yearly-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-yearly"
              type="button"
              role="tab"
              aria-controls="pills-yearly"
              onClick={() => setPlanPeriod('yearly')}
            >
              Yearly
            </button>
          </li>
        </ul>
      } */}
      <div className="price-header d-lg-flex flex-wrap">
        {plans && planId && selectedPlan && <div className="price-name-area" >
          <h4 className="plan-name" >{selectedPlan.title}</h4>
          <div className="different-plan" onClick={() => history.goBack()}>Choose different plan</div>
        </div>}
      </div>
      <div className="price-body" >
        {selectedPlan && selectedPlan.features && <ul className="price-features">
          {selectedPlan.features.map((feature, i) => (
            <li key={`${feature.title}-${i}`}><i className="py-check Icon"></i>
              <span dangerouslySetInnerHTML={{__html: feature.title}} />
              {feature.info && <a href="#" id={`Tooltip-${selectedPlan._id}-${i}`} className="info-ico ps-1" ><i class="fal fa-info-circle"></i>
                <Tooltip placement="top" isOpen={tooltipOpen[`Tooltip-${selectedPlan._id}-${i}`]} target={`Tooltip-${selectedPlan._id}-${i}`}
                  toggle={() => handleToggle(`Tooltip-${selectedPlan._id}-${i}`)}>
                  {feature.info}
                </Tooltip></a>}</li>
          ))}
        </ul>}
        {isDowngrade && planId && existingPlan && existingPlan.features && selectedPlan?.planLevel !== 3 && existingPlan?.planLevel === 4 && <ul className="price-features" key={existingPlan}>
          {existingPlan.features.map((feature, i) => (
            i != 0 && <React.Fragment >
              <li key={`${feature.title}-${i}`}><i className="fa fa-times Icon"></i> {feature.title}
                {feature.info && <a href="#" id={`Tooltip-${existingPlan._id}-${i}`} className="info-ico ps-1" ><i class="fal fa-info-circle"></i>
                  <Tooltip placement="top" isOpen={tooltipOpen[`Tooltip-${existingPlan._id}-${i}`]} target={`Tooltip-${existingPlan._id}-${i}`}
                    toggle={() => handleToggle(`Tooltip-${existingPlan._id}-${i}`)}>
                    {feature.info}
                  </Tooltip></a>}</li>
            </React.Fragment>
          ))}
        </ul>}

        {selectedPlan && <div className="price-total">${selectedPlan?.price?.toLocaleString()} USD</div>}
      </div>
      {selectedPlan && selectedPlan.planLevel == 1 && <div className="col-12 mt-4 px-0">
        <button className="btn btn-primary btn-block" disabled={isLoading} type="button" onClick={getCardDetails} >{buttonText} {isLoading && (<Spinner size="sm" color="default" />)}</button>
      </div>}
    </div>
  );
}

export default PlanDetails;
