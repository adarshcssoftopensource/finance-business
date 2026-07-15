import { orderBy, uniqBy } from "lodash";
import { toDollar, getDateMMddyyyy } from '../../../../../../utils/common';
import { _displayDate } from "../../../../../../utils/globalMomentDateFunc";

export const mailMessage = (data, via, businessInfo) => {
	const subject = `${data.name}\ #${data.invoiceNumber} from ${
		businessInfo.organizationName
		}`;
	const message = `
  Below please find a link to ${data.name}\ #${data.invoiceNumber}.

  Amount due: ${(data.currency && data.currency.symbol) || ""} ${
		data.dueAmount
		}

  Expires on: ${_displayDate(data.expiryDate, "YYYY-MM-DD")}
  
  To view this invoice online, please visit:${process.env.REACT_APP_WEB_URL}/public/invoice/${data.uuid}`;
	if (via === "gmail") {
		return `https://mail.google.com/mail/u/0/?view=cm&&su=${escape(
			subject
		)}&&body=${escape(message)}`;
	} if (via === "yahoo") {
		return `http://compose.mail.yahoo.com/?&&subj=${escape(
			subject
		)}&&body=${escape(message)}`;
	} if (via === "outlook") {
		return `https://outlook.live.com/owa/?path=/mail/action/compose&subject=${escape(
			subject
		)}&body=${escape(message)}`;
	}
};

export const statementMailMessage = (data, statmentPublicUrl, via, businessInfo) => {
	const subject = `Statement of Account from ${
		businessInfo.organizationName
	}`;
	const message = `Please find a link to your Statement of Account (${getDateMMddyyyy(data.filter.endDate)} to ${getDateMMddyyyy(data.filter.startDate)}) below. This statement includes invoices in multiple currencies.

	Total USD due: ${toDollar(data.total.totalBalance)}

	To view this statement and related invoices, visit: ${statmentPublicUrl}`;
	  
	if (via === "gmail") {
		return `https://mail.google.com/mail/u/0/?view=cm&&su=${escape(
			subject
		)}&&body=${escape(message)}`;
	} if (via === "yahoo") {
		return `http://compose.mail.yahoo.com/?&&subj=${escape(
			subject
		)}&&body=${escape(message)}`;
	} if (via === "outlook") {
		return `https://outlook.live.com/owa/?path=/mail/action/compose&subject=${escape(
			subject
		)}&body=${escape(message)}`;
	}
};

export const imageUploadValidation = (file, size = 10000) => {
  return file.name.match(/\.(jpg|jpeg|png|gif)$/) && (file.size / 1024) <= size
}

export const videoUploadValidation = (file, size = 512000) => {
  return file.name.match(/\.(.webm|gif|mkv|mp4|mov|mpeg4|m4v)$/) && (file.size / 1024) <= size
}