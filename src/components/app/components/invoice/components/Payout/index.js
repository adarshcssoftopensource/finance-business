import React, { PureComponent, Fragment } from 'react'
import { Tabs, Tab } from 'react-bootstrap';
import { StripeProvider, Elements } from 'react-stripe-elements';
import { connect } from 'react-redux'
import { getInvoiceByUUID } from "../../../../../../api/InvoiceService";
import InjectedPayoutForm from './cardPayoutForm';
import BankPayoutForm from './bankPayoutForm'
import { getStripeKey } from '../../../../../../utils/common';
import { PreAuthorize } from './PreAuthorize';
import { Button } from 'reactstrap';
import { handleAclPermissions } from '../../../../../../utils/GlobalFunctions'
import WalletOption from './WalletOption';
import { Elements as WalletElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PK_KEY,
	{ apiVersion: process.env.REACT_APP_STRIPE_API_VERSION });
class PublicPayout extends PureComponent {

	state = {
		invoiceData: null,
		salesSetting: null,
		activeTab: null
	}

	componentDidMount() {
		const id = this.props.match.params.id;
		this.fetchInvoiceData(id);
	}

	fetchInvoiceData = async id => {
		try {
			const token = localStorage.getItem('token')
			let response = await getInvoiceByUUID(id, !!token);
			const invoiceData = response.data.invoice;
			const salesSetting = response.data.salesSetting;
			const recurring = response.data.recurring;
			let activeTab = 'card';
			if (!!recurring && !!recurring.card) {
				if ((invoiceData.onlinePayments.modeCard || invoiceData.onlinePayments.modeWallet) && (invoiceData.onlinePayments.modeBank || invoiceData.onlinePayments.modePayByBank)) {
					activeTab = response.data.paymentSetting.preferred_mode
				} else if (invoiceData.onlinePayments.modeCard) {
					activeTab = 'card';
				} else if (invoiceData.onlinePayments.modeBank || invoiceData.onlinePayments.modePayByBank) {
					activeTab = 'bank';
				} else if (invoiceData.onlinePayments.modeWallet) {
					activeTab = 'wallet';
				}
			} else {
				if ((invoiceData.onlinePayments.modeCard || invoiceData.onlinePayments.modeWallet) && (invoiceData.onlinePayments.modeBank || invoiceData.onlinePayments.modePayByBank)) {
					activeTab = response.data.paymentSetting.preferred_mode
				} else if (invoiceData.onlinePayments.modeCard) {
					activeTab = 'card';
				} else if (invoiceData.onlinePayments.modeBank || invoiceData.onlinePayments.modePayByBank) {
					activeTab = 'bank';
				} else if (invoiceData.onlinePayments.modeWallet) {
					activeTab = 'wallet';
				}
			}

			if (invoiceData.providerName === 'astra') {
				activeTab = 'bank';
			}

			this.setState({ invoiceData, activeTab, salesSetting });
		} catch (error) {
			// if (error.data) {
			//   this.props.showSnackbar(error.message, true);
			// }
		}
	};

	_setAmount = e => {
		const { name, value } = e.target;
		this.setState({
			invoiceData: {
				...this.state.invoiceData,
				dueAmount: parseFloat(value).toFixed(2)
			}
		})
	}

	render() {
		const { paymentSettings, recurring, changeManual } = this.props;
		const { invoiceData, activeTab, salesSetting } = this.state;
		if (invoiceData && invoiceData.dueAmount > 0) {
			return (
				<div className="justify-content-center no-gutters row">
					{!handleAclPermissions(['Viewer']) &&
						<div className="public-preview-page col-md-6 py-4">
							{
								invoiceData && invoiceData.onlinePayments.modeCard && invoiceData.onlinePayments.systemEnabled && invoiceData.onlinePayments.businessEnabled && invoiceData.stripeCountry && invoiceData.providerName !== 'astra' && stripePromise && (
									<WalletElements stripe={stripePromise}>
										<WalletOption
											invoiceData={invoiceData}
											salesSetting={salesSetting}
											refreshData={() => this.props.refreshData()}
											showSnackbar={(message, err) => this.props.showSnackbar(message, err)}
											openAlert={(item) => this.props.openAlert(item)}
										/>
									</WalletElements>
								)
							}
							{!!recurring && !recurring.card && !!recurring.paymentModeSetting && !!recurring.paymentModeSetting.preAuthorized ?
								<Tabs bsPrefix="nav"
									defaultActiveKey={activeTab} id="uncontrolled-tab-payment" className="payment-view__tabs">
									<Tab eventKey="card" title="Credit/Debit card pre-authorization" className="text-center payment-view__tabs__content">
										<PreAuthorize
											invoiceData={invoiceData}
											showSnackbar={(message, err) => this.props.showSnackbar(message, err)}
											refreshData={() => this.props.refreshData()}
											openAlert={(item) => this.props.openAlert(item)}
											_setAmount={this._setAmount.bind(this)}
											preAuthorize={true}
											recurring={recurring}
											changeManual={changeManual}
										/>
										<p className="automatic_payment_warning pb-0 mb-0">
											Prefer to setup auto-payment later? You can&nbsp;
											<Button color="link" onClick={(e) => changeManual(e)}>
												pay for this invoice only.
											</Button>
										</p>
									</Tab>
								</Tabs>
								:
								<Tabs bsPrefix="nav"
									defaultActiveKey={activeTab} id="uncontrolled-tab-payment" className="payment-view__tabs">
									{invoiceData && invoiceData.onlinePayments.modeCard && (
										<Tab eventKey="card" title="Credit Card Payment" className="text-center payment-view__tabs__content">
											<StripeProvider apiKey={getStripeKey()}>
												<Elements>
													<InjectedPayoutForm invoiceData={invoiceData}
														showSnackbar={(message, err) => this.props.showSnackbar(message, err)}
														refreshData={() => this.props.refreshData()}
														openAlert={(item) => this.props.openAlert(item)}
														_setAmount={this._setAmount.bind(this)}
														preAuthorize={false}
													/>
												</Elements>
											</StripeProvider>
										</Tab>
									)}
									{
										invoiceData && (invoiceData.onlinePayments.modeBank || invoiceData.onlinePayments.modePayByBank) && invoiceData.onlinePayments.systemEnabled && invoiceData.onlinePayments.businessEnabled && (
											<Tab eventKey="bank" title="Bank Payment" className="payment-view__tabs__content">
												<BankPayoutForm invoiceData={invoiceData}
													refreshData={() => this.props.refreshData()}
													showSnackbar={(message, err) => this.props.showSnackbar(message, err)}
													openAlert={(item) => this.props.openAlert(item)}
												/>
											</Tab>
										)
									}

								</Tabs>
							}
							{/* </Tabs> */}
						</div>}
				</div>
			)
		}
		else {
			return (<div> </div>)
		}
	}

}

const mapStateToProps = state => {
	return {
		payoutInfo: state
	};
};


export default connect(mapStateToProps, {})(PublicPayout);