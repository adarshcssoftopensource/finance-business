import React, { useState, useEffect } from 'react';
import Pagination from "react-js-pagination";
import './pagination.scss';
import { addQueryStringUrl } from '../../../../../../utils/common';

const pageNumber = [5, 10, 25, 50, 100]
const Index = (props) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        setPageSize(props.data ? props.data.pageSize : 10)
    }, [])

    const toggle = () => setDropdownOpen(prevState => !prevState);

    const handlePageChange = (pageNumber) => {
        //  addQueryStringUrl(`?pageNo=${pageNumber}`);
        props.handlePaginationPage(pageNumber, props.type)
    }

    const selectPageSize = (size) => {
        setDropdownOpen(false);
        const pData = JSON.parse(localStorage.getItem('paginationData'))
        setPageSize(size);
        if (pData) {
            localStorage.setItem('paginationData', JSON.stringify({ offset: pData.offset, queryData: pData.queryData, limit: size }))
        } else {
            localStorage.setItem('paginationData', JSON.stringify({ offset: 1, queryData: {}, limit: size }))
        }

        props.handlePaginationPageSize(size, props.type)
    }

    return (
        <div id="pagination" className="d-flex mt-4">
            <div className="col-6">
                <span className="react-bs-table-sizePerPage-dropdown dropdown" style={{ 'visibility': 'visible' }}>
                    <button id="pageDropDown" onClick={toggle} className="btn btn-default btn-secondary dropdown-toggle" dataToggle="dropdown" ariaExpanded="false">{pageSize}<span> <span class="caret"></span></span>
                    </button>
                    <ul className="dropdown-menu" role="menu" ariaLabelledby="pageDropDown" style={{ display: dropdownOpen ? 'block' : 'none' }}>
                        {pageNumber.map((num) => (<li onClick={() => selectPageSize(num)} role="presentation" className={`dropdown-item ${pageSize == num ? 'active' : ''}`}>
                            <a href="javascript:void(0)" tabIndex="-1" role="menuitem" dataPage={num}>{num}</a>
                        </li>))}
                    </ul>
                </span>
            </div>
            <div className="col-6">
                <Pagination
                    hideDisabled={true}
                    hideFirstLastPages
                    activePage={props.data ? props.data.pageNo : 1}
                    itemsCountPerPage={pageSize}
                    totalItemsCount={props.data ? props.data.total : 10}
                    pageRangeDisplayed={4}
                    onChange={(e) => handlePageChange(e)}
                />
            </div>
        </div>
    )
}

export default Index;