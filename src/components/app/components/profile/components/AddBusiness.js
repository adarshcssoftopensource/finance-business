import React, { Component } from 'react'
import { Form, FormGroup, Label, Col, Input, FormText } from 'reactstrap';
import { BusinessForm } from './BusinessForm';
import MiniSidebar from '../../../../../global/MiniSidebar'
import AddBusinessForm from '../../BusinessInfo/AddBusiness'
import { _documentTitle } from '../../../../../utils/GlobalFunctions';
import { _getUser } from '../../../../../utils/authFunctions';
import { profileSidebarLinksArray } from '../../../../../utils/common';
export default class AddBusiness extends Component {
  componentDidMount(){
    _documentTitle({}, "Create a Businesses");
}
  render() {
    return (
        <div id="business-list-wrap" className="py-frame__page py-frame__settings has-sidebar">

            <MiniSidebar heading={'Profile'} listArray={profileSidebarLinksArray}/>

            <div className="py-page__content">
                <AddBusinessForm {...this.props} />
            </div>
        </div>
    )
  }
}
