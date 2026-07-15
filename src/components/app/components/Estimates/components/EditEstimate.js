import React, { PureComponent } from 'react'
import EstimateForm from './EstimateForm';
import { fetchEstimateById } from '../../../../../api/EstimateServices';
import _ from 'lodash';
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import history from '../../../../../customHistory';
import { openGlobalSnackbar } from '../../../../../actions/snackBarAction';

class EditEstimate extends PureComponent {
    state = {
        selectedEstimate: undefined,
        isDuplicate: false
    }
    componentDidMount(){
        const { businessInfo } = this.props;
        if(_.includes(this.props.location.search, 'duplicate=true')){
            this.setState({isDuplicate: true})
        }
        document.title = businessInfo && businessInfo.organizationName ? `Finance - ${businessInfo.organizationName} - Estimate` : `Finance - Estimate`;
        this.fetchEstimateData(_.includes(this.props.location.search, 'duplicate=true'))
    }

    fetchEstimateData= async(isDuplicate)=>{
        const estimateID = this.props.match.params.id
        try{
            let response = await fetchEstimateById(estimateID)
            if(response.statusCode=== 200){
                let selectedEstimate = response.data.estimate;
                this.setState({
                    selectedEstimate
                })
            }else{
                history.push('/app/estimates');
                this.props.openGlobalSnackbar(response.message, true)
            }
        }catch(err){
            if(err.statusCode === 404){
                history.push('/app/error/404');
            }else{
                history.push('/app/estimates');
                this.props.openGlobalSnackbar(err.message, true)
            }
        }
    }

    render(){
    const {selectedEstimate, isDuplicate} = this.state
        return(
            <EstimateForm
            isEditMode={true}
            selectedEstimate={selectedEstimate}
            isDuplicate={isDuplicate}
            />
        )
    }
}

const mapPropsToState = state => ({
    userSettings: state.settings.userSettings,
    businessInfo: state.businessReducer.selectedBusiness
})

export default withRouter(connect(mapPropsToState, {openGlobalSnackbar})(EditEstimate));