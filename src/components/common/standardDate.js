import React from 'react'

export const standardDate = (dat) => {
    const newDate = new Date(dat);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    // let time = formatAMPM(newDate);
    let hours12 = newDate.toLocaleString('en-US', {hour: 'numeric', hour12: true});
    let hours = newDate.getHours();
    let minutes = newDate.getMinutes();
    let seconds = newDate.getSeconds();
    let dayName = days[newDate.getDay()];
    let dateNumber = ("0" + newDate.getDate()).slice(-2);
    let monthName = months[newDate.getMonth()];
    let monthNumber = ("0" + (newDate.getMonth() + 1)).slice(-2);
    let fullYear = newDate.getFullYear();
    let standardDate = monthNumber + "-" + dateNumber + "-" + fullYear;

    return {
        standardDate: standardDate,
        // time: time,
        hours: hours,
        minutes: minutes,
        seconds: seconds,
        hours12: hours12,
        dayName: dayName,
        dateNumber: dateNumber,
        monthName: monthName,
        monthNumber: monthNumber,
        fullYear: fullYear,

    };
};