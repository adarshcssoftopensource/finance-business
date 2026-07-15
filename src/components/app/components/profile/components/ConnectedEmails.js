import { openGlobalSnackbar } from '../../../../../actions/snackBarAction';
import profileServices from '../../../../../api/profileService';
import classNames from 'classnames';
import React, { Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import { DeleteModal } from '../../../../../utils/PopupModal/DeleteModal';
import SetPrimaryEmail from '../../../../../utils/PopupModal/SetPrimaryEmail';
import { Tooltip } from 'reactstrap';
import history from '../../../../../customHistory';
import Icon from '../../../../../components/common/Icon';
import symbolsIcon from '../../../../../assets/icons/product/symbols.svg';

function Email({
  email,
  status,
  onSetPrimary,
  onDelete,
  onResend,
  showTooltip,
  onTooltip,
  id,
  isPrimary,
  businessName
}) {

  return (
    <tr className="py-table__row">
      <td className="py-table__cell">{email}</td>

      <td className="py-table__cell">
        <span
          className={classNames('badge', {
            'badge-success': isPrimary,
            'badge-info': status === 'Verified' && !isPrimary,
            'badge-warning': status === 'Unverified' && !isPrimary,
          })}
        >
          {isPrimary ? 'Primary' : status}
        </span>

        {isPrimary && status === 'Unverified' && (
          <Fragment>
            &nbsp;
            <Tooltip
              placement="top"
              isOpen={showTooltip === `email-${id}`}
              target={`account-${id}`}
              toggle={() => onTooltip('email', id)}
            >
              Verification is easy. We'll send you an email to confirm that the
              account is yours.
            </Tooltip>
            <span id={`account-${id}`}>
              <i className="far fa-question-circle ms-1" />
            </span>
          </Fragment>
        )}
      </td>

      <td className="py-table__cell">
        {isPrimary && status === 'Verified' && businessName && (
          <div className="font-size-12 text-dark">
            {businessName}
          </div>
        )}
      </td>



      <td className="py-table__cell__action">
        <div className="py-table__cell__action__icons">
          {status === 'Verified' && (
            <Fragment>
              <Tooltip
                placement="top"
                isOpen={showTooltip === `primary-${id}`}
                target={`account-primary-${id}`}
                toggle={() => onTooltip('primary', id)}
              >
                Set as primary
              </Tooltip>
              <div
                className="py-table__action Icon"
                onClick={onSetPrimary}
                id={`account-primary-${id}`}
                style={{ cursor: 'pointer' }}
              >
                {isPrimary ? (
                  <i className="material-icons" style={{ color: '#FFCD3C' }}>
                    star
                  </i>
                ) : (
                  <i className="material-icons">star_border</i>
                )}
              </div>
            </Fragment>
          )}

          {status === 'Unverified' && (
            <div
              className="py-table__action"
              onClick={onResend}
              style={{ cursor: 'pointer' }}
            >
              <span className="py-text--link">Resend verification</span>
            </div>
          )}

          {!isPrimary && (
            <Fragment>
              <Tooltip
                placement="top"
                isOpen={showTooltip === `delete-${id}`}
                target={`account-delete-${id}`}
                toggle={() => onTooltip('delete', id)}
              >
                Delete
              </Tooltip>
              <div
                className="py-table__action py-table__action__danger Icon"
                onClick={onDelete}
                id={`account-delete-${id}`}
                style={{ cursor: 'pointer' }}
              >
                <Icon className="Icon" xlinkHref={`${symbolsIcon}#delete`} />
              </div>
            </Fragment>
          )}
        </div>
      </td>
    </tr>
  );
}

class Emails extends PureComponent {
  state = {
    primaryEmail: '',
    deleteEmail: '',
    primaryLoad: false,
    deleteBtn: false,
    tooltip: '',
  };

  togglePrimaryPopup = (email) => {
    this.setState({ primaryEmail: email });
  };

  toggleDeletePopup = (email) => {
    this.setState({ deleteEmail: email });
  };

  deleteEmail = async () => {
    const { userId, showSnackbar, callback } = this.props;
    try {
      this.setState({ deleteBtn: true });
      const { statusCode, message } = await profileServices.deleteConnectedEmail(
        userId,
        this.state.deleteEmail
      );
      this.setState({ deleteBtn: false });
      if (statusCode === 200 || statusCode === 201) {
        callback();
        showSnackbar(message);
        this.toggleDeletePopup();
        return;
      }
      showSnackbar(message, true);
    } catch (e) {
      this.setState({ deleteBtn: false });
      showSnackbar(e.message, true);
    }
  };

  resendConfirmation = async (email) => {
    const { showSnackbar } = this.props;
    try {
      const { statusCode, message } = await profileServices.resendverification(email._id);
      if (statusCode === 202) {
        history.push(`/app/accounts/confirm-email/${email.email}`);
      } else {
        showSnackbar(message, true);
      }
    } catch (e) {
      showSnackbar(e.message, true);
    }
  };

  setEmailPrimary = async () => {
    const { userId, showSnackbar, callback } = this.props;
    try {
      this.setState({ primaryLoad: true });
      const { statusCode, message } = await profileServices.setPrimaryEmail(
        userId,
        this.state.primaryEmail._id
      );
      this.setState({ primaryLoad: false });
      if (statusCode === 200 || statusCode === 201) {
        callback();
        showSnackbar(message);
        this.togglePrimaryPopup();
        return;
      }
      showSnackbar(message, true);
    } catch (e) {
      this.setState({ primaryLoad: false });
      showSnackbar(e.message, true);
    }
  };

  render() {
    const { emails, userId } = this.props;
    const { tooltip } = this.state;

    return (
      <Fragment>
        {emails.map((email) => (
          <Email
            key={email.id}
            {...email}
            onSetPrimary={() => this.togglePrimaryPopup(email)}
            onDelete={() => this.toggleDeletePopup(email._id)}
            onResend={() => this.resendConfirmation(email)}
            id={email.id}
            isPrimary={email.isPrimary}
            showTooltip={tooltip}
            onTooltip={(from, id) =>
              this.setState({
                tooltip: tooltip === `${from}-${id}` ? '' : `${from}-${id}`,
              })
            }
          />
        ))}

        <SetPrimaryEmail
          userId={userId}
          email={this.state.primaryEmail}
          onConfirm={this.setEmailPrimary}
          onClose={() => this.togglePrimaryPopup()}
          primaryLoad={this.state.primaryLoad}
        />

        <DeleteModal
          message="Are you sure you want to remove this email?"
          openModal={!!this.state.deleteEmail}
          onDelete={this.deleteEmail}
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

export default connect(null, mapDispatchToProps)(Emails);
