import axios from 'axios'
import Config from '../constants/Config'
import { applyStaticMockAdapter } from '../utils/staticMockAdapter';

/**
 * Request Wrapper with default success/error actions
 */
const apiGatewayClient = (options) => {
    const client = axios.create({
        baseURL: Config.apiGatewayURL,
        headers: {
            'Content-Type': 'application/json',
            "Accept": "application/json",
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    });

    applyStaticMockAdapter(client);

    const onSuccess = (response) => {
        return response.data;
    }

    const onError = async (error) => {
        // Static demo: no redirects on API errors
        return Promise.reject(!!error.response?.data ? error.response.data : error.response || error.message);
    }

    return client(options)
        .then(onSuccess)
        .catch(onError);
}


export default apiGatewayClient;
