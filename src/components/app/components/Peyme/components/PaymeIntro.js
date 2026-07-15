import React from 'react'
import { Button,Spinner } from "reactstrap";
import peymeIntro from "../../../../../assets/images/peyme-intro.png"

const PaymeIntro = (props) => {
  return (
    <div>
      <div className="peyme-box-wrapper">
        <div className="peyme-intro-box">
            <div className="intro-icon">
                <img src={peymeIntro} alt="share connect" />
            </div>
            <h3 className="intro-title">Create a dedicated Finance.Me Lynk to share </h3>
            <div className="intro-desc">
                <p>Friends, family, and customers can use your link to pay custom amounts. No invoice, no specific product or service required.</p>
            </div>
            <div>
              <Button color="primary"  disabled={props.buttonLoading} className="peyme-action" onClick={() => props.handleCreateLink("add")}>{props.buttonLoading ? (
                <Spinner size="sm" color="default" />
              ) : (
                "Create Finance.Me Lynk now"
              )}</Button>
            </div>
            <a href={`${process.env.REACT_APP_WEB_URL}/payyitme`} target="_blank" className="btn btn-link mt-4" >Learn more</a>
        </div>
      </div>
    </div>
  )
}

export default PaymeIntro;
