const future = {
 prefixAgo: null,
 prefixFromNow: null,
 suffixAgo: ' ',
 suffixFromNow: ' ',
 seconds: 'Today',
 minute: 'Today',
 minutes: 'Today',
 hour: 'about an hour',
 hours: 'Today',
 day: 'Tomorrow',
 days: 'within %d days',
 month: 'about a month',
 months: '%d months',
 year: 'about a year',
 years: '%d years',
 wordSeparator: ' '
};

// It is not being used
const futureWithTime = {
 prefixAgo: null,
 prefixFromNow: null,
 suffixAgo: ' ',
 suffixFromNow: ' ',
 seconds: 'just a moment',
 minute: 'just a moment',
 minutes: '%d minutes',
 hour: 'about an hour',
 hours: '%d hours',
 day: 'Tomorrow',
 days: 'within %d days',
 month: 'about a month',
 months: '%d months',
 year: 'about a year',
 years: '%d years',
 wordSeparator: ' '
};

const past = {
 prefixAgo: null,
 prefixFromNow: null,
 suffixAgo: ' ',
 suffixFromNow: ' ',
 seconds: 'just a moment ago',
 minute: 'just a moment ago',
 minutes: '%d minutes ago',
 hour: 'about an hour ago',
 hours: 'Today',
 day: 'Yesterday',
 days: '%d days ago',
 month: 'about a month ago',
 months: '%d months ago',
 year: 'about a year ago',
 years: '%d years ago',
 wordSeparator: ''
};
// Used to track latest time 
// Example for last view 
const pastWithTime = {
 prefixAgo: null,
 prefixFromNow: null,
 suffixAgo: ' ',
 suffixFromNow: ' ',
 seconds: 'just a moment ago',
 minute: 'just a moment ago',
 minutes: '%d minutes ago',
 hour: 'about an hour',
 hours: '%d hours ago',
 day: 'Yesterday',
 days: '%d days ago',
 month: 'about a month ago',
 months: '%d months ago',
 year: 'about a year ago',
 years: '%d years ago',
 wordSeparator: ' '
};




module.exports= {
 future, futureWithTime, past, pastWithTime
}


