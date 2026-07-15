import history from '../../customHistory';
import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { logger } from '../GlobalFunctions';

// OnClick : https://github.com/react-bootstrap-table/react-bootstrap-table2/issues/302

class DataTableWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      expanded: []
    };
  }

  componentDidMount() {
    let elem = document.getElementById('pageDropDown');
    let menus = document.getElementsByClassName('dropdown-item');
    if (!!menus && menus.length > 0) {
      for (let i = 0; i < menus.length; i++) {
        if (menus[i].innerText === `${this.props.limit}`) {
          menus[i].classList.add('active');
        }
      }
    }
    let dropdownElem = elem.nextSibling;
    elem.addEventListener('click', (e) => {
      if (dropdownElem && dropdownElem.style) {
        dropdownElem.style.display = 'block';
        elem.classList.add('toggle');
      }
    });
    document.addEventListener('mousedown', (e) => {
      if (dropdownElem && dropdownElem.style) {
        dropdownElem.style.display = 'none';
        elem.classList.remove('toggle');
      }
    });
    /**@sort adding class to table sort */

    const elemSort = document.getElementsByClassName('sortable');
    if (!!elemSort && elemSort.length > 0) {
      let tag = null;
      for (let i = 0; i < elemSort.length; i++) {
        if (elemSort[i].innerText.toLowerCase() === this.props.sortField) {
          tag = elemSort[i];
        }
      }
      if (!!tag) {
        tag.classList.add(`sort-${!!this.props.sort ? 'asc' : 'desc'}`);
      }
    }
  }

  componentWillUnmount() {
    let elem = document.getElementById('pageDropDown');
    elem.removeEventListener('click', (e) => {
      let menus = document.getElementsByClassName('dropdown-menu');
      menus[menus.length - 1].style.display = 'block';
    });
    document.removeEventListener('mousedown', (e) => {
      let menus = document.getElementsByClassName('dropdown-menu');
      menus[menus.length - 1].style.display = 'none';
    });
  }

  getLinkUrl = (_id, status) => {
    if (_id && status) {
      if (status == 'Online' || status == 'Offline') {
        return '/app/sales/checkouts/share/' + _id;
      } else if (status == 'Draft') {
        return '/app/sales/checkouts/edit/' + _id;
      } else {
        return '1';
      }
    } else {
      return '2';
    }
  };

  _handlePageChange = (type, {
    page,
    sizePerPage
  }) => {
    const { changePage = () => logger.log() } = this.props;
    logger.log('page click', page, sizePerPage);
    changePage(type, {
      page,
      sizePerPage
    });
  };

  _handleOnExpand = (row, isExpand, rowIndex, e) => {
    const { keyField } = this.props;
    if (isExpand) {
      this.setState(() => ({
        expanded: [...this.state.expanded, row[keyField]]
      }));
    } else {
      this.setState(() => ({
        expanded: this.state.expanded.filter((x) => x !== row[keyField])
      }));
    }
  };

  render() {
    const {
      columns,
      data,
      defaultSorted,
      page,
      totalData = data.length,
      from,
      limit,
      expandRowComponent
    } = this.props;
    const { expanded } = this.state;
    const pageData = localStorage.getItem('paginationData');
    let setLimit = 10;

    if (!!pageData) {
      setLimit = JSON.parse(pageData).limit;
    } else if (limit) {
      setLimit = limit;
    }
    // if(from==='bills' || from==='receipts'){
    //   setLimit=limit;
    // }
    const option = {
      page: page,
      totalSize: totalData,
      paginationSize:setLimit,
      // makes 10 as default
      sizePerPage: setLimit,
      sizePerPageList: [
        {
          text: '5',
          value: 5
        },
        {
          text: '10',
          value: 10
        },
        {
          text: '25',
          value: 25
        },
        {
          text: '50',
          value: 50
        },
        {
          text: '100',
          value: 100
        }
      ]
    };
    const rowEvents = {
      onClick: (e, row, rowIndex) => {
        const { from } = this.props;
        if (
          e.target.id !== 'open-menu' &&
          e.target.id !== 'action' &&
          e.target.id !== 'dropIcon' &&
          e.target.id !== 'textaction' &&
          !e.target.id.includes('dropItem') &&
          !e.target.id.includes('modal') &&
          !e.target.id.includes('react-select')
        ) {
          if (!!from) {
            if (from.includes('invoice')) {
              history.push(`/app/invoices/view/${row._id}`);
            }
            if (from.includes('estimate')) {
              history.push(`/app/estimates/view/${row._id}`);
            }
            if (from.includes('recurring')) {
              history.push(`/app/recurring/view/${row._id}`);
            }
            if (from.includes('checkout')) {
              if (row.status !== 'Archived') {
                history.push(this.getLinkUrl(row._id, row.status));
              }
            }
          }
        }

        // Before performing any action on row click, please check from which screen this row/table belongs
        // Else the click event will get applied to all screens
      }
    };
    const expandRow = expandRowComponent
      ? {
        renderer: expandRowComponent,
        expanded: expanded,
        onExpand: this._handleOnExpand
      }
      : { expandByColumnOnly: true };

    const rowClass = (row, rowIndex) => {
      return 'py-table__row';
    };
    return (
      <div>
        <BootstrapTable
          remote
          keyField="id"
          data={data}
          rowEvents={rowEvents}
          columns={columns}
          rowClasses={rowClass}
          classes="py-table"
          hover
          defaultSorted={!!defaultSorted ? defaultSorted : []}
          pagination={paginationFactory(option)}
          {...this.props}
          expandRow={expandRow}
          onTableChange={this._handlePageChange}
        />
      </div>
    );
  }
}

export default DataTableWrapper;
