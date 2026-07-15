import React, { Component } from 'react'
import profileServices from '../../../../../../api/profileService'
import Card from './RoleCard'

export default class BusinessInit extends Component {

    state = {
        s: []
    }
    componentDidMount() {
        this._fetchs()
    }

    _fetchs = async () => {
        const s = await profileServices.fetchRoles()
        if (!!s && s.statusCode === 200) {
            this.setState({ s: s.data })
        }
    }

    render() {
        const { s } = this.state;
        return (
            <div className="py-page__content">
                <div className="py-page__inner">
                    <header className="py-header--page flex">
                        <div className="py-header--title">
                            <h2 className="py-heading--title">Invite a new user to access {this.props.businessInfo.selectedBusiness.organizationName} on Finance</h2>
                        </div>
                    </header>
                    <p className="py-text py-text--hint text-center">Choose a user to get started:</p>
                    <div className="py-editable-user-list">
                        <div className="card-table">
                            {
                                !!s && s.length > 0 &&
                                s.map((item, i) => {
                                    return (
                                        <Card
                                            setRole={(id) => this.props.setRole(id)}
                                            data={item}
                                            key={i}
                                            set={(id) => this.props.set(id)}
                                        />
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
