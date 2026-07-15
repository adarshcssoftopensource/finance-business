import MiniSidebar from "../../../../../global/MiniSidebar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import DataTableWrapper from "../../../../../utils/dataTableWrapper/DataTableWrapper";
import { defaultSorted } from "../../../../../constants/invoiceConst";
import { profileSidebarLinksArray } from "../../../../../utils/common";
import { getSession, signOutSelectedSession } from "../../../../../actions/deviceSessionAction";
import { useDispatch, connect } from "react-redux";
import { Button } from "reactstrap";

const SignOutButtonStyle = {
  fontSize: 14,
  marginLeft: "auto",
  padding: "10px 10px"
}

function DeviceSession({ deviceSession }) {
  const [session, setSession] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [pageState, setPageState] = useState({
    sizePerPage: 10,
    page: 1
  });
  const dispatch = useDispatch();
  const signeOutUser = (id, type = "single") => {
    const payload = {
      type,
      payload: {
        status: "expired",
        isDeleted: true
      }
    };
    dispatch(signOutSelectedSession(id, payload, true, `pageNo=${pageState.page}&pageSize=${pageState.sizePerPage}`));
  };
  const signOutButton = useCallback((cell, row, rowIndex) => {
    if(row.isCurrent) {
      return (
        <div style={SignOutButtonStyle}>
          Current session
        </div>
      )
    }
    return (
      <Button
        color="primary"
        style={SignOutButtonStyle}
        onClick={() => signeOutUser(cell)}
      >
        Sign out
      </Button>
    );
  }, []);

  const allColumns = useMemo(
    () => [
      {
        dataField: 'location',
        text: 'Location',
        classes: 'py-table__cell',
        sort: false,
      },
      {
        dataField: 'osName',
        text: 'OS Name',
        classes: 'py-table__cell',
        sort: false,
        formatter: (cell) => {
          return <div className={'text-capitalize'}>{cell}</div>
        },
      },
      {
        dataField: 'browserName',
        text: 'Browser/Device',
        classes: 'py-table__cell',
        sort: false,
        formatter: (cell) => {
          return <div className={'text-capitalize'}>{cell}</div>
        },
      },
      {
        dataField: 'ipAddress',
        text: 'IP Address',
        classes: 'py-table__cell',
        sort: true,
        id: 'tooltip',
      },
      {
        dataField: '_id',
        text: 'Action',
        classes: 'py-table__cell__action',
        formatter: signOutButton,
        sort: false,
      },
    ],
    []
  )

  useEffect(() => {
    dispatch(getSession( `pageNo=${pageState.page}&pageSize=${pageState.sizePerPage}`));
  }, []);

  useEffect(() => {
    if (deviceSession.sessions?.allUserSession) {
      const currentSession = (deviceSession.sessions?.allUserSession ?? []).filter((value) => value.isCurrent);
      setCurrentSession(currentSession?.[0]);
      setSession((deviceSession.sessions?.allUserSession ?? []).sort((value) => value.isCurrent ? -1 : 0));
    }
  }, [deviceSession.sessions?.allUserSession?.length, deviceSession?.session?.meta?.total, deviceSession?.session?.meta?.pageNo, deviceSession?.session?.meta?.pageSize]);

  useEffect(() => {
    dispatch(getSession(`pageNo=${pageState.page}&pageSize=${pageState.sizePerPage}`));
  }, [pageState.sizePerPage, pageState.page]);

  return (
    <div className="py-frame__page py-frame__settings has-sidebar">
      <MiniSidebar heading={"Sessions"} listArray={profileSidebarLinksArray} />
      <div className="py-page__content">
        <div className={"py-page__inner"} style={{ minHeight: "80vh" }}>
          <div style={{ display: "flex" }}>
            <Button
              color="primary"
              style={SignOutButtonStyle} onClick={() => signeOutUser(currentSession?._id, "all")}
              disabled={!currentSession?._id || session.length < 2}>
              Sign out all other sessions
            </Button>
          </div>
          <div className="invoice-list-table tab-all">
            <DataTableWrapper
              data={session}
              classes="py-table py-table--condensed py-table__v__center"
              changePage={(type, { page, sizePerPage }) => {
                if (type === 'pagination') {
                  setPageState({
                    page,
                    sizePerPage
                  });
                }
              }}
              page={pageState.page}
              limit={pageState.sizePerPage}
              totalData={deviceSession?.session?.meta?.total}
              columns={allColumns}
              defaultSorted={defaultSorted}
              sortField="date"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    deviceSession: state.deviceSession
  };
};

export default connect(mapStateToProps)(DeviceSession);
