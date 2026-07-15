import React, { useEffect, useState } from 'react'
import moment from 'moment';
import { get } from 'lodash';
import { connect, useDispatch } from 'react-redux';
import Filter from './Filter';
import { fetchIncomeByCustomers } from '../../../../../api/DashboardService';
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'
import CenterSpinner from '../../../../../global/CenterSpinner';
import { _formatDate } from '../../../../../utils/globalMomentDateFunc';
import { fetchBusinessById } from '../../../../../api/businessService';
import { getUserById } from '../../../../../api/profileService';
import { fetchSalesSetting } from '../../../../../api/SettingService';
import { openGlobalSnackbar } from '../../../../../actions/snackBarAction';
import { downloadBlobAsPDF, downloadPDFBlob } from '../../../../../api/reportService';
import { downloadBlobFile } from './constant';


const IncomeByCustomersReport = ({isCustomerIncomeExportEnabled}) => {
  const [startDate, setStartDate] = useState(moment()
    .toDate());
  const [endDate, setEndDate] = useState(moment().toDate());
  const [customDate, setCustomDate] = useState('');
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [incomeByCustomersData, setIncomeByCustomersData] = useState([]);
    const [userSettings, setUserSettings] = useState(null);
    const [btnLoading, setBtnLoading] = useState(false);
    const [businessData , setBusinessData] = useState(null);
    const [userData, setuserData] = useState(null);
    const [downloadLoading, setDownloadLoading] = useState(false);
    const dispatch = useDispatch();

  useEffect(async () => {
    setLoading(true);
    const response = await fetchIncomeByCustomers(startDate, endDate);
    if (response) {
      setIncomeByCustomersData(response?.data);
      setLoading(false);
    }
  }, [startDate, endDate]);

   const handleDateChange = (date, type) => {
      const fromDate =  date?.value?.startDate ?? moment().startOf('year').toDate();
      const toDate = date?.value?.endDate ?? moment().endOf('year').toDate();
      if (type === 'startDate') {
        const fromDate = date ? _formatDate(date) : customDate?.value?.startDate;
        setStartDate(fromDate);
      } else if (type === 'endDate') {
        const toDate = date ? _formatDate(date) : customDate?.value?.endDate ?? new Date();
        setEndDate(toDate);
      } else if (type === 'custom') {
        if (date?.value) {
          setStartDate(date.value.startDate || fromDate);
          setEndDate(date.value.endDate || toDate);
        } else {
          setStartDate(fromDate);
          setEndDate(toDate);
        }
        setCustomDate(date);
      }
    };

      const fetchBusinesData = async () => {
        const businessId = localStorage.getItem('businessId');
        let response = await fetchBusinessById(businessId)
        if (response) {
          setBusinessData(response?.data.business);
        } else {
          setBusinessData(null);
        }
    
      }
    
    
      const fetchUserData = async () => {
        const userId = localStorage.getItem('user.id');
        let response = await getUserById(userId)
        if (response) {
          setuserData(response?.data);
        } else {
          setuserData(null);
        }
    
      }
    
      const fetchSettingData = async () => {
        try {
          const settingResponse = await fetchSalesSetting();
          const userSettings = settingResponse.data.salesSetting;
          setUserSettings(userSettings);
        } catch (error) {
          if (error) {
            console.error('Error fetching settings:', error.message);
          }
        }
      };
    
      useEffect(() => {
        fetchSettingData();
        fetchBusinesData();
        fetchUserData();
      }, [])

     const downloadCSV = () => {
  if (!incomeByCustomers) return;
  setDownloadLoading(true);
  dispatch(openGlobalSnackbar('Preparing CSV download...', false));

  const headers = ['Customer', 'Total Amount', 'Paid Amount'];
  const rows = incomeByCustomers.map(item => [
    `"${item.customer}"`,
    `"${item.totalAmount}"`,
    `"${item.paidAmount}"`
  ]);

  const total = (totalIncome ?? 0).toFixed(2);
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
    `Total Income,,${total}`
  ].join('\n');

  const date = new Date().toISOString().split('T')[0];
  downloadBlobFile(csvContent, `IncomeByCustomers-${date}.csv`);

  dispatch(openGlobalSnackbar('CSV downloaded successfully!', false));
  setDownloadLoading(false);
};
      

      const downloadPDF = async () => {
        try {
          setDownloadLoading(true);
            dispatch(openGlobalSnackbar('Preparing PDF download...', false));
          const type = 'incomeByCustomer';
          const salesSetting = userSettings || {};
          const businessId = businessData || "";
          const report = {...incomeByCustomersData , type} || [];
          const user = userData || {};
      
          const data = { salesSetting, businessId, userInfo: user , report };
      
          const res = await downloadPDFBlob({
            reportType: type,
            salesSetting,
            businessData: businessId,
            userData: user,
            reportData: report
          });
          
      
         if (res?.data) {
                   downloadBlobAsPDF(res.data, 'IncomeByCustomers');
                   dispatch(openGlobalSnackbar('PDF downloaded successfully!', false));
                 } else {
                   throw new Error('No PDF data received.');
                 }
        } catch (err) {
          dispatch(openGlobalSnackbar('PDF download failed. Please try again.', true));
          console.error(err);
          setDownloadLoading(false);
        }
      };


      const resetFilters = () => {
        const todayStart = moment().startOf('day').toDate(); // Start of today (00:00:00)
        const todayEnd = moment().endOf('day').toDate(); // End of today (23:59:59)
      
        setStartDate(todayStart);
        setEndDate(todayEnd);
        setCustomDate(null);  // Optionally reset custom date selection
      };

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const currency = incomeByCustomersData?.currency?.symbol;
  const totalIncome = incomeByCustomersData?.totalIncome;
  const incomeByCustomers = incomeByCustomersData?.breakdown;
  return (
    <div className="reports-page-wrapper">
      <div className="content-wrapper__main__fixed">
        <header className="py-header--page d-flex flex-wrap">
          <div className="py-header--title"><h2 className="py-heading--title">Income by Customers</h2></div>
          {isCustomerIncomeExportEnabled &&
            <div className='py-header--actions'>
              <ButtonDropdown isOpen={isDropdownOpen} toggle={toggleDropdown}>
                 <DropdownToggle caret color="primary" disabled={downloadLoading }>
                                  {downloadLoading  ? (
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                  ) : (
                                    'Export'
                                  )}
                                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-center">
                  <DropdownItem disabled={downloadLoading} onClick={downloadCSV} className="dropdown-menu-item-export">CSV</DropdownItem>
                  <DropdownItem disabled={downloadLoading} onClick={downloadPDF}  className="dropdown-menu-item-export">PDF</DropdownItem>
                </DropdownMenu>
              </ButtonDropdown>
            </div>
          }
        </header>
        <div className="mt-2 mb-2">
          <Filter
            handleDateChange={handleDateChange}
            resetFilters={resetFilters}
            startDate={startDate}
            endDate={endDate}
            customDate={customDate}
            showCustom
          />
        </div>
        {loading ? <CenterSpinner /> :
          <div className='content'>
            <div>
              <table className="py-table">
                <colgroup>
                  <col style={{ width: "65%" }} />
                  <col style={{ width: "35%" }} />
                </colgroup>
                <thead className="py-table__header">
                  <tr className="py-table__row text-uppercase">
                    <th className="py-table__cell" colSpan="1"><div className="">Customers</div></th>
                    <th className="py-table__cell text-right" colSpan="1">
                      All Income
                    </th>
                  </tr>
                </thead>
                <tbody className="py-table__rowgroup">
                  <tr className="py-table__row--header">
                    <td className="py-table__cell" colSpan="2"><div className="">Income</div></td>
                  </tr>
                  {incomeByCustomers?.map((income, index) => (
                    <tr className="py-table__row" key={index}>
                      <td className="py-table__cell text-capitalize" colSpan="1"><div className="">{income.customer}</div></td>
                      <td className="py-table__cell text-right" colSpan="1">{currency}{income.totalAmount}</td>
                    </tr>
                  ))}
                  <tr className="py-table__row--total">
                    <td className="py-table__cell" colSpan="1"><div className="">Total Income</div></td>
                    <td className="py-table__cell--grandtotal" colSpan="1">
                      {currency}{(totalIncome ? totalIncome.toFixed(2) : "0.00")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>
    </div>
  )
}

const mapStateToProps = ({ settings: { featureFlags } = {} }) => {
  const isCustomerIncomeExportEnabled = get(featureFlags, 'reports.customerIncomeExport', 'true') === 'true';
  return {
    isCustomerIncomeExportEnabled
  }
}

export default connect(mapStateToProps)(IncomeByCustomersReport);
