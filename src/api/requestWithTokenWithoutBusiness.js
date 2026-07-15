import axios from 'axios'
import Config from '../constants/Config'
import { applyStaticMockAdapter } from '../utils/staticMockAdapter';

/**
 * Request Wrapper with default success/error actions
 */
const requestWithTokenWithoutBusiness = (options) => {
    const client = axios.create({
        baseURL: Config.api_url,
        headers: {
            'Content-Type': 'application/json',
            "Accept": "application/json",
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
    });

    applyStaticMockAdapter(client);

    const onSuccess = (response) => {
        return response.data;
    }

  const onError = error => {
    if (error.response && error.response.status === 405) {
      localStorage.removeItem('basicAuthToken')
    }
    // Static demo: no redirects on API errors
    return Promise.reject(error.response?.data || error.message)
  }

  client.interceptors.request.use(function(config) {
    if (process.env.REACT_APP_MY_ENVIRONMENT === 'development') {
      config.headers['basic-auth-token'] = localStorage.getItem(
        'basicAuthToken'
      )
    }
    return config
  })

    return client(options)
        .then(onSuccess)
        .catch(onError);
}

export default requestWithTokenWithoutBusiness
