import React, { Component } from 'react'
import { Form, Label, Input, Spinner, Button } from 'reactstrap';
import MiniSidebar from '../../../../../global/MiniSidebar';
import { openGlobalSnackbar } from '../../../../../actions/snackBarAction';
import { changePass } from '../../../../../actions/profileActions';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import FormValidationError from '../../../../../global/FormValidationError';
import { profileSidebarLinksArray } from '../../../../../utils/common';
import { Eye, EyeOff } from "react-feather";

class ChangePassword extends Component {
  state = {
    currentPassword: '',
    newPassword: '',
    confNewPassword: '',
    showOldPass: false,
    showNewPass: false,
    showConfPass: false,

    // validation state (consistent names)
    currentPasswordErr: false,
    currentPasswordErrText: 'This field is required',
    newPasswordErr: false,
    confNewPasswordErr: false,
    passwordErr: 'At least 8 characters, but longer is better',
    confError: 'Password must match with New Password',

    disabled: true,
    load: false,
  }

  componentDidMount() {
    document.title = "Finance - Change Password";
  }

  togglePassword = (field) => {
    this.setState(prev => ({ [field]: !prev[field] }));
  };

  _handleText = (e) => {
    const { name, value } = e.target;
    // update value then validate
    this.setState({ [name]: value }, () => this._validateForm());
  };

  _validateForm = () => {
    const { currentPassword, newPassword, confNewPassword } = this.state;

    // current password: required, at least 6 chars
    let currentPasswordErr = false;
    let currentPasswordErrText = '';

    if (!currentPassword) {
      currentPasswordErr = true;
      currentPasswordErrText = 'This field is required';
    } else if (currentPassword.length < 6) {
      currentPasswordErr = true;
      currentPasswordErrText = 'Must be at least 6 characters';
    }

    // new password: required, at least 8 chars
    let newPasswordErr = false;
    let passwordErr = '';
    if (!newPassword) {
      newPasswordErr = true;
      passwordErr = 'This field is required';
    } else if (newPassword.length < 8) {
      newPasswordErr = true;
      passwordErr = "Uh oh, this password isn't strong enough.";
    }

    // confirm: must match new
    let confNewPasswordErr = false;
    let confError = '';
    if (confNewPassword && newPassword !== confNewPassword) {
      confNewPasswordErr = true;
      confError = 'Passwords do not match';
    } else if (!confNewPassword) {
      // if empty, show required only after user touched it — for simplicity, treat empty as error
      confNewPasswordErr = true;
      confError = 'This field is required';
    }

    // enable form only when all are valid
    const disabled = currentPasswordErr || newPasswordErr || confNewPasswordErr;

    this.setState({
      currentPasswordErr,
      currentPasswordErrText,
      newPasswordErr,
      confNewPasswordErr,
      passwordErr,
      confError,
      disabled
    });
  }

  _handleForm = async (e) => {
    e.preventDefault();
    const { newPassword, confNewPassword, currentPassword, disabled } = this.state;

    // guard (should be redundant because button is disabled)
    if (disabled) return;

    // final sanity check
    if (newPassword.length < 8) {
      this.setState({ newPasswordErr: true, passwordErr: "Password must be at least 8 characters" });
      return;
    }
    if (currentPassword.length < 6) {
      this.setState({ currentPasswordErr: true, currentPasswordErrText: "Must be at least 6 characters" });
      return;
    }
    if (newPassword !== confNewPassword) {
      this.setState({ confNewPasswordErr: true, confError: 'Passwords do not match' });
      return;
    }

    this.setState({ load: true });
    try {
      const response = await this.props.changePass({ newPassword, currentPassword });
      this.setState({ load: false });
      if (response && response.statusCode === 200) {
        this.props.openGlobalSnackbar("Password changed successfully", false);
        // optional: clear fields after success
        this.setState({
          currentPassword: '',
          newPassword: '',
          confNewPassword: '',
          disabled: true
        });
      } else {
        const msg = (response && response.message) || 'Something went wrong';
        this.props.openGlobalSnackbar(msg, true);
      }
    } catch (err) {
      this.setState({ load: false });
      this.props.openGlobalSnackbar('Network error', true);
    }
  }

