import requestWithToken from "./requestWithToken";
import requestWithTokenBlob from "./requestWithTokenBlob";

export const updatePaymentSetting = (data) => {
	return requestWithToken({
		url: `/api/v1/settings/payment/debitcard-onboarding`,
		method: 'PATCH',
		data
	})
}

export const generateDebitCard = (data) => {
	return requestWithToken({
		url: `api/v1/debit-cards/`,
		method: 'POST',
		data
	});
};

export const getDebitCardSummary = () => {
	return requestWithToken({
		url: `api/v1/debit-cards/summary`,
		method: 'GET'
	})
}

export const revealCardDetails = (cardId) => {
	return requestWithToken({
		url: `api/v1/debit-cards/` + cardId + `/reveal`,
		method: 'GET'
	})
}

export const payoutBalance = () => {
	return requestWithToken({
		url: `api/v1/debit-cards/payout`,
		method: 'GET'
	})
}

export const addWalletBalance = (data) => {
	return requestWithToken({
		url: `api/v1/debit-cards/topup`,
		method: 'POST',
		data
	})
}

export const getTransactionRecords = (queryString) => {
	let url = `api/v1/debit-cards/transactions`;
	if (queryString) {
		url += `?${queryString}`;
	}
	return requestWithToken({
		url,
		method: 'GET'
	})
}

export const exportTransactionRecords = () => {
	let url = `api/v1/debit-cards/transactions/export?exportType=csv`;
	return requestWithTokenBlob({
		url,
		method: 'GET'
	})
}

export const checkPaymentOnBoarding = () => {
	return requestWithToken({
		url: `api/v1/settings/payment`,
		method: 'GET'
	})
}

export const updateStatus = (cardId, data) => {
	return requestWithToken({
		url: `api/v1/debit-cards/`+cardId,
		method: 'PATCH',
		data
	})
}

export const getPhysicalCardSummary = () => {
	return requestWithToken({
		url: `api/v1/debit-cards/physical-card/summary`,
		method: 'GET',
	})
}

export const generateDebitCardWallet = (data, isFirstTime) => {
	return requestWithToken({
		url: `api/v1/debit-cards/wallets${isFirstTime ? `?isFirstTime=${isFirstTime}` : ''}`,
		method: 'POST',
		data
	});
};

export const getBusinessLegalAddress = () => {
	return requestWithToken({
		url: `api/v1/debit-cards/billingAddress`,
		method: 'GET',
	})
}

export const revealCardAuthenticate = (data) => {
	return requestWithToken({
		url: `api/v1/debit-cards/revealCardAuthenticate`,
		method: 'POST',
		data
	})
}

const DebitCardService = {
	updatePaymentSetting,
	generateDebitCard,
	getDebitCardSummary,
	revealCardDetails,
	payoutBalance,
	addWalletBalance,
	getTransactionRecords,
	checkPaymentOnBoarding,
	updateStatus,
	getPhysicalCardSummary,
	exportTransactionRecords,
	generateDebitCardWallet,
	getBusinessLegalAddress,
	revealCardAuthenticate
}

export default DebitCardService;