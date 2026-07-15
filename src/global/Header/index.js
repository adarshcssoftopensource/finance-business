import React, { PureComponent } from 'react';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, Button } from 'reactstrap';
import { getLogoURL, help } from '../../utils/GlobalFunctions'
import history from '../../customHistory'

class Home extends PureComponent {
    state = {
        dropdownOpen: false
    }

    toggle = () => {
        this.setState(prevState => ({
            dropdownOpen: !prevState.dropdownOpen
        }));
    }

    handleLogout = () => {
        const basicAuthToken = localStorage.getItem('basicAuthToken')
        localStorage.clear();
        localStorage.setItem('basicAuthToken', basicAuthToken)
        history.push('/signin')
    }

    render() {
        const { handleDrawerOpen } = this.props;
        return (
            <header className="main-header">
                <nav className="navbar navbar-expand-md bg-3">
                    <div className="navbar-logo p-3 py-md-0">
                        <a className="navbar-brand" href="javascript:void(0)">
                            <img src={getLogoURL()} alt="" className="logo" /> </a>
                        <Button type="button" className="navbar-toggler" onClick={handleDrawerOpen}>
                            <span className="Icon-bar"></span>
                            <span className="Icon-bar"></span>
                            <span className="Icon-bar"></span>
                        </Button>
                    </div>
                    <div className="navbar-options px-3 px-md-4">
                        <UncontrolledDropdown className="nav">
                            <DropdownToggle className="dropdown-toggle nav-link">
                                <img src="/assets/images/user.png" className="avatar user-avatar rounded-circle me-2" alt="..." />
                                <i className="fal fa-angle-down"></i>
                            </DropdownToggle>
                            <DropdownMenu className="dropdown-menu-right">
                                <div className="dropdown-menu--body">
                                    <div className="dropdown-heading rounded-top bg-3 arrow top color-1">
                                        <div className="content py-1">
                                        </div>
                                    </div>
                                    <ul className="dropdown-body list list-group list-group-flush">
                                        <li className="list-group-item list-group-item-action"><a href="javascript:void(0)"><i className="me-3 fal fa-user"></i>Profile</a></li>
                                        <li className="list-group-item list-group-item-action"><a href="javascript:void(0)"><i className="me-3 fal fa-cogs"></i>Settings</a></li>
                                        <li className="list-group-item list-group-item-action"><a href="javascript:void(0)" onClick={() => help()}><i className="me-3 fal fa-life-ring"></i>Help</a></li>
                                    </ul>
                                    <div className="dropdown-footer bg-1 d-flex justify-content-between align-items-center">
                                        <a href="javascript:void(0)" className="btn btn-rounded btn-3" onClick={this.handleLogout}>
                                            <i className="me-3 fal fa-sign-out-alt"></i>Log out </a>
                                        <a href="javascript:void(0)" className="text-danger">
                                            <i className="me-3 fal fa-lock"></i>
                                        </a>
                                    </div>
                                </div>
                            </DropdownMenu>
                        </UncontrolledDropdown>
                    </div>
                </nav>
            </header>
        )
    }
}

export default Home
