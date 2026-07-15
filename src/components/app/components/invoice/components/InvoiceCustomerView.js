import React, { PureComponent, Fragment } from "react";
import { connect } from "react-redux";
import { Button, Spinner } from "reactstrap";
import ReactToPrint from "react-to-print";
import { getInvoice } from "../../../../../api/InvoiceService";
import { openGlobalSnackbar } from "../../../../../actions/snackBarAction";
import { invoiceInput } from "../helpers";
import InvoicePreview from "../components/InvoicePreview";
import InvoicePreviewClassic from "./InvoicePreviewClassic";
import InvoicePreviewModern from "./InvoicePreviewModern";
import { invoiceSettingPayload } from "../../setting/components/supportFunctionality/helper";
import { fetchSalesSetting } from "../../../../../api/SettingService";
import PoweredBy from "../../../../common/PoweredBy";
import CenterSpinner from "../../../../../global/CenterSpinner";
import {withRouter} from "react-router-dom";
import { downloadBase64PDF, generateInvoicePDF } from "../helpers/InvoicePdfService";

class InvoiceCustomerView extends PureComponent {
    resume;
    state = {
        openModal: false,
        dropdownOpen: false,
        dropdownOpenMore: false,
        modal: false,
        invoiceModal: false,
        selectedCustomer: null,
        invoiceData: invoiceInput(),
        userSettings: invoiceSettingPayload(),
        loading: true,
        print: false,
        InvoiceDataforPDF: null,
        btnLoading: false
    };

    componentDidMount() {
        const id = this.props.match.params.id;
        this.fetchInvoiceData(id);
    }

    fetchInvoiceData = async id => {
        try {
            let invoiceResponse = await getInvoice(id);
            const settingResponse = await fetchSalesSetting();
            const userSettings = settingResponse.data.salesSetting;
            this.setState({ 
                invoiceData: invoiceResponse.data.invoice,
                InvoiceDataforPDF: invoiceResponse.data,
                userSettings, 
                loading: false 
            });
        } catch (error) {
            if (error.data) {
                this.props.showSnackbar(error.message, true);
                this.props.history.push("/app/invoices");
            }
        }
    };

    exportPDF = async () => {
    try {   
        this.setState({ btnLoading: true });
        const { InvoiceDataforPDF } = this.state;
        const date = new Date().toISOString().split('T')[0];
        const data = {
            ...InvoiceDataforPDF,
            salesSetting: {
                ...InvoiceDataforPDF.salesSetting,
                template: InvoiceDataforPDF.salesSetting.template,
            },
        };
        const base64Pdf = await generateInvoicePDF(data);
        downloadBase64PDF(base64Pdf, `Invoice_${date}.pdf`);

        this.setState({ btnLoading: false });
       
    } catch (error) {
        console.error('Error generating PDF:', error);
        this.setState({ btnLoading: false });
    }
};

    printPDF = () => {
        window.print();
    };

    renderInvoiceReceipt = () => {
        const { invoiceData, userSettings } = this.state;
        if (userSettings.template === "classic") {
            return (<InvoicePreviewClassic
                ref={el => (this.componentRef = el)}
                invoiceData={invoiceData}
                userSettings={userSettings}
            />)
        } else if (userSettings.template === "modern") {
            return (<InvoicePreviewModern
                ref={el => (this.componentRef = el)}
                invoiceData={invoiceData}
                userSettings={userSettings}
            />)
        } else {
            return (<InvoicePreview
                ref={el => (this.componentRef = el)}
                invoiceData={invoiceData}
                userSettings={userSettings}
            />)
        }
    }

    render() {
        const {loading, btnLoading} = this.state;
        return (
            <Fragment>
                {loading ? <CenterSpinner /> : 
                    <div>
                        <div
                            id="divIdToPrint"
                            style={{
                                width: this.state.print ? "60%" : '100%',
                                padding: "0px 10px",
                                margin: "auto",
                                overflowX: "hidden",
                                overflowY: "hidden",
                                minHeight: '297mm',
                                marginLeft: 'auto',
                                marginRight: 'auto'
                            }}
                        >

                            <div>

                                <div className="invoice-preview__actions">
                                    <ReactToPrint
                                        trigger={() => <Button color="primary" outline >Print</Button>}
                                        content={() => this.componentRef}
                                    />
                                    <Button color="primary" outline onClick={this.exportPDF}disabled={btnLoading}>{btnLoading ? <Spinner size="sm" /> : 'Download PDF'}</Button>
                                </div>
                                <div ref={el => (this.componentRef = el)}>
                                    {this.renderInvoiceReceipt()}
                                </div>
                            </div>
                        </div>
                        <PoweredBy />
                    </div>
                }
            </Fragment>
        );
    }
}

const mapStateToProps = state => ({
    businessInfo: state.businessReducer.selectedBusiness
});

const mapDispatchToProps = dispatch => {
    return {
        showSnackbar: (message, error) => {
            dispatch(openGlobalSnackbar(message, error));
        }
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(InvoiceCustomerView));