import React from 'react';

export default props => (
    <div className="CentralBankingWidget text-center" >
    	<figure className="bank-illus"><img src={`${process.env.REACT_APP_CDN_URL}/static/web-assets/no-bank-connected.png`} alt="Central Banking" />
		</figure>
		<div class="py-heading--section-title">Connect your bank account and credit card</div>
		<div class="py-text mb-4">Automate your bookkeeping by importing transactions automatically.</div>
    </div>
)