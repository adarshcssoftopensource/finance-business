import history from "../customHistory";
import ProductServices from "../api/ProductService";
import * as actionTypes from "../constants/ActionTypes";
import { openGlobalSnackbar } from "./snackBarAction";

import { errorHandle } from "../actions/errorHandling";

export const productError = errorMessage => {
    return { type: actionTypes.PRODUCT_FAILED, errorMessage };
};

export const productList = products => {
    return {
        type: actionTypes.FETCH_PRODUCTS,
        payload: products
    };
};

export function addProduct(productInfo) {
    return function (dispatch, getState) {
        return ProductServices.addProduct(productInfo)
            .then(addProductResponse => {
                if (addProductResponse.statusCode === 201) {
                    dispatch({
                        type: actionTypes.ADD_PRODUCT
                    });
                    addProductResponse.data.product.message = addProductResponse.message;
                    return addProductResponse.data.product
                }
            })
            .catch(err => {
                return err;
            });
    };
}

export function resetAddProduct() {
    return function (dispatch) {
        return dispatch({
            type: actionTypes.RESET_ADD_PRODUCT
        });
    };
}

export function fetchProducts(type, query) {
    return async (dispatch, getState) => {
        let pageNo = 1, pageSize=10;
        const { productReducer } = getState().productReducer
        if(!!productReducer && productReducer.products){
            pageNo = productReducer.products.meta.pageNo
            pageSize = productReducer.products.meta.pageSize
        }
        return ProductServices.fetchProducts(type, !!query ? query : `pageNo=${pageNo}&pageSize=${pageSize}`)
            .then(productsResponse => {
                if (productsResponse.statusCode === 200) {
                    return dispatch(productList(productsResponse.data));
                }
            })
            .catch(error => {
            });
    };
}

export function fetchProductById(productId) {
    return async dispatch => {
        try {
            dispatch({type: actionTypes.FETCH_PRODUCT_BY_ID_LOADING})
            const response = await ProductServices.fetchProductById(productId);
            if (response.statusCode === 200) {
                return dispatch({
                    type: actionTypes.FETCH_PRODUCT_BY_ID,
                    selectedProduct: response.data.product
                });
            }
        } catch (error) {
            dispatch(productError(error));
        }
    };
}

export function updateProduct(productId, productInfo) {
    return async (dispatch, getState) => {
        try {
            const response = await ProductServices.updateProductById(
                productId,
                productInfo
            );
            if (response) {
                dispatch({
                    type: actionTypes.UPDATE_PRODUCT
                });
                response.data.product.message = response.message;
                return response.data.product
            }
        } catch (error) {
            dispatch(productError(error));
        }
    };
}

export function deleteProduct(id) {
    return function (dispatch) {
        return ProductServices.deleteProduct(id)
            .then(response => {
                dispatch(
                    openGlobalSnackbar(response.message, !response.statusCode === 200)
                );
                return { message: response.message, statusCode: response.statusCode };
            })
            .catch(error => {
                return dispatch({
                    type: actionTypes.PRODUCT_FAILED,
                    payload: error
                });
            });
    };
}
