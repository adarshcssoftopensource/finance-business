import React, { useState } from "react";
import { Row, Table, Form, Col } from 'react-bootstrap';
import { Spinner, Button } from 'reactstrap';
import {ReactSVG} from 'react-svg';
import { CustomDeleteModal } from '../../../../../../../../utils/PopupModal/DeleteModal';
import icDeleteSvg from "../../../../../../../../assets/icons/ic_delete.svg"
import icAddSvg from "../../../../../../../../assets/icons/ic_add.svg"

const OwnerListing = (props) => {
    const [ownerShipCheck, setOwnerShipCheck] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectIndex, setSelectIndex] = useState(null)
    const { ownerData, addOwnerData, isIndividual, isReadOnly } = props;

    const deleteAddOwner = (i) => {
        if (!isReadOnly){
            setSelectIndex(i);
            setModalOpen(true);
        }
    }

    const toggleDeleteModal = () => {
        setModalOpen(false);
    }

    const renderRoles = (data) => {
        return (
            <tr>
                <td colSpan={9} className="border-top-0 pt-0">
                    {data && data.roles && data.roles.map((role, idx) => (
                        <span key={idx} class="badge badge-pill badge-primary ms-1">{role}</span>
                    ))}
                </td>
            </tr>
        )
    }
    return (
        <div className="aditional-information" >
            <header className="py-header py-header--page">
                <div className="py-header--title">
                    <div className="mb-3 h3">Management & Ownership</div>
                </div>
            </header>
            <Row className="p-3">
                <Table className="mb-0">
                    <thead className="text-left" style={{ backgroundColor: '#ebeff4' }}>
                        <tr>
                            <th colSpan={3} >You</th>
                            <th colSpan={3} ></th>
                            <th colSpan={3} ></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={3} className="text-left">
                                {ownerData.firstName}&nbsp;{ownerData.lastName}
                            </td>
                            <td colSpan={3} className="text-center">
                                {!props.isNonProfit && `${ownerData.ownership}% Ownership`}
                            </td>
                            {/* <td colSpan={3} className="text-right" onClick={() => props.handleOwnerTypeData('owner', true)}>
                                <div className="action-icon">
                                    <ReactSVG
                                        src="/assets/icons/ic_edit.svg"
                                        afterInjection={(error, svg) => {
                                            if (error) {
                                                return;
                                            }
                                        }}
                                        beforeInjection={svg => {
                                            svg.classList.add('py-svg-icon');
                                        }}
                                        renumerateIRIElements={false}
                                        className="Icon py-table__action py-table__action__info"
                                    />
                                </div>
                            </td> */}
                        </tr>
                        {ownerData.roles && renderRoles(ownerData)}
                    </tbody>
                </Table>
                <Table className="mb-0">
                    <thead className="text-left" style={{ backgroundColor: '#ebeff4' }}>
                        <tr>
                            <th colSpan={3} >Additional Owners</th>
                            <th colSpan={3} ></th>
                            <th colSpan={3} ></th>
                        </tr>
                    </thead>
                    <tbody>
                        {addOwnerData.map((data, i) => (
                            <React.Fragment key={i}>
                                <tr>
                                    <td colSpan={3} className="text-left">
                                        {data.firstName}&nbsp;{data.lastName}
                                    </td>
                                    <td colSpan={3} className="text-center">
                                        {!props.isNonProfit && `${data.ownership}% Ownership`}
                                    </td>
                                    <td colSpan={3} className="text-right" >
                                        <div className="d-flex justify-content-end action-icon" >
                                            {/* <div onClick={() => props.handleOwnerTypeData(i, true)}>
                                                <ReactSVG
                                                    src="/assets/icons/ic_edit.svg"
                                                    afterInjection={(error, svg) => {
                                                        if (error) {
                                                            return;
                                                        }
                                                    }}
                                                    beforeInjection={svg => {
                                                        svg.classList.add('py-svg-icon');
                                                    }}
                                                    renumerateIRIElements={false}
                                                    className="Icon py-table__action py-table__action__info"
                                                />
                                            </div> */}
                                            <div className={`${isReadOnly ? 'disabled' : ''}`} onClick={() => deleteAddOwner(i)}>
                                                <ReactSVG
                                                    src={icDeleteSvg}
                                                    afterInjection={(error, svg) => {
                                                        if (error) {
                                                            return;
                                                        }
                                                    }}
                                                    beforeInjection={svg => {
                                                        svg.classList.add('py-svg-icon');
                                                    }}
                                                    renumerateIRIElements={false}
                                                    className="Icon py-table__action py-table__action__danger"

                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                {data.roles && renderRoles(data)}
                            </React.Fragment>
                        ))}

                        {!isIndividual && !isReadOnly && <tr>
                            <td colSpan={12} className="text-center p-0" >
                                <Button
                                    onClick={() => props.handleOwnerTypeData(addOwnerData.length, false)}
                                    className="btn-add-invoice"
                                    color="primary"
                                    outline
                                    block
                                ><ReactSVG
                                        src={icAddSvg}
                                        afterInjection={(error, svg) => {
                                            if (error) {
                                                return;
                                            }
                                        }}
                                        beforeInjection={svg => {
                                            svg.classList.add('py-svg-icon');
                                        }}
                                        renumerateIRIElements={false}
                                        className="Icon me-1"
                                    />Add additional owner</Button>
                            </td>
                        </tr>}
                        {!isIndividual && <tr>
                            <td colSpan={10} >
                            </td>
                        </tr>}
                    </tbody>
                </Table>
            </Row>
            <Form.Group as={Col} xs={12} controlId="ownerShipCheck">
                <Form.Check
                    custom
                    inline
                    label="I confirm there are no additional owners with 25% or more of the business"
                    type="checkbox"
                    name="ownerShipCheck"
                    id="ownerShipCheck"
                    className="text-left"
                    onChange={(e) => {
                        e.target.checked ? setOwnerShipCheck(true) : setOwnerShipCheck(false)
                    }}
                />
            </Form.Group>

            <div className="d-flex justify-content-center mt-4">
                {!isReadOnly && <Button color="primary" className="cursor-pointer"
                    disabled={!ownerShipCheck || props.loading}
                    onClick={() => props.onSubmit()}>Save and continue &nbsp; {props.loading && <Spinner size="sm" color="default" />}</Button>}
                {isReadOnly && <Button type="button" color="primary" outline className="ms-2" onClick={() => props.handleSteps(3)}>Next</Button>}
            </div>
            <CustomDeleteModal
                openModal={modalOpen}
                title="Delete"
                onDelete={() => {
                    setModalOpen(false);
                    props.onDelete(selectIndex)
                }}
                onClose={toggleDeleteModal}
            >
                <h4>Are you sure you want to delete this person?</h4>
            </CustomDeleteModal>

        </div >
    );
}

export default OwnerListing;