import React, { useState } from 'react';
import { Tooltip } from 'reactstrap';
import { convertToPrice, getBillingStatus } from '../../../../../../../utils/common';
// import Icon from '../../../../../../common/Icon';
import { _displayDate } from '../../../../../../../utils/globalMomentDateFunc'
function Index({ history, openPdfModal }) {
  const [tooltipOpen, setTooltipOpen] = useState({})

  const handleToggle = (target) => {
    setTooltipOpen({
      [target]: !tooltipOpen[target]
    })
  };

  return (
    <div className="responsive-table-wrapper mt-3">
      <div className="billing-filter-header row">
        <div className="py-header--title mt-0 col-8">
          <h2 className="py-heading--title mb-3">Billing History</h2>
        </div>
        {/* <div class="billing-filter--search col-4">
     <div class="btn-search input-group">
      <input placeholder="Search..." type="text" class="form-control" />
      <div class="input-group-append">
       <button type="button" class="btn btn-secondary"><i class="fal fa-search" aria-hidden="true"></i></button>
      </div>
     </div>
    </div> */}
      </div>
      <div className="billing-list-table-filters-container" >
        <div className="billing-list-table">
          <div className="react-bootstrap-table">
            <table className="table table-bordered py-table py-table--condensed py-table__v__center" style={{ fontSize: '14px' }}>
              <thead>
                <tr>
                  <th className="py-table__cell billing-col"><span className="ov-text" >Status</span></th>
                  <th className="py-table__cell billing-col" style={{ width: '130px' }}><span className="ov-text" >Billing ID</span></th>
                  <th className="py-table__cell date-col" ><span className="ov-text" >Charge Date</span></th>
                  <th className="py-table__cell duration-col" style={{ width: '220px' }}><span className="ov-text" >Remarks</span></th>
                  <th className="py-table__cell"><span className="ov-text" >Plan Type</span></th>
                  <th className="py-table__cell card-col text-right"><span className="ov-text" >Card</span></th>
                  <th className="py-table__cell amount-col text-right"><span className="ov-text" >Amount</span></th>
                </tr>
              </thead>
              <tbody>
                {history && history.length > 0 && history?.map((dt, i) => (<tr key={dt._id}>
                  <td className="py-table__cell" >
                    <span className={`badge badge-${getBillingStatus(dt.status)}`}>{dt.status}</span>
                  </td>
                  <td className="py-table__cell billing-col cursor-pointer" style={{ cursor: "pointer" }} onClick={() => openPdfModal(dt)} id={`Tooltip-${dt._id}-${i}`}>
                    <span className="ov-text btn-link" > {dt.paymentId}</span>
                    <Tooltip placement="bottom" isOpen={tooltipOpen[`Tooltip-${dt._id}-${i}`]} target={`Tooltip-${dt._id}-${i}`}
                      toggle={() => handleToggle(`Tooltip-${dt._id}-${i}`)}>
                      Download Invoice
                    </Tooltip>
                  </td>
                  <td className="py-table__cell date-col" ><span className="ov-text" >{_displayDate(dt.paymentDate, 'DD MMM YYYY')}</span></td>
                  <td className="py-table__cell duration-col" style={{ width: '220px' }}>{(dt.status === 'Success' || dt.status === 'Failed') ?<span className="ov-text" >{_displayDate(dt.startDate, 'DD MMM YYYY')} - {_displayDate(dt.endDate, 'DD MMM YYYY')}</span> : dt?.remarks}</td>
                  <td className="py-table__cell text-capitalize">{(dt.status === 'Success' || dt.status === 'Failed') ? <> {dt.planTitle || '-'} {dt.recurring ? `(${dt.recurring})` : ''} {dt.isTrail && ` (Trial)`}</> : '-'}</td>
                  <td className="py-table__cell card-col text-right" >{dt?.card?.cardNumber && (dt.status === 'Success' || dt.status === 'Failed') ? <>•••• {dt?.card?.cardNumber}</> : 'NA'}</td>
                  <td className="py-table__cell amount-col text-right" ><span className="py-text--link remove-anchor" >${convertToPrice(dt?.amount?.toLocaleString())}</span></td>
                </tr>))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Index;