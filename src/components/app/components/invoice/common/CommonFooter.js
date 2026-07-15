import React,{Component} from 'react';
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    ButtonGroup,
    ButtonDropdown,
    Spinner
  } from 'reactstrap';

class CommonFooter extends Component{
    constructor(props){
        super(props)
    }
    
    render(){
        let {
              onRecurringPreviewClick,
              onSubmitRecurringInvoice,
              loading,
              onPreviewClick,
              onSubmitInvoice,
              openBelowDropdown,
              toggleBelowDropdown,
              onSaveAndSend,
              onSaveAndPayment,
        } = this.props;
     
        return(
            <footer className="page footer" style={{ marginBottom: '50px' }}>
                {window.location.pathname.includes('/app/recurring') ? (
                  <div
                    className="d-flex justify-content-end align-items-center"
                    style={{ marginBottom: '50px' }}
                  >
                    <Button
                        onClick={onRecurringPreviewClick}
                        color="primary"
                        outline
                        className="me-2"
                    >Preview</Button>

                    <Button
                        color="primary"
                        onClick={() => onSubmitRecurringInvoice()}
                        disabled={loading}
                    >
                      {loading ? (
                        <Spinner
                          color="primary"
                          size="md"
                          className="loader btnLoader"
                        />
                      ) : (
                        'Save and continue'
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="content clearfix">
                    <div className="pull-right">
                        <Button
                            onClick={onPreviewClick}
                            color="primary"
                            outline
                            className="me-2"
                        >Preview</Button>
                    
                        <ButtonGroup>                    
                            <Button
                            color="primary"
                            onClick={() => onSubmitInvoice()}
                            disabled={loading}
                            >{loading ? <Spinner color="default" size="sm" /> : "Save and continue"}</Button>

                            <ButtonDropdown 
                            isOpen={openBelowDropdown}
                            toggle={toggleBelowDropdown}
                            >
                                <DropdownToggle color="primary" className="ps-2 pe-3 border-left" caret />
                                    <DropdownMenu right>
                                        <DropdownItem onClick={onSaveAndSend}>Save and send</DropdownItem>
                                        <DropdownItem onClick={() => onSaveAndPayment()} >Save and record payment</DropdownItem>
                                    </DropdownMenu>
                            </ButtonDropdown>
                        </ButtonGroup>                    
                    </div>
                  </div>
                )}
              </footer>
        )
    }
}

export default CommonFooter;