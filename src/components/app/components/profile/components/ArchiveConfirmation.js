import React from "react";
import { Spinner, Button } from "reactstrap";

export const ArchiveConfirmation = props => (
    <div className="archiveConfrmWrp">
        <div className="archiveCnfrmMsg">
            <h6><i className="fal fa-info-circle"></i> Are you sure you want to archive this business?</h6>
            <p>Taking this action will remove this business from all menus and remove any collaborators. You will always have the ability to restore this business.</p>
        </div>
        <div className="archiveButton">
            <Button color="primary"
                onClick={(e) => props.archieve(e)}
                disabled={props.load}
            > {props.load ? <Spinner size="sm" color="default"/> : 'Yes, archive this business'}</Button>
            <a href="javascript: void(0)" onClick={() => props.closeConfrm()}>Cancel archiving, I changed my mind</a>
        </div>
    </div>
)