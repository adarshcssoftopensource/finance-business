import React, { Component } from 'react'
import { Collapse, Button, CardBody, Card } from 'reactstrap';


export default class CollapsibleTrigger extends Component {
  render() {
    return (
        <Button color="secondary" style={this.props.style} className={this.props.className} onClick={this.props.toggleCollapse}>
          {this.props.text}
        </Button>
    )
  }
}
