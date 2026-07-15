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
            <h3 className="intro-title">Create a dedicated Give link to share </h3>
            <div className="intro-desc">
              <p>Whether you're raising money for a personal cause, a charitable organization, or a community project, our crowdfunding link makes it easy to collect donations and reach your goals.</p>
            </div>
            <div>
              <Button color="primary"  disabled={props.buttonLoading} className="peyme-action" onClick={() => props.handleCreateLink("add")}>{props.buttonLoading ? (
                <Spinner size="sm" color="default" />
              ) : (
                "Get started now"
              )}</Button>
            </div>
        </div>
      </div>
    </div>
  )
}

export default PaymeIntro;
