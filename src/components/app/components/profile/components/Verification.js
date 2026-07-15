import React from 'react'
import { useLocation } from 'react-router-dom';
import MiniSidebar from '../../../../../global/MiniSidebar/index'
import { profileSidebarLinksArray } from '../../../../../utils/common';
import IdentityVerification from '../../veriff'

const Verification = ({ params }) => {
  const location = useLocation();
  const isProfileVerificationSection = location?.pathname?.includes('/accounts/verification');
  return (
    <div className="py-frame__page has-sidebar">
      <MiniSidebar heading={'Profile'} listArray={profileSidebarLinksArray} />
      <div className="py-page__content">
        <IdentityVerification
          isProfileVerificationSection={isProfileVerificationSection}
        />
      </div>
    </div>
  )
}

export default Verification