  render() {
    const {
      currentPassword, newPassword, confNewPassword,
      showOldPass, showNewPass, showConfPass,
      currentPasswordErr, currentPasswordErrText,
      newPasswordErr, passwordErr,
      confNewPasswordErr, confError,
      load, disabled
    } = this.state;

    return (
      <div className="py-frame__page py-frame__settings has-sidebar">
        <MiniSidebar heading={'Profile'} listArray={profileSidebarLinksArray} />

        <div className="py-page__content">
          <div className="py-page__inner">
            <div className="py-header--page flex">
              <div className="py-header--title">
                <h2 className="py-heading--title">Change Your Password</h2>
              </div>
            </div>

            <Form className="py-form-field--condensed" onSubmit={this._handleForm}>
              {/* Current / Old Password */}
              <div className="row mx-n2 mb-2">
                <div className="col-12 col-md-4 text-md-right px-2">
                  <Label htmlFor="currentPassword" className="is-required no-abs mt-3">Old Password</Label>
                </div>
                <div className="col-12 col-md-8 px-2 position-relative">
                  <Input
                    type={showOldPass ? "text" : "password"}
                    value={currentPassword}
                    name="currentPassword"
                    id="currentPassword"
                    placeholder="Old Password"
                    onChange={this._handleText}
                  />
                  <span
                    onClick={() => this.togglePassword('showOldPass')}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "#666"
                    }}
                  >
                    {showOldPass ? <EyeOff /> : <Eye />}
                  </span>

                  <FormValidationError
                    message={currentPasswordErrText}
                    showError={currentPasswordErr}
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="row mx-n2 mb-2">
                <div className="col-12 col-md-4 text-md-right px-2">
                  <Label htmlFor="newPassword" className="is-required no-abs mt-3">New Password</Label>
                </div>
                <div className="col-12 col-md-8 px-2 position-relative">
                  <Input
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    name="newPassword"
                    id="newPassword"
                    placeholder="New Password"
                    onChange={this._handleText}
                  />
                  <span
                    onClick={() => this.togglePassword('showNewPass')}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "#666"
                    }}
                  >
                    {showNewPass ? <EyeOff /> : <Eye />}
                  </span>

                  <FormValidationError
                    showError={newPasswordErr}
                    message={passwordErr}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="row mx-n2 mb-2">
                <div className="col-12 col-md-4 text-md-right px-2">
                  <Label htmlFor="confNewPassword" className="is-required no-abs mt-3">Confirm New Password</Label>
                </div>
                <div className="col-12 col-md-8 px-2 position-relative">
                  <Input
                    type={showConfPass ? "text" : "password"}
                    value={confNewPassword}
                    name="confNewPassword"
                    id="confNewPassword"
                    placeholder="Confirm New Password"
                    onChange={this._handleText}
                  />
                  <span
                    onClick={() => this.togglePassword('showConfPass')}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "#666"
                    }}
                  >
                    {showConfPass ? <EyeOff /> : <Eye />}
                  </span>

                  <FormValidationError
                    showError={confNewPasswordErr}
                    message={confError}
                  />
                </div>
              </div>

              <div className="row mx-n2 mb-2">
                <div className="col-12 col-md-4 text-right px-2"></div>
                <div className="col-8 col-sm-4 px-2">
                  <Button color="primary" className="mn-w-100" disabled={disabled || load}>
                    {load ? <Spinner color="default" size="sm" /> : 'Save'}
                  </Button>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  changePassword: state.changePass
});

export default withRouter(connect(mapStateToProps, { changePass, openGlobalSnackbar })(ChangePassword));
