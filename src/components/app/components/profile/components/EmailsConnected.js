import profileServices from '../../../../../api/profileService';
import classNames from 'classnames';
import ConnectedAccounts from './ConnectedAccounts';
import MiniSidebar from '../../../../../global/MiniSidebar'
import React, { Component } from 'react'
import { Tooltip } from 'reactstrap';
import { AddNewEmail } from '../../../../../utils/PopupModal/AddNewEmail';
import Emails from './ConnectedEmails';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { openGlobalSnackbar } from '../../../../../actions/snackBarAction';
import { handleAclPermissions } from '../../../../../utils/GlobalFunctions';
import { profileSidebarLinksArray } from '../../../../../utils/common';

class EmailsConnected extends Component {
  state = {
    newEmailOpen: false,
    emails: [],
    accounts: [],
    loading: false,
    addEmailTooltip: false,
  };

  componentDidMount() {
    document.title = "Finance - Email & Connected Accounts";

    this.fetchConnectedEmails();
  }

  handleAddNewEmail(e) {
    this.setState({
      newEmailOpen: !this.state.newEmailOpen
    })
  }

  toggleAddEmailTooltip = () => {
    this.setState({
      addEmailTooltip: !this.state.addEmailTooltip
    });
  };

  fetchConnectedEmails = async () => {
    const { params: { userId: id } } = this.props;
    const { data: { emails } = { emails: [] } } = await profileServices.getConnectedEmails(id);
    this.setState({ emails: emails.filter(item => item.provider === "local"), accounts: emails.filter(item => item.provider !== "local") });
  };

  renderEmails() {
    const { params: { userId } } = this.props;
    return (
      <Emails emails={this.state.emails} userId={userId} callback={this.fetchConnectedEmails} />
    );
  }

  render() {
    const { params } = this.props;
    const { newEmailOpen, emails } = this.state;
    const isAdmin = handleAclPermissions(['Admin']);
    const isOwner = handleAclPermissions(['Owner']);
    const canAddEmail = !emails.filter(r => r.status === 'Unverified').length && (isAdmin || isOwner);
    
    return (
      <div className="py-frame__page has-sidebar">
        <MiniSidebar heading={'Profile'} listArray={profileSidebarLinksArray} />
        <AddNewEmail
          openModal={newEmailOpen}
          onClose={this.handleAddNewEmail.bind(this)}
          userId={params.userId}
          callback={this.fetchConnectedEmails}
          openGlobalSnackbar={(message, status) => this.props.openGlobalSnackbar(message, status)}
        />
        <div className="py-page__content connected_accounts">
          <div className="py-page__inner">
            <div className="py-header--page flex">
              <div className="py-header--title">
                <h2 className="py-heading--title">Emails & Connected Accounts</h2>
              </div>
            </div>

            <h2 className="py-heading--section-title">Emails</h2>
            <p className="py-text">You will be able to sign in to Finance using any of the email addresses below with
              your <Link className="py-text--link" to={`/app/${params.userId}/accounts/password`}>Finance password</Link>. You can also use any of these emails on the
              invoices you send to your customers.</p>

            <table className="py-table py-table__hover">
              <thead className="py-table__header">
                <tr className="py-table__row">
                  <th className="py-table__cell">Address</th>
                  <th className="py-table__cell">Status</th>
                  <th className="py-table__cell">Business</th>
                  <th className="py-table__cell__action">Actions</th>
                </tr>
              </thead>
              <tbody>
                {this.renderEmails()}
                <tr className="py-table__row">
                  <td className="py-table__cell">
                    <a href="javascript: void(0)" id="add-new-email"
                      className={classNames({ 'py-btn__text': true, disabled: !canAddEmail })}
                      onClick={canAddEmail ? this.handleAddNewEmail.bind(this) : undefined}>
                      {/* onClick={this.handleAddNewEmail.bind(this)}> */}
                      <span className="Icon me-1 "><i className="fal fa-plus-circle" /></span>
                      Add new email
                    </a>
                    {!canAddEmail &&
                      <Tooltip
                        placement="top"
                        isOpen={this.state.addEmailTooltip}
                        toggle={this.toggleAddEmailTooltip}
                        target="add-new-email"
                      >
                        You need to verify your existing email addresses first.
                    </Tooltip>
                    }
                  </td>
                  <td className="py-table__cell" />
                  <td className="py-table__cell" />
                </tr>
              </tbody>
            </table>
            <div className="py-layout__callout">
              <div className="py-notify py-notify--info">
                <div className="py-notify__icon-holder">
                  <span className="Icon icon-lg">
                    <svg viewBox="0 0 20 20" className="py-svg-icon" id="info" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M10 19a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm0-2a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm0-11a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 3a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0v-4a1 1 0 0 1 1-1z" />
                    </svg>
                  </span>
                </div>
                <div className="py-notify__content-wrapper">
                  <div className="py-notify__content">
                    <div className="py-notify__message">
                      If you want to grant someone else access to your Finance account (such as a business partner,
                      accountant or bookkeeper), you can do that by adding them as a user.
                    </div>
                  </div>
                  <div className="py-notify__action">
                    <button className="btn btn-rounded btn-outline-info">
                      <Link to="/app/setting/user-management">
                        Add a user
                      </Link>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* <ConnectedAccounts userId={params.userId} accounts={this.state.accounts} callback={this.fetchConnectedEmails} /> */}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(null, { openGlobalSnackbar })(EmailsConnected)
