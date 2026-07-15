import React, { Component } from 'react'
import { Table, Tooltip } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import Icon from '../../../../../components/common/Icon';
import { DeleteModal } from '../../../../../utils/PopupModal/DeleteModal';
import symbolsIcon from "../../../../../assets/icons/product/symbols.svg";

export default class BusinessList extends Component {
    state = {
        tooltipOpen: false,
        openConfimationModal: false,
        removeAccessData: {},
        isLoading: false
    }
    _handleRemovePopup = (e, id) => {
        e.preventDefault();
        this.setState({
            openConfimationModal: true,
            removeAccessData: { e, id }
        })
    }
    _handlePopupClose = () => {
        this.setState({
            openConfimationModal: false
        })
    }

    _handleRemoveAccess = async () => {
        const { removeAccessData } = this.state
        this.setState({ isLoading: true })
        const res = await this.props._handleRemoveAccess(removeAccessData)
        this.setState({ isLoading: true, openConfimationModal: false })
    }

    toggle() {
        this.setState({
            tooltipOpen: !this.state.tooltipOpen
        });
    }

    handleToggle = (target) => {
        this.setState({
            ...this.state,
            [target]: !this.state[target]
        });
    };

    render() {
        const { list, _handlePrimary, _handleEdit, params, primary, showDel } = this.props;
        return (
            <Table hover responsive className="table-business-list py-table mg-top-32">
                <thead classNam="py-table__header">
                    <tr className="py-table__row">
                        <th className="py-table__cell" colSpan="4">Name</th>
                        <th className="py-table__cell" colSpan="4"></th>
                        <th className="py-table__cell__action" colSpan="4">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        !!list && list.length > 0 ?
                            list.map((item, i) => {
                                return (
                                    <tr key={i}>
                                        <td colSpan="8"><NavLink className="py-text--strong py-text--link-primary" to={`/app/accounts/business/${item._id}/edit`}>{item.organizationName}</NavLink>{item.isPrimary ? (<div className="statusSuccess ms-2">Default</div>) : ""}</td>
                                        <td className="py-table__cell__action" colSpan="1">
                                            <div className="py-table__cell__action__icons">
                                                {!item.isPrimary && <span className="Icon" id={'Tooltip-' + item._id}
                                                    className="py-table__action Icon"
                                                    onClick={e => _handlePrimary(e, item)}
                                                >
                                                    <Icon className="Icon" xlinkHref={`${symbolsIcon}#star-alt`} />
                                                    <Tooltip placement="top" isOpen={this.state[`Tooltip-${item._id}`]} target={`Tooltip-${item._id}`}
                                                        toggle={() => this.handleToggle(`Tooltip-${item._id}`)}>
                                                        Set as primary business
                                                    </Tooltip>
                                                </span>}
                                                {
                                                    showDel ? (
                                                        <span className="Icon"
                                                            className="py-table__action Icon"
                                                            id={'Tooltip-' + item._id + i}
                                                            onClick={e => this._handleRemovePopup(e, item._id)}
                                                        >
                                                            <Tooltip placement="top" isOpen={this.state[`Tooltip-${item._id + i}`]} target={`Tooltip-${item._id + i}`}
                                                                toggle={() => this.handleToggle(`Tooltip-${item._id + i}`)}>
                                                                Remove access
                                                            </Tooltip>
                                                            <Icon className="Icon" xlinkHref={`${symbolsIcon}#cancel`} />
                                                        </span>
                                                    ) : (
                                                            <span className="Icon"
                                                                id={'Tooltip-' + item._id + i}
                                                                className="py-table__action Icon"
                                                                onClick={e => _handleEdit(e, item._id)}
                                                            >
                                                                <Icon className="Icon" xlinkHref={`${symbolsIcon}#edit-alt`} />
                                                                <Tooltip placement="top" isOpen={this.state[`Tooltip-${item._id + i}`]} target={`Tooltip-${item._id + i}`}
                                                                    toggle={() => this.handleToggle(`Tooltip-${item._id + i}`)}>
                                                                    Edit
                                                               </Tooltip>
                                                            </span>
                                                        )
                                                }

                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                            : ""
                    }
                </tbody>
                <DeleteModal
                    message={"Are you sure you want to remove access?"}
                    openModal={this.state.openConfimationModal}
                    onDelete={this._handleRemoveAccess}
                    onClose={this._handlePopupClose}
                    btnLoad={this.state.isLoading}
                    btnText="Remove Access"
                />
            </Table>
        )
    }
}
