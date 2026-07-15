import React from 'react';
import ReCAPTCHA from "react-google-recaptcha";
import FormValidationError from './FormValidationError';

function Recaptcha({ errors, onChange }) {
 return (
  <div>
   <ReCAPTCHA
    sitekey="6LfFyLYZAAAAACUVjgqzZtRJJh2NKfY5OGX_X7q_"
    onChange={onChange}
   />
   {errors && errors.gTokenErr && <FormValidationError showError={errors.gTokenErr} />}
  </div>
 );
}

export default Recaptcha;