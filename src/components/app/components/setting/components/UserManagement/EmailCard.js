import React, { Component } from 'react'
import { Row, Col, Button } from 'reactstrap';
import { handleAclPermissions } from '../../../../../../utils/GlobalFunctions'

export default class EmailCard extends Component {
    render() {
        const { data, key } = this.props
        return (
            <div className="editable-user-list-item" key={key}>
                <div className="card-table-row">
                    <div className="py-box card-table-row--box mg-bt-0">
                        <div className="py-box__content">
                            <div className="card-table-row-title-section container">
                                <Row>
                                    <Col sm="5" className="pb-3 pb-sm-0" >
                                        <span className="py-text">{data.firstName} {data.lastName}</span>
                                        <span className="py-text">{data.email}</span>
                                        <div className="card-table-row-caption-section">
                                            <span className="py-text--hint py-text--strong">{data.acl.role} {data.position !== 'Owner' ? `(${data.position})` : ''}</span>
                                        </div>
                                    </Col>
                                    <Col xs="6" sm="2" >
                                        <div className={`badge badge-${data.status == 'accepted' ? 'success' : 'warning'}`} >{(!!data.acl.role && data.acl.role === 'Owner') ? '' : data.status}</div>
                                    </Col>
                                    <Col xs="6" sm="5" className="text-right">
                                        <div className="card-table-row-title-section--actions">
                                            <Button color="primary" outline className={`${handleAclPermissions(['Viewer', 'Editor']) ? 'd-none' : ''}`} onClick={e => this.props.onClickEdit(data)}>{(!!data.acl.role && data.acl.role === 'Owner') ? 'Manage your profile' : 'Edit'}</Button>
                                        </div>
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
