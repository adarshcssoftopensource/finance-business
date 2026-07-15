import React, { Component } from "react";
import { OverlayTrigger, Tooltip as Tip } from 'react-bootstrap';
import { Spinner,
	// CustomInput,
	Button } from 'reactstrap';

class StepOne extends Component {
	state = {
		selected: null,
		llcTab: false,
		isReadOnly:false
	}

	componentDidMount() {
		if (this.props.data && this.props.data.businessType) {
			this.onSelected(this.props.data.businessType, true);
		}
  this.checkIfReadonly()
	}

	componentDidUpdate(prevProps){
		if (prevProps.data.step != this.props.data.step)
			this.checkIfReadonly()
	}

 checkIfReadonly=()=>{
		if (this.props.data.step != 'NA' && parseInt(this.props.data.step) > 0) {
			this.setState({ isReadOnly: true })
		} else {
			this.setState({ isReadOnly: false })
		}
	}

	onSelected = (type, comp) => {
		if (!this.state.isReadOnly || comp) {
			if (type != 'single_member_llc' && type != 'multiple_member_llc')
				this.setState({ selected: type, llcTab: false });
			else
				this.setState({ selected: type, llcTab: true });
		}

	}

	onMouseEnter = () => {
		this.setState({
			llcTab: true
		})
	}

	onMouseExit = () => {
		if (this.state.selected != 'single_member_llc' && this.state.selected != 'multiple_member_llc') {
			this.setState({
				llcTab: false
			})
		}
	}

	onSubmit = () => {
		if (this.state.selected) {
			const data = {
				step: 1,
				businessType: this.state.selected
			}
			this.props.onSubmit(data);
		} else {
			this.props.onShowSnackbar('Business type is mandatory');
		}
	}

	getTooltip = (section) => {
		switch (section) {
			case 1:// Individaul
				return (
					<div className="tooltipBody">
						You are the sole owner of the business
						and claim all profit and losses on your
						personal income tax return. Even if you
						didn't register a business with the
						government, this is you.
					</div>
				)
			case 2://'Company':
				return (
					<div className="tooltipBody">
						Your company will likely have LLC or
						Limited Company at the end of its name.
						You are a Single Member LLC if you are the
						only member/owner, otherwise you are a
						Multiple Member LLC.
					</div>
				)
			case 3://'Non Profit':
				return (
					<div className="tooltipBody">
						You are a registered charity or a
						501(c) tax exempt organization.
					</div>
				)
			default:
				return (
					<div className="tooltipBody">
						Unknown
					</div>
				)
		}
	}

	TooltipContainer = (props) => {
		let placement = 'left';
		return (
			<OverlayTrigger
				placement={placement}
				overlay={
					<Tip>
						{
							this.getTooltip(props.tooltipIndex)
						}
					</Tip>
				}
			>
				{props.children}
			</OverlayTrigger>
		)
	}

	render() {
		const { loading  } = this.props;
		const { selected, isReadOnly } = this.state;
		const { TooltipContainer } = this;
		return (
			<div id="onboarding_stepone" key={isReadOnly}>
				<header className="py-header py-header--page mb-4">
					<div className="py-header--title">
						<div className="h3"> Choose Your Business Type</div>
					</div>
				</header>

				<div className="payment__onboard__business__type__list" style={{ textAlign: 'left' }}>
					<TooltipContainer tooltipIndex={1}>
						<div className={`${(selected == 'individual') ? "selectedOptions" : "selectOptions"} ${isReadOnly ? 'disabled':''}`} onClick={() => { this.onSelected('individual') }}>Individuals and Sole Proprietorships</div>
					</TooltipContainer>
					<TooltipContainer tooltipIndex={2}>
						<div className={`${(selected == 'company') ? 'selectedOptions' : 'selectOptions'} ${isReadOnly ? 'disabled' : ''}`} onClick={() => { this.onSelected('company') }}>Corporations, LLCs and Partnerships</div>
					</TooltipContainer>
					<TooltipContainer tooltipIndex={3}>
						<div className={`${(selected == 'non_profit') ? "selectedOptions" : "selectOptions"} ${isReadOnly ? 'disabled':''}`} onClick={() => { this.onSelected('non_profit') }}>Non-Profits</div>
					</TooltipContainer>
				</div>
				<div className="d-flex align-items-center mt-4 text-center">
					{!isReadOnly && <Button color="primary" onClick={this.onSubmit} disabled={this.state.loading}>Save and continue &nbsp;{this.state.loading && (<Spinner size="sm" color="default" />)}</Button>}
					{isReadOnly && <Button type="button" color="primary" outline className="ms-2" onClick={() => this.props.handleSteps(1)}>Next</Button>}
				</div>
			</div>
		)
	}
}

export default StepOne;