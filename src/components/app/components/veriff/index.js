/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-underscore-dangle */
import React, { useEffect, useState } from 'react';
import { Veriff } from '@veriff/js-sdk';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'react-bootstrap';
import { initiateVerification } from '../../../../actions/verificationActions';
import { openGlobalSnackbar } from '../../../../actions/snackBarAction';
import history from '../../../../customHistory';
import CenterSpinner from '../../../../global/CenterSpinner';
import veriffImage from '../../../../assets/images/vriff-image.png';

const verificationMessages = {
  pending: "You have already started verification. Please resume.",
  submitted: "You have already submitted documents for verification. Please wait while we are reviewing.",
  resubmission_requested: "You're advised to resubmit your documents for verification.",
  approved: "Your documents are already verified and approved.",
  rejected: "Your documents have been rejected and you cannot proceed further. Please contact Customer Support.",
};

const IdentityVerification = ({ isProfileVerificationSection }) => {
  const dispatch = useDispatch();
  const [verificationStatus, setVerificationStatus] = useState('');
  const [veriffSessionUrl, setVeriffSessionUrl] = useState('');
  const { user: userData, loading } = useSelector(state => state.userData);
  const shouldShowInProfileSection = isProfileVerificationSection && 
    verificationStatus !== 'pending' && verificationStatus !== 'submitted' && 
    verificationStatus !== 'approved' && verificationStatus !== 'rejected'

  const openVeriffModal = (sessionUrl) => {
    window.veriffSDK.createVeriffFrame({
      url: sessionUrl,
      onEvent: status => {
        if (status === 'CANCELED' || status === 'FINISHED') {
          // Hide the button because we already have created a session and we'll use that
          if (document.getElementById('veriff-root')) {
            document.getElementById('veriff-root').style.display = 'none'
          }

          if (document.getElementById('veriff-root') && status === 'CANCELED') {
            setVeriffSessionUrl(sessionUrl)
            setVerificationStatus('pending')
          }

          if (document.getElementById('veriff-resume-wrapper') && status === 'FINISHED') {
            document.getElementById('veriff-resume-wrapper').style.display = 'none'
            setVerificationStatus('submitted')
          }
        }
      }
    })
  }

  const resumeOrResubmitDocuments = () => {
    openVeriffModal(veriffSessionUrl);
    // Make popup visible if it loses focus due to zIndex
    if (document.getElementById('veriffFrame') && document.getElementById('veriffFrame').parentElement) {
      document.getElementById('veriffFrame').parentElement.style.zIndex = 1000000000
    }
  }

  useEffect(() => {
    const status = userData.identityVerification && userData.identityVerification.status;
    const sessionUrl = userData.identityVerification && userData.identityVerification.sessionUrl;
    setVeriffSessionUrl(sessionUrl);
    setVerificationStatus(status);
  }, [userData])

  useEffect(() => {
    let veriffInstance

    if (verificationStatus === 'not_required' && !shouldShowInProfileSection) {
      history.push('/app/dashboard');
    }

    if ((verificationStatus === 'required' || shouldShowInProfileSection) && document.getElementById('veriff-root')) {
      veriffInstance = Veriff({
        apiKey: process.env.REACT_APP_VERIFF_PUBLIC_KEY,
        parentId: 'veriff-root',
        onSession: (err, response) => {
          if (err) {
            dispatch(openGlobalSnackbar(`Veriff: ${err && err.statusText || 'Something went wrong.'}`, false));
          }
          const veriffSessionData = {
            sessionUrl: response.verification.url,
            userId: userData && userData.uuid,
            status: response.verification.status
          }
          dispatch(initiateVerification(veriffSessionData));
          openVeriffModal(response.verification.url);
          setVerificationStatus(response.verification.status);
          setVeriffSessionUrl(response.verification.url);
        }
      });
    }
  
    if (veriffInstance && userData) {
      veriffInstance.setParams({
        person: {
          givenName: userData.firstName,
          lastName: userData.lastName,
        },
        vendorData: userData.uuid
      });
      veriffInstance.mount({
        submitBtnText: 'Verify my identity',
        loadingText: 'Please wait...'
      });
    }
  }, [userData, verificationStatus, shouldShowInProfileSection])

  useEffect(() => {
    document.title = "Finance | Verifications";
    if (document.getElementsByClassName('veriff-description') && document.getElementsByClassName('veriff-description')[0]) {
      document.getElementsByClassName('veriff-description')[0].innerHTML =
        `Finance as partnered with <a title="Veriff" href="https://www.veriff.com/" style="color: #136acd" target="_blank">Veriff</a> to verify the identities of its users.`
    }
    const veriffSubmitButtonElement = document.getElementById('veriff-submit-btn')
    if (veriffSubmitButtonElement) {
      veriffSubmitButtonElement.style.backgroundColor = '#136acd'
    }
  }, [userData, verificationStatus])

  if (loading) {
    return <CenterSpinner />
  }

  return (
    <div className='veriff-content-area'>
      <figure className='vriff-image text-center'>
        <img src={veriffImage} alt="" />
      </figure>
      {verificationMessages[verificationStatus] && <h4 className='w-75 text-center mb-4'>{verificationMessages[verificationStatus]}</h4>}
      <div>
        {(verificationStatus === 'required' || shouldShowInProfileSection) && (
          <div id='veriff-root' />
        )}
        {(verificationStatus === 'pending' || verificationStatus === 'resubmission_requested') && (
          <div id='veriff-resume-wrapper'>
            <Button className='veriff-resume veriff-resume--center  ' onClick={resumeOrResubmitDocuments}>
              Resume Verification
            </Button>
            <p className="veriff-description" />
          </div>
        )}
      </div>
    </div>
  );
};

export default IdentityVerification;