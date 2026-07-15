import React, { Fragment } from 'react';
import { Button } from 'reactstrap';
import { handleAclPermissions } from '../utils/GlobalFunctions'
export const NoDataMessage = ({ title, buttonTitle, add, filter, primaryMessage, secondryMessage, btnText = 'Add a', showHead = 'created', showBtn=true }) => {
    return (
        <Fragment>
            <div className="text-center vr-middle">
                {!filter ? (
                    <Fragment>
                        <div className="py-heading--section-title">
                            {primaryMessage ? primaryMessage : `You haven't ${showHead} any ${title} yet.`}
                        </div>
                        <p>{secondryMessage}</p>
                        {!handleAclPermissions(['Viewer']) && showBtn  && <Button
                            onClick={add}
                            color="primary"
                            outline
                        >
                            {btnText} {buttonTitle}
                        </Button>}
                    </Fragment>)
                    : (
                        <Fragment>
                            <div className="mt-5">
                                <i className="fal fa-search color-muted" style={{ fontSize: '40px' }} />
                                <div className="py-heading--section-title mt-4">
                                No {title.endsWith('s') ? title : `${title}s`} found for your current filters.
                        </div>
                                <p className="lead">Verify your filters and try again.</p>
                            </div>
                        </Fragment>)
                }
            </div>
        </Fragment>
    )
}