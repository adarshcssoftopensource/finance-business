
import React, { Fragment } from 'react';
import * as PaymentIcon from './PaymentIcon';

export const ShowPaymentIcons = props => {
    const { icons = ['visa', 'master', 'amex', 'discover', 'bank'] } = props
    return (
        <Fragment>
            <div className={props.className}>
                {
                    icons && icons.length &&
                    icons.map((icon, i) => {
                        let iconUrl
                        // let iconUrl = process.env.REACT_APP_WEB_URL.includes('localhost') ? !!PaymentIcon[icon] ? `/${PaymentIcon[icon]}` : `/assets/${icon}.svg` : (PaymentIcon[icon] || `/assets/${icon}.svg`);
                        if (process.env.REACT_APP_WEB_URL.includes('localhost')) {
                            if (!!PaymentIcon[icon]) {
                                if (PaymentIcon[icon].includes('https://')) {
                                    iconUrl = `${PaymentIcon[icon]}`
                                } else {
                                    iconUrl = `/${PaymentIcon[icon]}`
                                }
                            } else {
                                iconUrl = `/assets/${icon}.svg`
                            }
                        } else {
                            iconUrl = (PaymentIcon[icon] || `/assets/${icon}.svg`)
                        }
                        return (
                            <img src={iconUrl} />
                        )
                    })
                }
            </div>
        </Fragment>
    )
}