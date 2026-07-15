import { _subDate, _displayDate } from "../../../../utils/globalMomentDateFunc"

export const BankList = [
    {
        name: 'American Express',
        link: 'https://www.americanexpress.com/'
    },
    {
        name: 'American Express',
        link: 'https://www.americanexpress.com/'
    },
    {
        name: 'American Express',
        link: 'https://www.americanexpress.com/'
    },
    {
        name: 'American Express',
        link: 'https://www.americanexpress.com/'
    },
    {
        name: 'American Express',
        link: 'https://www.americanexpress.com/'
    },
    {
        name: 'American Express',
        link: 'https://www.americanexpress.com/'
    },
    {
        name: 'American Express',
        link: 'https://www.americanexpress.com/'
    },
    {
        name: 'American Express',
        link: 'https://www.americanexpress.com/'
    },
    {
        name: 'American Express',
        link: 'https://www.americanexpress.com/'
    },
    {
        name: 'American Express',
        link: 'https://www.americanexpress.com/'
    },
    {
        name: 'American Express',
        link: 'https://www.americanexpress.com/'
    },
    {
        name: 'American Express',
        link: 'https://www.americanexpress.com/'
    },
    {
        name: 'American Express',
        link: 'https://www.americanexpress.com/'
    },
    {
        name: 'American Express',
        link: 'https://www.americanexpress.com/'
    },
    {
        name: 'American Express',
        link: 'https://www.americanexpress.com/'
    }
]

export const dateRange = [
    {name: 'From up to 91 days ago', value: _displayDate(_subDate(new Date(), 91, 'days'))},
    {name: 'Today', value: _displayDate},
    {name: 'Yesterday', value: _displayDate(_subDate(new Date, 1, 'days'))},
    {name: 'From a month ago', value: _displayDate(_subDate(new Date(), 30, 'days'))},
    {name: 'From a specific date...', value: 'specific'}
]