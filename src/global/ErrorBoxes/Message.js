import React from 'react';

export const Message = props => {
    return (
        <div className={`inner-alert step-msg message ${props.className}`}>
            <span className="symbol">! </span>
            <span className="text">{props.text}</span>
        </div>
    )
}

export const ValidationMessages = ({title, messages, className, id, autoFocus}) => (
    <div className={`w-100 ${className}`} id={id} autoFocus={autoFocus}>
        <div className="alert-action" role="alert">
            <div className="alert-icon">
                <svg className="Icon" viewBox="0 0 20 20" id="attention" xmlns="http://www.w3.org/2000/svg"><path d="M7.916 3.222C8.369 2.453 9.153 2 10 2c.848 0 1.632.453 2.085 1.222l6.594 12.196c.426.758.428 1.689.006 2.449-.424.765-1.147 1.122-2.084 1.133H3.391c-.928-.01-1.65-.368-2.075-1.133a2.51 2.51 0 0 1 0-2.436l6.6-12.21zm-4.76 12.904a.717.717 0 0 0-.002.696c.063.114.21.174.557.178h12.46c.356-.004.502-.064.565-.178a.723.723 0 0 0-.008-.708L10.564 4.298A.657.657 0 0 0 10 3.97a.656.656 0 0 0-.557.317l-6.287 11.84zM10 14a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-6a1 1 0 0 1 1 1v3a1 1 0 0 1-2 0V9a1 1 0 0 1 1-1z"></path></svg>
            </div>
            <div className="alert-content">
                <h4 className="alert-title">{title}</h4>
                {
                    messages && messages.length > 0 && messages.map(({heading, message}, i) => {
                        return (
                            <ul className="alert-desc">
                            <li>{heading && <strong>{heading}:&nbsp;</strong>}{message}</li>
                            </ul>
                        )
                    })
                }
            </div>
        </div>
    </div>
)