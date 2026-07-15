import React, { Fragment, useState, useEffect } from 'react'
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import CenterSpinner from '../../../../../../../global/CenterSpinner';
import Table from './table';

const TablePayout = (props) => {
    const [activeTab, setActiveTab] = useState('1');
    const [payouts, setPayouts] = useState([])

    useEffect(() => {
        if (props.data && props.data.payouts) {
            props.data.payouts.map((element, idx) => {
                return element.id = idx;
            });
            setPayouts(props.data.payouts);
        }
    }, [props.data && props.data.payouts])

    const toggleTabs = tab => {
        const pData = JSON.parse(localStorage.getItem('paginationData'))
        props.getAllPayout(`pageNo=1&pageSize=${pData && pData.limit ? pData.limit : 10}?type=${tab === '1' ? 'upcomming' : 'history'}`);
        setActiveTab(tab);
    }

    const handlgePagination = (data) => {
        const queryData = props.handlePayoutURL();
        props.getAllPayout(`pageNo=${data.page}&pageSize=${data.sizePerPage}${queryData ? `&${queryData}` : ''}?type=${activeTab === '1' ? 'upcomming' : 'history'}`);
    }

    return (
        <Fragment>
            <div className={!props.isUnderPaymentSection ? "Margin__t-32" : ""}>
                {/* <Nav tabs>
                    <NavItem>
                        <NavLink active={activeTab === '1'} onClick={() => toggleTabs('1')}>Upcoming</NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink active={activeTab === '2'} onClick={() => toggleTabs('2')}>History</NavLink>
                    </NavItem>
                </Nav> */}
            </div>
            <TabContent activeTab={activeTab}>
                <TabPane tabId="1">
                    {props.loading ? <CenterSpinner />
                        : <Table
                            handlgePagination={handlgePagination}
                            payouts={payouts}
                            {...props} />}
                </TabPane>
                <TabPane tabId="2">
                    {props.loading ? <CenterSpinner />
                        :
                        <Table
                            handlgePagination={handlgePagination}
                            payouts={payouts}
                            {...props} />}
                </TabPane>
            </TabContent>
        </Fragment>
    )
}

export default TablePayout
