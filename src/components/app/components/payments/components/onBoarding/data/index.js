
export const steps = ['Provider Information', 'Business Type', 'Business Details', 'Your Details',
    'Bank Details', 'Customized Statement', 'Verification'];

export const businessCategoryOptions = [{ type: "Accounting, Auditing, and Bookkeeping Services", mcc: '8931' },
{ type: "Advertising Services", mcc: '7311' },
{ type: "Architectural, Engineering, and Surveying Services", mcc: '8911' },
{ type: "Automotive Body Repair Shops", mcc: '7531' },
{ type: "Bands, Orchestras, and Miscellaneous Entertainers", mcc: '7929' },
{ type: "Barber and Beauty Shops", mcc: '7230' },
{ type: "Chiropractors", mcc: '8041' },
{ type: "Commercial Photography, Art, and Graphics", mcc: '7333' },
{ type: "Construction Materials", mcc: '5039' },
{ type: "Courier Services - Air or Ground, Freight Forwarders", mcc: '4215' },
{ type: "Dance Halls, Studios and Schools", mcc: '7911' },
{ type: "Dentists, Orthodontists", mcc: '8021' },
{ type: "Department Stores", mcc: '5311' },
{ type: "Doctors", mcc: '8011' },
{ type: "Eating Places, Restaurants", mcc: '5812' },
{ type: "General Contractors - Residential and Commercial", mcc: '1520' },
{ type: "Health and Beauty Spas", mcc: '7298' },
{ type: "Household Employer", mcc: '8351' },
{ type: "Insurance Sales, Underwriting, and Premiums", mcc: '6300' },
{ type: "Landscaping and Horticultural Services", mcc: '0780' },
{ type: "Legal Services, Attorneys", mcc: '8111' },
{ type: "Management, Consulting, and Public Relations Services", mcc: '7392' },
{ type: "Medical Services and Health Practitioners", mcc: '8099' },
{ type: "Miscellaneous General Merchandise Stores", mcc: '5399' },
{ type: "Miscellaneous Repair Shops and Related Services", mcc: '7699' },
{ type: "Nursing Care/Personal Care Facilities", mcc: '8050' },
{ type: "Organizations, Charitable and Social Service", mcc: '8398' },
{ type: "Organizations, Religious", mcc: '8661' },
{ type: "Other General Services", mcc: '7299' },
{ type: "Photographic Studios", mcc: '7221' },
{ type: "Professional Services", mcc: '8999' },
{ type: "Real Estate Agents and Managers - Rentals", mcc: '6513' },
{ type: "Stenographic and Secretarial Support Services", mcc: '7339' }];

export const donationOptions = [
    { title: 'Events', value: 'events' },
    { title: 'Email', value: 'email' },
    { title: 'Website', value: 'website' }
]

export const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
];

export const requiredMsg = 'This field is required'

export const removeMaskRegex = (value) => {
    return value.replace(/[^a-zA-Z0-9]/g, "")
}

export const validateUrl = (url) => {
    var re = /^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/;
    return re.test(url);
}

export const validatePhone=(phone)=>{
    return phone.replace(/[^\w\s]/gi, "");
}


