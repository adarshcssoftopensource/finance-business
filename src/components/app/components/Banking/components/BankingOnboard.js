import React, { Component } from "react";
import {
  Col
} from "reactstrap";
import SelectBox from "../../../../../utils/formWrapper/SelectBox";
import "./banking.css";
import Autocomplete from "../../../../common/Autocomplete/Autocomplete";
import Icon from "../../../../common/Icon";
import { getAllBank, searchBanks } from "../../../../../actions/bankingActions";
import { connect } from "react-redux";
import BankIconListShow from "./BankIconListShow";
import { SEARCH_BANKS_SUCCESS, GET_BANKS_LOADING, GET_BANKS_SUCCESS, SEARCH_BANKS_LOADING } from "../../../../../actions/bankingActions/bankingTypes";
import CenterSpinner from "../../../../../global/CenterSpinner";
import { openGlobalSnackbar } from "../../../../../actions/snackBarAction";
import SnakeBar from "../../../../../global/SnakeBar";

class BankConnections extends Component {

  state = {
    isOpen: false,
    updateOpen: false,
    isOpenCollapse: false,
    showSuggestion: false,
    bankList: []
  }

  componentDidMount(){
    this.props.getAllBank(1, 12, "")
  }

  componentWillReceiveProps(nextProps) {
    if(this.props !== nextProps){
      const { banking: {type, data, searchData} } = nextProps;
      if(type === SEARCH_BANKS_SUCCESS){
        if(!!searchData && !!searchData.institutes){
          if(searchData.institutes.length > 0){
            const arr = searchData.institutes.map(ins => {
              const obj = {
                id: ins._id,
                name: ins.name,
                link: ins.url,
                logo: ins.logo
              }
              ins = obj;
              return ins
            })
            this.setState({bankList: arr})
          }else{
            this.setState({bankList: []})
          }
        }else{
          this.setState({bankList: []})
        }
      }

      if(type === GET_BANKS_SUCCESS) {
        if(!!data && !!data.institutes){
          if(data.institutes.length > 0){
            const arr = data.institutes.map(ins => {
              const obj = {
                id: ins._id,
                name: ins.name,
                link: ins.url,
                logo: ins.logo
              }
              ins = obj;
              return ins
            })
            this.setState({bankList: arr})
          }else{
            this.setState({bankList: []})
          }
        }else{
          this.setState({bankList: []})
        }
      }
    }
  }

  toggle = e => {
    e.preventDefault();
    this.setState({
      isOpen: !this.state.isOpen
    })
  }

  toggleDrop = e => {
    e.preventDefault()
    this.setState({updateOpen: !this.state.updateOpen})
  }
  _suggestion(e){
    e.preventDefault();
    const {value, name} = e.target;
    if(!!value){
      this.setState({showSuggestion: true})
      this.props.searchBanks(1, null, value)
    }
    if(!value || value.length === 0){
      this.setState({showSuggestion: false})
    }
    this.setState({
      searchValue: value
    })
  }

