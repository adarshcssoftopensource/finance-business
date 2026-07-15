import PropTypes from 'prop-types';

// Tag Proptypes
export const tagPropType = PropTypes.oneOfType([
  PropTypes.func,
  PropTypes.string,
  PropTypes.shape({
    $$typeof: PropTypes.symbol,
    render: PropTypes.func
  }),
  PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.string,
    PropTypes.shape({
      $$typeof: PropTypes.symbol,
      render: PropTypes.func
    }),
  ]))
]);


// CssModule
let globalCssModule;

export function setGlobalCssModule(cssModule) {
  globalCssModule = cssModule;
}

export function mapToCssModules(className = '', cssModule = globalCssModule) {
  if (!cssModule) return className;
  return className
    .split(' ')
    .map(c => cssModule[c] || c)
    .join(' ');
}