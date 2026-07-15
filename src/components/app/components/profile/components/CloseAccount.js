import React, { Component } from 'react'
import { Col } from 'reactstrap';
import {NavLink} from 'react-router-dom';

export default class CloseAccount extends Component {
  render() {
    return (
      <div className="closeWrp row">
        <Col xs={12} sm={12} md={12} lg={12}>
            <h3 className="py-heading--section-title">Close Your Account</h3>
            <p  className="py-text">
                Click the button below to delete your entire Finance account.&nbsp;
                <b>Please note, you will no longer be able to access your businesses and stored information, indefinitely.</b>&nbsp;
                For example, you will lose access to your invoices, accounting, customers, etc.
            </p>
            <p>This action cannot be undone.</p>
            <NavLink to="/closeaccount">
              <button className="btn btn-outline-danger ">Close This Finance Account</button>
            </NavLink>
        </Col>
      </div>
    )
  }
}
