import React from 'react';
import { get as _get } from 'lodash';

export const MaskedInput = ({ value, onChange, id, required, disabled }) => {
  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  return (
    <input
      type="password"
      id={id}
      value={value || ""}
      onChange={handleChange}
      required={required}
      disabled={disabled}
      className="form-control"
    />
  );
};

let halfCount = 0;

export function CustomFieldTemplate(props) {
  const {
    id,
    classNames,
    label,
    rawDescription,
    help,
    required,
    description,
    errors,
    children,
    schema
  } = props
  halfCount = schema.data === 'half' && halfCount++
  return (
    <div className={`${classNames} ${schema.data} ${id.toLowerCase()} ${label?.replace(/\s/g, '').toLowerCase()}`}>
      {!_get(schema, 'isLabelHide', false) ? (
        <label className={`${_get(schema, 'isLabelAsTitle', false) ? 'label-title' : 'label'}`} htmlFor={id}>
          {label}
          {schema.isAsterhide ? " " : (required ? '*' : null)}

        </label>
      ) : (
        ''
      )}

      {!_get(schema, 'isDescriptionHide', false)
        ? rawDescription && (
        <div className="field-description" dangerouslySetInnerHTML={{ __html: rawDescription }} />
      )
        : ''}

      {halfCount <= 1 ? (
        <div className="row">
          <div className={'col-lg-12 col-md-12 col-sm-12 col-xs-12 in-field'} key={id}>
            {children}
          </div>
          {
            (errors &&errors.props && errors.props.errors) ? <div style={{color:"red",marginLeft:"15px"}}>{errors.props.errors[0]}</div>:""
          }
        </div>
      ) : (
        <div className="row">
          <div className={'col-lg-6 col-md-6 col-sm-6 col-xs-6 in-field'} key={id}>
            {children}
          </div>
        </div>
      )}
    </div>
  )
}