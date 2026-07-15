import React, { Component, Fragment } from 'react'
import PlaidLinkTokenButton from '../../../../../global/PlaidWrapper/PlaidLinkTokenButton';
import { saveBank } from '../../../../../api/bankingServices';
import history from '../../../../../customHistory';
import { openGlobalSnackbar } from '../../../../../actions/snackBarAction';
import { _institutionLists } from '../../invoice/helpers';
import { Col, Button } from 'reactstrap';

export default class BankIconListShow extends Component {

    handleBankSucess = async(token, metadata) => {
        if (!!token) {
            try {
                const saveBankDetails = await saveBank(metadata.public_token)
                if(!!saveBankDetails){
                    if(saveBankDetails.statusCode === 200){
                        this.props.openGlobalSnackbar('Bank added successfully', false)
                        this.props.refreshBank(saveBankDetails.data.institute._id)
                        // history.push({pathname: '/app/banking/bankconnections', state: {id: saveBankDetails.data.institute._id}})
                    }else{
                        this.props.openGlobalSnackbar(saveBankDetails.message, true)
                    }
                }
            } catch (err) {
                this.props.openGlobalSnackbar(err.message, true)
            }
        }
    }
    render() {
        const { className, list } = this.props;
        return (
            <div className={`bankPayment-container`}>
                <PlaidLinkTokenButton
                    api="banking"
                    asWrapper
                    onExit={this.handleOnExit}
                    onSuccess={this.handleBankSucess}
                    className="plaid"
                >
                    <Fragment>
                        {/* <div className="py-bank-list row">
                            {_institutionLists.map((item, i) => {
                                return (
                                <Col
                                    sm={3}
                                    key={i}
                                    className="py-bank-list__item-wrapper"
                                >
                                    <div className="institution-list__display">
                                    <div className="intitution-list__item">
                                        <img src={item.img} alt={item.name} />
                                        <span>{item.name}</span>
                                    </div>
                                    </div>
                                </Col>
                                )
                            })}
                        </div> */}
                        <div className="text-center">
                            <Button color="primary" >Connect a bank</Button>
                        </div>
                    </Fragment>
                </PlaidLinkTokenButton>
            </div>
        )
    }
}
