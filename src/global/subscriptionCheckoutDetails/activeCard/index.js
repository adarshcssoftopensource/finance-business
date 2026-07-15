import React, { useState, useEffect } from 'react';
import { Spinner } from 'reactstrap';
import { terms, privacyPolicy } from '../../../utils/GlobalFunctions'

import * as PaymentIcon from '../../../global/PaymentIcon'

const Index = ({ handleDifferentCard, isLoading, getCardDetails, cards, buttonText }) => {
    const [selectedCard, setSelectedCard] = useState(null)
    useEffect(() => {
        const getPrimary = cards.find((card) => card.isPrimary)
        setSelectedCard(getPrimary)
    }, [cards])
    return (
        <div className="row p-0 m-0">
            <div className="col-12 px-0">
                {/* Card-List-Item */}
                <ul className="payment__cards__list">
                    {/* For selected item. Use this className "is-selected" */}
                    {cards && selectedCard && cards.map((card) => (<li key={card._id} onClick={() => setSelectedCard(card)} className={`payment__cards__list__item ${selectedCard._id === card._id ? 'is-selected' : ''}`}>
                        <div className="icon">
                            <img src={PaymentIcon[card?.brand?.toLowerCase()]} />
                        </div>
                        <span className="number">•••• {card?.cardNumber}{card?.expiryYear?.length}</span>
                        <span className="date">{card?.expiryYear?.toString().length == 1 ? "0" + card?.expiryYear : card?.expiryYear}/{card?.expiryMonth}</span>
                        <span className="name">{card?.cardHolderName}</span>
                    </li>))}
                    <li className="payment__cards__list__item linkable" onClick={handleDifferentCard}>Use a Different Credit Card</li>
                </ul>
            </div>
            <div className="col-12 py-text mt-4 px-0 text-left mb-3">
                <p>By clicking {buttonText}, you agree to our <a href={terms()} target="_blank">Terms of Use</a> and have read and acknowledge our <a href={privacyPolicy()} target="_blank">Privacy Policy</a>.</p>
            </div>
            <div className="col-12 mt-0 px-0">
                <button className="btn btn-primary btn-block" disabled={isLoading} type="button" onClick={() => getCardDetails(selectedCard)} >{buttonText} {isLoading && (<Spinner size="sm" color="default" />)}</button>
            </div>
        </div>
    );
}

export default Index;
