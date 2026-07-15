import axios from 'axios'
import Config from '../constants/Config'
import { openGlobalSnackbar } from '../actions/snackBarAction';
import history from '../customHistory';
import { logout, setupRefreshTimer, callRefresh } from '../utils/GlobalFunctions';
/**
 * Create an Axios Client with defaults
 */
const client = axios.create({
    baseURL: Config.api_url,
    responseType: 'arraybuffer',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'x-business-id': localStorage.getItem('businessId'),
    },
});

/**
 * Request Wrapper with default success/error actions
 */
const requestWithTokenBlob = (options) => {
    const onSuccess = (response) => {
        return response.data;
    }

    const onError = (error) => {
        openGlobalSnackbar(error.message, false)
        if (error.response) {
            // Request was made but server responded with something
            // other than 2xx
            if (error.response.status === 405) {
              localStorage.removeItem('basicAuthToken')
                return Promise.reject(error.response || error.message);
            }
            if (error.response.status === 401 || error.response.status === 403) {
                //If refresh token expires
                if(options.url.includes('refresh') || window.location.pathname.includes('signin')){
                    logout()
                }else{
                    //If other api's fails
                    callRefresh()
                    setupRefreshTimer();
                    requestWithTokenBlob(options);
                }
            }
            if(error.response.status === 403){
                history.push('/app/no-permission')
            }

        } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the
            // browser and an instance of
            // http.ClientRequest in node.js
            history.push('/app/error/500')
        } else {
            // Something else happened while setting up the request
            // triggered the error
            history.push('/app/error/500')
        }

        return Promise.reject(error.response || error.message);
    }

    return client(options)
        .then(onSuccess)
        .catch(onError);
}

client.interceptors.request.use(function(config) {
  if (process.env.REACT_APP_MY_ENVIRONMENT === 'development') {
    config.headers['basic-auth-token'] = localStorage.getItem('basicAuthToken')
  }
  return config
})

export default requestWithTokenBlob
