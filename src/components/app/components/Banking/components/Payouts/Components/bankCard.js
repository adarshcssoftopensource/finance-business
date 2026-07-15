import React from 'react';
import Icon from '../../../../../../../components/common/Icon'
import symbolsIcon from '../../../../../../../assets/icons/product/symbols.svg'

const BankCard = ({ card, from }) => {
    return (        
        <div className="card_wrapper">
            <div className="bank-card">
                {/*{card.endingIn && from !='settings' && <div className="d-flex"> */}
                {card.endingIn ? <div className="d-flex">
                    <span className='me-2'>Account:</span><span className='monospace d-flex'><span
                    className='star'>******</span>{card.endingIn}</span>
                </div> : null}
                {card.routing ? <div className="d-flex">
                    <div className="d-flex">
                        <span className='me-2'>Routing: </span><span className='monospace'>{card.routing}</span>
                    </div>
                </div> : null}
                <div className="footer-card">
                    <div className="card-icon">
                        <Icon
                            className="Icon"
                            xlinkHref={`${symbolsIcon}#bank_icon`}
                        />
                    </div>
                    <div className="card-description">
                        {card.instituteName || from || 'Not available'}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BankCard;