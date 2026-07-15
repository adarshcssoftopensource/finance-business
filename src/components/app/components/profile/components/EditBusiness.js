import React, { Component } from 'react'
import { Form, FormGroup, Label, Col, Input, FormText } from 'reactstrap';
import { BusinessForm } from './BusinessForm';
import MiniSidebar from '../../../../../global/MiniSidebar'
import EditBusinessInfo from '../../BusinessInfo/EditBussiness'
import { profileSidebarLinksArray } from '../../../../../utils/common';
export default class EditBusiness extends Component {
  render() {
    return (
        <div id="business-wrap" className="py-frame__page py-frame__settings has-sidebar">
                <MiniSidebar heading={'Profile'} listArray={profileSidebarLinksArray}/>
                <div className="py-page__content">
                    <EditBusinessInfo {...this.props} />
                </div>
        </div>
    )
  }
}
