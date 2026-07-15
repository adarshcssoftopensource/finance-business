import React, { useEffect, useState } from 'react';
import ReactHtmlParser from 'react-html-parser';
import Icon from '../../components/common/Icon';
import { Tooltip, Button } from 'reactstrap';
import BrowserTabTitle from '../../global/browserTabTitle'
import symbolsIcon from "../../assets/icons/product/symbols.svg";

const Index = ({ isActive, plan, updatePlan, planPeriod }) => {
  const [tooltipOpen, setTooltipOpen] = useState({})
  const [activePlan, setActivePlan] = useState()
  const [hoveredPlan, setHoveredPlan] = useState()

  useEffect(() => {
    if(isActive === true){
      setActivePlan(plan.title)
    } 
  }, [])

  const handleToggle = (target) => {
    setTooltipOpen({
      [target]: !tooltipOpen[target]
    })
  };

  return (
    <div className={`price-box ${activePlan === plan.title || hoveredPlan ===plan.title ? 'active' : ''}`}
    onMouseEnter={() => setHoveredPlan(plan.title)}
    onMouseLeave={()=> setHoveredPlan(null)}
    >
      {plan?.rewardInfo?.title && <h4 className='earn-label' ><div>{plan?.rewardInfo?.title}</div>{plan?.rewardInfo?.info}</h4> }
      <BrowserTabTitle title="Subscription plan" />
      <div className="price-header">
        {plan.trialDays ? <span className="price-badge">{plan.trialDays} Days Trial</span> : ""}
        <h3 className="price-title" >{plan.title}</h3>
        <div className="price-amount">{plan?.planLevel > 1 && plan?.recurring === 'yearly' && <del>${plan?.sellingPrice}</del>}  ${plan.price} USD</div>
        <div className="price-priod">per company/{plan?.recurring === 'yearly' ? 'year' : 'month'}</div>
      </div>
      <div className="price-body">
        <ul className="price-features">
          {plan.features.length > 0 && plan.features.map((feature, i) => (
            <li key={feature.title}>
              <Icon className="Icon" xlinkHref={`${symbolsIcon}#check-solid`} />
              {ReactHtmlParser(feature.title)}
              {feature.info && <a href="#" id={`Tooltip-${plan._id}-${i}`} className="info-ico ps-1" ><i class="fas fa-info-circle"></i>
                <Tooltip placement="top" isOpen={tooltipOpen[`Tooltip-${plan._id}-${i}`]} target={`Tooltip-${plan._id}-${i}`}
                  toggle={() => handleToggle(`Tooltip-${plan._id}-${i}`)}>
                  {feature.info}
                </Tooltip>
              </a>}
            </li>
          ))}
        </ul>
      </div>
      <div className='mt-auto text-center'>
        {plan.isRecomended && 
          <div className='req-badge' ><i class="fas fa-star"></i> RECOMMENDED <i class="fas fa-star"></i></div>
        }
        {activePlan === plan.title ? "" :
          <Button onClick={() => updatePlan(plan._id)} color="primary mt-4" block>
            <span className="px-5">Modify</span>
          </Button>
        }
      </div>
      {/*<div className="price-footer">
        <Button color="primary" block onClick={()=>updatePlan(plan._id)} > {plan.trialDays > 0 ? `Start ${plan.trialDays} days trial` : 'Modify Plan'}</Button>
      </div>*/}
    </div>
  );
}

export default Index;