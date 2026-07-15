import React from 'react';
const prefix = `${process.env.REACT_APP_CDN_URL}/static/web-assets/`;

const creditCards = (props) => {
    return (
        <div className="cards global-cards mt-4 mb-2">
            {props.cards.length > 0 && props.cards.map((card) => (<span {...props} className="card">
                <img src={`${prefix}${card}.svg`} />
            </span>))}
        </div>
    )
}

export default creditCards;