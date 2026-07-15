import history from '../../../../../customHistory';
import React, { Component } from 'react'
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';

export default class ActionDropDown extends Component {
  state = {
    dropdownOpen: false
  };

  toggle = () => {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }));
  };

  render() {
    const { url, data, deleteVendor } = this.props;
    return (
      <div style={{ display: 'inline-block', marginLeft: '8px' }}>
        <Dropdown
            isOpen={this.state.dropdownOpen}
            toggle={this.toggle}
        >
          <DropdownToggle color="circle dropdown-toggle" ><i class="fas fa-caret-down" id="dropIcon" aria-hidden="true"></i></DropdownToggle>
          <DropdownMenu left>
            <DropdownItem key={0} onClick={() => history.push(`${url}/vendors/edit/${data.id}`)}>Edit</DropdownItem>
            <DropdownItem key={1} onClick={() => history.push(`${url}/bills/add/${data.id}`)}>Create bill</DropdownItem>
            <DropdownItem divider />
            {/* <DropdownItem key={3} divider /> */}
            <DropdownItem key={8} onClick={(e) => deleteVendor(e, data)}>Delete</DropdownItem>            
          </DropdownMenu>
        </Dropdown>
      </div>
    );
  }
}
