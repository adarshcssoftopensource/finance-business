import React, { Component } from 'react'
import { NavLink, withRouter } from 'react-router-dom';
import { _getUser } from '../../utils/authFunctions';

class index extends Component {
  render() {
    const currentPath = this.props.location?.pathname;
    const { heading, listArray } = this.props;
    const {acl} = _getUser(localStorage.getItem('token'))
    return (
      <div className="py-page__sidebar">
        <div className="py-nav__sidebar">
          <div className="py-nav__heading">{heading}</div>
          <ul className="py-nav__section">
            {
                !!listArray && listArray.length > 0 ?
                    listArray.map((item, i) => {
                      if(item.name.includes('Connected')){
                        if(!!acl && !!acl.permissions && acl.permissions.length > 0 && !!acl.permissions[3] && !!acl.permissions[3].scope && acl.permissions[3].scope.includes('write')){
                          return (
                              <li key={i} className={item.link === currentPath ? "active" : ""} hidden={item?.isHidden}>
                                  <NavLink className="nav-link" to={item.link}>
                                      <span>{item.name}</span>
                                  </NavLink>
                              </li>
                          )
                        }
                      }else{
                        return (
                          <li key={i} className={item.link === currentPath ? "active" : ""} hidden={item?.isHidden}>
                              <NavLink className="nav-link" to={item.link}>
                                  <span>{item.name}</span>
                              </NavLink>
                          </li>
                        )
                      }
                    })
                : ""
            }
        </ul>
        </div>
      </div>
    )
  }
}

export default withRouter(index);