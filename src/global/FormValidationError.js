import React from 'react';

export default ({ message = 'This field is required', showError, err = true }) => {
  const formattedMessage = message.charAt(0).toUpperCase() + message.slice(1);

  return (
    <span className="errorMassage" hidden={!showError}>
      <small className={`form-text ${err ? "text-danger" : 'text-success'}`}>
        {formattedMessage}
      </small>
    </span>
  );
};
