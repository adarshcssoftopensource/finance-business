import React, { useEffect, useState } from 'react'
import moment from 'moment';
import { get } from 'lodash';
import { connect, useDispatch } from 'react-redux';
import Filter from './Filter';
import { fetchCashFlow } from '../../../../../api/DashboardService';
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'
import CenterSpinner from '../../../../../global/CenterSpinner';
import { _formatDate } from '../../../../../utils/globalMomentDateFunc';
import { fetchSalesSetting } from '../../../../../api/SettingService';
import { fetchBusinessById } from '../../../../../api/businessService';
import { getUserById } from '../../../../../api/profileService';
import { openGlobalSnackbar } from '../../../../../actions/snackBarAction';
import { downloadBlobAsPDF, downloadPDFBlob } from '../../../../../api/reportService';
import { downloadBlobFile } from './constant';


const CashFlowReport = ({isCashFlowExportEnabled}) => {
  const [startDate, setStartDate] = useState(moment().toDate());
  const [endDate, setEndDate] = useState(moment().toDate());
  const [customDate, setCustomDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [cashFlowData, setCashFlowData] = useState([]);
  const [userSettings, setUserSettings] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);
  const [businessData , setBusinessData] = useState(null);
  const [userData, setuserData] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const dispatch = useDispatch();


  useEffect(async () => {
    setLoading(true);
    const response = await fetchCashFlow('', startDate, endDate);
    if (response) {
      setCashFlowData(response?.data);
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
      if (error?.data) {
        console.error('Error fetching settings:', error.message);
      }
    }
  };

  useEffect(() => {
    fetchSettingData();
    fetchBusinesData();
    fetchUserData();
  }, [])

  const resetFilters = () => {
    const todayStart = moment().startOf('day').toDate(); // Start of today (00:00:00)
    const todayEnd = moment().endOf('day').toDate(); // End of today (23:59:59)
  
    setStartDate(todayStart);
    setEndDate(todayEnd);
    setCustomDate(null);  // Optionally reset custom date selection
  };
  
 const downloadCSV = () => {
  if (!cashFlowData?.values) return;

  try {
    setBtnLoading(true);
    setDownloadLoading(true);
    dispatch(openGlobalSnackbar('Preparing CSV download...', false));

    // Coerce values to numbers safely
    const inflow = Number(cashFlowData.values.inflow || 0);
    const outflow = Number(cashFlowData.values.outflow || 0);
    const netChange = Number(cashFlowData.values.netChange || 0);

    const headers = ['Sales ', 'Purchases', 'Net Cash from Operating Activities'];
    const values = [
      inflow.toFixed(2),
      outflow.toFixed(2),
      netChange.toFixed(2)
    ];

    const csvContent = [headers, values]
      .map(row => row.join(','))
      .join('\n');

    const date = new Date().toISOString().split('T')[0];
    const fileName = `Cashflow_${date}.csv`;

    downloadBlobFile(csvContent, fileName);
    dispatch(openGlobalSnackbar('CSV downloaded successfully!', false));
  } catch (error) {
    console.error('Error generating cash flow CSV:', error);
    dispatch(openGlobalSnackbar('CSV download failed', true));
  } finally {
    setDownloadLoading(false);
    setBtnLoading(false);
  }
};


  
const downloadPDF = async () => {
  try {
    setDownloadLoading(true);
    setBtnLoading(true);
    setDropdownOpen(false);
    dispatch(openGlobalSnackbar('Preparing PDF download...', false));

    const res = await downloadPDFBlob({
      reportType: 'cashflow',
      salesSetting: userSettings,
      businessData: businessData,
      userData: userData,
      reportData: cashFlowData
    });

   if (res?.data) {
      downloadBlobAsPDF(res.data, 'Cashflow');
      dispatch(openGlobalSnackbar('PDF downloaded successfully!', false));
           } else {
      throw new Error('No PDF data received.');
           }
  } catch (err) {
    dispatch(openGlobalSnackbar('PDF download failed.', true));
    console.error('PDF download failed:', err);
  } finally {
    setDownloadLoading(false);
    setBtnLoading(false);
  }
};
  
  

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const currency = cashFlowData?.currency?.symbol;
  const cashFlow = cashFlowData?.values;
  const cashInFlow = currency+cashFlow?.inflow;
  const cashOutFlow = currency+cashFlow?.outflow;
  const cashNetChange = currency+cashFlow?.netChange;
  const isProfit = cashFlow?.netChange > 0;

  return (
    <div className="reports-page-wrapper">
      <div className="content-wrapper__main__fixed">
        <header className="py-header--page d-flex flex-wrap">
          <div className="py-header--title"><h2 className="py-heading--title">Cash Flow</h2></div>
          {isCashFlowExportEnabled &&
            <div className='py-header--actions'>
              <ButtonDropdown isOpen={isDropdownOpen} toggle={toggleDropdown}>
                <DropdownToggle caret color="primary" disabled={btnLoading}>
                  {btnLoading ? (
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
            <div className="cash-flow-overview--single">
              <div className="cash-flow-overview--single__block">
                <p className="py-text--block-label">GROSS CASH INFLOW</p>
                <span className="py-number--positive py-number">{cashInFlow}</span>
              </div>
              <h1 className="py-heading--title">-</h1>
              <div className="cash-flow-overview--single__block">
                <p className="py-text--block-label">GROSS CASH OUTFLOW</p>
                <span className="py-number--negative py-number">{cashOutFlow}</span>
              </div>
              <h1 className="py-heading--title">=</h1>
              <div className="cash-flow-overview--single__block">
                <p className="py-text--block-label">NET CASH CHANGE</p>
                <span className={`py-number--${isProfit ? 'positive' : 'negative'} py-number`}>{cashNetChange}</span>
              </div>
            </div>
            <div>
              <div>
                <table className="py-table">
                  <colgroup>
                    <col style={{ width: "65%" }} />
                    <col style={{ width: "35%" }} />
                  </colgroup>
                  <thead className="py-table__header">
                    <tr className="py-table__row">
                      <th className="py-table__cell" colSpan="1"><div className="">CASH INFLOW AND OUTFLOW</div></th>
                      <th className="py-table__cell text-right" colSpan="1">
                        <div className="">{moment(startDate).format('MMM DD, YYYY')}</div>
                        <div className="">to {moment(endDate).format('MMM DD, YYYY')}</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="py-table__rowgroup">
                    <tr className="py-table__row--header">
                      <td className="py-table__cell" colSpan="2"><div className="">Operating Activities</div></td>
                    </tr>
                    {cashInFlow &&
                      <tr className="py-table__row">
                        <td className="py-table__cell" colSpan="1"><div className="">Sales</div></td>
                        <td className="py-table__cell--grandtotal" colSpan="1"><div className="">{cashInFlow}</div></td>
                      </tr>
                    }
                    {cashOutFlow &&
                      <tr className="py-table__row">
                        <td className="py-table__cell" colSpan="1"><div className="">Purchases</div></td>
                        <td className="py-table__cell--grandtotal" colSpan="1"><div className="">{cashOutFlow}</div></td>
                      </tr>
                    }
                    {cashNetChange &&
                      <tr className="py-table__row--total">
                        <td className="py-table__cell" colSpan="1"><div className="">Net Cash from Operating Activities</div></td>
                        <td className="py-table__cell--grandtotal" colSpan="1"><div className="">{cashNetChange}</div></td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  )
}

const mapStateToProps = ({ settings: { featureFlags } = {} }) => {
  const isCashFlowExportEnabled = get(featureFlags, 'reports.cashFlowExport', 'true') === 'true';
  return {
    isCashFlowExportEnabled
  }
}

export default connect(mapStateToProps)(CashFlowReport);
