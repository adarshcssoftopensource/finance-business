import React, { useState } from 'react';

import '../style/global-information-alert.scss';

/**
 * For changes in background and color
 * Need to add class @varient as props
 * @ex .alert-success is append like .alert-@varient
 * if you want to add your own varient add class in above 
 * style file with .alert-@yourvarient
 */

const InformationAlert = (props) => {
 const [isOpen, setIsOpen] = useState(true);

 const closeAlert = () => {
  setIsOpen(false)
 }

 return (
  <div className="global-alert">
   <div className={`alert-action alert-${props.varient} align-items-center alert-dismissible fade ${isOpen ? 'show' : 'hide'}`} role="alert">
    {props.children}
    {/*<button type="button" className="close"
     onClick={closeAlert}
     data-dismiss="alert" aria-label="Close">
     <span aria-hidden="true">&times;</span>
    </button>*/}
   </div>
  </div>
 )
}

export default InformationAlert