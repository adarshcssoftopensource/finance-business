import React, { Component, Fragment } from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { _getUser } from '../../../../../../utils/authFunctions'
import { DeleteModal } from '../../../../../../utils/PopupModal/DeleteModal';
import { connect } from 'react-redux';
import history from '../../../../../../customHistory';
import { deleteProduct, fetchProducts } from '../../../../../../actions/productAction';
import Icon from '../../../../../../components/common/Icon';
import { handleAclPermissions } from '../../../../../../utils/GlobalFunctions'
import _ from "lodash"
import symbolsIcon from "../../../../../../assets/icons/product/symbols.svg";

class ProductActions extends Component {
    state = {
        openDelete: false,
        deleteBtn: false
    }

    onDeleteConfirmation = (event, item) => {
        this.setState({
          openDelete: true,
          selectedDeleteProduct: item
        });
    };

    onDeleteCall = () => {
        const { selectedDeleteProduct } = this.state;
        this.setState({deleteBtn: true})
        this.deleteProduct(selectedDeleteProduct._id)
    };
    deleteProduct = async (id) => {
        const type = _.includes(window.location.pathname, 'sales') ? 'sell' : 'buy';
        try {
          await this.props.deleteProduct(id);
          this.props.fetchProducts(type)
          this.fetchP(type);
        } catch (error) {
            this.setState({deleteBtn: false})
        }
        this.setState({ openDelete: false, deleteBtn: false })
    };
    render() {
        const { row } = this.props;
        const {acl} = _getUser(localStorage.getItem('token'))
        return (
            <Fragment>
                {
                    acl.permissions[3].scope.includes("write") && (
                        <div className="align-center-right">
                        <OverlayTrigger
                            key="top-edit"
                            placement="top"
                            overlay={
                            <Tooltip id={`tooltip-edit`}>Edit</Tooltip>
                            }
                        >
                            <a onClick={e => history.push(`${window.location.pathname}/edit/${row._id}?payment=${false}`)}
                            href="javascript:void(0)" className="py-table__action Icon"
                            data-toggle="tooltip"
                            ><svg viewBox="0 0 20 20" id="edit" xmlns="http://www.w3.org/2000/svg"><path d="M8.75 13.836L16.586 6 14 3.414 6.164 11.25l2.586 2.586zm-1.528 1.3l-2.358-2.358-.59 2.947 2.948-.59zm11.485-8.429l-10 10a1 1 0 0 1-.51.274l-5 1a1 1 0 0 1-1.178-1.177l1-5a1 1 0 0 1 .274-.511l10-10a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1 0 1.414z"></path></svg></a>
                        </OverlayTrigger>
                            {!handleAclPermissions(['Viewer']) && <OverlayTrigger
                            key="top-delete"
                            placement="top"
                            overlay={
                            <Tooltip id={`tooltip-delete`}>
                            Delete
                            </Tooltip>
                            }
                        >
                            <a href="javascript:void(0)" className="py-table__action py-table__action__danger  Icon"
                            onClick={e => this.onDeleteConfirmation(e, row)}
                            data-toggle="tooltip"
                            >
                            <Icon
                                className="Icon"
                                xlinkHref={`${symbolsIcon}#delete`}
                            />
                            </a>    
                        </OverlayTrigger>}
                        </div>
                    )
                }
                {
                    this.state.openDelete && (
                        <DeleteModal
                            message={"Are you sure you want to delete this product?"}
                            openModal={this.state.openDelete}
                            onDelete={this.onDeleteCall}
                            onClose={() => this.setState({ openDelete: false, deleteBtn: false })}
                            btnLoad={this.state.deleteBtn}
                        />
                    )
                }
            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return state;
}
export default connect(mapStateToProps, {deleteProduct, fetchProducts})(ProductActions)