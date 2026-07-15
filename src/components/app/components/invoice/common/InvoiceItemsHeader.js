import React,{Component} from 'react';

class InvoiceItemsHeader extends Component{
    constructor(props){
      super(props);
      this.th1Ref = React.createRef()
      this.th2Ref = React.createRef()
      this.th3Ref = React.createRef()
      this.th4Ref = React.createRef()
    }

    componentDidMount(){
      const borderColour = this.props.userSettings
          ? this.props.userSettings.accentColour
          : '#000';
      this.th1Ref.current.style.setProperty('background-color', borderColour, "important")
      this.th2Ref.current.style.setProperty('background-color', borderColour, "important")
      this.th3Ref.current.style.setProperty('background-color', borderColour, "important")
      this.th4Ref.current.style.setProperty('background-color', borderColour, "important")
    }

    render(){
        const { itemHeading } = this.props.invoiceInfo;

        return(
        <thead>
          <tr>
            <th width="500"
              ref={this.th1Ref}
            >
              {itemHeading.column1.name}
            </th>
            <th className="text-center" ref={this.th2Ref} width="100">
              {!itemHeading.hideQuantity && (
                itemHeading.column2.name
              )}
            </th>
            <th ref={this.th3Ref} width="150">
              {!itemHeading.hidePrice && (
                itemHeading.column3.name
              )}
            </th>
            <th ref={this.th4Ref} width="150">
              {!itemHeading.hideAmount && (
                itemHeading.column4.name
              )}
            </th>
          </tr>
        </thead>
        )
    }
}


export default InvoiceItemsHeader;