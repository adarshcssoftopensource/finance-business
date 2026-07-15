import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { get } from 'lodash'
import { connect, useDispatch } from 'react-redux'
import {
  fetchAgedReceivables,
  fetchPayableInvoices,
} from '../../../../../api/DashboardService'
import {
  ButtonDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from 'reactstrap'
import CenterSpinner from '../../../../../global/CenterSpinner'
import { fetchSalesSetting } from '../../../../../api/SettingService'
import { fetchBusinessById } from '../../../../../api/businessService'
import { getUserById } from '../../../../../api/profileService'
import { openGlobalSnackbar } from '../../../../../actions/snackBarAction'
import { downloadBlobAsPDF, downloadPDFBlob } from '../../../../../api/reportService'
import { downloadBlobFile } from './constant'

const AgedReceivablesReport = ({ isAgedReceivablesExportEnabled }) => {
  const [endDate, setDate] = useState(moment(new Date()).endOf('day').toDate())
  const [isDropdownOpen, setDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [agedReceivablesData, setAgedReceivablesData] = useState([])
  const [totalReceivablesPerDuration, setTotalReceivablesPerDuration] =
    useState([])
  const [userSettings, setUserSettings] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);
  const [businessData , setBusinessData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const currency = agedReceivablesData?.currency?.symbol
  const agedReceivables = agedReceivablesData?.incomeData
  const totalReceivablesPerCustomer = agedReceivablesData?.totalPerCustomer
  const totalReceivables = agedReceivablesData?.grossTotal
  const dispatch = useDispatch()

  useEffect(async () => {
    setLoading(true)
    const response = await fetchAgedReceivables(endDate)
    const perDurationReceivables = await fetchPayableInvoices()
    if (response) {
      setAgedReceivablesData(response?.data)
      setLoading(false)
    }
    if (perDurationReceivables) {
      setTotalReceivablesPerDuration(perDurationReceivables?.data?.data)
    }
  }, [endDate])

  const handleDateChange = (date) => {
    setDate(date)
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

  const downloadCSV = () => {
  try {
    setBtnLoading(true);
    setDownloadLoading(true);
    dispatch(openGlobalSnackbar('Preparing CSV download...', false));

    const headers = [
      'Customer',
      'Not Yet Overdue',
      '30 or Less',
      '31 to 60',
      '61 to 90',
      '91 or More',
      'Total Unpaid'
    ].join(',');

    const customers = {};

    agedReceivables?.forEach(item => {
      const id = item._id;
      const timeSpan = item.timeSpan;

      if (!customers[id]) {
        customers[id] = {
          customer: `"${item.customer?.replace(/"/g, '""') || ''}"`, // Escape quotes
          '0': 0,
          '30': 0,
          '60': 0,
          '90': 0,
          '>90': 0,
          total: getTotalDueAmountPerCustomer(id) || 0
        };
      }

      if (customers[id][timeSpan] !== undefined) {
        customers[id][timeSpan] = item.dueAmount;
      }
    });

    const rows = Object.values(customers).map(customer =>
      [
        customer.customer,
        customer['0'].toFixed(2),
        customer['30'].toFixed(2),
        customer['60'].toFixed(2),
        customer['90'].toFixed(2),
        customer['>90'].toFixed(2),
        customer.total.toFixed(2)
      ].join(',')
    );

    const totalsRow = [
      '"Total Unpaid"',
      (totalReceivablesPerDuration?.[0]?.amount || 0).toFixed(2),
      (totalReceivablesPerDuration?.[1]?.amount || 0).toFixed(2),
      (totalReceivablesPerDuration?.[2]?.amount || 0).toFixed(2),
      (totalReceivablesPerDuration?.[3]?.amount || 0).toFixed(2),
      (totalReceivablesPerDuration?.[4]?.amount || 0).toFixed(2),
      (totalReceivables?.[0]?.total || 0).toFixed(2)
    ].join(',');

    const csvContent = [headers, ...rows, totalsRow].join('\n');
    const date = new Date().toISOString().split('T')[0];
    const fileName = `AgedReceivables_${date}.csv`;

    downloadBlobFile(csvContent, fileName);
    dispatch(openGlobalSnackbar('CSV downloaded successfully!', false));
  } catch (error) {
    console.error('Error generating CSV:', error);
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
      reportType: 'agedReceivables',
      salesSetting: userSettings,
      businessData: businessData,
      userData: userData,
      reportData: agedReceivablesData,
    });

      if (res?.data) {
          downloadBlobAsPDF(res.data, 'Aged_Receivables');
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
    setDropdownOpen(!isDropdownOpen)
  }

  const getTotalDueAmountPerCustomer = (receivableId) => {
    return totalReceivablesPerCustomer?.find(
      (totalReceivable) => totalReceivable._id === receivableId
    )?.totalAmount
  }

  return (
    <div className="reports-page-wrapper">
      <div className="content-wrapper__main__fixed">
        <header className="py-header--page d-flex flex-wrap">
          <div className="py-header--title">
            <h2 className="py-heading--title">Aged Receivables</h2>
          </div>
          {isAgedReceivablesExportEnabled && (
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
                  {agedReceivables?.map((receivable, index) =>
                    receivable.dueAmount ? (
                      <tr className="py-table__row" key={index}>
                        <td className="py-table__cell text-capitalize">
                          {receivable.customer}
                        </td>
                        <td className="py-table__cell text-center">
                          {receivable.timeSpan === '0'
                            ? `${currency}${parseFloat(
                                receivable.dueAmount
                              ).toFixed(2)}`
                            : ''}
                        </td>
                        <td className="py-table__cell text-center is-item-highlighted">
                          {receivable.timeSpan === '30'
                            ? `${currency}${parseFloat(
                                receivable.dueAmount
                              ).toFixed(2)}`
                            : ''}
                        </td>
                        <td className="py-table__cell text-center is-item-highlighted">
                          {receivable.timeSpan === '60'
                            ? `${currency}${parseFloat(
                                receivable.dueAmount
                              ).toFixed(2)}`
                            : ''}
                        </td>
                        <td className="py-table__cell text-center is-item-highlighted">
                          {receivable.timeSpan === '90'
                            ? `${currency}${parseFloat(
                                receivable.dueAmount
                              ).toFixed(2)}`
                            : ''}
                        </td>
                        <td className="py-table__cell text-center is-item-highlighted">
                          {receivable.timeSpan === '>90'
                            ? `${currency}${parseFloat(
                                receivable.dueAmount
                              ).toFixed(2)}`
                            : ''}
                        </td>
                        <td className="py-table__cell text-center">
                          {currency}
                          {parseFloat(
                            getTotalDueAmountPerCustomer(receivable._id)
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
                        totalReceivablesPerDuration?.[0]?.amount
                      ).toFixed(2)}
                    </td>
                    <td className="py-table__cell--grandtotal text-center is-item-highlighted">
                      {currency}
                      {parseFloat(
                        totalReceivablesPerDuration?.[1]?.amount
                      ).toFixed(2)}
                    </td>
                    <td className="py-table__cell--grandtotal text-center is-item-highlighted">
                      {currency}
                      {parseFloat(
                        totalReceivablesPerDuration?.[2]?.amount
                      ).toFixed(2)}
                    </td>
                    <td className="py-table__cell--grandtotal text-center is-item-highlighted">
                      {currency}
                      {parseFloat(
                        totalReceivablesPerDuration?.[3]?.amount
                      ).toFixed(2)}
                    </td>
                    <td className="py-table__cell--grandtotal text-center is-item-highlighted">
                      {currency}
                      {parseFloat(
                        totalReceivablesPerDuration?.[4]?.amount
                      ).toFixed(2)}
                    </td>
                    <td className="py-table__cell--grandtotal text-center">
                      {currency}
                      {parseFloat(totalReceivables?.[0]?.total || 0).toFixed(2)}
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
  const isAgedReceivablesExportEnabled =
    get(featureFlags, 'reports.agedReceivablesExport', 'true') === 'true'
  return {
    isAgedReceivablesExportEnabled,
  }
}

export default connect(mapStateToProps)(AgedReceivablesReport)
