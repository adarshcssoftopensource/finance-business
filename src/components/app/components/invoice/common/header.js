import React from 'react'
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
    ButtonDropdown,
  ButtonGroup,
  Spinner
} from 'reactstrap'

class CommonHeader extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      openUpperDropdown: false
    }
  }

  onSaveAndSend = () => {
    this.props.onSubmitInvoice('Send')
  }

  onSaveAndPayment = () => {
    this.props.onSubmitInvoice('Payment')
  }
  toggleUpperDropdown = () => {
    this.setState(prevState => ({
      openUpperDropdown: !prevState.openUpperDropdown
    }))
  }
  render() {
    let { invoiceNumber } = this.props.data
    return (
      <header className="py-header">
        {(this.props.location && this.props.location.pathname.includes('/app/recurring')) ? (
          <div className="py-heading--title">
            {this.props.isEditMode
              ? `Edit recurring invoice`
              : 'New recurring invoice'}{' '}
          </div>
        ) : (
            <div className="py-header--title">
              <h2 className="py-heading--title">
                {this.props.isEditMode
                  ? `Edit invoice #${invoiceNumber}`
                  : 'New invoice'}{' '}
              </h2>
            </div>
          )}

        {this.props.location.pathname.includes('/app/recurring') ? (
          <div className="py-header--actions">
            <Button
                onClick={this.props.onRecurringPreviewClick}
                color="primary"
                outline
                className="me-2"
            >{this.props.state.showPreview ? 'Edit' : 'Preview'}</Button>

            <Button
              onClick={() => this.props.onSubmitRecurringInvoice()}
              color="primary"
              disabled={this.props.state.loading}
            >
              {this.props.state.loading ? (
                <Spinner
                  color="primary"
                  size="md"
                  className="loader btnLoader"
                />
              ) : (
                  'Save and continue'
                )}
            </Button>
          </div>
        ) : (
            <div className="py-header--actions">
              <Button
                onClick={this.props.onPreviewClick}
                color="primary"
                outline
              >{this.props.state.showPreview ? 'Edit' : 'Preview'}</Button>
                <ButtonGroup>
                  <Button
                    color="primary"
                    onClick={() => this.props.onSubmitInvoice()}
                    disabled={this.props.state.loading}>{this.props.state.loading ? <Spinner color="default" size="sm" /> : 'Save and continue'}</Button>
                    <ButtonDropdown 
                    isOpen={this.state.openUpperDropdown}
                    toggle={this.toggleUpperDropdown}
                    >
                        <DropdownToggle color="primary" className="ps-2 pe-3 border-left" caret />
                        <DropdownMenu right>
                            <DropdownItem onClick={this.onSaveAndSend}>Save and send</DropdownItem>
                            <DropdownItem onClick={this.onSaveAndPayment}>Save and record payment</DropdownItem>
                        </DropdownMenu>
                    </ButtonDropdown>
                </ButtonGroup>
            </div>
          )}
      </header>
    )
  }
}

export default CommonHeader
