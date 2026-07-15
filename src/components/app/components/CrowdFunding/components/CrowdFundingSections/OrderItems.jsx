import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ReactSVG } from 'react-svg';
import Icon from '../../../../../common/Icon';
import symbolsIcon from '../../../../../../assets/icons/product/symbols.svg';
import {
  cancelOrderPayments,
  getFundingOrdersItems
} from '../../../../../../actions/crowdFundingAction';
import DataTableWrapper from '../../../../../../utils/dataTableWrapper/DataTableWrapper';
import { getAmountToDisplay } from '../../../../../../utils/GlobalFunctions';
import ProcessStopIcon from '../../../../../../assets/icons/process-stop.svg';
import { DeleteModal } from '../../../../../../utils/PopupModal/DeleteModal';
import { Label } from 'reactstrap';
import CenterSpinner from '../../../../../../global/CenterSpinner';

const ItemsRender = (row) => {
  return (
    <div style={{
      background: '#adf0cc',
      padding: '10px',
      borderRadius: '5px'
    }}>
      <div className={`expandHeader`}>
        Items
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '50% 50%',
        fontSize: 18,
        color:'black',
        fontWeight: 500,
        borderBottom: '2px solid #b2c2cd'
      }}>
        <div style={{
          color:'black'
        }}>Title</div>
        {/*<div>Description</div>*/}
        {/*<div>Price Type</div>*/}
        <div style={{
          color:'black'
        }}>Amount</div>
      </div>
      {
        row?.items?.map((value) => {
          return (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '50% 50%',
              padding: '15px 0'
            }}>
              <div style={{
          color:'black'
        }}>{value?.title ?? ''}</div>
              {/*<div>{value?.description ?? ''}</div>*/}
              {/*<div>{value?.priceType ?? ''}</div>*/}
              <div
                style={{
                  color: '#0ea90e',
                  fontSize: '16px',
                  fontWeight: 400
                }}
              >
                {getAmountToDisplay({ symbol: '$' }, value?.amount ?? '')}
              </div>
            </div>
          );
        })
      }
    </div>
  );
};

