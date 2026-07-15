import React, { Component, Fragment } from 'react'
import { Input, Button, Spinner } from 'reactstrap'
import PlaidLinkTokenButton from '../../../global/PlaidWrapper/PlaidLinkTokenButton';
import { saveBank } from '../../../api/bankingServices';
import history from '../../../customHistory';

export default class Autocomplete extends Component {
    state={
        showMore: false
    }

    toggleShow = e => {
        e.preventDefault();
        this.setState({showMore: !this.state.showMore})
        // this.props.onFocus()
    }

    handleBankSucess = async(token, metadata) => {
        if (!!token) {
            try {
                const saveBankDetails = await saveBank(metadata.public_token)
                if(!!saveBankDetails){
                    if(saveBankDetails.statusCode === 200){
                        this.props.openGlobalSnackbar('Bank added successfully', false)
                        history.push('/app/banking/bankconnections')
                    }else{
                        this.props.openGlobalSnackbar(saveBankDetails.message, true)
                    }
                }
            } catch (err) {
                this.props.openGlobalSnackbar('Something went wrong, please try again later.', false)
            }
        }
    }

    render() {
        return (
            <div className={`Autocomplete ${this.props.className}`}>
                <div className="Autocomplet__field">
                    <Input
                        type="text"
                        className="form-control py-form-control text-center"
                        placeholder={this.props.placeholder}
                        aria-label={this.props.areaLabel}
                        aria-describedby={this.props.areaDescribed}
                        onChange={this.props.onChange}
                        value={this.props.value}
                        onFocus={this.props.onFocus}
                        // onBlur={this.props.onBlur}
                    />
                    {this.props.children}
                </div>
                {
                    this.props.showSuggestion && (

                        <div className="Autocomplete__content-cont">
                        <div className="Autocomplete__content">
                            <ul className="Autocomplete__options">
                                {   this.props.loading ? (
                                    <li className="Autocomplete__optionsItem" disabled>
                                        <div className="media align-items-center">
                                            <div className="d-flex align-items-center justify-content-center bg-white Margin__r-24" style={{ width: "48px", height: "48px"}}>
                                                {/* <img src="http://placehold.it/24x24" className="Icon__M" alt="American Express" /> */}
                                            </div>
                                            <div className="media-body">
                                                <div className="font-weight-bold text-center">Please wait <Spinner color="primary" size="md" className="loader" /></div>
                                                {/* <small>{list.link}</small> */}
                                            </div>
                                        </div>
                                    </li>
                                ) :
                                    !!this.props.list && this.props.list.length > 0 && this.props.list.map((list, i) => {
                                        if(this.state.showMore){
                                            return (
                                                <PlaidLinkTokenButton
                                                    api="banking"
                                                    institutionId={list.institutionId}
                                                    asWrapper
                                                    onSuccess={(token, metadata) => this.handleBankSucess(token, metadata)}
                                                    className="plaid"
                                                    style={{ width: '100%' }}
                                                >
                                                <li className="Autocomplete__optionsItem" key={i}>
                                                        <div className="media align-items-center">
                                                            <div className="rounded border d-flex align-items-center justify-content-center bg-white Margin__r-24" style={{ width: "48px", height: "48px"}}>
                                                                <img src={list.logo ? `data:image/jpeg;base64, ${list.logo}` : "http://placehold.it/24x24"} className="Icon__M" alt="American Express" />
                                                            </div>
                                                            <div className="media-body">
                                                                <div className="font-weight-bold">{list.name}</div>
                                                                <small>{list.link}</small>
                                                            </div>
                                                        </div>
                                                </li>
                                                </PlaidLinkTokenButton>
                                            )
                                        }else{
                                            if(i<6){
                                                return (
                                                    <PlaidLinkTokenButton
                                                            api="banking"
                                                            institutionId={list.institutionId}
                                                            asWrapper
                                                            onSuccess={(token, metadata) => this.handleBankSucess(token, metadata)}
                                                            className="plaid"
                                                            style={{ width: '100%' }}
                                                        >
                                                            <li className="Autocomplete__optionsItem" key={i}>
                                                            <div className="media align-items-center">
                                                                <div className="rounded border d-flex align-items-center justify-content-center bg-white Margin__r-24" style={{ width: "48px", height: "48px"}}>
                                                                    <img src={list.logo ? `data:image/jpeg;base64, ${list.logo}` : "http://placehold.it/24x24"} className="Icon__M" alt="American Express" />
                                                                </div>
                                                                <div className="media-body">
                                                                    <div className="font-weight-bold">{list.name}</div>
                                                                    <small>{list.link}</small>
                                                                </div>
                                                            </div>
                                                    </li>
                                                    </PlaidLinkTokenButton>
                                                )
                                            }
                                        }
                                    })
                                }
                            </ul>
                            {
                                !this.props.loading && this.props.list.length > 6 && (
                                    <div className="Autocomplete__footer">
                                        <Button color="secondary" size="lg" block onClick={this.toggleShow}>{this.state.showMore ? 'Show less' : 'Show more'}</Button>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                    )
                }
            </div>
        )
    }
}
