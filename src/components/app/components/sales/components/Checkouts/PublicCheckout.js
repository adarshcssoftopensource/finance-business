
import React, { PureComponent } from 'react'
import CheckoutPreviewForm from './CheckoutPreviewForm';
import { Spinner, Container } from 'reactstrap';
import CenterSpinner from '../../../../../../global/CenterSpinner';
import * as CheckoutActions from '../../../../../../actions/CheckoutActions';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'
import { openGlobalSnackbar } from '../../../../../../actions/snackBarAction';
import SnakeBar from '../../../../../../global/SnakeBar';

class PublicCheckout extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            dropdownOpen: false,
            selectedCheckout: null,
            isLoadingData: true
        };
    }

    toggleDropdown =()=> {
        this.setState(prevState => ({
            dropdownOpen: !prevState.dropdownOpen
        }));
    }

    componentDidMount(){
        const { selectedCheckout } = this.state;
        const { selectedBusiness } = (selectedCheckout && selectedCheckout.business)? selectedCheckout.business : {};

        let { uuid } = this.props.match.params;
        this.fetchCheckoutData(uuid);
    }

    fetchCheckoutData = async (uuid)=>{
        if(uuid){
            this.setState({ isLoadingData: true });
            const response = await this.props.actions.fetchCheckoutByUUID(uuid)
            if(!!response && !!response.type){
                this.setState({ selectedCheckout: response.selectedCheckout, isLoadingData: false });
            }else{
                this.setState({ isLoadingData: false });
            }
        }
    }

    render() {
        const { selectedCheckout, isLoadingData } = this.state;
        return (
            <div className={(isLoadingData) ? "back-white" : "back-white accent-bar"}>
                <SnakeBar isAuth={false}/>
                {
                    isLoadingData ?
                    <div className="mrT50 text-center">
                        <h3>Loading public checkout...</h3>
                        <CenterSpinner />
                    </div> :
                    <div className="">
                        <CheckoutPreviewForm hidden={selectedCheckout == null} publicCheckout={selectedCheckout} isPublic={true} isEditMode={false} {...this.props} />
                    </div>
                }

            </div>
        )
    }
}


const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators(CheckoutActions, dispatch),
        openGlobalSnackbar: bindActionCreators(openGlobalSnackbar, dispatch)
    };
}

const mapStateToProps = state => {
    return {
        selectedBusiness: state.businessReducer.selectedBusiness,
        selectedCheckout: state.checkoutReducer.selectedCheckout,
    };
};

export default withRouter((connect(mapStateToProps, mapDispatchToProps)(PublicCheckout)))

// const mapStateToProps = state => {
//     return {
//         selectedBusiness: state.businessReducer.selectedBusiness
//     };
// };

// export default withRouter((connect(mapStateToProps, null)(PublicCheckout)))
