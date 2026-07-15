import axios from 'axios';
import Config from '../constants/Config';
import { applyStaticMockAdapter } from '../utils/staticMockAdapter';

const requestWithToken = (options) => {
    const header = {
        'Content-Type': 'application/json',
        "Accept": "application/json",
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'x-business-id': localStorage.getItem('businessId'),
    }
    const assumeUserHeader = {
        'Content-Type': 'application/json',
        "Accept": "application/json",
        'Authorization': `Bearer ${options.authToken}`,
    }

    const client = axios.create({
        baseURL: Config.api_url,
        headers: options.authToken ? assumeUserHeader : header,
    });

    applyStaticMockAdapter(client);

    const onSuccess = (response) => {
        return response.data;
    }

    const onError = async (error) => {
        if (error.response && error.response.status === 405) {
            localStorage.removeItem('basicAuthToken')
        }
        // Static demo: no redirects on API errors
        return Promise.reject(!!error.response?.data ? error.response.data : error.response || error.message);
    }

    client.interceptors.request.use(function (config) {
        if (process.env.REACT_APP_MY_ENVIRONMENT === 'development') {
            config.headers['basic-auth-token'] = localStorage.getItem(
                'basicAuthToken'
            );
        }
        return config;
    });

    return client(options)
        .then(onSuccess)
        .catch(onError);
}

export default requestWithToken;
