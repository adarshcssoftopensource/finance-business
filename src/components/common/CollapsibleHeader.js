import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {mapToCssModules, tagPropType} from '../../utils/helpers';



const propTypes = {
  tag: tagPropType,
  inverse: PropTypes.bool,
  color: PropTypes.string,
  className: PropTypes.string,
  body: PropTypes.bool,
  outline: PropTypes.bool,
  cssModule: PropTypes.object,
  innerRef: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
    PropTypes.func,
  ]),
};

const defaultProps = {
  tag: 'div'
};

const Collapsibe = (props) => {
  const {
    className,
    cssModule,
    color,
    body,
    inverse,
    outline,
    tag: Tag,
    innerRef,
    ...attributes
  } = props;
  const classes = mapToCssModules(classNames(
    classNames,
    'Collapsible__Header',
    inverse ? 'text-white' : false,
    body ? 'Collapsible__Content' : false,
    color ? `${outline ? 'border' : 'bg'}-${color}` : false
  ), cssModule);

  return ( <
    Tag {
      ...attributes
    }
    className = {
      classes
    }
    ref = {
      innerRef
    }
    />
  );
};

Collapsibe.propTypes = propTypes;
Collapsibe.defaultProps = defaultProps;

export default Collapsibe;