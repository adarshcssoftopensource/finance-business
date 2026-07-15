import React from 'react';
import { Helmet } from 'react-helmet'
import { NavLink, withRouter } from 'react-router-dom';
import { connect } from "react-redux";
import { get as _get } from "lodash";
import { UncontrolledTooltip } from 'reactstrap';
import { _documentTitle, help, home, getLogoURL, isDisableHelpButtonForStarterPlan, customerSupportTooltipText } from '../../utils/GlobalFunctions';
import SnakeBar from "../../global/SnakeBar";
import  errorIllustrationPng from "../../assets/error-ilustration.png"

const Error400 = ({ selectedBusiness }) => {
  _documentTitle({}, "404")
  const activeSubscription =  _get(selectedBusiness, "subscription.planLevel", 1);
  const isHelpButtonDisable = isDisableHelpButtonForStarterPlan(activeSubscription);
  return (
    <main>
      <Helmet>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>
      <SnakeBar />
      <div className="container-fluid error404Wrapper">
        <div className="py-content__primary">
          <div className="py-content py-content--centered">
            <div className="error-logo"><NavLink to="/" >
              <img className="logo-action" 
              src={getLogoURL()}
              alt="Finance" /></NavLink></div>
            <div className="py-content__primary">
              <div className="error-image">
                <img src={errorIllustrationPng} alt="Error" />
              </div>
            </div>
          </div>
          <div className="py-header--page--centered">
            <div className="py-header__title mb-5">
              <div className="py-heading--title error-title mb-1">Page not found.</div>
              <div className="py-heading--subtitle">Sorry, we can't find the page you are looking for.</div>
            </div>
          </div>
          <div className="py-content py-content--centered">
            <div className="py-content__primary">
              <p className="py-text mb-3">Use your browser's back button and try again, or try one of the following:</p>
              <ul className="py-list--plain--vertical">
                <li><NavLink className="py-text--link" to="/app/dashboard" >Home</NavLink></li>
                <li><NavLink className="py-text--link" to="/signup/" >Sign Up</NavLink></li>
                <li><NavLink className="py-text--link" to="/signin/" >Sign In</NavLink></li>
                <li>
                  {
                    isHelpButtonDisable
                    ? <React.Fragment>
                        <UncontrolledTooltip 
                          placement="top" 
                          target="help_link">
                          {customerSupportTooltipText(activeSubscription)}
                        </UncontrolledTooltip>
                        <a className="py-text--link" href="javascript: void(0);" id="help_link">Help</a>
                      </React.Fragment>
                    : <a className="py-text--link" href="javascript: void(0);" onClick={() => help()}>Help</a>
                  }
                </li>
              </ul>
              <p className="py-text py-text--fine-print mt-5">Error code: <span className="py-text--code">404</span></p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
};

const Page = (props) => (
  <div className="page-err">
    <div key="1">
      <Error400 {...props} />
    </div>
  </div>
);

const mapStateToProps = state => {
  return {
      selectedBusiness: state.businessReducer.selectedBusiness,
  };
};

export default withRouter(connect(mapStateToProps)(Page));
