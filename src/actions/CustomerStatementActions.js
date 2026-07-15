import history from "../customHistory";
import CustomerStatementServices from "../api/CustomerStatementServices";
import * as actionTypes from "../constants/ActionTypes";

import { errorHandle } from "../actions/errorHandling";

export const statementList = statements => {
    return {
        type: actionTypes.FETCH_CUSTOMER_STATEMENTS,
        payload: statements
    };
};

export const statement = statements => {
    return {
        type: actionTypes.FETCH_CUSTOMER_STATEMENTS,
        payload: statements
    };
};

export function fetchCustomerStatements(data) {
    return async dispatch => {
        return CustomerStatementServices.fetchCustomerStatements(data)
            .then(statementResponse => {
                if (statementResponse.statusCode === 200) {
                    return dispatch(statementList(statementResponse.data));
                }
            })
            .catch(error => {
            });
    };
}


export function getPublicStatement(uuid) {
    return async dispatch => {
        return CustomerStatementServices.getPublicStatement(uuid)
            .then(statementResponse => {
                if (statementResponse.statusCode === 200) {
                    return dispatch(statementList(statementResponse.data));
                }
            })
            .catch(error => {
            });
    };
}

export function generateStatement(data) {
    return async dispatch => {
        return CustomerStatementServices.generateStatement(data)
        .then(statementResponse => {
                if (statementResponse.statusCode === 201) {
                        return dispatch(statement(statementResponse.data));
                }
            })
            .catch(error => {
            });
    };
}
export function mailCustomerStatement(uuid,data) {
    return async dispatch => {
        return CustomerStatementServices.mailCustomerStatement(uuid,data)
        .then(statementResponse => {
                if (statementResponse.statusCode === 201) {
                        return statementResponse;
                }
            })
            .catch(error => {
            });
    };
}