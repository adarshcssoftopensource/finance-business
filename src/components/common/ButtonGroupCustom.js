import React, { Component } from 'react'
import { Button, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, ButtonGroup, Spinner } from 'reactstrap';

export default class ButtonGroupCustom extends Component {
  state = {
    dropdownOpen: false
  }
  render() {
    return (
      <ButtonGroup className={this.props.className}>
        <Button
          type="button"
          disabled={(this.props.data._id === this.props.selectedBsns) && this.props.disabled}
          className={`${this.props.actionClass}`}
          onClick={this.props.onClick}
          style={{
            width: '110px'
          }}
        >
          {((this.props.data._id === this.props.selectedBsns) && this.props.disabled) ? <Spinner size="sm" color='default' /> : this.props.text}
        </Button>
        <ButtonDropdown isOpen={this.state.dropdownOpen} toggle={() => this.setState({dropdownOpen: !this.state.dropdownOpen})}>
          <DropdownToggle className={`btn dropdown-toggle ${this.props.actionClass}`}>
            {/* <button id="btnGroupDrop1" type="button" className="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <svg className="Icon">
                <use xlinkHref="/assets/icons/product/symbols.svg#expand_more"></use>
              </svg></button> */}
              {/* Button Dropdown */}
          </DropdownToggle>
          {this.props.children}
        </ButtonDropdown>
      </ButtonGroup>
    )
  }
}
