import React from 'react';
import history from '../../customHistory';
import styled from "styled-components";
import Icon from './Icon';
import symbolsIcon from '../../assets/icons/product/symbols.svg';

const DisplayBanner = ({ isSticky, data, handleRemoveBanner }) => {
  const handleRedirectUrl = (isRedirect, url) => {
    const Parseurl = formatPath(url);
    if (isRedirect) {
      window.open(Parseurl, '_blank')
    } else {
      history.push(Parseurl)
    }
  };

  const formatPath = (url = '') => {
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) {
      return url
    }
    if (url.startsWith('/')) {
      return url
    }
    const cleanUrl = url.replace(/^\/+/, '')
    return `/${cleanUrl.startsWith('app/') ? '' : 'app/'}${cleanUrl}`
  }

  const PYBanner = styled.div`
    &#${data.uuid} {
       &:before {
        background: ${data.accentColor};
      }
      .banner-action:hover {
        background: ${data.accentColor};
        border-color: ${data.accentColor};
      }
      .info-icon {
        color: ${data.accentColor};
      }

      .cencel-link {
        color: ${data.accentColor};
      }
    }
  `;


  return (
    <PYBanner className="py-banner" id={data.uuid}>
      <div className="info-icon"><Icon className="Icon" xlinkHref={`${symbolsIcon}#info-square`} /></div>
      <div className={`py-banner-content ${data.actionButton && data.actionButton.text ? 'have-button' : ''}`}><div className="py-banner-desc" dangerouslySetInnerHTML={{ __html: data.description }} /></div>
      <div className="py-banner-actions">
        {data.actionButton && data.actionButton.text !== "" &&
          <button onClick={() => handleRedirectUrl(data.actionButton.targetToExternal, data.actionButton.redirectTo)} className={`banner-action`}>
            {data.actionButton.text}
          </button>
        }
        {!isSticky &&
          <button color="link" className="cencel-link" onClick={() => handleRemoveBanner(data.bannerTargetId || '')}>
            <i className="fas fa-times" />
          </button>
        }
      </div>
    </PYBanner>
  );

  // return (
  //   <PYBanner className="py-banner" >
  //     <div className="py-banner-title" >
  //       <span className='angle front' />
  //       Notice
  //       <span className='angle back' />
  //     </div>
  //     <div className="py-banner-content">
  //       <div className="py-banner-desc">
  //         Due to technical challenges, we regret to inform you that Payments by Finance remains in beta and no longer available for all users. All pending payouts will resume as normal while we revise Payments by Finance. We greatly apologize for the inconvenience and are working to launch Payments by Finance for all users on or before Oct 15th.
  //       </div>
  //     </div>
  //   </PYBanner>
  // )
}

export default DisplayBanner
