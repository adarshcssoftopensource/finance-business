import React from 'react'
import {
    Button,
    Col,
    Collapse,
    FormGroup,
    Input,
    
  } from 'reactstrap'

class ContentHeader extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      error: null,
    }
  }

  


  render() {
      let {userSettings , businessInfo , invoiceInput , collapse , onImageUpload} = this.props;
    return (
      <div className="invoice-view__collapsible">
        <div className={ collapse ? 'invoice-view__collapsible-button is-open' : 'invoice-view__collapsible-button' } >
          <Button
            color="grey"
            className="btn-link"
            onClick={this.props.toggleBusiness}
          >
            <div className="invoice-view__collapsible-button__content">
              <div>
                Business address and contact details, title, summary, and logo
              </div>
              <div className="invoice-view__collapsible-button__expand-icon">
                <svg
                  viewBox="0 0 20 20"
                  id="expand"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10 12.586l6.293-6.293a1 1 0 0 1 1.414 1.414l-7 7a1 1 0 0 1-1.414 0l-7-7a1 1 0 0 1 1.414-1.414L10 12.586z"></path>
                </svg>
              </div>
            </div>
          </Button>
        </div>
        <Collapse className="py-box" isOpen={collapse}>
          <div className="create-invoice-header">
            <div className="create-invoice-header-left" >
              {userSettings && !!userSettings.companyLogo ? (
                <div
                  className="edit-info info-logo"
                  style={{ color: '#9f55ff', cursor: 'pointer' }}
                >
                  <img src={userSettings.companyLogo} alt="" />
                  <br />
                  <span
                    className="py-text--link mt-2 d-inline-block"
                    onClick={this.props.removeLogoConfirmation}
                  >
                    {' '}
                    Remove logo{' '}
                  </span>
                </div>
              ) : (
                <div className="uploader-zone">
                  <span className="upload-icon" ><i className="fal fa-upload"></i></span>
                  <div className="py-text--browse"><span className="py-text--link" >Browse</span> or drop your logo here.</div>
                  <div className="py-text--hint">Maximum 10MB in size. <br />JPG, PNG, or GIF formats.</div>
                  <div className="py-text--hint mb-0">Recommended size: 200 x 200 pixels.</div>
                  {this.props.error && <div className="error-message" style={{ color: 'red' }}>{this.props.error}</div>}
                  <Input
                    type="file"
                    name="companyLogo"
                    onChange={onImageUpload}
                    accept=".jpg,.png,.jpeg"
                  />
                </div>
              )}
            </div>
            <div className="create-invoice-header-right" >
              <FormGroup>
                <Input
                  className="jumbo-text"
                  style={{
                    textAlign: 'right'
                  }}
                  type="text"
                  name="title"
                  value={invoiceInput.title}
                  onChange={this.props.handleOnInputChange}
                />
              </FormGroup>
              <FormGroup>
                <Input
                  style={{
                    marginTop: '0px',
                    marginBottom: '0px',
                    height: '35px',
                    textAlign: 'right'
                  }}
                  type="text"
                  name="subTitle"
                  maxLength={100}
                  value={invoiceInput.subTitle}
                  placeholder="Summary (e.g. project name, description of invoice)"
                  onChange={this.props.handleOnInputChange}
                />
              </FormGroup>
              <div className="business-inof text-right">
                <strong>
                  {' '}
                  {businessInfo && businessInfo.organizationName}
                </strong>
                {businessInfo ? (
                  businessInfo.address ? (
                    <div className="address">
                      <div className="address_field">
                        {' '}
                        <span>
                          {' '}
                          {businessInfo.address.addressLine1
                            ? businessInfo.address.addressLine1
                            : ''}{' '}
                        </span>{' '}
                      </div>
                      <div className="address_field">
                        {' '}
                        <span>
                          {' '}
                          {`${
                            businessInfo.address.city
                              ? `${businessInfo.address.city},`
                              : ''
                          }`}{' '}
                          {businessInfo.address.state &&
                          businessInfo.address.state.name
                            ? `${businessInfo.address.state.name}`
                            : ''}{' '}
                          {businessInfo.address.postal
                            ? businessInfo.address.postal
                            : ''}
                        </span>
                      </div>
                      <div className="address_field">
                        {' '}
                        <span>
                          {businessInfo.address.country &&
                          businessInfo.address.country.name
                            ? businessInfo.address.country.name
                            : ''}
                        </span>{' '}
                      </div>
                    </div>
                  ) : (
                    ''
                  )
                ) : (
                  ''
                )}
                {businessInfo && businessInfo.communication && (
                  <div className="address">
                    {businessInfo.communication.phone && (
                      <div className="address__field">
                        {' '}
                        Phone: {businessInfo.communication.phone}
                      </div>
                    )}
                    {businessInfo.communication.fax && (
                      <div className="address__field">
                        Fax: {businessInfo.communication.fax}
                      </div>
                    )}
                    {businessInfo.communication.mobile && (
                      <div className="address__field">
                        {' '}
                        Mobile: {businessInfo.communication.mobile}
                      </div>
                    )}
                    {businessInfo.communication.tollFree && (
                      <div className="address__field">
                        {' '}
                        Toll-Free: {businessInfo.communication.tollFree}
                      </div>
                    )}
                    {businessInfo.communication.website && (
                      <div className="address__field">
                        {businessInfo.communication.website}
                      </div>
                    )}
                  </div>
                )}
                <span className="py-text--link" onClick={this.props.onEditBusiness}>
                  Edit your business address and contact details{' '}
                </span>
              </div>
            </div>
          </div>
        </Collapse>
      </div>
    )
  }
}
export default ContentHeader