function OrderItems(props) {
  const {
    crowdFundingData
  } = props;
  const [refreshClass, setRefreshClass] = useState('Icon');
  const [orderItemOpen, setOrderItemOpen] = useState(true);
  const [removeState, setRemoveState] = useState({
    isOpen: false,
    selectedOrder: null
  });
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [PageState, setPageState] = useState({
    page: 1,
    sizePerPage: 10
  });
  const dispatch = useDispatch();

  const state = useSelector((state) => {
    const {
      crowdFundingReducer: {
        fundingOrderList,
        isFundingOrderLoading
      }
    } = state;

    return {
      orders: fundingOrderList?.orders,
      isFundingOrderLoading
    };
  });
  const handleRefreshOrder = (isRefreshButtonClicked) => {
    const { funding: { uuid } = {} } = crowdFundingData;
    dispatch(getFundingOrdersItems(uuid, showOnlyActive));
    if (isRefreshButtonClicked) {
      setRefreshClass('Icon fa-spin');
      setTimeout(() => {
        setRefreshClass('Icon');
      }, 2000);
    }
  };
  useEffect(() => {
    handleRefreshOrder();
  }, [showOnlyActive]);

  const handleDeleteModel = (selectedRecord) => {
    if (!selectedRecord) {
      setRemoveState({
        isOpen: false,
        selectedOrder: null
      });
    } else {
      setRemoveState({
        isOpen: true,
        selectedOrder: selectedRecord
      });
    }
  };

  const allColumns = useMemo(() => [
    {
      dataField: 'customer',
      text: 'Customer Name',
      classes: 'py-table__cell',
      formatter: (cell) => {
        return (
          <div className={'text-capitalize'}>{`${cell?.firstName} ${cell?.lastName}`}</div>
        );
      },
      cellStyle: {
        width: '20%'
      },
      sort: false
    },
    {
      dataField: 'customer.email',
      text: 'Email',
      classes: 'py-table__cell',
      sort: false,
      formatter: (cell, row) => {
        return <div>{cell}</div>;
      }
    },
    {
      dataField: 'amount',
      text: 'Amount',
      classes: 'py-table__cell',
      formatter: (cell, row) => {
        return (
          <div
            style={{
              color: '#0ea90e',
              fontSize: '16px',
              fontWeight: 500
            }}
          >
            {getAmountToDisplay(row?.currency?.symbol ? row?.currency : { symbol: '$' }, cell)}
          </div>
        );
      }
    },
    {
      dataField: 'status',
      text: 'Status',
      classes: 'py-table__cell',
      formatter: (cell, row) => {
        return <div>
          {row?.status === 'active' ?
            <div className="py-table__cell" style={{
              textAlign: 'right',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 5
            }}>
              {/*<Image src={ProcessStopIcon}/>*/}
              <div className={'text-capitalize'}>{cell}</div>
              <ReactSVG
                src={ProcessStopIcon}
                afterInjection={(error, svg) => {
                  if (error) {
                    return null;
                  }
                }}
                beforeInjection={svg => {
                  // svg.classList.add('py-svg-icon');
                  svg.setAttribute('style', 'width: 20px;height: 20px;');
                  // svg.setAttribute('style', 'height: 20px')
                }}
                // style={{
                //   width: '20px',
                //   height: '20px'
                // }}
                // renumerateIRIElements={false}
                // className="Icon py-table__action py-table__action__danger"
                onClick={(e) => {
                  e?.stopPropagation();
                  handleDeleteModel(row.uuid);
                }}
              />
            </div> :
            <div className={'text-capitalize'} style={{
              textAlign: 'right'
            }}>{cell}</div>}
        </div>;
      }
    }
  ], []);

  const onCancelOrder = () => {
    const { funding: { uuid } = {} } = crowdFundingData;
    const { selectedOrder } = removeState;
    dispatch(cancelOrderPayments(uuid, selectedOrder, showOnlyActive));
    handleDeleteModel();
  };
  const pageStart = PageState.page === 1 ? 0 : ((PageState.page - 1) * PageState.sizePerPage);
  const pageEnd = pageStart + PageState.sizePerPage;

  return (
    <div>
      <div className="py-box py-box--large">
        <div className="invoice-steps-card__options">
          <div
            style={{ position: 'relative' }}
            className="invoice-step-Collapsible__header-content"
          >
            <div className="step-indicate">
              <div className="step-icon plane-icon">
                <Icon className="Icon" xlinkHref={`${symbolsIcon}#timeline`} />
              </div>
            </div>
            <div className="d-flex  w-100">
              <div className="py-heading--subtitle" style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}>
                <div
                  className="cursor-pointer"
                  onClick={() => setOrderItemOpen(!orderItemOpen)}
                >
                  Upcoming Payments
                </div>

                <div onClick={() => handleRefreshOrder(true)} className="refresh-action">
                  <Icon
                    className={refreshClass}
                    xlinkHref={`${symbolsIcon}#refresh`}
                  />
                </div>
                <div className="py-form-field__element">
                  <Label className="py-checkbox" style={{
                    alignItems: 'center',
                    fontSize: 12
                  }}>
                    <input
                      type="checkbox"
                      name="agreement"
                      value={showOnlyActive}
                      onChange={event => {
                        setShowOnlyActive(event.target.checked);
                      }}
                      checked={showOnlyActive}
                    />
                    <span className="py-form__element__faux" />
                    <span className="py-form__element__label">
                               Show Only Active
                              </span>
                  </Label>
                </div>
              </div>
              <div
                className="invoice-step-card__actions cursor-pointer"
                onClick={() => setOrderItemOpen(!orderItemOpen)}
              >
                <div
                  className={`collapse-arrow ms-auto ${
                    orderItemOpen && 'collapsed'
                  }`}
                >
                  <i className="fas fa-chevron-up" />
                </div>
              </div>
            </div>
          </div>
        </div>
        {state.isFundingOrderLoading ? <CenterSpinner /> : orderItemOpen && (
          <div style={{ marginTop: 30 }}>
            <div>
              <div>
                {crowdFundingData
                  ? <DataTableWrapper
                    data={state.orders?.slice(pageStart, pageEnd) || []}
                    classes="py-table py-table--condensed py-table__v__center"
                    changePage={(type, {
                      page,
                      sizePerPage
                    }) => {
                      if (type === 'pagination') {
                        setPageState({
                          page,
                          sizePerPage
                        });
                      }
                    }}
                    page={PageState.page}
                    limit={PageState.sizePerPage}
                    totalData={state.orders?.length || 0}
                    columns={allColumns}
                    // defaultSorted={}
                    expandRowComponent={ItemsRender}
                    sortField="date"
                    keyField="_id"
                  />
                  :
                  ''}
              </div>
            </div>
          </div>
        )}
        <DeleteModal
          message={'Are you sure you want to cancel this order?'}
          openModal={removeState.isOpen}
          btnText={'Yes'}
          onDelete={onCancelOrder}
          onClose={() => handleDeleteModel()}
          // refreshData={this.props.refreshData}
        />
      </div>
    </div>
  );
}

export default OrderItems;
