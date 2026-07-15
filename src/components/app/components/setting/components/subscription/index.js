import React, { useEffect, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import BrowserTabTitle from '../../../../../../global/browserTabTitle'
import CenterSpinner from '../../../../../../global/CenterSpinner'
import CurrentPlanCard from './currentPlanCard'
import InvoiceCardDetail from './invoiceCardDetail'
import UpcomingPlan from './upcomingPlan'
import BillingHistory from './billingHistory'
import StarterPlan from './starterPlan'
import { _downloadPDF } from "../../../../../../utils/GlobalFunctions";
import ExportPdfModal from "../../../../../../utils/PopupModal/ExportPdfModal";
import { _formatDate } from "../../../../../../utils/globalMomentDateFunc";
import { openGlobalSnackbar } from '../../../../../../actions/snackBarAction';
import { getActiveSubscriptionPlan, getSubscriptionBilling } from '../../../../../../actions/subscriptionActions';
import { useLocation } from 'react-router-dom';

const Index = (props) => {
  const location = useLocation();
  const fromUpdatePage = location?.state === 'update'

  const subscription = useSelector(state => state?.subscriptionReducer)
  const isFetching = subscription?.subscriptionLoading || subscription?.billingLoading

  const activeSubscription = subscription?.activeSubscription
  const billingHistory = subscription?.billing

  const activePlan = activeSubscription?.current
  const upcomingPlan = activeSubscription?.upcoming

  const [openExportModal, setOpenExportModal] = useState(false)
  const [loader, setLoader] = useState(fromUpdatePage ? true : isFetching)
  const [btnLoading, setBtnLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [pdfData, setPdfData] = useState({})
  const dispatch = useDispatch()

  useEffect(() => {
    if (!fromUpdatePage) {
      initCall()
    }
    const timer = setTimeout(async () => {
      initCall(() => {
        setLoader(false)
      })
    }, 5000);
    return () => clearTimeout(timer);
  }, [fromUpdatePage])

  const initCall = (stopLoading) => {
    dispatch(getActiveSubscriptionPlan())
    dispatch(getSubscriptionBilling())
    if (stopLoading) {
      stopLoading();
    }
  }

  const openPdfModal = (data) => {
    setOpenExportModal(true)
    setPdfData(data)
  }

  const exportPDF = async () => {
    try {
      setBtnLoading(true)
      setOpenExportModal(true)
      const date = _formatDate(new Date())

      let link = await _downloadPDF(
        { subscriptionId: pdfData.subscriptionId, paymentId: pdfData._id },
        'subscription'
      )
      if (!!link) {
        setOpenExportModal(false)
        setDownloadLoading(false)
        link.download = `Subscription_${pdfData.paymentId}_${date}.pdf`
        link.click()
        setOpenExportModal(false)
      } else {
        props.openGlobalSnackbar(
          'Failed to download PDF. Please try again after sometime.',
          true
        )
      }
    } catch (err) {
      props.openGlobalSnackbar('Something went wrong.', true)
      setOpenExportModal(false)
    } finally {
      // Always reset the loading states
      setBtnLoading(false)
      setDownloadLoading(false)
    }
  }

  return (
    <div className="subscribe-billing-history" >
      <BrowserTabTitle title="Subscription details" />
      {/* Upgrade-Box-Screen-/-End */}
      {loader ? <div className="m-auto">
        <CenterSpinner />
      </div> : <div className="content-wrapper__main__fixed" >
          <div className="row mb-4">
            <div class="py-header--title mt-0 col-8"><h2 class="py-heading--title">Subscription</h2></div>
          </div>
          {!loader && billingHistory?.length == 0 && (!activePlan || (activePlan && activePlan.planLevel == 1)) ?
            <StarterPlan /> : <React.Fragment>
              {/* Billing-Header-Content-Start */}
              <div className="billing-header row">
                {/*Header-Left-Card*/}
                <div className="col-6 mb-4">
                  {/* Show this updateCard button only if 2nd card doesn't show. Otherwise, 2nd card has already this button. */}
                  <CurrentPlanCard plan={activePlan} showUpdateCardButton={!upcomingPlan && !activePlan?.card?.brand} />
                </div>
                {/*Header-Right-Card*/}
                {activePlan && activePlan.planLevel != 1 && <div className="col-6 mb-4">
                  {upcomingPlan && <UpcomingPlan plan={upcomingPlan} />}
                  {activePlan?.card?.brand && !upcomingPlan && <InvoiceCardDetail plan={activePlan} />}
                </div>}
              </div>
              {/* Billing-Header-Content-End */}
              {/* Billing-History-List-Start */}
              <BillingHistory history={billingHistory} openPdfModal={openPdfModal} />
              {/* Billing-History-List-End */}
            </React.Fragment>}
        </div>}
      <ExportPdfModal
        openModal={openExportModal}
        onClose={() => setOpenExportModal(!openExportModal)}
        onConfirm={exportPDF}
        loading={downloadLoading}
        from={"subscription"}
        btnLoading={btnLoading}
      />
    </div>
  );
}

export default connect(null, { openGlobalSnackbar })(Index);