import React from "react";
import { Button } from 'reactstrap';

export const RestoreConfirmation = props => (
    <div className="archiveConfrmWrp">
        <div className="mrB20 mrT20">
            <div>Are you sure you want to restore <strong>{props.selected.organizationName}</strong>?</div>
        </div>
        <div className="archiveButton">
            <Button color="primary" className="me-3" onClick={(e) => props.restore(e)}> Yes, restore my business</Button>
            <Button color="primary" outline onClick={() => props._toggleRestoreConfrm()}>No, cancel</Button>
        </div>
    </div>
)