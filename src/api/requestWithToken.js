import axios from 'axios';
import Config from '../constants/Config';
import history from '../customHistory';
import { callRefresh, logout, setupRefreshTimer } from '../utils/GlobalFunctions';


let isRefreshing = false;
let failedQueue = [];
/**
 * Request Wrapper with default success/error actions
 */

const requestWithToken = (options) => {
    /**
     * Create an Axios Client with defaults
     */
    // if(options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE' || options.method === 'PATCH'){

    // }
    const header = {
        'Content-Type': 'application/json',
        "Accept": "application/json",
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'x-business-id': localStorage.getItem('businessId'),
        // 'x-payyit-agent': 'Web'
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
    // if(!!localStorage.getItem('businessId')){
    //     axios.defaults.header['x-business-id'] = localStorage.getItem('businessId')
    // }

    const onSuccess = (response) => {
        return response.data;
    }

    const onError = async (error) => {
        if (error.response) {
            // Request was made but server responded with something
            // other than 2xx

            if (error.response.status === 405) {
                localStorage.removeItem('basicAuthToken')
                return Promise.reject(error.response || error.message);
            }

            if (error.response.status === 403) {
                //If refresh token expires
                if (options.url.includes('refresh')) {
                    logout()
                }
            } else if (error.response.status === 401) {
                //If refresh token expires
                if (options.url.includes('refresh') || window.location.pathname.includes('signin')) {
                    logout()
                } else {
                    //If other api's fails
                    await callRefresh()
                    setupRefreshTimer();
                    requestWithToken(options);
                }
            } else if (error.response.status === 404) {
                history.push('/404')
            }
            return Promise.reject(!!error.response.data ? error.response.data : error.response || error.message);
        } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the
            // browser and an instance of
            // http.ClientRequest in node.js
            history.push('/app/error/500')

            return Promise.reject(error.request);
        } else {
            // Something else happened while setting up the request
            // triggered the error
            if (error?.statusCode === 403 || error?.statusCode === 400) {
                history.push('/signin')
            } else {
                history.push('/app/error/500')
            }
            return Promise.reject(error.message);
        }
    }

    const processQueue = (error, token = null) => {
        failedQueue.forEach(prom => {
            if (error) {
                prom.reject(error);
            } else {
                prom.resolve(token);
            }
        })

        failedQueue = [];
    }

    client.interceptors.response.use(function (response) {
        return response;
    }, function (error) {
        if (!localStorage.getItem('assumeUser')) {
            const originalRequest = error.config;
            if (error.response.status === 401 && !originalRequest._retry && originalRequest.baseURL === Config.api_url) {

                if (isRefreshing) {
                    return new Promise(function (resolve, reject) {
                        failedQueue.push({
                            resolve,
                            reject
                        });
                    }).then(token => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        return axios(originalRequest);
                    })
                        .catch(err => {
                            return Promise.reject(err);
                        });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                return new Promise(function (resolve, reject) {
                    callRefresh()
                        .then(({ data }) => {
                            localStorage.setItem('token', data.accessToken);
                            localStorage.setItem('refreshToken', data.refreshToken);
                            originalRequest.headers['Authorization'] = 'Bearer ' + data.accessToken;
                            processQueue(null, data.accessToken);
                            resolve(axios(originalRequest));
                        })
                        .catch((err) => {
                            processQueue(err, null);
                            reject(err);
                            logout();
                        })
                        .finally(() => {
                            isRefreshing = false;
                        });
                });
            }
        }
        return Promise.reject(error);
    });

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
