import React, { Component } from 'react'
import { Row, Col } from 'reactstrap'
import history from '../../../../../../customHistory'

export default class RoleCard extends Component {
  render() {
    const { data, key, setRole } = this.props
    return (
      <div
        className="editable-user-list-item"
        key={key}
        onClick={() => setRole(data._id)}
      >
        <div className="card-table-row">
          <div className="py-box card-table-row--box">
            <div className="py-box__content">
              <div className="card-table-row-title-section container">
                <Row>
                  <Col xs="2">
                    <div className="image">
                      <img
                        src={
                          !!data.image
                            ? data.image
                            : `${process.env.REACT_APP_CDN_URL}/static/web-assets/payroll-manager.svg`
                        }
                        alt="avatar"
                        className="img-responsive"
                      />
                    </div>
                    {/* <div className="badge badge-info">{data.status}</div> */}
                  </Col>
                  <Col xs="10">
                    <Row>
                      <Col xs="12">
                        <h2>{data.name}</h2>
                      </Col>
                      <Col xs="12">
                        <p className="py-text--hint">{data.suitableFor}</p>
                      </Col>
                      <Col xs="12">
                        <p>{data.description}</p>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
