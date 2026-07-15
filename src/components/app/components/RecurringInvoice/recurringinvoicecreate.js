import history from "../../../../customHistory";
import React, { Component, Fragment } from 'react';
import { updateCompany } from "../../../../api/businessService";
import { setSelectedBussiness } from "../../../../actions/businessAction";
import { connect } from "react-redux";
import { Spinner, Button } from "reactstrap";
import {SELECTED_BUSINESS} from "../../../../constants/ActionTypes";

class RecurringInvoiceCreate extends Component {
	state = {
		loader: false
	}
	_updateFirstVisit = async (e) => {
		e.preventDefault();
		try {
			this.setState({ loader: true })
			let { selectedBusiness } = JSON.parse(JSON.parse(localStorage.getItem('reduxPersist:root')).businessReducer)
			const updateBusiness = await updateCompany(selectedBusiness._id, { businessInput: { meta: { recurring: { firstVisit: false } } } })
			if (updateBusiness.statusCode === 200) {
				const refresh = localStorage.getItem('refreshToken')
				const res = await this.props.setSelectedBussiness(selectedBusiness._id, refresh, false);
				if (!!res && !!res.type && res.type === SELECTED_BUSINESS) {
					this.setState({ loader: false })
					history.push('/app/recurring/add');
				}
			}
		} catch (err) {
			this.setState({ loader: false })
		}
	}
	render() {
		return (
			<div className="content-wrapper__main__fixed">
				<div className="content">
					<div className="recurring-wrapper">
						<header className="py-header py-header--page text-center">
							<div className="py-header--title">
								<h5 className="text-primary">Recurring Invoices</h5>
								<div className="py-heading--title mb-3">
									Bill your repeat customers and get paid<br />without lifting a finger
								</div>
								<div className="text-center">
									<Button color="primary"
										onClick={this._updateFirstVisit}
										disabled={this.state.loader}
									>{this.state.loader ? <Spinner size="sm" color="default" /> : 'Create a recurring invoice'}</Button>
								</div>
							</div>
						</header>

						<div className="row">
							<div className="col-md-4">
								<div className="recurring-list">
									<span className="rec-icon" ><img src={`${process.env.REACT_APP_CDN_URL}/static/web-assets/recurring-icon-1.png`} alt="logo" /></span>
									<h2>Automatic payments</h2>
									<p>Charge your customer’s saved credit card automatically to get paid instantly.</p>
								</div>
							</div>
							<div className="col-md-4">
								<div className="recurring-list">
									<span className="rec-icon" ><img src={`${process.env.REACT_APP_CDN_URL}/static/web-assets/recurring-icon-2.png`} alt="logo" /></span>
									<h2>Flexible scheduling</h2>
									<p>Fully customizable so your customers get your invoices exactly when you want.</p>
								</div>
							</div>
							<div className="col-md-4">
								<div className="recurring-list">
									<span className="rec-icon" ><img src={`${process.env.REACT_APP_CDN_URL}/static/web-assets/recurring-icon-3.png`} alt="logo" /></span>
									<h2>Professional invoices</h2>
									<p>Create beautiful, branded invoices that your customers will love and trust.</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}


export default connect(null, { setSelectedBussiness })(RecurringInvoiceCreate)