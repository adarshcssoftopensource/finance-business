import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

class ThingsToDo extends Component {
  render() {
    return (
      <div className="dh-widget things-to-do-widget">
        <h3 className="widget-title">Things You Can Do</h3>
        <div className="widget-box" >        
            <ul className="widget-list">
              <li><NavLink to="/app/sales/customer/add">Add a customer</NavLink></li>
              <li><NavLink to="/app/purchase/vendors/add">Add a vendor</NavLink></li>
              <li><NavLink to="/app/setting/invoice-customization">Customize your invoices</NavLink></li>
              <li><NavLink to="/app/setting/user-management">Invite a guest collaborator</NavLink></li>
            </ul>
        </div>
      </div>
    );
  }
}

export default ThingsToDo;
