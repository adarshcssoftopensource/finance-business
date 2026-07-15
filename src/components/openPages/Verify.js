import React, { Component } from 'react'
import { connect } from 'react-redux'
import { registerVerify } from '../../actions/authAction'
import queryString from 'query-string'
import CenterSpinner from '../../global/CenterSpinner'
import { REGISTER_VERIFY_SUCCESS, REGISTER_VERIFY_ERROR } from '../../constants/ActionTypes'
import { logout } from '../../utils/GlobalFunctions'
import { openGlobalSnackbar } from '../../actions/snackBarAction'
import SnakeBar from '../../global/SnakeBar'
import history from '../../customHistory'

class Verify extends Component {
    componentDidMount(){
        const { token, email } = queryString.parse(this.props.location.search)
        const decodeEmail = decodeURIComponent(email)
        this.props.registerVerify(decodeEmail, token)
    }
    componentWillReceiveProps(nextProps){
        if(this.props.verify !== nextProps.verify){
            if(nextProps.verify.type === REGISTER_VERIFY_SUCCESS){
                logout();
            }
        }
    }
    render() {
        return (
            <div>
                <SnakeBar isAuth={false}/>
                <center><h3>Verifying your account...</h3></center>
                <CenterSpinner/>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {verify: state.registerVerify}
}

export default connect(mapStateToProps, { registerVerify })(Verify)