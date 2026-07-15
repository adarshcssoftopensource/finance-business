import React, {useEffect, useState} from 'react';
import SubscriptionCheckoutDetails from '../../global/subscriptionCheckoutDetails';
import SnakeBar from '../../global/SnakeBar';
import { Helmet } from 'react-helmet';
import { getLogoURL } from '../../utils/GlobalFunctions';
import anime1Png from "../../assets/images/anime/anime-1.png"
import anime2Png from "../../assets/images/anime/anime-2.png"
import anime3Png from "../../assets/images/anime/anime-3.png"
import anime4Png from "../../assets/images/anime/anime-4.png"
import anime5Png from "../../assets/images/anime/anime-5.png"
import anime6Png from "../../assets/images/anime/anime-6.png"
import anime7Png from "../../assets/images/anime/anime-7.png"
import anime8Png from "../../assets/images/anime/anime-8.png"
import Main_Logo from "../../assets/logo/finance-logo.png"
const Index = (props) => {
  const [planType, setPlanType] = useState(null)
  useEffect(()=>{
    const urlParams = new URLSearchParams(props.location.search);
    const getPlanType = urlParams.get('planType');
    setPlanType(getPlanType)
  })
 return (
  <div className="py-page__auth subs-checkout-page align-items-center p-3">
  <Helmet>
    <meta charSet="utf-8" />
    <title>Finance - Sign In</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </Helmet>
   <div className="anime-content" >
    <div className="anime-item one"><img src={anime1Png} alt="Animation" /> </div>
    <div className="anime-item two"><img src={anime2Png} alt="Animation" /> </div>
    <div className="anime-item three"><img src={anime3Png} alt="Animation" /> </div>
    <div className="anime-item four"><img src={anime4Png} alt="Animation" /> </div>
    <div className="anime-item five"><img src={anime5Png} alt="Animation" /> </div>
    <div className="anime-item six"><img src={anime6Png} alt="Animation" /> </div>
    <div className="anime-item seven"><img src={anime7Png} alt="Animation" /> </div>
    <div className="anime-item eight"><img src={anime8Png} alt="Animation" /> </div>
   </div>
   <div>
    <div class="text-center mb-3 pb-3">
      <a href={`${process.env.REACT_APP_ROOT_URL}`} className="step-logo">
        <img
          src={Main_Logo}
          alt="finance"
        />
      </a>
      </div>
      <SnakeBar />
      <SubscriptionCheckoutDetails planType={planType} />
   </div>
  </div>
 );
}

export default Index;