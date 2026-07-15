import axios from 'axios'
import Config from '../constants/Config'
import { openGlobalSnackbar } from '../actions/snackBarAction';
import history from '../customHistory';
import { setupRefreshTimer, callRefresh, logout } from '../utils/GlobalFunctions';
/**
 * Create an Axios Client with defaults
 */
const client = axios.create({
    baseURL: Config.api_url,
    headers: {
        'Content-Type': 'application/json',
        // 'x-payyit-agent': 'Web'
    },
});

/**
 * Request Wrapper with default success/error actions
 */
const request = (options) => {
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

            if (error.response.status === 401) {
                logout()
            }
            if (error.response.status === 403) {
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
    .catch(onError)
}

client.interceptors.request.use(function(config) {
  if (process.env.REACT_APP_MY_ENVIRONMENT === 'development') {
    config.headers['basic-auth-token'] = localStorage.getItem('basicAuthToken')
  }

  return config
})

export default request
