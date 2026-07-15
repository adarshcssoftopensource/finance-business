
import React, { PureComponent } from 'react'
import CheckoutPreviewForm from './CheckoutPreviewForm';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import * as CheckoutActions from '../../../../../../actions/CheckoutActions';
import { bindActionCreators } from 'redux'

class PreviewCheckout extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            dropdownOpen: false
        };

    }
    componentDidMount(){
        // this.fetchCheckoutData()
    }

    fetchCheckoutData=()=>{
        const checkoutId = this.props.match.params.id;
        this.props.actions.fetchCheckoutById(checkoutId).then(result => {
            this.setState({ checkoutData: result.payload });
        });
    }
    toggleDropdown =()=> {
        this.setState(prevState => ({
            dropdownOpen: !prevState.dropdownOpen
        }));
    }

    render() {
        return (
            <div className="checkoutWrapper">
                <CheckoutPreviewForm isPublic={false} isEditMode={true} {...this.props} />
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators(CheckoutActions, dispatch)
    };
}

const mapStateToProps = state => {
    return {
        selectedBusiness: state.businessReducer.selectedBusiness,
        selectedCheckout: state.checkoutReducer.selectedCheckout,
    };
};

export default withRouter((connect(mapStateToProps, mapDispatchToProps)(PreviewCheckout)))
