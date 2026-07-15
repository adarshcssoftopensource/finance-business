import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { connect, useDispatch } from 'react-redux'
import { get } from 'lodash'

import {
  fetchAgedPayables,
  fetchOwingBills,
} from '../../../../../api/DashboardService'
import {
  ButtonDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from 'reactstrap'
import CenterSpinner from '../../../../../global/CenterSpinner'
import { getUserById } from '../../../../../api/profileService'
import { fetchSalesSetting } from '../../../../../api/SettingService'
import { fetchBusinessById } from '../../../../../api/businessService'
import { openGlobalSnackbar } from '../../../../../actions/snackBarAction'
import { downloadBlobAsPDF, downloadPDFBlob } from '../../../../../api/reportService'
import { downloadBlobFile } from './constant'

const AgedPayablesReport = ({ isAgedPayablesExportEnabled }) => {
  const [endDate, setDate] = useState(moment(new Date()).endOf('day').toDate())
  const [isDropdownOpen, setDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [agedPayablesData, setAgedPayablesData] = useState([])
  const [totalPayablesPerDuration, setTotalPayablesPerDuration] = useState([])
  const [userSettings, setUserSettings] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);
  const [businessData , setBusinessData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const currency = agedPayablesData?.currency?.symbol
  const agedPayables = agedPayablesData?.payableData
  const totalPayablesPerVendor = agedPayablesData?.totalPerVendor
  const totalPayables = agedPayablesData?.grossTotal
  const dispatch = useDispatch()

  useEffect(async () => {
    setLoading(true)
    const response = await fetchAgedPayables(endDate)
    const perDurationPayables = await fetchOwingBills()
    if (response) {
      setAgedPayablesData(response?.data)
      setLoading(false)
    }
    if (perDurationPayables) {
      setTotalPayablesPerDuration(perDurationPayables?.data?.data)
    }
  }, [endDate])

  const handleDateChange = (date) => {
    setDate(date)
  }

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen)
  }

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
          setUserData(response?.data);
        } else {
          setUserData(null);
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
  setBtnLoading(true);
  setDownloadLoading(true);
  dispatch(openGlobalSnackbar('Preparing CSV download...', false));

  const headers = [
    'Vendor',
    'Not Yet Overdue',
    '30 or Less',
    '31 to 60',
    '61 to 90',
    '91 or More',
    'Total Unpaid'
  ];

  const vendorsData = {};
  agedPayables?.forEach(payable => {
    if (!vendorsData[payable._id]) {
      vendorsData[payable._id] = {
        vendor: payable.vendor,
        '0': 0,
        '30': 0,
        '60': 0,
        '90': 0,
        '>90': 0,
        total: getTotalDueAmountPerVendor(payable._id) || 0
      };
    }
    vendorsData[payable._id][payable.timeSpan] = payable.dueAmount;
  });

  const rows = Object.values(vendorsData).map(vendor => [
    vendor.vendor,
    vendor['0'],
    vendor['30'],
    vendor['60'],
    vendor['90'],
    vendor['>90'],
    vendor.total
  ]);

  const totalsRow = [
    'Total Unpaid',
    totalPayablesPerDuration?.[0]?.amount || 0,
    totalPayablesPerDuration?.[1]?.amount || 0,
    totalPayablesPerDuration?.[2]?.amount || 0,
    totalPayablesPerDuration?.[3]?.amount || 0,
    totalPayablesPerDuration?.[4]?.amount || 0,
    totalPayables?.[0]?.total || 0
  ];

  const csvData = [headers, ...rows, totalsRow];
  const csvContent = csvData.map(row =>
    row.map(item => `"${item}"`).join(',')
  ).join('\n');

  const date = new Date().toISOString().split('T')[0];
  downloadBlobFile(csvContent, `Aged_Payables_${date}.csv`);

  dispatch(openGlobalSnackbar('CSV downloaded successfully!', false));
  setDownloadLoading(false);
  setBtnLoading(false);
};

      
      const downloadPDF = async () => {
     try {
       setDownloadLoading(true);
       setBtnLoading(true);
       setDropdownOpen(false);
       dispatch(openGlobalSnackbar('Preparing PDF download...', false));
   
       const res = await downloadPDFBlob({
         reportType: 'agedPayables',
         salesSetting: userSettings,
         businessData: businessData,
         userData: userData,
         reportData: agedPayablesData,
       });
   
       if (res?.data) {
      downloadBlobAsPDF(res.data, 'Aged_Payables');
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

  const getTotalDueAmountPerVendor = (payableId) => {
    return totalPayablesPerVendor?.find(
      (totalPayable) => totalPayable._id === payableId
    )?.totalAmount
  }

  return (
    <div className="reports-page-wrapper">
      <div className="content-wrapper__main__fixed">
        <header className="py-header--page d-flex flex-wrap">
          <div className="py-header--title">
            <h2 className="py-heading--title">Aged Payables</h2>
          </div>
          {isAgedPayablesExportEnabled && (
            <div className="py-header--actions">
             <ButtonDropdown isOpen={isDropdownOpen} toggle={toggleDropdown}>
              <DropdownToggle caret color="primary" disabled={downloadLoading }>
                {downloadLoading  ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  'Export'
                )}
              </DropdownToggle>
                <DropdownMenu className="dropdown-menu-center">
                  <DropdownItem disabled={downloadLoading} onClick={downloadCSV} className="dropdown-menu-item-export">
                    CSV
                  </DropdownItem>
                  <DropdownItem disabled={downloadLoading} onClick={downloadPDF} className="dropdown-menu-item-export">
                    PDF
                  </DropdownItem>
                </DropdownMenu>
              </ButtonDropdown>
            </div>
          )}
        </header>
        {/* <div className="mt-2 mb-2">
          <Filter
            handleDateChange={handleDateChange}
            endDate={endDate}
          />
        </div> */}
        {loading ? (
          <CenterSpinner />
        ) : (
          <div className="content">
            <div>
              <table className="py-table">
                <thead className="py-table__header">
                  <tr className="py-table__row text-uppercase">
                    <th className="py-table__cell" colSpan={3} />
                    <th className="py-table__cell" colSpan={4}>
                      <div className="">Number of Days Overdue</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="py-table__rowgroup">
                  <tr className="py-table__row--header">
                    <td className="py-table__cell"></td>
                    <td className="py-table__cell text-center">
                      Not Yet Overdue
                    </td>
                    <td className="py-table__cell text-center is-item-highlighted">
                      30 or Less
                    </td>
                    <td className="py-table__cell text-center is-item-highlighted">
                      31 to 60
                    </td>
                    <td className="py-table__cell text-center is-item-highlighted">
                      61 to 90
                    </td>
                    <td className="py-table__cell text-center is-item-highlighted">
                      91 or More
                    </td>
                    <td className="py-table__cell text-center">Total Unpaid</td>
                  </tr>
                  {agedPayables?.map((payable, index) =>
                    payable.dueAmount ? (
                      <tr className="py-table__row" key={index}>
                        <td className="py-table__cell text-capitalize">
                          {payable.vendor}
                        </td>
                        <td className="py-table__cell text-center">
                          {payable.timeSpan === '0'
                            ? `${currency}${parseFloat(
                                payable.dueAmount
                              ).toFixed(2)}`
                            : ''}
                        </td>
                        <td className="py-table__cell text-center is-item-highlighted">
                          {payable.timeSpan === '30'
                            ? `${currency}${parseFloat(
                                payable.dueAmount
                              ).toFixed(2)}`
                            : ''}
                        </td>
                        <td className="py-table__cell text-center is-item-highlighted">
                          {payable.timeSpan === '60'
                            ? `${currency}${parseFloat(
                                payable.dueAmount
                              ).toFixed(2)}`
                            : ''}
                        </td>
                        <td className="py-table__cell text-center is-item-highlighted">
                          {payable.timeSpan === '90'
                            ? `${currency}${parseFloat(
                                payable.dueAmount
                              ).toFixed(2)}`
                            : ''}
                        </td>
                        <td className="py-table__cell text-center is-item-highlighted">
                          {payable.timeSpan === '>90'
                            ? `${currency}${parseFloat(
                                payable.dueAmount
                              ).toFixed(2)}`
                            : ''}
                        </td>
                        <td className="py-table__cell text-center">
                          {currency}
                          {parseFloat(
                            getTotalDueAmountPerVendor(payable._id)
                          ).toFixed(2)}
                        </td>
                      </tr>
                    ) : (
                      ''
                    )
                  )}
                  <tr className="py-table__row--total">
                    <td className="py-table__cell text-left" colSpan="1">
                      <div className="">Total Unpaid</div>
                    </td>
                    <td className="py-table__cell--grandtotal text-center">
                      {currency}
                      {parseFloat(
                        totalPayablesPerDuration?.[0]?.amount
                      ).toFixed(2)}
                    </td>
                    <td className="py-table__cell--grandtotal text-center is-item-highlighted">
                      {currency}
                      {parseFloat(
                        totalPayablesPerDuration?.[1]?.amount
                      ).toFixed(2)}
                    </td>
                    <td className="py-table__cell--grandtotal text-center is-item-highlighted">
                      {currency}
                      {parseFloat(
                        totalPayablesPerDuration?.[2]?.amount
                      ).toFixed(2)}
                    </td>
                    <td className="py-table__cell--grandtotal text-center is-item-highlighted">
                      {currency}
                      {parseFloat(
                        totalPayablesPerDuration?.[3]?.amount
                      ).toFixed(2)}
                    </td>
                    <td className="py-table__cell--grandtotal text-center is-item-highlighted">
                      {currency}
                      {parseFloat(
                        totalPayablesPerDuration?.[4]?.amount
                      ).toFixed(2)}
                    </td>
                    <td className="py-table__cell--grandtotal text-center">
                      {currency}
                      {parseFloat(totalPayables?.[0]?.total || 0).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const mapStateToProps = ({ settings: { featureFlags } = {} }) => {
  const isAgedPayablesExportEnabled = get(featureFlags, 'reports.agedPayablesExport', 'true') === 'true';
  return {
    isAgedPayablesExportEnabled
  }
}

export default connect(mapStateToProps)(AgedPayablesReport)
