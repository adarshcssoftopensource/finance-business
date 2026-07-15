import React, { Component } from 'react'
import DOMPurify from 'dompurify';

class Notes extends Component {
  constructor(props) {
    super(props)
    this.state = {
      notes : ''
    }
  }



  render() {
    let  { invoiceInput, handleOnInputChange, notesRef } = this.props;
    return (
      <div className="invoice-memo">
        <strong className="color-muted">Notes</strong>
        <div
          contentEditable="true"
          ref={notesRef}
          name="notes"
          rows={3}
          className="reactStrap-design noBorder p-0 editableDiv"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(invoiceInput.notes).toString()
          }}
          onBlur={handleOnInputChange}
        />
      </div>
    )
  }
}


export default Notes;