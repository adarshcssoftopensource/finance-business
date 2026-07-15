import React, { Component } from 'react'
import { Button, Row, Col } from 'reactstrap'
import Icon from '../../../../common/Icon'
import  BankDetails from "./BankDetails"
import  BankingEditModal from "./BankingEditModal"

export default class BankImportTransaction extends Component {
  state={
    isOpen: false
  }

  toggle = e => {
    this.setState({isOpen: !this.state.isOpen})
  }
    render() {
        return (
            <div className="content-wrapper__main">
                <Row className="justify-content-center Margin__t-24">
                    <Col md={7} className="">
                      <div className="py-box py-box--card">
                        <div className="py-box__header">
                          <div className="h5 m-0">Import transactions</div>
                        </div>
                        <div className="py-box--content">
                        <div className="">
                          <div className="py-text--uppercase text-muted">
                            Connected to
                          </div>
                          <div  className="h5 Margin__b-16 text-italic">
                            JP Morgan Chase
                          </div>
                        </div>
                    <div className=" ">

                        <div className="account-card__single Margin__b-24">
                          <BankDetails
                              bankName="Chase college"
                              accountNo="1234"
                              balance={'USD $16,381.71'}
                          />
                          <div className="account-card__single-footer">
                            <div className="Callout">
                                Do you want to import transactions from this account.
                                <label className="py-switch ms-auto" for="AccountImportSwitch">
                                    <input id="AccountImportSwitch" type="checkbox" className="py-toggle__checkbox" onChange={this.toggle}/>
                                    <span className="py-toggle__handle"></span>
                                </label>
                            </div>
                          </div>
                        </div>
                        <div className="account-card__single Margin__b-24">
                          <BankDetails
                              bankName="Chase college"
                              accountNo="1234"
                              balance={'USD $16,381.71'}
                          />
                          <div className="account-card__single-footer">
                            <div className="Callout">
                                Do you want to import transactions from this account.
                                <label className="py-switch ms-auto" for="AccountImportSwitch">
                                    <input id="AccountImportSwitch" type="checkbox" className="py-toggle__checkbox" />
                                    <span className="py-toggle__handle"></span>
                                </label>
                            </div>
                          </div>
                        </div>
                        <div className="account-card__single Margin__b-24">
                          <BankDetails
                              bankName="Chase college"
                              accountNo="1234"
                              balance={'USD $16,381.71'}
                          />
                          <div className="account-card__single-footer">
                            <div className="Callout">
                                Do you want to import transactions from this account.
                                <label className="py-switch ms-auto" for="AccountImportSwitch">
                                    <input id="AccountImportSwitch" type="checkbox" className="py-toggle__checkbox" />
                                    <span className="py-toggle__handle"></span>
                                </label>
                            </div>
                          </div>
                        </div>
                        <Button color="primary" size="lg" block>Connect</Button>
                        <Button color="default" size="lg" block>Cancel</Button>
                        </div>
                        </div>
                      </div>
                    
                    </Col>
                  </Row>
                  <BankingEditModal
                    isOpen={this.state.isOpen}
                    toggle={this.toggle}
                    className="modal"
                  />
            </div>
        )
    }
}
