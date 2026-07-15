import axios from 'axios'
import Config from '../constants/Config'
import { openGlobalSnackbar } from '../actions/snackBarAction';
import { applyStaticMockAdapter } from '../utils/staticMockAdapter';
/**
 * Create an Axios Client with defaults
 */
const client = axios.create({
    baseURL: Config.api_url,
    responseType: 'arraybuffer',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf'
    },
});

applyStaticMockAdapter(client, { isBlob: true });

/**
 * Request Wrapper with default success/error actions
 */
const requestWithBlob = (options) => {
    const onSuccess = (response) => {
        return response.data;
    }

    const onError = (error) => {
        openGlobalSnackbar(error.message, false)
        if (error.response && error.response.status === 405) {
            localStorage.removeItem('basicAuthToken')
        }
        // Static demo: no redirects on API errors
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

export default requestWithBlob
