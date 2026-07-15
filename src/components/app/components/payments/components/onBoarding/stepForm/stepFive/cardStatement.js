import React from 'react'
import { _subDate, _displayDate, _addDate } from '../../../../../../../../utils/globalMomentDateFunc';
import dotPng from '../../../../../../../../assets/images/dot.png'

const cardStatement = (props) => {
  const { displayName } = props;
  return (
    <div className="section-div">
      <div className="container">
        <div className="row">
          <div className="col-md-7 col-lg-6">
            <div className="rotate-line"></div>
            <div className="main-div">
              <ul>
                <li className="list-part">
                  <span className="date-box">{_displayDate(_subDate(new Date(), 4, 'days'), "MMM D")}</span>
                  <span className="date-content">SWEET TOOTH BAKERS</span>
                </li>
                <li className="list-part">
                  <span className="date-box">{_displayDate(_subDate(new Date(), 3, 'days'), "MMM D")}</span>
                  <span className="date-content">TATTOO ARTISTS</span>
                </li>
                <li className="list-part">
                  <span className="date-box">{_displayDate(_subDate(new Date(), 2, 'days'), "MMM D")}</span>
                  <span className="date-content">DR.MAXWELLINGTON</span>
                </li>
                <li className="list-part">
                  <span className="date-box">{_displayDate(_subDate(new Date(), 1, 'days'), "MMM D")}</span>
                  <span className="date-content">ELIZABETHS TAILOR</span>
                </li>
                <li className="list-part part-chng">
                  <span className="date-box">{_displayDate(new Date(), "MMM D")}</span>
                  <span className="date-content">{displayName}</span>
                </li>
                <li className="list-part">
                  <span className="date-box">{_displayDate(_addDate(new Date(), 1, 'days'), "MMM D")}</span>
                  <span className="date-content">CATERING 2 U SERVICE</span>
                </li>
                <li className="list-part">
                  <span className="date-box">{_displayDate(_addDate(new Date(), 2, 'days'), "MMM D")}</span>
                  <span className="date-content">FTW CONSULTING FIRM</span>
                </li>
                <li className="list-part">
                  <span className="date-box">{_displayDate(_addDate(new Date(), 3, 'days'), "MMM D")}</span>
                  <span className="date-content">THE MAIN EVENT PLANNER</span>
                </li>
                <li className="list-part">
                  <span className="date-box">{_displayDate(_addDate(new Date(), 4, 'days'), "MMM D")}</span>
                  <span className="date-content">MAN'S BEST FRIEND</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-md-5 col-lg-6">
            <div className="notes">
              <img className="db-line" src={dotPng} />
              <h5>CREDIT CARD STATEMENT</h5>
              <div className="row">
                <div className="col-md-6">
                  <div className="first-line"></div>
                  <div className="row">
                    <div className="col-md-8 padding-0">
                      <div className="list-1">
                        <ul>
                          <li></li>
                          <li></li>
                          <li></li>
                          <li></li>
                          <li></li>
                          <li></li>
                          <li className="even-sec"></li>
                          <li></li>
                          <li></li>
                          <li></li>
                          <li></li>
                          <li></li>
                          <li></li>
                          <li></li>
                          <li></li>
                        </ul>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="list-1">
                        <ul>
                          <li></li>
                          <li></li>
                          <li></li>
                          <li></li>
                          <li></li>
                          <li></li>
                          <li className="even-sec"></li>
                          <li></li>
                          <li></li>
                          <li></li>
                          <li></li>
                          <li></li>
                          <li></li>
                          <li></li>
                          <li></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="box-right"></div>
                </div>
                <div className="col-md-12">
                  <div className="btn-section">
                    <ul>
                      <li></li>
                      <li></li>
                      <li></li>
                      <li></li>
                    </ul>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="list-2">
                    <ul>
                      <li></li>
                      <li></li>
                      <li></li>
                      <li></li>
                      <li></li>
                      <li></li>
                    </ul>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="list-2">
                    <ul>
                      <li></li>
                      <li></li>
                      <li></li>
                      <li></li>
                      <li></li>
                      <li></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default cardStatement
