import React, { Fragment } from 'react';
import { Button } from 'reactstrap';
import { Link } from 'react-router-dom';

const GetRedirectUrl = ({ row, className, viewButton, linkId, isPeyme, isCrowdFunding }) => {
  // Return null if row or paymentType is missing
  if (!row || !row.paymentType) {
    return null;
  }

  const paymentType = row.paymentType.toLowerCase();

  switch (paymentType) {
    case 'invoice':
      return (
        <Fragment>
          <Link
            className={!viewButton ? className : ''}
            to={`/app/invoices/view/${linkId ? row.linkId : row.invoiceId}`}
          >
            {viewButton ? (
              <Button color="primary">View {row.paymentType}</Button>
            ) : (
              `Invoice #${row.other ? row.other.invoiceNo : row.linkId || ''}`
            )}
          </Link>
        </Fragment>
      );

    case 'checkout':
      return (
        <Fragment>
          <Link
            className={!viewButton ? className : ''}
            to={`/app/sales/checkouts/edit/${linkId ? row.linkId : row.checkoutId}`}
          >
            {viewButton ? (
              <Button color="primary">View {row.paymentType}</Button>
            ) : (
              `${row.other ? row.other.checkoutName : row.linkId || ''}`
            )}
          </Link>
        </Fragment>
      );

    case 'peyme':
      return (
        <Fragment>
          {(!isPeyme || (isPeyme && !viewButton)) && (
            <Link className={!viewButton ? className : ''} to="/app/payyitme">
              {viewButton ? <Button color="primary">View Finance.Me</Button> : 'Finance.Me'}
            </Link>
          )}
        </Fragment>
      );

    case 'funding':
      return (
        <Fragment>
          {(!isCrowdFunding || (isCrowdFunding && !viewButton)) && (
            <Link className={!viewButton ? className : ''} to="/app/give">
              {viewButton ? <Button color="primary">View Give</Button> : 'Give'}
            </Link>
          )}
        </Fragment>
      );

    case 'transaction':
      return (
        <Fragment>
          <Link
            className={!viewButton ? className : ''}
            to={`/app/payments/view-payment/${row.uuid || row.linkId || ''}`}
          >
            {viewButton ? (
              <Button color="primary">View Transaction</Button>
            ) : (
              `Transaction #${row.other ? row.other.invoiceNo : row.uuid || row.linkId || ''}`
            )}
          </Link>
        </Fragment>
      );

    default:
      return null;
  }
};

export default GetRedirectUrl;