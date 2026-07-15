import React,{Component} from 'react';
import {
    Button,
    Collapse,
    Input
  } from 'reactstrap';
  
class ContentFooter extends Component{
    constructor(props){
        super(props)
    }

    render(){
        let {
            collapse,
            toggleFooter, 
            footerCollapse,
            invoiceInput,
            handleOnInputChange
        } = this.props; 
        return(
            <div className="invoice-view__collapsible invoice-view__footer">
            <div
              className={
                footerCollapse
                  ? 'invoice-view__collapsible-button is-open'
                  : 'invoice-view__collapsible-button'
              }
            >
              <Button
                color="grey"
                className="btn-link"
                onClick={toggleFooter}
              >
                <div className="invoice-view__collapsible-button__content">
                  <div className="collapse_title" >Footer</div>
                  <div className="invoice-view__collapsible-button__expand-icon">
                    <svg
                      viewBox="0 0 20 20"
                      id="expand"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10 12.586l6.293-6.293a1 1 0 0 1 1.414 1.414l-7 7a1 1 0 0 1-1.414 0l-7-7a1 1 0 0 1 1.414-1.414L10 12.586z"></path>
                    </svg>
                  </div>
                </div>
              </Button>
            </div>
            <Collapse
              className="py-box "
              isOpen={footerCollapse}
            >
              <Input
                type="textarea"
                value={invoiceInput.footer}
                onChange={handleOnInputChange}
                name="footer"
                maxLength={255}
                placeholder="Enter a footer for this invoice (e.g. tax information, thank you note)"
              />
            </Collapse>
          </div>
        )
    }
}

export default ContentFooter;