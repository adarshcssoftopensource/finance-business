import React from 'react';
import Countdown from 'react-countdown';
import { _documentTitle } from '../../utils/GlobalFunctions';
import comingSoonPng from "../../assets/coming-soon.png"
import "./style.scss";

const ComingSoon = (props) => {
  _documentTitle({}, "Coming Soon");
  // Random component
  const Completionist = () => <span>We're live now!</span>;

  // Renderer callback with condition
  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      // Render a complete state
      return <Completionist />;
    } else {
      // Render a countdown
      return (
        <div class="countdown-circles d-flex flex-wrap justify-content-center">
          <div class="holder m-2"><span class="h1 font-weight-bold">{days}</span> Days</div>
          <div class="holder m-2"><span class="h1 font-weight-bold">{hours}</span> Hrs</div>
          <div class="holder m-2"><span class="h1 font-weight-bold">{minutes}</span> Min</div>
          <div class="holder m-2"><span class="h1 font-weight-bold">{seconds}</span> Sec</div>
        </div>
      )
    }
  };
  return (
    <main>
      <div className="container-fluid error404Wrapper coming-soon-container">
        <div className="py-content__primary">
          <div className="py-content py-content--centered">
            <div className="py-content__primary">
              <div className="error-image">
                <img src={comingSoonPng} alt="coming soon" />
              </div>
            </div>
          </div>
          <div className="py-header--page--centered">
            <div className="py-header__title">
              <div className="py-heading--title error-title mb-1">COMING SOON</div>
              <div className="py-heading--subtitle">
                <span>This page is under construction.</span> 
              </div>
            </div>
          </div>
        </div>
        {props.isCounter && <div class="count-number">
          <div class="row">
            <div class="col-lg-8 mx-auto">
              <div class="rounded text-center mb-5">
                {/* <p class="mb-4 font-weight-bold text-uppercase">Countdown</p> */}
                <Countdown
                  date={new Date(props.counterDate).toISOString()}
                  renderer={renderer}
                />
              </div>
            </div>
          </div>
        </div>}
      </div>
    </main>
  )
};

const Page = (props) => (
  <div key="1">
    <ComingSoon {...props} />
  </div>
);

export default Page;