  setSelected = value => {
    this.setState({searchValue: value, showSuggestion: false})
  }
  render() {

    const { banking } = this.props;
    let iconList = []
    if(banking.type === GET_BANKS_SUCCESS || (!!banking.type && banking.type.includes('SEARCH_BANKS'))){
      iconList = banking.data.institutes
    }
    return (
      <div className="content-wrapper__main">
        <SnakeBar/>
        <header classNameName="py-header--page flex">
          <div className="py-header--title mt-2">
            <h1 className="py-heading--title text-center">
              Connect your bank or credit card
            </h1>

            <h2 className="text-center mt-2 py-heading--subtitle">
              Save time by importing transactions automatically.
            </h2>
          </div>
        </header>
          <div
            className="bankPayment-container"
            style={{
              padding: 20
            }}
          >
            <Col xs={12} style={{maxWidth:"800px"}} className="m-auto">
              <div className=" py-box shadow" style={{padding: "24px"}}>
                  <div className="bankPayment-formExplainer py-text--strong">
                    <h6 className="text-center">
                      <span>
                        Search for your bank or select an option below
                      </span>
                    </h6>
                  </div>
                  {/* <Autocomplete
                    placeholder="Enter your bank name. For example, “US Bank” or “SunTrust”"
                    areaLabel={"Username"}
                    areaDescribed={"Search bank"}
                    list={this.state.bankList}
                    showSuggestion={this.state.showSuggestion}
                    onChange={this._suggestion.bind(this)}
                    setSelected={this.setSelected}
                    value={this.state.searchValue}
                    onFocus={() => this.setState({showSuggestion: true})}
                    onBlur={() => this.setState({showSuggestion: false})}
                    loading={banking.type === SEARCH_BANKS_LOADING}
                    openGlobalSnackbar={this.props.openGlobalSnackbar}
                  >
                    <Icon
                      className={"Icon Search__Typehead__Icon"}
                      xlinkHref={"/assets/icons/product/symbols.svg#search"}
                    />
                  </Autocomplete> */}
                  {
                    banking.type === GET_BANKS_LOADING ?
                    (
                      <CenterSpinner/>
                    ): (
                      <BankIconListShow
                        list={iconList}
                        openGlobalSnackbar={this.props.openGlobalSnackbar}
                      />
                    )
                  }
              </div>
              <div className="text-center Margin__t-32">
                <div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.541 1.88005C18.52 0.616047 15.274 -0.0199528 12 0.0100472C8.72501 -0.0199528 5.479 0.617047 2.458 1.88005C1.556 2.27005 0.970003 3.15605 0.966003 4.13905V11.439C1.044 16.792 4.434 21.534 9.474 23.339L10.546 23.739C11.485 24.084 12.516 24.084 13.455 23.739L14.525 23.339C19.565 21.535 22.957 16.792 23.034 11.439V4.13905C23.03 3.15605 22.443 2.26905 21.541 1.88005Z" fill="#D6AE74"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M14.3333 4.12508C14.488 4.12508 14.6364 4.18654 14.7458 4.29594C14.8552 4.40533 14.9167 4.55371 14.9167 4.70841V9.37508H9.08333V4.70841C9.08333 4.55371 9.14479 4.40533 9.25419 4.29594C9.36358 4.18654 9.51196 4.12508 9.66667 4.12508H14.3333ZM14.3333 3.54175H9.66667C9.35725 3.54175 9.0605 3.66466 8.84171 3.88346C8.62292 4.10225 8.5 4.399 8.5 4.70841V9.37512H6.16667C5.85725 9.37512 5.5605 9.49804 5.34171 9.71683C5.12292 9.93562 5 10.2324 5 10.5418V16.3751C5 16.6845 5.12292 16.9813 5.34171 17.2001C5.5605 17.4189 5.85725 17.5418 6.16667 17.5418H17.8333C18.1428 17.5418 18.4395 17.4189 18.6583 17.2001C18.8771 16.9813 19 16.6845 19 16.3751V10.5418C19 10.2324 18.8771 9.93562 18.6583 9.71683C18.4395 9.49804 18.1428 9.37512 17.8333 9.37512H15.5V4.70841C15.5 4.399 15.3771 4.10225 15.1583 3.88346C14.9395 3.66466 14.6428 3.54175 14.3333 3.54175ZM17.8333 9.95846C17.988 9.95846 18.1364 10.0199 18.2458 10.1293C18.3552 10.2387 18.4167 10.3871 18.4167 10.5418V16.3751C18.4167 16.5298 18.3552 16.6782 18.2458 16.7876C18.1364 16.897 17.988 16.9585 17.8333 16.9585H6.16667C6.01196 16.9585 5.86358 16.897 5.75419 16.7876C5.64479 16.6782 5.58333 16.5298 5.58333 16.3751V10.5418C5.58333 10.3871 5.64479 10.2387 5.75419 10.1293C5.86358 10.0199 6.01196 9.95846 6.16667 9.95846H17.8333ZM11.4844 12.2137C11.6211 12.0769 11.8066 12.0001 12 12.0001C12.1934 12.0001 12.3788 12.0769 12.5156 12.2137C12.6523 12.3504 12.7292 12.5359 12.7292 12.7293C12.7277 12.8556 12.693 12.9793 12.6285 13.0878C12.564 13.1964 12.4719 13.286 12.3617 13.3476V14.5551C12.3617 14.651 12.3236 14.743 12.2557 14.8109C12.1879 14.8787 12.0959 14.9168 12 14.9168C11.9041 14.9168 11.8121 14.8787 11.7443 14.8109C11.6764 14.743 11.6383 14.651 11.6383 14.5551V13.3476C11.5281 13.286 11.436 13.1964 11.3715 13.0878C11.307 12.9793 11.2722 12.8556 11.2708 12.7293C11.2708 12.5359 11.3477 12.3504 11.4844 12.2137Z" fill="white"/>
                  </svg>
                </div>
                At Finance, the privacy and security of your information are top priorities.&nbsp;<a href="" className="Link__External">Learn more</a>
                {/* <BankIconListShow
                  // list={iconList}
                  openGlobalSnackbar={this.props.openGlobalSnackbar}
                /> */}
              </div>
            </Col>
          </div>
      </div>
    );
  }
}

const state = ({banking}) => {
  return {
    banking
  }
}
export default connect(state, { getAllBank, openGlobalSnackbar, searchBanks })(BankConnections);
