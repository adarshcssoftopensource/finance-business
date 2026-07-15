const date = new Date();
const year = date.getFullYear();

// Initialize window config from localStorage or empty object
window.APP_CONFIG = JSON.parse(localStorage.getItem('APP_CONFIG')) || {};

// Add helper to update config that persists to localStorage and reload page
window.updateConfig = (key, value) => {
  window.APP_CONFIG[key] = value;
  localStorage.setItem('APP_CONFIG', JSON.stringify(window.APP_CONFIG));
  window.location.reload(); // Reload the page after updating config
};

const APPCONFIG = {
  brand: 'ProjectName',
  user: 'OwnerName',
  year,
  productLink: 'project link',
  AutoCloseMobileNav: true,                         // true, false. Automatically close sidenav on route change (Mobile only)
  color: {
    primary: '#00BCD4',
    success: '#8BC34A',
    info: '#66BB6A',
    infoAlt: '#7E57C2',
    warning: '#FFCA28',
    danger: '#F44336',
    text: '#3D4051',
    gray: '#EDF0F1'
  },
  settings: {
    layoutBoxed: false,                             // true, false
    navCollapsed: false,                            // true, false
    navBehind: false,                               // true, false
    fixedHeader: true,                              // true, false
    sidebarWidth: 'middle',                         // small, middle, large
    colorOption: '14',                              // String: 11,12,13,14,15,16; 21,22,23,24,25,26; 31,32,33,34,35,36
    theme: 'light',                                 // light, gray, dark
  },
  get api_url() {
    return window.APP_CONFIG.API_URL || process.env.REACT_APP_API_URL;
  },
  apiGatewayURL: process.env.REACT_APP_API_GATEWAY_URL,
  company_logo_path: '',
  subscription_starter: 1    // Assuming plan level of starter plan always be 1
};

export default APPCONFIG;
