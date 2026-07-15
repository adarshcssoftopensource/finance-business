import React, { Component } from 'react'
import Icon from '../../../../common/Icon'
import symbolsIcon from '../../../../../assets/icons/product/symbols.svg'
import { UncontrolledTooltip } from 'reactstrap'
import { connect } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { get } from 'lodash'
import Partner1 from '../../../../../assets/images/travel-partners/partner-1.jpg'
import Partner2 from '../../../../../assets/images/travel-partners/partner-2.jpg'
import Partner3 from '../../../../../assets/images/travel-partners/partner-3.jpg'
import Partner4 from '../../../../../assets/images/travel-partners/partner-4.jpg'
import Partner5 from '../../../../../assets/images/travel-partners/partner-5.jpg'
import Partner6 from '../../../../../assets/images/travel-partners/partner-6.jpg'
import Partner7 from '../../../../../assets/images/travel-partners/partner-7.jpg'
import Partner8 from '../../../../../assets/images/travel-partners/partner-8.jpg'
import Partner9 from '../../../../../assets/images/travel-partners/partner-9.jpg'
// Import Swiper styles
import 'swiper/css'
import 'swiper/css/free-mode'
// import required modules
import { Autoplay, FreeMode } from 'swiper'

import { openGlobalSnackbar } from '../../../../../actions/snackBarAction'
import rewardService from '../../../../../api/rewardService'
import DisplayBanner from '../../../../common/DisplayBanner'
import history from '../../../../../customHistory'

