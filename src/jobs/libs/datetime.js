import moment from 'moment-business-days';

// Determine the number of business days between two dates
const businessDaysBetween = (date1, date2) => {
    return Math.abs(moment(date1).businessDiff(moment(date2), 'days'));
}

module.exports = { businessDaysBetween }
