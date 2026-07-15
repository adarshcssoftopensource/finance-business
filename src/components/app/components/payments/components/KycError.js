import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { fetchPaymentSettings } from '../../../../../actions/paymentSettings';
import { openGlobalSnackbar } from '../../../../../actions/snackBarAction';
import {
    fetchKycUrl
} from '../../../../../actions/paymentAction'
import CenterSpinner from '../../../../../global/CenterSpinner';
import { help, _documentTitle } from "../../../../../utils/GlobalFunctions";
import history from '../../../../../customHistory'
import { Spinner, Button } from 'reactstrap';
import { uniqBy } from 'lodash'

const KycError = props => {
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        props.fetchPaymentSettings();
        _documentTitle(props.businessInfo, ' KYC issue');
    }, [])
    
    useEffect(() => {
        let timer;
        if (parseInt(data && data.verificationRemarks && data.verificationRemarks.includes('inProgress')) === 0) {
            return () => clearInterval(timer);
        } else {
            timer = setInterval(() => props.fetchPaymentSettings(), 10000);
        }
        return () => clearInterval(timer);
    }, [props.paymemntSettings]);

    useEffect(() => {
        checkIfFix();
    }, [props.paymemntSettings])

    const checkIfFix = () => {
        const { paymemntSettings: { data } } = props
        if (data.isSetupDone && data.kycStatus === 'verified') {
            history.push('/app/payments')
        } else if (!data.isSetupDone && !data.isKycIssue && data.charges.expressSupported && data.charges.expressEnabled) {
            history.push('/app/payments/express-onboarding')
        }
    }
    const generateUrl = async () => {
        try {
            setIsLoading(true)
            await props.fetchKycUrl((res) => {
                setIsLoading(false)
                if (res.data && res.data.urlInfo && res.data.urlInfo.url) {
                    window.open(res.data.urlInfo.url, '_blank')
                } else {
                    props.showSnackbar(res.message ? res.message : "Something went wrong", true)
                }
            })
        } catch (error) {
            setIsLoading(false);
            props.showSnackbar(error.message, true)
        }
    }

    const renderErrors = (errors) => {
        const getUniqErr = uniqBy(errors, 'reason');
        return (
            <React.Fragment>
                {getUniqErr.map((err) => (
                    <div class="alert alert-danger w-100 justify-content-start text-left">
                        <strong style={{ minWidth: '100px' }}>KYC Failed </strong>{err.reason}
                    </div>
                ))}
            </React.Fragment>
        )
    }

    const { paymemntSettings: { loading, data } } = props

    if (loading) {
        return (<div className="content-wrapper__main__fixed text-center vh-100 d-flex align-items-center">
            <CenterSpinner />
        </div>)
    } if(data.onboardingStatus === "awaiting_approval" || data.kycStatus === 'pending') {
        return(
            <div className="content-wrapper__main__fixed text-center vh-100 d-flex align-items-center">
                <div className="py-status-page">
                    <div className="py-box">
                        <div className="py-box--content">
                            <h1 className="py-heading--title mb-4">Please allow us up to 24 business hours to review your application for Payments by Finance.</h1>
                        </div>
                    </div>
                </div>
            </div>
        )
    } if(data.onboardingStatus === "blocked") {
        return(
            <div className="content-wrapper__main__fixed text-center vh-100 d-flex align-items-center">
                <div className="py-status-page">
                    <div className="py-box">
                        <div className="py-box--content">
                            <h1 className="py-heading--title mb-4">Unfortunately, your business is not eligible for Payments by Finance. This decision is final.</h1>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    else {
        return (
            <div className="content-wrapper__main__fixed text-center vh-100 d-flex align-items-center">
                <div className="py-status-page">
                    {
                        data.providerName === 'finix' ?
                            <div className="py-box">
                                <div className="py-box--content">
                                    <h1 className="py-heading--title mb-4">Please allow 10 to 30 minutes for your information to be verified.</h1>
                                </div>
                            </div>
                        : <div className="py-box">
                            <div className="py-box--content">
                                <h1 className="py-heading--title mb-4">We need to talk</h1>        
                                <div className="py-heading--subtitle">                                
                                    <p>It appears that we are experiencing difficulty verifying a few things.</p>
                                    <p>Below, you should see a button “Start KYC Verification”. Please click the button to resolve issues related to Know Your Customer.</p>
                                    <p>If you do not see the “Start KYC Verification” or experiencing issues with KYC, please reach out to Finance Customer Support <a href="javascript: void(0)" className="Link__External" onClick={() => help()}>here</a>.</p>
                                </div>
                            </div>
                        </div>
                    }
                    
                    {/* {data.verificationRemark && data.providerName !== 'finix' && (<div className="kyc-status pb-3">
                        {data.verificationRemark.errors && data.verificationRemark.errors.length > 0 && (
                            <React.Fragment> {renderErrors(data.verificationRemark.errors)}</React.Fragment>
                        )}
                        {data.verificationRemark.includes('inProgress') && parseInt(data.verificationRemark.inProgress) > 0 && (<div class="alert alert-info w-100 justify-content-start text-left">
                            <strong style={{ minWidth: '100px' }}>Verifying</strong>{data.verificationRemark.inProgress}
                        </div>)}
                    </div>)} */}
                    {/* {data.verificationRemark.inProgress && parseInt(data.verificationRemark.inProgress) == 0 &&  */}
                    {
                        data && data.providerName ?
                            <Button color="primary" disabled={isLoading} onClick={generateUrl}>
                                Start KYC Verification {isLoading && (<Spinner size="sm" color="default" />)}
                            </Button>
                        : ''
                    }
                    {
                        data && data.providerName === 'finix' && data.kycStatus === 'unverified' ?
                            <Button color="primary" disabled={isLoading} onClick={generateUrl}>
                                Start KYC Verification {isLoading && (<Spinner size="sm" color="default" />)}
                            </Button>
                        : ''
                    }
                    {/* } */}
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        businessInfo: state.businessReducer.selectedBusiness,
        paymemntSettings: state.paymentSettings
    }
}

const mapDispatchToProps = dispatch => {
    return {
        fetchPaymentSettings: () => {
            dispatch(fetchPaymentSettings())
        },
        fetchKycUrl: (cb) => {
            dispatch(fetchKycUrl(cb))
        },
        showSnackbar: (message, error) => {
            dispatch(openGlobalSnackbar(message, error))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(KycError)