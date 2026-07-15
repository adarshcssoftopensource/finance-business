import React, { useEffect} from 'react';
import { help, _documentTitle } from "../../utils/GlobalFunctions";

const Index = props => {
 useEffect(() => {
  _documentTitle('', ' Need to talk');
 }, [])

  return (
   <div className="content-wrapper__main__fixed text-center vh-100 d-flex align-items-center">
    <div className="py-status-page">
     <div className="py-box">
      <div className="py-box--content">
       <h1 className="py-heading--title mb-4">We need to talk</h1>
       <div className="py-heading--subtitle">
        <p>It appears that we are experiencing difficulty verifying a few things.</p>
        {/* <p>Below, you should see a button “Start KYC Verification”. Please click the button to resolve issues related to Know Your Customer.</p> */}
        <p>Please reach out to Finance Customer Support <a href="javascript: void(0)" className="Link__External" onClick={() => help()}>here</a>.</p>
       </div>
      </div>
     </div>
    </div>
   </div>
  )
}

export default Index