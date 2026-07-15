import React, { Component } from 'react'
import { get as _get } from 'lodash';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import CenterSpinner from '../../../../../../global/CenterSpinner';
import { handleAclPermissions } from "../../../../../../utils/GlobalFunctions";
class Sidebar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      location: 'app/setting/invoice-customization',
      toggle: false
    }
  }
  componentDidMount() {
    this.setState({
      location: window.location.pathname
    })
  }

  componentDidUpdate(prevProps) {
    if (this.state.location !== window.location.pathname) {
      this.setState({
        location: window.location.pathname
      })
    }
  }

  handleToggle = () => {
    this.setState({ toggle: !this.state.toggle })
  }


  render() {
    const { paymentSettings: { loading, data }, location } = this.props;
    const isPermission = !handleAclPermissions(['Viewer', 'Editor'])
    return (
      <aside className={`py-page__sidebar-menu ${this.state.toggle == false && 'active'}`}>
        <button className='maneu-toggle' onClick={() => this.handleToggle()}>{this.state.toggle == false ? <i className='fal fa-angle-left' ></i> : <i className='fal fa-angle-right' ></i>}</button>
        <div className="py-page__sidebar">
          {
            !!loading ? <CenterSpinner /> : (
              <div className="py-nav__sidebar">
                <h5 className="py-nav__heading">Settings</h5>
                <ul className="py-nav__section">
                  <li className="title">User Management</li>
                  <li>
                    <NavLink className="nav-link" activeClassName={this.state.location.includes('setting/user-management') && 'is-active'} to='/app/setting/user-management'>Users</NavLink>
                  </li>
                  <li className="title">Sales</li>
                  <li>
                    <NavLink className="nav-link" activeClassName={this.state.location.includes('setting/invoice-customization') && 'is-active'} to='/app/setting/invoice-customization'>Customization</NavLink>
                  </li>
                  {
                    !!data && !!data.isVerified && !!data.isOnboardingApplicable && isPermission && (
                      <li>
                        <NavLink className="nav-link" activeClassName={this.state.location.includes('setting/payments') && 'is-active'} to='/app/setting/payments'>Payments</NavLink>
                      </li>
                    )
                  }
                  {/* {
                    !loading && data && data.isOnboardingApplicable && isPermission && _get(data, "onBoardingRules.isPayoutEnabled", false) && (
                      <li>
                        <NavLink className="nav-link" activeClassName={this.state.location.includes('setting/payouts') && 'is-active'} to='/app/setting/payouts'>Payouts</NavLink>
                      </li>
                    )
                  } */}
                </ul>
                {/* <ul className="py-nav__section">
                <li className="title">Purchases</li>
                <li>
                  <NavLink className="nav-link" activeClassName={this.state.location.includes('setting/receipts') && 'is-active'} to='/app/setting/receipts'>Receipts</NavLink>
                </li>
              </ul> */}
                {/*
                !loading && data && data.isOnboardingApplicable && (
                  <ul className="py-nav__section">
                    <li className="title">Banking</li>
                    <li>
                      <NavLink className="nav-link" activeClassName={this.state.location.includes('setting/payouts') && 'is-active'} to='/app/setting/payouts'>Payouts</NavLink>
                    </li>
                  </ul>
                )
                */}
                {isPermission && <ul className="py-nav__section">
                  <li className="title">Subscription</li>
                  <li>
                    {!this.state.location.includes('setting/update-card') && <NavLink className="nav-link" activeClassName={this.state.location.includes('setting/subscription-history') && 'is-active'} to='/app/setting/subscription-history'>Details</NavLink>}
                    {this.state.location.includes('setting/update-card') && <NavLink className="nav-link is-active" activeClassName={'is-active'} to='/app/setting/subscription-history'>Details</NavLink>}
                  </li>
                </ul>}

                {<ul className="py-nav__section">
                  <li className="title">Verification Center</li>
                  <li>
                    <NavLink className="nav-link" activeClassName={this.state.location.includes('setting/verification-center') && 'is-active'} to='/app/setting/verification-center'>Documents</NavLink>
                  </li>
                </ul>}
                <li className="title">Send Emails</li>
                <li>
                  <NavLink className="nav-link" activeClassName={this.state.location.includes('setting/emails') && 'is-active'} to='/app/setting/emails'>From</NavLink>
                </li>
              </div>
            )
          }
        </div>
      </aside>
    )
  }
}

const states = ({ paymentSettings }) => {
  return { paymentSettings }
}
export default connect(states, null)(Sidebar)