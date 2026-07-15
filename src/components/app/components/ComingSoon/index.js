import React, { useState, useEffect } from 'react';
import ComingSoon from '../../../comingSoon/index';


const Index = (props) => {

    const [title, setTitle] = useState('Accounting');
    const [counter, setCouner] = useState(false);
    const [counterDate, setCounerDate] = useState(new Date())

    useEffect(() => {
        const { path } = props.match
        if (path.includes('accounting')) {
            setTitle('Accounting');
            //setCouner(true);
            //setCounerDate("2021-10-15T12:00:00-06:30")
        } else if (path.includes('advancepayments')) {
            setTitle('Advance Payments')
            setCouner(false);
        } else if (path.includes('chargeback-insurance')) {
            setTitle('Chargeback Insurance')
        } else if (path.includes('banking')) {
            setTitle('Banking')
        } else if (path.includes('management')) {
            setTitle('Management')
        } else if (path.includes('mynt-club')) {
            setTitle('Mynt Club')
            setCouner(false);
            setCounerDate("2021-03-15T12:00:00-06:30")
        } else if (path.includes('advisors')) {
            setTitle('Advisors')
            setCouner(false);
        } else if (path.includes('creditreporting')) {
            setTitle('Credit Reporting');
            // setCouner(true);
            // setCounerDate("2020-07-15T12:00:00-06:30")
        } else if (path.includes('cryptocurrency')) {
            setTitle('Cryptocurrency');
            // setCouner(true);
            // setCounerDate("2020-07-15T12:00:00-06:30")
        } else if (path.includes('integrations')) {
            setTitle('Integrations');
            // setCouner(true);
            // setCounerDate("2020-09-15T12:00:00-06:30")
        } else if (path.includes('investments')) {
            setTitle('Investments');
            // setCouner(true);
            // setCounerDate("2020-09-15T12:00:00-06:30")
        } else if (path.includes('insurance')) {
            setTitle('Insurance')
            setCouner(false);
        } else if (path.includes('ios-android-app')) {
            setTitle('iOS and Android App ')
            setCouner(true);
            setCounerDate("2020-11-02T12:00:00-06:30")
        } else if (path.includes('p2p-transfers')) {
            setTitle('P2P Transfers')
            setCouner(false);
            setCounerDate("2020-12-15T12:00:00-06:30")
        } else if (path.includes('payment-gateway')) {
            setTitle('Payment Gateway')
            setCouner(false);
            setCounerDate("2020-12-15T12:00:00-06:30")
        } else if (path.includes('launchpad')) {
            setTitle('Launchpad')
            setCouner(false);
        } else if (path.includes('payroll')) {
            setTitle('Payroll')
            setCouner(false);
        } else if (path.includes('payyit-plus')) {
            setTitle('Finance Plus')
            setCouner(false);
            setCounerDate("2020-12-15T12:00:00-06:30")
        } else if (path.includes('reports')) {
            setTitle('Reports');
            // setCouner(true);
            // setCounerDate("2020-07-15T12:00:00-06:30")
        } else if (path.includes('reviews')) {
            setTitle('Reviews');
            // setCouner(true);
            // setCounerDate("2020-07-15T12:00:00-06:30")
        } else if (path.includes('working-capitals')) {
            setCouner(false);
            setTitle('Working Capital')
        } else if (path.includes('appointments')) {
            setTitle('Appointments');
        }
    }, [props.match])



    return (
        <div className={`${title.replace(" ", "-").toLowerCase()}-commingsoon content-wrapper__main estimate`}>
            <header className="py-header--page flex">
                <div className="py-header--title">
                    <h1 className="py-heading--title">{title}</h1>
                </div>
            </header>
            <ComingSoon isCounter={counter} counterDate={counterDate} title={title} />
        </div>
    )
}

export default Index;