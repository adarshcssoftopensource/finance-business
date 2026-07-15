import React, { Fragment } from 'react'
import ReactDOM from 'react-dom'
import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact from '@bugsnag/plugin-react'
import { persistStore } from 'redux-persist'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import history from './customHistory'
import Main from './routes'
import { Helmet } from 'react-helmet'
import { hotjar } from './hotjar'
import { removeURLParameter } from './utils/GlobalFunctions'
import { setSelectedBussiness } from './actions/businessAction'
import { PersistGate } from 'redux-persist/integration/react'
import CenterSpinner from './global/CenterSpinner'
import { store } from './Store'
import axios from 'axios'
import { applyStaticMockAdapter } from './utils/staticMockAdapter'

applyStaticMockAdapter(axios)

export const persistingStore = persistStore(store)

/**
 * Method used for check token is valid ot not
 */
export const requireAuth = async () => {
    // Static demo: allow all routes without signin/onboarding/permission redirects
    return true
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

const bugsnagKey = process.env.REACT_APP_BUGSNAG_API_KEY
const hasValidBugsnagKey =
  typeof bugsnagKey === 'string' && /^[a-f0-9]{32}$/i.test(bugsnagKey)

if (hasValidBugsnagKey) {
  Bugsnag.start({
    appType: 'client',
    appVersion: "2.1.0",
    apiKey: bugsnagKey,
    plugins: [new BugsnagPluginReact()],
    enabledReleaseStages: ['production'],
    releaseStage: process.env.NODE_ENV
  })
}

const ErrorBoundary = hasValidBugsnagKey
  ? Bugsnag.getPlugin('react').createErrorBoundary(React)
  : class DemoErrorBoundary extends React.Component {
      constructor(props) {
        super(props)
        this.state = { error: null }
      }
      static getDerivedStateFromError(error) {
        return { error }
      }
      componentDidCatch(error) {
        console.error('[demo ErrorBoundary]', error)
      }
      render() {
        if (this.state.error) {
          return (
            <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
              <h2>Something went wrong</h2>
              <pre style={{ whiteSpace: 'pre-wrap', color: '#b00020' }}>
                {String(this.state.error?.message || this.state.error)}
              </pre>
              <button type="button" onClick={() => { this.setState({ error: null }); window.location.href = '/app/dashboard' }}>
                Back to dashboard
              </button>
            </div>
          )
        }
        return this.props.children
      }
    }

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
