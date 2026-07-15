import React,{Component} from 'react';

class InVoicePreviewHeader extends Component{
    constructor(props){
        super(props);
    }

render(){
    let {invoiceData , businessInfo} = this.props;
    return(
        <div className="contemporary-template__header__info">
              <div className="con-temp-header_title">
               {invoiceData.title
                  ? invoiceData.title.toUpperCase()
                  : invoiceData.name
                  ? invoiceData.name.toUpperCase()
                  : ''}
              </div>
              <div className="details__text">
                {invoiceData.subTitle || invoiceData.subheading}
              </div>
              <div className="con-temp-header_subtitle">
                <strong>{businessInfo && businessInfo.organizationName}</strong>
              </div>
              {businessInfo && businessInfo.address && (
                <div className="con-temp-address">
                  <div className="address__field">
                    {businessInfo.address.addressLine1}
                  </div>
                  <div className="address__field">
                    {businessInfo.address.addressLine2}
                  </div>
                  <div className="address__field">
                    {!!businessInfo.address.city
                      ? `${businessInfo.address.city},`
                      : ''}{' '}
                    {businessInfo.address.state &&
                      businessInfo.address.state.name}{' '}
                    {businessInfo.address.postal}
                  </div>
                  <div className="address__field">
                    {businessInfo.address.country &&
                      businessInfo.address.country.name}
                  </div>
                  <div className="address__field" />
                </div>
              )}
              <br />
              {businessInfo && businessInfo.communication && (
                <div className="con-temp-address">
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
            </div>
    )
}

}


export default InVoicePreviewHeader;