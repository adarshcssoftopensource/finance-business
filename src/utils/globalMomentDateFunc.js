import moment from 'moment';
import momentz from 'moment-timezone'
/**
 * Make sure moment is imported only in this file.
 */
export const _getStartOf = (date, scope = 'day') => {
    return _getMomentUtc(date).startOf(scope);
}

export const _getEndOf = (date, scope = 'day') => {
    return _getMomentUtc(date).endOf(scope);
}

export const _getDiffDate = (from, to = new Date(), scope = "days") => {
    return _getStartOf(_formatDate(from)).diff(_getStartOf(_formatDate(to)), scope)
}

export const _addDate = (date, no = 1, scope = 'days') => {
    return _getStartOf(date).add(no, scope)
}

export const _subDate = (date, no = 1, scope = 'days') => {
    return _getStartOf(date).subtract(no, scope)
}

export const _formatDate = (date = new Date(), format = 'YYYY-MM-DD') => {
    return _getMoment(date).format(format)
}

export const _displayDate = (date = new Date(), format = 'YYYY-MM-DD') => {
    return _getMomentUtc(date).format(format)
}

export const _toDateConvert = date => {
    return _getMoment(date).toDate()
}

export const _timeZoneMoment = (from, to) => {
    return moment.tz(from, to)
}

export const _getMomentUtc = (date = new Date()) => {
    return moment.utc(date)
}

export const _getMomentUnix = (date = new Date()) => {
    return moment.unix(date)
}

export const _getMoment = date => {
    return moment(date)
}

export const _getDateOrdinal = date => {
    return moment(date, 'DD-MM-YYYY').format('Do');
}

export const _getAllTimeZone = () => {
    return momentz.tz.names()
}

export const _convertIntoLocal = date => {
    return moment.utc(date).local().format()
}

export const _getWeekDaysDate = value => {
    return moment().day(value).toDate()
}

export const _convertUnixToDate = (tms,fmt) =>{
    return moment.unix(tms).local().format(fmt)
}
// Get Days difference from start to end timestamp
export const _getDaysDiffeFromTimestamp=(endDate)=>{
    const start = moment()
    endDate = moment(_convertUnixToDate(endDate, 'MM-DD-YYYY'))
    return endDate.diff(start, 'days');
}
