import React from 'react';

function Roles({ selectRole, selectedRoles, isNonProfit }) {
 return (
  <div className="row">
   {["owner","director", "executive" ].map((role) => (<div className="col-4 checkbox">
    <label className="py-checkbox">
     <input
      type="checkbox"
      name="roles"
      value={role}
      disabled={role == 'owner' && isNonProfit}
      checked={selectedRoles.indexOf(role) > -1 ? true : false}
      onChange={selectRole}
     />
     <span className="py-form__element__faux"></span>
     <span className="py-form__element__label text-capitalize">{role}</span>
    </label>
   </div>))}
  </div>
 );
}

export default Roles;