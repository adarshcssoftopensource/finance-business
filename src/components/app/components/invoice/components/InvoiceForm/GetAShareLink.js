import React from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    Spinner
} from "reactstrap";
import { connect } from "react-redux";

import { updateData, openGlobalSnackbar } from "../../../../../../actions/snackBarAction";

class GetAShareLink extends React.PureComponent {
    componentDidMount(){
        let elem = document.getElementById('shareLink');
        if(!!elem){
            elem.focus();
            elem.select();
        }
    }

    componentDidUpdate(){
        let elem = document.getElementById('shareLink');
        if(!!elem){
            elem.focus();
            elem.select();
        }
    }
    render() {
        const {invoiceData
            , openShareLink
            , onClose,
            copyMarkSent,
            copyLoad
        } = this.props
        return (
            <Modal
                isOpen={openShareLink}
                toggle={onClose}
                className="reminder-modal share-link"
                centered
            >
                <ModalHeader toggle={onClose}>Get share link</ModalHeader>
                <ModalBody>
                    <div className="reminder-modal">
                        <div className="text-center">
                            Your customer can view the invoice at this link:
                        <div className="text-center">
                                <div className="py-form-email mrT18">
                                    <Input id="shareLink" type='text' value={`${process.env.REACT_APP_PUBLIC_BASE_URL}/invoice/${invoiceData.uuid}`}/>
                                </div>
                            </div>
                        </div>
                        <div className="remainder-body mrT18">
                            <p className="text-center share-text"> Copy the link and share it with your customer.</p>
                            <center><a className="Link__External" href={`${process.env.REACT_APP_PUBLIC_BASE_URL}/invoice/${invoiceData.uuid}?isUser=false`} target="_blank" > Preview in new window</a></center>

                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" outline onClick={onClose} >Cancel</Button>
                    <CopyToClipboard text={`${process.env.REACT_APP_PUBLIC_BASE_URL}/invoice/${invoiceData.uuid}`}>
                        <Button onClick={onClose} color="primary" outline >Copy link</Button>
                    </CopyToClipboard>
                    <CopyToClipboard text={`${process.env.REACT_APP_PUBLIC_BASE_URL}/invoice/${invoiceData.uuid}`}>
                        <Button
                            onClick={copyMarkSent}
                            color="primary"
                            disabled={copyLoad}
                        >{copyLoad ? <Spinner color="default" size="sm" /> : 'Copy, and mark invoice as sent'} </Button>
                    </CopyToClipboard>
                </ModalFooter>
            </Modal>
        );
    }
}

const mapPropsToState = state => ({
    businessInfo: state.businessReducer.selectedBusiness
});

const mapDispatchToProps = dispatch => {
    return {
        refreshData: () => {
            dispatch(updateData());
        },
        showSnackbar: (message, error) => {
            dispatch(openGlobalSnackbar(message, error));
        }
    };
};

export default connect(
    mapPropsToState,
    mapDispatchToProps
)(GetAShareLink);

