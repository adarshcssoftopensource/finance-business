import React, { Component } from 'react'
import { Alert, Button, Table } from 'reactstrap';

export default class CsvPreview extends Component {

  renderData = (columns) => {
    try {
      return columns && columns.length > 0 && columns.map((item, i) => (
        <tr key={i}>
          <td>{!!item['Company Name'] ? item['Company Name'] : !!item['customerName'] ? item['customerName'] : !!item['vendorName'] ? item['vendorName'] : ''}</td>
          <td>{!!item['First Name'] ? item['First Name'] : !!item['firstName'] ? item['firstName'] : ''}</td>
          <td>{!!item['Last Name'] ? item['Last Name'] : !!item['lastName'] ? item['lastName'] : ''}</td>
          <td>{!!item['Email'] ? item['Email'] : !!item['email'] ? item['email'] : ''}</td>
          <td>{!!item['Phone'] ? item['Phone'] : !!item['phone'] ? item['phone'] : ''}</td>
          <td>{!!item['Address 1'] ? item['Address 1'] : !!item['addressLine1'] ? item['addressLine1'] : !!item['address'] ? item['address'].addressLine1 : ''}</td>
          <td>{!!item['Address 2'] ? item['Address 2'] : !!item['addressLine2'] ? item['addressLine2'] : !!item['address'] ? item['address'].addressLine2 : ""}</td>
          <td>{!!item['City'] ? item['City'] : !!item['city'] ? item['city'] : !!item['address'] ? item['address'].city : ''}</td>
          <td>{!!item['Postal Code'] ? item['Postal Code'] : !!item['postal'] ? item['postal'] : !!item['address'] ? item['address'].postal : ''}</td>
          <td>{!!item['Country'] ? item['Country'] : !!item['country'] ? item['country'].name : ''}</td>
          <td>{!!item['Currency'] ? item['Currency'] : !!item['currency'] ? item['currency'].code : ''}</td>
        </tr>
      ))
    } catch (error) {
      this.props.handlDataError();
    }
  }
  render() {
    const { headings, columns } = this.props;
    return (
      <div>
        <Alert color="secondry" className="csvPreviewAlert mrB20">
          <span style={{ fontSize: '25px' }}>
            <strong><i className="pe-7s-info" />&nbsp;</strong>
          </span>
          <span style={{ display: 'inline' }}>
            <strong>
              Showing {columns.length} of {columns.length} entries in the CSV.
                        </strong>
            &nbsp;Does your data look correct?
                    </span>
        </Alert>
        <div style={{ overflowX: 'auto' }}>
          <Table hover className="customerTable">
            <thead className="py-table__header">
              <tr className="py-table__row">
                {
                  headings && headings.length > 0 &&
                  headings.map((item, i) => {
                    return (
                      <th className="py-table__cell" nowrap key={i}>
                        <span className="text-800">{item}</span>
                      </th>
                    )
                  })
                }
              </tr>
            </thead>
            <tbody>
              {
                this.renderData(columns)
              }
            </tbody>
          </Table>
        </div>
        <div className="mrT30">
          <Button
            color="primary" 
            outline
            className="me-2"
            onClick={this.props.onCancel}
          >No, try again</Button>
          <Button
            color="primary" 
            onClick={this.props.onSubmit}
          >Yes, proceed with import</Button>

        </div>
      </div>
    )
  }
}
