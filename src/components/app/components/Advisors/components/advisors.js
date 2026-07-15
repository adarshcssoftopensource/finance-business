import React, { Component } from 'react'
import Icon from '../../../../common/Icon'
import symbolsIcon from '../../../../../assets/icons/product/symbols.svg'
import advisorIllustrationPng from '../../../../../assets/images/advisor-ilustratino.png';

export default class advisors extends Component {
    render() {
        return (          
            <div className="advisors_wrapper">
                <div className="content-wrapper__main__fixed">
                    <main>
                        <div className="container-fluid">
                            <div className="header-title">
                                <h2 className="h2">Welcome to Finance Advisors</h2>
                                <div className="desc">Hire an expert that cares about your business as much as you do</div>
                            </div>
                            <div className="row align-items-center">
                                <div className="col-12 col-lg-6">                                        
                                    <div className="header-text">
                                        <ul className="icon-list">
                                            <li><span className="icon"><Icon className="Icon" xlinkHref={`${symbolsIcon}#advisor--check`} /></span>Accountant (Starting at $249 per month)</li>
                                            <li><span className="icon"><Icon className="Icon" xlinkHref={`${symbolsIcon}#advisor--check`} /></span>Bookkeeper (Starting at $149 per month)</li>
                                            <li><span className="icon"><Icon className="Icon" xlinkHref={`${symbolsIcon}#advisor--check`} /></span>Brand Strategist (Starting at $249 per month)</li>
                                            <li><span className="icon"><Icon className="Icon" xlinkHref={`${symbolsIcon}#advisor--check`} /></span>Business Coach (Starting at $999 per month)</li>
                                            <li><span className="icon"><Icon className="Icon" xlinkHref={`${symbolsIcon}#advisor--check`} /></span>Business Consultant (Starting at $499 per month)</li>
                                            <li><span className="icon"><Icon className="Icon" xlinkHref={`${symbolsIcon}#advisor--check`} /></span>Business Credit Consultant (Starting at $499 per month)</li>
                                            <li><span className="icon"><Icon className="Icon" xlinkHref={`${symbolsIcon}#advisor--check`} /></span>Content Writer (Starting at $249 per month)</li>
                                            <li><span className="icon"><Icon className="Icon" xlinkHref={`${symbolsIcon}#advisor--check`} /></span>Personal Credit Consultant (Starting at $349 per month)</li>
                                            <li><span className="icon"><Icon className="Icon" xlinkHref={`${symbolsIcon}#advisor--check`} /></span>Social Media Manager (Starting at $749 per month)</li>
                                            <li><span className="icon"><Icon className="Icon" xlinkHref={`${symbolsIcon}#advisor--check`} /></span>Tax Preparer (Starting at $249 per month)</li>
                                        </ul>
                                        {/* <a href="https://calendly.com/payyit" target="_blank" className="btn btn-primary" >Get started</a> */}
                                        <a target="_blank" className="btn btn-primary" >Get started</a>
                                    </div>
                                </div>
                                <div className="col-12 col-lg-6">
                                    <figure className="header-image">
                                        <img src={advisorIllustrationPng} alt="share connect" />
                                    </figure>
                                </div>
                            </div>
                            <div className="service-list">
                                <h3 className="h3">Getting started is easy!</h3>
                                <div className="row">
                                    <div className="col-lg-4">
                                        <div className="service-box">
                                            <div className="icon">
                                                <Icon className="Icon" xlinkHref={`${symbolsIcon}#adv-goal`} />
                                            </div>
                                            <h4 className="title">Book a free consultation</h4>
                                        </div>
                                    </div>
                                    <div className="col-lg-4">
                                        <div className="service-box">
                                            <div className="icon">
                                                <Icon className="Icon" xlinkHref={`${symbolsIcon}#adv-discover`} />
                                            </div>
                                            <h4 className="title">Explore your options</h4>
                                        </div>
                                    </div>
                                    <div className="col-lg-4">
                                        <div className="service-box">
                                            <div className="icon">
                                                <Icon className="Icon" xlinkHref={`${symbolsIcon}#adv-hands`} />
                                            </div>
                                            <h4 className="title">Get peace of mind</h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr className="mt-5" />
                        <div className="text-center py-3">Finance has partnered with the best professionals around the world to further the growth of you and your business hence why your experience is covered under our money-back guarantee policy. In the event that your experience with an Advisor is not acceptable, please contact us at <a href="mailto:advisors@finance.com" >advisors@finance.com</a> for further assistance.</div>
                    </main>
                </div>
            </div>
        )
    }
}
