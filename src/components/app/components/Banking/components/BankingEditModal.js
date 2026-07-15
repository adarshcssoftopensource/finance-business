import React, { useState, useEffect, Fragment } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Spinner,Button } from 'reactstrap';
import CustomLabelDropDown from '../../../../common/CustomLabelDropDown';
import BankDetails from './BankDetails';
import { connect } from 'react-redux';
import { getAllTransactionsData, saveTransactionsImport, disableTransactionsImport, editTransactionsImport } from '../../../../../actions/bankingActions/transactionsActions';
import { GET_TRANSACTIONS_DATA_LOADING, GET_TRANSACTIONS_DATA_SUCCESS, SAVE_TRANSACTIONS_SUCCESS } from '../../../../../actions/bankingActions/transactionTypes';
import CenterSpinner from '../../../../../global/CenterSpinner';
import { dateRange } from '../constants';
import DatepickerWrapper from "../../../../../utils/formWrapper/DatepickerWrapper";
import { getAmountToDisplay } from '../../../../../utils/GlobalFunctions';
import { _subDate, _formatDate } from '../../../../../utils/globalMomentDateFunc';

const BankingEditModal = props => {
    const [ transBusiness, setTransBusiness ] = useState([])
    const [ selectedBusiness, setSelectedBusiness ] = useState(null)
    const [ businessTransAccounts, setBusinessTransAccounts ] = useState([
        {name: 'Create new account', value: 'new'}
    ]);
    const defaultValArr = [
        {name: 'Create new account', value: 'new'}
    ]
    const [ selectedTransAcc, setSeletedTransAcc ] = useState(null)
    const [ selectedDateRange, setSelectedDateRange ] = useState(_formatDate((_subDate(new Date(), 91, 'days'))))
    const [ selectedDatePick, setSelectedDatePick ] = useState(_formatDate(_subDate(new Date(), 91, 'days')))
    useEffect(() => {
        props.getAllTransactionsData();

    }, [])

    useEffect(() => {
        let { transaction: { type, data, allBusinesTransData }, banking } = props;
        if(type === GET_TRANSACTIONS_DATA_SUCCESS){
            if(!!allBusinesTransData && !!allBusinesTransData.responseBusinesses && allBusinesTransData.responseBusinesses.length > 0){

                const arr = allBusinesTransData.responseBusinesses.map((business) => {
                    let obj = {
                        name: business.name,
                        value: business._id,
                        transactionAccounts: []
                    }
                    business.transactionAccounts.length > 0 &&
                    business.transactionAccounts.map(transAcc => {
                        obj.transactionAccounts = obj.transactionAccounts.concat({value: transAcc._id, name: transAcc.name})
                    })
                    business = obj;
                    return business
                })
                arr.unshift({value: '', name: 'Select business'}, )
                setTransBusiness(arr)
                if(props.isEdit){
                    setSelectedBusiness(props.data.businessId);
                    const test = arr.filter((trans) => {return trans.value === props.data.businessId})
                    if(test.length > 0){
                        setBusinessTransAccounts(businessTransAccounts.concat(test[0].transactionAccounts))
                    }
                    _setBusinessTransAcc({target: {value: props.data.transactionAccountId}})
                }
            }
        }
    }, [props.transaction])

    const _setBusiness = ({target: {value}}) => {
        setSelectedBusiness(value);
        setSeletedTransAcc("")
        const test = transBusiness.filter((trans) => {return trans.value === value})
        setBusinessTransAccounts(defaultValArr.concat(test[0].transactionAccounts))
    }

    const _setBusinessTransAcc = ({target: {value}}) => {
        setSeletedTransAcc(value);
    }

    const _setDateRange = ({target: {value}}) => {
        setSelectedDateRange(value)
    }

    const _checkFormValidity = _ => {
        if(!!selectedDateRange && !props.isEdit){
            const elem = document.getElementById('date')
            if(!!elem){
                elem.classList.remove("color-red")
            }
        }else{
            const elem = document.getElementById('date')
            if(!!elem){
                elem.classList.add("color-red")
            }
        }
        if(!!selectedBusiness){
            const elem = document.getElementById('business')
            if(!!elem){
                elem.classList.remove("color-red")
            }
        }else{
            const elem = document.getElementById('business')
            if(!!elem){
                elem.classList.add("color-red")
            }
        }
        if(!!selectedTransAcc){
            const elem = document.getElementById('account')
            if(!!elem){
                elem.classList.remove("color-red")
            }
        }else{
            const elem = document.getElementById('account')
            if(!!elem){
                elem.classList.add("color-red")
            }
        }
        if(!!selectedTransAcc && !!selectedBusiness && (!!selectedDateRange || props.isEdit)){
            return true
        }else{
            return false
        }
    }

    const _saveAccount = (e) => {
        e.preventDefault();
        if(_checkFormValidity()){
            if(props.isEdit){
                props.editTransactionsImport(props.data._id, {businessId: selectedBusiness, transactionAccountId: selectedTransAcc})
            }else{
                props.saveTransactionsImport(props.data._id, {businessId: selectedBusiness, transactionAccountId: selectedTransAcc, dateFrom: selectedDateRange !== 'specific' ? selectedDateRange : selectedDatePick})
            }
        }
    }

    const _toggleImport = e => {
        const conf = window.confirm("You have choosen to turh off this account from importing into your accounting. Doing this could have very negative effects on your bookkeeping. Are you sure you want to stop importing this account?")
        if(conf){
            props.disableTransactionsImport(props.data._id, {businessId: selectedBusiness, transactionAccountId: props.data.transactionAccountId})
        }
    }

    const _dateChange = date => {
        setSelectedDatePick(date)
    }
    return (
        <Modal fade={false} isOpen={props.isOpen} toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Import settings</ModalHeader>
            <ModalBody className="p-0">
                <div className="Callout px-4">
                    Do you want to import transactions from this account.
                    <label className="py-switch ms-auto" htmlFor="AccountImportSwitch">
                        <input
                            type="checkbox"
                            className="py-toggle__checkbox"
                            defaultChecked={props.data.isImporting}
                            disabled={!props.isEdit}
                        />
                        <span className={!props.isEdit ? "py-toggle__handle disabled" : "py-toggle__handle"}
                            onClick={!props.isEdit ? () => false : _toggleImport}
                        ></span>
                    </label>
                </div>
                <div className="p-4">
                    <BankDetails
                        bankName={props.data.name}
                        accountNo={props.data.mask}
                        balance={`USD ${getAmountToDisplay(props.data.currency, props.data.balance)}`}
                        className="w-100 Margin__b-32"
                    />
                    {
                        props.transaction.type === GET_TRANSACTIONS_DATA_LOADING ?
                            (<CenterSpinner/>)
                        : (
                            <Fragment>
                                <CustomLabelDropDown
                                    className="Margin__b-24 banking-import-field"
                                    label="Import transactions into business"
                                    name="business"
                                    options={transBusiness}
                                    onChange={(e) => _setBusiness(e)}
                                    value={selectedBusiness}
                                    required={true}
                                    id="business"
                                    showSelectDefault={false}
                                />
                                <CustomLabelDropDown
                                    className="Margin__b-24 banking-import-field"
                                    label="Import transactions into account"
                                    name="account"
                                    options={businessTransAccounts}
                                    onChange={(e) => _setBusinessTransAcc(e)}
                                    value={selectedTransAcc}
                                    required={true}
                                    id="account"
                                    showSelectDefault={true}
                                />
                                {
                                    (!props.isEdit && !props.data.isImportedBefore) &&
                                        (
                                        <CustomLabelDropDown
                                            className="Margin__b-24 banking-import-field"
                                            label="Start importing transactions"
                                            name="dateRange"
                                            options={dateRange}
                                            onChange={e => _setDateRange(e)}
                                            value={selectedDateRange}
                                            valueDate={selectedDatePick}
                                            onChangeDate={date => _dateChange(date)}
                                            required={true}
                                            id="date"
                                            showSelectDefault={false}
                                        />
                                    )
                                }
                            </Fragment>
                        )
                    }
                </div>
            </ModalBody>
            <ModalFooter>
                <Button 
                    color="primary"
                    outline
                    onClick={props.toggle}>Cancel</Button>
                <Button 
                    color="primary"
                    disabled={!props.transaction.type || props.transaction.type.includes('LOADING')}
                    onClick={_saveAccount}
                >
                    {props.isEdit ? 'Update' : 'Save'} changes {(!props.transaction.type || props.transaction.type.includes('LOADING')) && <Spinner size={"sm"} color={'default'} className="loader"/>}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

const stateProps = state => {
    return {
        banking: state.banking,
        transaction: state.transaction
    }
}
export default connect(stateProps, { getAllTransactionsData, saveTransactionsImport, editTransactionsImport, disableTransactionsImport })(BankingEditModal)