class Reward extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      balance: {},
      isRewardView: false
    }
  }

  async componentDidMount() {
    const { isRewardViewEnabled } = this.props
    if (!isRewardViewEnabled) {
      history.push('/app/dashboard')
    }
    await this.fetchBusinessRewardBalance();
  }

  fetchBusinessRewardBalance = async () => {
    this.setState({ isLoading: true });
    await rewardService.getRewardBalance()
        .then(response => {
          this.setState({ isLoading: false });
          if (response?.result?.statusCode === 200) {
            this.setState({ balance: response?.result?.data?.balance || {} });
          } else {
            this.props.showSnackbar(response?.result?.message, true)
          }
        })
        .catch(error => {
          this.setState({ isLoading: false });
          this.props.showSnackbar(error.message, true)
        })
  }

  render() {
    const { balance } = this.state;
    const isPremiumUser = this.props.businessInfo?.subscription?.planLevel > 1;
    return (
      <div className="reward_wrapper">
        <main>
          {
            this.props.businessInfo?.country?.id != "231" ?
              <DisplayBanner
                key="reward_banner"
                isSticky
                data={{ uuid: "reward_banner", accentColor: "#136ACD", description: "This feature will go live on March 13th for Premium users. Earn points for travel, Cashback and crypto when you collect payments with Finance."}}
              />
            : null
          }
          {
            !isPremiumUser ?
              <DisplayBanner
                key="reward_banner"
                isSticky
                data={{ uuid: "reward_banner", accentColor: "#136ACD", description: "This feature is available for Premium users. Earn points for travel, cash-back, and crypto when you collect payments with Finance."}}
              />
            : null
          }
          <div className='py-frame__page'>
            <div className='content-wrapper__main reward-wrapper'>
              <header className="py-header--page d-flex flex-wrap">
                <div className="py-header--title">
                  <h2 className="py-heading--title">Finance Membership Rewards</h2>
                </div>
              </header>
              <div className='py-content--page'>
                <div className='reward-points-box row'>
                  <div className='col-md-3'>
                    <div className='reward-column'>
                      <h3 className='reward-title'>Your Points</h3>
                      <div className='reward-single-box'>
                        <h4 className='box-title'>Available</h4>
                        <h3 className='box-number'>{balance?.availablePoints || 0} <sup>PTS</sup></h3>
                      </div>
                      <div className='reward-single-box'>
                        <UncontrolledTooltip placement="bottom" target="pending_title">Points accumulate between the 1st and the end of the month, minus refunds, disputes, and adjustments.</UncontrolledTooltip>
                        <h4 className='box-title'>Pending <span className='fal fa-info-circle' id='pending_title'></span></h4>
                        <h3 className='box-number'>{balance?.pendingPoints || 0} <sup>PTS</sup></h3>
                      </div>
                    </div>
                  </div>
                  <div className='col-md-6'>
                    <div className='reward-column'>
                      <h3 className='reward-title'>Ways to Use Your Points</h3>
                      <ul className='point-icon-list d-none'>
                        <li>
                          <span className='icon'>
                            <Icon className="Icon" xlinkHref={`${symbolsIcon}#reward_invoice`} />
                          </span>
                          <h4 className='title'>Invoices by Finance</h4>
                          <div className='desc'><a href="#" className='link'>Pay an invoice with Points</a></div>
                          {/*  window expands, enters invoice number  */}
                        </li>
                        <li>
                          <span className='icon'>
                            <Icon className="Icon" xlinkHref={`${symbolsIcon}#reward_checkout`} />
                          </span>
                          <h4 className='title'>Checkouts by Finance</h4>
                          <div className='desc'><a href="#" className='link'>Pay a checkout link with Points</a></div>
                          {/*  window expands, enters checkout link URL  */}
                        </li>
                        <li>
                          <span className='icon'>
                            <Icon className="Icon" xlinkHref={`${symbolsIcon}#nav--peyme`} />
                          </span>
                          <h4 className='title'>Finance.Me Lynks by Finance</h4>
                          <div className='desc'><a href="#" className='link'>Pay a Finance.Me Lynk with Points</a></div>
                          {/*  window expands, enters checkout link URL  */}
                        </li>
                      </ul>
                      <ul className='point-icon-list'>
                        <li>
                          <span className='icon'>
                            <Icon className="Icon" xlinkHref={`${symbolsIcon}#reward_cashback`} />
                          </span>
                          <h4 className='title'>Cashback (Coming Soon)</h4>
                          <div className='desc'><a href="#" className='link'>Redeem for Cashback</a></div>
                          {/*  window expands, conversion rate initiated, no processing fees applied, user account credited with conversion Points to Cash */}
                        </li>
                      </ul>
                      <ul className='point-icon-list'>
                        <li>
                          <span className='icon'>
                            <Icon className="Icon" xlinkHref={`${symbolsIcon}#reward_giftcard`} />
                          </span>
                          <h4 className='title'>Gift Cards (Coming Soon)</h4>
                          <div className='desc'><a href="#" className='link'>Redeem for gift cards</a></div>
                        </li>
                      </ul>
                      <ul className='point-icon-list'>
                        <li>
                          <span className='icon'>
                            <Icon className="Icon" xlinkHref={`${symbolsIcon}#reward_travel_transfer`} />
                          </span>
                          <h4 className='title'>Transfer to Travel Partners (Coming Soon)</h4>
                          <div className='desc'><a href="#" className='link'>Transfer your points</a></div>
                        </li>
                        <li className='ps-0'>
                          <div className='travel-partner-slider'>
                            <Swiper
                            spaceBetween={30}
                            slidesPerView={4}
                            autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                            }}
                            modules={[Autoplay,FreeMode]}
                            >
                            <SwiperSlide><img src={Partner2} alt="InterContinential Hotel Group" /></SwiperSlide>
                            <SwiperSlide><img src={Partner4} alt="Hilton" /></SwiperSlide>
                            <SwiperSlide><img src={Partner5} alt="American Airlines" /></SwiperSlide>
                            <SwiperSlide><img src={Partner6} alt="JetBlue" /></SwiperSlide>
                            <SwiperSlide><img src={Partner8} alt="Emirate Airlines" /></SwiperSlide>
                            </Swiper>
                          </div>
                        </li>
                        <li className='ps-0'>
                          <div className='row px-5'>
                            <div className='col-sm-4'>
                              <div className='single-image'>
                                <img src={Partner1} alt="Marriott" />
                              </div>
                            </div>
                            <div className='col-sm-4'>
                              <div className='travel-partner-slider'>
                                <Swiper
                                  spaceBetween={0}
                                  slidesPerView={1}
                                  >
                                  <SwiperSlide><img src={Partner7} alt="Uber" /></SwiperSlide>
                                  <SwiperSlide><img src={Partner9} alt="Lypt" /></SwiperSlide>
                                </Swiper>
                              </div>
                            </div>
                            <div className='col-sm-4'>
                              <div className='single-image'>
                                <img src={Partner3} alt="Delta" />
                              </div>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className='col-md-3'>
                    <div className='reward-column'>
                      <h3 className='reward-title'>Your Activity</h3>
                      <div className='reward-activity-box'>
                        <div className='active-circle'>
                          <h4 className='amount'><sup>$</sup>{balance?.redeemedPoints || 0}</h4>
                          <span className='label'>Redeemed <br/> in 2023</span>
                        </div>
                      </div>
                      <div className='activity-detials'>
                        {/* <UncontrolledTooltip placement="bottom" target="keep_earning_title">When you collect payments from your customers as a Premium user with Payments by Peymynt, you earn one (1) point for every dollar your customer spends on your products and services.</UncontrolledTooltip> */}
                        <h4 className='title'>How to earn</h4>
                        <div className='mb-2'><b>For Premium users</b></div>
                        <ol className='list'>
                          <li>1x - Earn 1 point per dollar for processing fees when the pass-fee feature is disabled</li>
                          <li>2x - Earn 2 points per dollar for processing fees when the pass-fee feature is enabled</li>
                        </ol>
                        <div className='mb-2 mt-4'><b>For Premium Pro users</b></div>
                        <ol className='list'>
                          <li>2x - Earn 2 points per dollar for processing fees when the pass-fee feature is disabled</li>
                          <li>4x - Earn 4 points per dollar for processing fees when the pass-fee feature is enabled</li>
                        </ol>
                        <div className='mb-2 mt-4'><b>For Premium Elite users</b></div>
                        <ol className='list'>
                          <li>4x - Earn 4 points per dollar for processing fees when the pass-fee feature is disabled</li>
                          <li>8x - Earn 8 points per dollar for processing fees when the pass-fee feature is enabled</li>
                        </ol>
                      </div>
                      <div className='mt-auto text-center mb-4'>
                        <NavLink exact={true} to='/app/reward/history'><b>Review points activity</b></NavLink>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }
}

const mapStateToProps = state => {
  const { settings: { featureFlags } = {} } = state;
  const isRewardViewEnabled = get(featureFlags, 'reward.view', 'true') === 'true';
  return {
    businessInfo: state.businessReducer.selectedBusiness,
    isRewardViewEnabled,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    showSnackbar: (message, error) => {
      dispatch(openGlobalSnackbar(message, error))
    },
  }
}
// export default withRouter(connect(null, { openGlobalSnackbar })(Reward))
export default connect(mapStateToProps, mapDispatchToProps)(Reward);
