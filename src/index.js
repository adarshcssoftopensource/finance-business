import React, { Fragment } from 'react'
import ReactDOM from 'react-dom'
import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact from '@bugsnag/plugin-react'
import { persistStore } from 'redux-persist'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import history from './customHistory'
import Main from './routes'
import { _getUser } from './utils/authFunctions'
import { Helmet } from 'react-helmet'
import { hotjar } from './hotjar'
import {
    handleAclPermissions,
    removeURLParameter,
} from './utils/GlobalFunctions'
import { setSelectedBussiness } from './actions/businessAction'
import { PersistGate } from 'redux-persist/integration/react'
import CenterSpinner from './global/CenterSpinner'
import { store } from './Store'
import axios from 'axios';

// GLOBAL STATIC MOCK: Bypass all API calls and return generic success with static data
axios.interceptors.request.use((config) => {
  config.adapter = async (config) => {
    // Generate some static items for tables to display instead of being empty
    const staticItems = [
      { _id: '1', id: '1', name: 'Static Item 1', amount: 100, status: 'active', createdAt: new Date().toISOString() },
      { _id: '2', id: '2', name: 'Static Item 2', amount: 250, status: 'pending', createdAt: new Date().toISOString() }
    ];

    return {
      data: {
        statusCode: 200, status: 200, success: true, message: "Success",
        data: staticItems, 
        items: staticItems, 
        list: staticItems, 
        count: 2, 
        total: 2,
        businesses: [{ _id: 'biz1', name: 'Static Business' }],
        selectedBusiness: { _id: 'biz1', name: 'Static Business' },
        user: { _id: "static", name: "Static User", email: "user@finance.com", themeMode: 'light' }
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      request: {}
    };
  };
  return config;
});

export const persistingStore = persistStore(store)

/**
 * Method used for check token is valid ot not
 */
export const requireAuth = async (nextState, path, replace) => {
    const authToken = localStorage.getItem('token')
    let business = nextState.businessReducer.business
    const paymentSettings = nextState.paymentSettings
    const persistStorage = localStorage.getItem('reduxPersist:root')
    if (!authToken || !persistStorage) {
        const { location } = window
        if (location.search.includes('selectedBusiness=') && persistStorage) {
            const redirectTo = location.pathname + location.search
            localStorage.setItem('redirectTo', redirectTo)
        }
        if (!persistStorage) {
            const basicAuthToken = localStorage.getItem('basicAuthToken')
            if (!localStorage.getItem("assumeUser")) localStorage.clear()
            localStorage.setItem('basicAuthToken', basicAuthToken)
            await persistingStore.purge()
        }
        history.push({
            pathname: '/signin',
            state: {
                from: location.pathname
            }
        })
        window.location.reload(true)
        return false
    } else {
        const user = _getUser(authToken)
        if (business.length === 0) {
            history.push('/onboarding')
        }
        let checkPer = true

        if ((path.includes('payments') || path.includes('payouts') || path.includes('subscription') || path.includes('update')) && handleAclPermissions(['Viewer'])) {
            history.push('/app/no-permission')
        }

        if (!!user && !!user.acl && !!user.acl.permissions) {
            if (user.acl.permissions.length > 0) {
                user.acl.permissions.find(per => {
                    if (path.includes(per.resource)) {
                        if (per.allowed) {
                            if (per.scope.includes('write')) {
                                checkPer = true
                            } else if (per.scope.length === 1 && per.scope.includes('read')) {
                                if (path.includes('add') || path.includes('create')) {
                                    checkPer = false
                                } else {
                                    checkPer = true
                                }
                            }
                        } else {
                            checkPer = false
                        }
                    } else if (checkPer === true) {
                        if (per.resource === "*") {
                            if (per.allowed) {
                                if (per.scope.includes('write')) {
                                    checkPer = true
                                } else if (per.scope.length === 1 && per.scope.includes('read')) {
                                    if (path.includes('add') || path.includes('view') || path.includes('create') || path.includes('edit')) {
                                        checkPer = !!(path.includes('customer/edit') || path.includes('products/edit'));
                                    } else {
                                        checkPer = true
                                    }
                                } else {
                                    checkPer = true
                                }
                            } else {
                                checkPer = false
                            }
                        }
                    }
                })
                if (checkPer === false) {
                    history.push('/app/no-permission')
                } else {
                    return checkPer
                }
            }
        }
        return checkPer
    }
}

// if (window.performance) {
if (localStorage.getItem("token")) {
    const authToken = localStorage.getItem("token");
    store.dispatch(setSelectedBussiness(localStorage.getItem('businessId'), authToken, false))
}
// }

// Check if selectedBusiness queryParam exists
const handleSelectedBusinessQuery = async () => {
    const { location } = window
    if (typeof URLSearchParams !== 'undefined') {
        const urlParams = new URLSearchParams(location.search);
        if (urlParams.has('selectedBusiness') && localStorage.getItem('businessId')) {
            const selectedBusinessId = urlParams.get('selectedBusiness')
            if (localStorage.getItem('businessId') !== selectedBusinessId) {
                localStorage.setItem('businessId', selectedBusinessId)
                const newUrl = await removeURLParameter(location.pathname + location.search, 'selectedBusiness')
                await store.dispatch(setSelectedBussiness(selectedBusinessId, null, false))
                history.replace(newUrl)
                location.reload()
            } else {
                const newUrl = await removeURLParameter(location.pathname + location.search, 'selectedBusiness')
                history.replace(newUrl)
                location.reload()
            }
        } else {
            return <Main />
        }
    } else {
        console.log(`Your browser  does not support URLSearchParams`)
        return <Main />
    }
}

Bugsnag.start({
    appType: 'client',
    appVersion: "2.1.0",
    apiKey: process.env.REACT_APP_BUGSNAG_API_KEY,
    plugins: [new BugsnagPluginReact()],
    enabledReleaseStages: ['production'],
    releaseStage: process.env.NODE_ENV
})

const ErrorBoundary = Bugsnag.getPlugin('react')
    .createErrorBoundary(React)

// Force light mode
localStorage.setItem("colormode", "light-mode");
sessionStorage.setItem('colormodeSessionStorageData', 'light-mode');
document.body.classList.remove('dark-mode');
document.body.classList.add('light-mode');

// history.listen((location) => {
//   window.gtag('set', 'page', location.pathname + location.search);
//   window.gtag('send', 'pageview');
// }
// );
//ReactGA.pageview(window.location.pathname);

ReactDOM.render(
    <ErrorBoundary>
        <Provider store={store}>
            <PersistGate loading={<CenterSpinner />} persistor={persistingStore}>
                <Router history={history}>
                    <Fragment>
                        <Helmet>
                            {process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'staging' ? hotjar.initialize() : ''}
                        </Helmet>
                        {
                            // handleSelectedBusinessQuery()
                            window.location.search.includes('selectedBusiness=') && localStorage.getItem('businessId') ? handleSelectedBusinessQuery() :
                                <Main />
                        }
                    </Fragment>
                </Router>
            </PersistGate>
        </Provider>
    </ErrorBoundary>,
    document.getElementById('app-container')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
