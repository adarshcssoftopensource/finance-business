import { openGlobalSnackbar } from '../../../../../actions/snackBarAction';
import profileServices from '../../../../../api/profileService';
import classNames from 'classnames';
import React, { Fragment, PureComponent } from 'react'
import { connect } from 'react-redux';
import { Tooltip } from 'reactstrap';
import { DeleteModal } from '../../../../../utils/PopupModal/DeleteModal';
import Icon from '../../../../../components/common/Icon';
import symbolsIcon from "../../../../../assets/icons/product/symbols.svg";

function Account({ provider, id, email, isLoginAllowed, showTooltip, onDelete, onTooltip }) {
  return (
    <tr className="py-table__row">

      <td className="py-table__cell__action text-left">
        {email}
        {/* <span className={classNames({
          'badge-info': status === 'Verified',
          'badge-primary': status === 'Primary',
          'badge-warning': status === 'Unverified',
        })}>
          {isLoginAllowed ? <i className="fal fa-check" /> : <i className="fal fa-times" />}
        </span> */}
      </td>
      <td className="py-table__cell accounts-list">
        <span className={provider} id={`account-${id}`}>{provider}</span>
        <Tooltip
          placement="right"
          isOpen={showTooltip}
          target={`account-${id}`}
          toggle={onTooltip}>
          {email}
        </Tooltip>
      </td>
      <td className="py-table__cell__action">
        <div className="py-table__cell__action__icons">
          <div className="py-table__action py-table__action__danger Icon" onClick={onDelete}>
            <Icon className="Icon" xlinkHref={`${symbolsIcon}#delete`} />
          </div>
        </div>
      </td>
    </tr>
  );
}

class ConnectedAccounts extends PureComponent {
  state = {
    deleteAccount: '',
    tooltip: '',
    accounts: [],
    deleteBtn: false
  };

  componentDidMount() {
    this.fetchConnectedAccounts();
  }

  fetchConnectedAccounts = async () => {
    const { userId: id } = this.props;
    const { data: { accounts } = { accounts: [] } } = await profileServices.getConnectedAccounts(id);
    this.setState({ accounts });
  };

  toggleDeletePopup = (id) => {
    this.setState({ deleteAccount: id });
  };

  toggleTooltip = (id) => {
    this.setState({ tooltip: this.state.tooltip === id ? '' : id });
  };

  deleteAccount = async () => {
    const { userId, showSnackbar, callback } = this.props;
    try {
      this.setState({ deleteBtn: true })
      const { statusCode, message } = await profileServices.deleteConnectedEmail(userId, this.state.deleteAccount);
      this.setState({ deleteBtn: false })
      if (statusCode === 200 || statusCode === 201) {
        callback();
        // this.fetchConnectedAccounts();
        showSnackbar(message);
        this.toggleDeletePopup();
        return;
      }

      showSnackbar(message, true);
    } catch (e) {
      this.setState({ deleteBtn: false })
      showSnackbar(e.message, true);
    }
  };

  googleResponse = async (response) => {
    const { userId } = this.props;
    if (!!response.accessToken) {
      const payload = {
        accountProfileInput: {
          provider: 'google',
          token: response.accessToken,
          email: response.profileObj.email,
          firstName: response.profileObj.givenName,
          lastName: response.profileObj.familyName,
          name: response.profileObj.name,
        }
      };
      const { data, message, statusCode } = await profileServices.addConnectedAccount(userId, payload);
      if (statusCode === 200 || statusCode === 201) {
        this.fetchConnectedAccounts();
      }
    }
  };

  render() {
    const { accounts } = this.props;
    return (
      <Fragment>
        <h2 className="py-heading--section-title">Connected Accounts</h2>
        <p className="py-text">Add an account to incorporate your contacts or login with that account.</p>
        <table className="py-table py-table__hover login-table">
          <thead className="py-table__header">
            <tr className="py-table__row">
              <th className="py-table__cell">Account</th>
              <th className="py-table__cell__action text-left">Provider</th>
              <th className="py-table__cell__action">Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(account => (
              <Account
                key={account.id}
                {...account}
                showTooltip={this.state.tooltip === account.id}
                onDelete={() => this.toggleDeletePopup(account.id)}
                onTooltip={() => this.toggleTooltip(account.id)}
              />
            ))}
          </tbody>
        </table>

        <div className="py-btn-container"
          style={{ marginTop: '1em', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <p className="py-text">Connect another account: &nbsp;</p>
          <a className="btn btn-social--google" href={`${process.env.API_URL}/api/v2/users/me/emails/google`}>Google</a>
        </div>

        <DeleteModal
          message='Are you sure you want to delete this account?'
          openModal={!!this.state.deleteAccount}
          onDelete={this.deleteAccount}
          onClose={() => this.toggleDeletePopup()}
          btnLoad={this.state.deleteBtn}
        />

      </Fragment>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    showSnackbar(message, error) {
      dispatch(openGlobalSnackbar(message, error));
    },
  };
}

export default connect(null, mapDispatchToProps)(ConnectedAccounts);
