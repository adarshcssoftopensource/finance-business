import React from 'react';
import { Link } from 'react-router-dom';

const Index = () => {
 return (
  <div className="subscription-vcenter">
    <div className="upgrad-plan-area-box">
      <Link className="btn btn-primary" to="/app/setting/subscription-plans" >Upgrade My Plan</Link>
    </div>
  </div>
 )
}

export default Index;