import React from 'react';
import { privacyPolicy, terms, getstarted, security, home, getLogoURL } from "../../utils/GlobalFunctions";
import { NavLink } from 'react-router-dom';
import { _formatDate } from '../../utils/globalMomentDateFunc';
import { connect } from 'react-redux';

const PoweredByLogo = ({ themeMode }) => (
    <div className="py-logo--powered-by--mono py-logo">
        <span className="py-logo--powered-by py-logo--small">
            Powered By  <a href="javascript: void(0)" onClick={() => home()} className="font-bold ms-3">
                <img
                    className="logo-action"
                    src={getLogoURL()}
                    alt="Finance"
                />
            </a>
        </span>
    </div>
)

export const PoweredBy = ({ themeMode, affiliateRef="" }) => (
    <div className="readonly_footer">
        <PoweredByLogo themeMode={themeMode} affiliateRef={affiliateRef} />
        <div className="py-text py-text--small">
            Financial Software for Entrepreneurs. <a href={`${getstarted()}${affiliateRef ? `?ref=${affiliateRef}` : ""}`} target="_blank">Get Started </a>
        </div>
        <div className="py-text--hint footer_menu">
            <span className="copyright">© {_formatDate(new Date(), 'YYYY')} Finance LLC.</span> <a href={terms()} target="_blank">Terms of Use</a> • <a href={privacyPolicy()} target="_blank">Privacy Policy</a> • <a onClick={() => security()} href="#">Security</a>
        </div>
    </div>
)

export const PoweredByTerms = ({ themeMode }) => (
    <div className="public-checkout__footer row text-xs-center mt-3 mb-2 mx-0">
        <div className="col-sm-6 my-1">
            <PoweredByLogo themeMode={themeMode} />
        </div>
        <div className="col-sm-6 my-1 text-right text-xs-center" >
            <a href={terms()} target="_blank" className="py-text--link">Terms of Use</a>
            <span> . </span>
            <a href={privacyPolicy()} target="_blank" className="py-text--link">Privacy Policy</a>
        </div>
    </div>
)

const mapStateToProps = state => {
    return {
        themeMode: state.themeReducer.themeMode
    }
}

export default connect(mapStateToProps, {})(PoweredBy);