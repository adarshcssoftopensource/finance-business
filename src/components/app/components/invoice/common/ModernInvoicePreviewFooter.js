import React,{Component} from 'react';

class ModernInvoicePreviewFooter extends Component{
    constructor(props){
        super(props);
    }

    render(){
        let {
            invoiceData,
            userSettings,
            businessInfo
        } = this.props;
        return(
            <div className="modern-template__sticky-bottom print_footer">
            <section className="modern-template__footer fs-exclude">
              <span className="py-text py-text--fine-print word-break">
                {invoiceData.footer}
              </span>
            </section>
            <div className="py-divider" />
            <div className="modern-template__business-info">
              {userSettings &&
              userSettings.displayLogo &&
              userSettings.companyLogo ? (
                <div className="classic-template__header__logo invoiceLogoModern">
                  <img src={userSettings.companyLogo} alt="" />{' '}
                </div>
              ) : (
                ''
              )}
              <div className="modern-template__business-info__address">
                <strong className="py-text--strong">
                  {businessInfo && businessInfo.organizationName}{' '}
                </strong>
                <div className="address">
                  <div className="address__field">
                    <span className="py-text py-text--body">
                      {' '}
                      {!!businessInfo && !!businessInfo.address &&
                      !!businessInfo.address.addressLine1
                        ? businessInfo.address.addressLine1
                        : ''}
                    </span>
                  </div>
                  <div className="address__field">
                    <span className="py-text py-text--body">
                      {' '}
                      {!!businessInfo && !!businessInfo.address &&
                      !!businessInfo.address.addressLine2
                        ? businessInfo.address.addressLine2
                        : ''}
                    </span>
                  </div>
                  <div className="address__field">
                    {`${
                      !!businessInfo && !!businessInfo.address && !!businessInfo.address.city
                        ? `${businessInfo.address.city},`
                        : ''
                    }`}{' '}
                    {!!businessInfo && !!businessInfo.address &&
                    businessInfo.address.state &&
                    !!businessInfo.address.state.name
                      ? businessInfo.address.state.name
                      : ''}{' '}
                    {!!businessInfo && !!businessInfo.address && !!businessInfo.address.postal
                      ? businessInfo.address.postal
                      : ''}
                  </div>
                  <div className="address__field">
                    <span className="py-text py-text--body">
                      {!!businessInfo && !!businessInfo.address &&
                        businessInfo.address.country &&
                        businessInfo.address.country.name}
                    </span>
                  </div>
                </div>
              </div>
              {businessInfo.communication && (
                <div className="modern-template__business-info__contact">
                  <div className="address">
                    <strong className="py-text--strong">
                      Contact Information
                    </strong>
                    {businessInfo.communication.phone ? (
                      <div className="address__field">
                        {' '}
                        Phone: {businessInfo.communication.phone}
                      </div>
                    ) : (
                      ''
                    )}
                    {businessInfo.communication.fax ? (
                      <div className="address__field">
                        Fax: {businessInfo.communication.fax}
                      </div>
                    ) : (
                      ''
                    )}
                    {businessInfo.communication.mobile ? (
                      <div className="address__field">
                        {' '}
                        Mobile: {businessInfo.communication.mobile}
                      </div>
                    ) : (
                      ''
                    )}
                    {businessInfo.communication.tollFree ? (
                      <div className="address__field">
                        {' '}
                        Toll-Free: {businessInfo.communication.tollFree}
                      </div>
                    ) : (
                      ''
                    )}
                    {businessInfo.communication.website ? (
                      <div className="address__field">
                        {businessInfo.communication.website}
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
    }
}

export default ModernInvoicePreviewFooter;