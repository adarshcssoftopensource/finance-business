import React, { Component } from 'react'
import { Col, Spinner, Button } from 'reactstrap';

export default class ConfirmPrimary extends Component {
  render() {
    const { info, _cancelPrimary, _setPrimary, btnLoad } = this.props;
    return (
        <div className="row">
            <Col sm={12}>
                <p>Are you sure you want to set <b>{info.organizationName}</b> as your default business?</p>
            </Col>
            <Col sm={12}>
                <Button color="primary"
                    onClick={e => _setPrimary(e, info._id)}
                    disabled={btnLoad}
                > { btnLoad ? <Spinner size="sm" color = 'default' /> : "Yes, make it the default business"}</Button>
                <a className="ms-2 py-text--link" href="javascript: void(0)" onClick={e => _cancelPrimary(e)}>No, cancel</a>
            </Col>
        </div>
    )
  }
}
