import React,{Component} from 'react';
import { NavLink } from 'react-router-dom';
import MiniSidebar from '../../../../../global/MiniSidebar';
import { profileSidebarLinksArray } from '../../../../../utils/common';

export default class ConfirmEmail extends Component {
    render(){
    return (
        <div className="py-frame__page has-sidebar">
            <MiniSidebar heading={'Profile'} listArray={profileSidebarLinksArray} />
            <div className="py-page__content">
                <div className="mail-confirm-massage">
                    <div className="logo-box text-center mb-5"><img className="logo-action" src={`${process.env.REACT_APP_CDN_URL}/static/web-assets/confirmation.png`} alt="Finance" /></div>
                    <h3 className="desc-2 title-1 text-center mb-3" >Confirm Your Email</h3>
                    <div className="desc-1 mb-5 text-center">We've sent an email to <b>{this.props.match.params.email}</b> containing a link you'll need to follow to confirm your email. You should receive the email within the next few minutes.</div>
                    <h5 className="desc-2 title-2 mb-3">Didn't get the email?</h5>
                    <div className="desc-2 mb-3">Below are some of the most common reasons you might not be receiving the message:</div>
                    <ul className="dots-list" >
                        <li>First, be patient; sometimes it takes a while for the email to arrive.</li>
                        <li>Confirm above that you entered your email address correctly.</li>
                        <li>Check your junk email box; the message might have been filtered as junk.</li>
                    </ul>
                </div>
            </div>
        </div>
    )
    }
}