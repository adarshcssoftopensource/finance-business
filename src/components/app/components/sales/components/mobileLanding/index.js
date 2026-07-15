import React from 'react'

function Index() {
  return (
    <div className="mobile-landing-page">
      <div className="wrapper">
        <img
          src={`${process.env.REACT_APP_CDN_URL}/static/web-assets/webapp-screen/mobile-page-bg.png`}
          alt="Background"
          className="page-bg"
        />
        <div className="row align-items-center">
          <div className="col-md-6">
            <figure className="mobile-screen">
              <img
                src={`https://storage.googleapis.com/finance_storage_bucket/static/web-assets/webapp-screen/invoice-screen.png`}
                alt="Mobile Screen"
              />
            </figure>
          </div>
          <div className="col-md-6 text-center text-md-left mb-5">
            <h2 className="heading-1">
              Manage your <br /> business,{' '}
              <span className="text-primary">
                anytime <br /> anywhere.
              </span>
            </h2>
            <div className="d-flex justify-content-center justify-content-md-start">
              <a
                href="https://apps.apple.com/us/app/peymynt-invoices/id1537225675"
                target="_blank"
                className="d-inline-block me-3"
              >
                <img
                  src={`${process.env.REACT_APP_CDN_URL}/static/web-assets/webapp-screen/app-store-v2.png`}
                  width="160px"
                  alt="App Store"
                />
              </a>
              {/* <a href="https://play.google.com/store/apps/details?id=com.peymyntfinancial" target="_blank" className="d-inline-block" >
                                <img src={`${process.env.REACT_APP_CDN_URL}/static/web-assets/webapp-screen/play-store-v3.png`} width="160px" alt="Play Store" />
                            </a> */}
              {/* Coming Soon Button className if needed in future: button-comings-soon */}
              <a
                href="https://play.google.com/store/apps/details?id=com.peymynt.invoice"
                target="_blank"
                className="d-inline-block me-3"
              >
                <img
                  src={`${process.env.REACT_APP_CDN_URL}/static/web-assets/webapp-screen/play-store-v3.png`}
                  width="160px"
                  alt="Play Store"
                />
              </a>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-3">
            <div className="feature-box">
              <div className="icon">
                <img
                  src={`${process.env.REACT_APP_CDN_URL}/static/web-assets/webapp-screen/file-icon.png`}
                  alt="File Icon"
                />
              </div>
              <h4 className="box-title">Create customizable invoices</h4>
            </div>
          </div>
          <div className="col-md-3">
            <div className="feature-box">
              <div className="icon">
                <img
                  src={`${process.env.REACT_APP_CDN_URL}/static/web-assets/webapp-screen/envolope-icon.png`}
                  alt="envolope Icon"
                />
              </div>
              <h4 className="box-title">Send invoices to customers</h4>
            </div>
          </div>
          <div className="col-md-3">
            <div className="feature-box">
              <div className="icon">
                <img
                  src={`${process.env.REACT_APP_CDN_URL}/static/web-assets/webapp-screen/card-icon.png`}
                  alt="card Icon"
                />
              </div>
              <h4 className="box-title">Get paid from customers</h4>
            </div>
          </div>
          <div className="col-md-3">
            <div className="feature-box">
              <div className="icon">
                <img
                  src={`${process.env.REACT_APP_CDN_URL}/static/web-assets/webapp-screen/scan-icon.png`}
                  alt="QR Code Icon"
                />
              </div>
              <h4 className="box-title">Scan and track expenses</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Index
