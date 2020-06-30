import axios from 'axios';
import Cookies from 'js-cookie';

export const CORE_ERROR = 'CORE_ERROR';
export const SHOP_ERROR = 'SHOP_ERROR';
export const BRAINTREE_ERROR = 'BRAINTREE_ERROR';
export const PRODUCTS_BYSELL_INFO = 'PRODUCTS_BYSELL_INFO';
export const PRODUCTS_BYARRIVAL_INFO = 'PRODUCTS_BYARRIVAL_INFO';
export const BRAINTREE_INFO = 'BRAINTREE_INFO';
export const CATEGORY_INFO = 'CATEGORY_INFO';
export const FILTERED_RESULT_INFO = 'FILTERED_RESULT_INFO';
export const VIEW_PRODUCT_ERROR = 'VIEW_PRODUCT_ERROR';
export const EXPAND_FILTERED_RESULT_INFO = 'EXPAND_FILTERED_RESULT_INFO';
export const SINGLE_PRODUCT = 'SINGLE_PRODUCT';
export const RELATED_PRODUCTS = 'RELATED_PRODUCTS';

export function coreError(error = '') {
    return (dispatch) => {
        return dispatch({
            type: CORE_ERROR,
            payload: error
        });
    }
}

export function shopError(error = '') {
    return (dispatch) => {
        return dispatch({
            type: SHOP_ERROR,
            payload: error
        });
    }
}

export function braintreeError(error = '') {
    return (dispatch) => {
        return dispatch({
            type: BRAINTREE_ERROR,
            payload: error
        });
    }
}

export function viewProductError(error = '') {
    return (dispatch) => {
        return dispatch({
            type: VIEW_PRODUCT_ERROR,
            payload: error
        });
    }
}

export function productsBySellData(data = []) {
    return (dispatch) => {
        return dispatch({
            type: PRODUCTS_BYSELL_INFO,
            productsBySell: data
        });
    }
}

export function productsByArrivalData(data = []) {
    return (dispatch) => {
        return dispatch({
            type: PRODUCTS_BYARRIVAL_INFO,
            productsByArrival: data
        });
    }
}

export function setBraintreeData(data = []) {
    return (dispatch) => {
        return dispatch({
            type: BRAINTREE_INFO,
            braintree_info: data
        });
    }
}

export function setCategoryData(data = []) {
    return (dispatch) => {
        return dispatch({
            type: CATEGORY_INFO,
            category_info: data
        });
    }
}

export function setFilteredResultData(data = []) {
    return (dispatch) => {
        return dispatch({
            type: FILTERED_RESULT_INFO,
            filtered_result_info: data
        });
    }
}

export function setExtraFilteredResultData(data = []) {
    return (dispatch) => {
        return dispatch({
            type: EXPAND_FILTERED_RESULT_INFO,
            extra_filtered_result_info: data
        });
    }
}

export function setSingleProduct(data = {}) {
    return (dispatch) => {
        return dispatch({
            type: SINGLE_PRODUCT,
            single_product: data
        });
    }
}

export function setRelatedProducts(data = []) {
    return (dispatch) => {
        return dispatch({
            type: RELATED_PRODUCTS,
            related_products: data
        });
    }
}export const getProductsBySell = ({ site, sortBy }) => async (dispatch, getState) => {
    try {        const response = await axios.get(`/api/products?sortBy=${sortBy}&order=desc&limit=8`);
        return dispatch(productsBySellData(response.data));
    } catch (error) {
        dispatch(coreError(error.response.data.error));
        return false;
    }
};export const fetchProductsBySellSSR = ({ site, sortBy }, port) => async (dispatch, getState) => {
    try {        const response = await axios.get(`/api/products?sortBy=${sortBy}&order=desc&limit=8`,
            {
                proxy: {
                    host: 'localhost',
                    port: port
                }
            }
        );
        return dispatch(productsBySellData(response.data));

    } catch (error) {
        return dispatch(coreError(error.response.data.error));
    }
};

export const getProductsByArrival = ({ site, sortBy }) => async (dispatch, getState) => {
    try {
        const response = await axios.get(`/api/products?sortBy=${sortBy}&order=desc&limit=8`);
        return dispatch(productsByArrivalData(response.data));
    } catch (error) {
        dispatch(coreError(error.response.data.error));
        return false;
    }
};

export const getBraintreeClientToken = (site) => async (dispatch, getState) => {
    try {
        const cookies = Cookies.getJSON('mywebsite');
        const token = cookies.token;
        const uid = cookies.user.uid;

        const response = await axios.get(`/api/braintree/getToken/${uid}`, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });
        return dispatch(setBraintreeData(response.data));
    } catch (error) {
        dispatch(braintreeError(error.response.data.error));
        return false;
    }
};

export const getBraintreeClientTokenSSR = (site, cookie = null, port) => async (dispatch, getState) => {
    try {
        const userInfo = JSON.parse(cookie);
        const uid = userInfo.user.uid;
        const token = userInfo.token;

        const response = await axios.get(`/api/braintree/getToken/${uid}`, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            proxy: {
                host: 'localhost',
                port: port
            }
        });
        return dispatch(setBraintreeData(response.data));
    } catch (error) {
        return dispatch(braintreeError(error.response.data.error));
    }
};

export const processPayment = (site, paymentData) => async (dispatch, getState) => {
    try {
        const cookies = Cookies.getJSON('mywebsite');
        const token = cookies.token;
        const uid = cookies.user.uid;

        const response = await axios.post(`/api/braintree/payment/${uid}`, paymentData, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        return dispatch(braintreeError(error.response.data.error));
    }
};

export const createOrder = (site, createOrderData) => async (dispatch, getState) => {
    try {
        const cookies = Cookies.getJSON('mywebsite');
        const token = cookies.token;
        const uid = cookies.user.uid;

        const response = await axios.post(`/api/order/create/${uid}`, { order: createOrderData }, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        return response.data;

    } catch (error) {
        return dispatch(braintreeError(error.response.data.error));
    }
};

export const fetchProductsByArrivalSSR = ({ site, sortBy }, port) => async (dispatch, getState) => {
    try {
        const response = await axios.get(`/api/products?sortBy=${sortBy}&order=desc&limit=8`,
            {
                proxy: {
                    host: 'localhost',
                    port: port
                }
            }
        );
        return dispatch(productsByArrivalData(response.data));

    } catch (error) {
        return dispatch(coreError(error.response.data.error));
    }
};

export const getCategories = (site) => async (dispatch, getState) => {
    try {
        const response = await axios.get(`/api/categories`);
        dispatch(setCategoryData(response.data));
        return true;
    } catch (error) {
        dispatch(shopError(error.response.data.error));
        return false;
    }
};

export const getCategoriesSSR = (site, port) => async (dispatch, getState) => {
    try {
        const response = await axios.get(`/api/categories`,
            {
                proxy: {
                    host: 'localhost',
                    port: port
                }
            }
        );
        return dispatch(setCategoryData(response.data));
    } catch (error) {
        return dispatch(shopError(error.response.data.error));
    }
};

export const getFilteredProducts = (site, skip, limit, filters = {}) => async (dispatch, getState) => {
    try {
        const data = {
            limit,
            skip,
            filters
        };

        const response = await axios.post(`/api/products/by/search`, data, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        });

        dispatch(setFilteredResultData(response.data));
        return true;
    } catch (error) {
        dispatch(shopError(error.response.data.error));
        return false;
    }
};

export const getFilteredProductsSSR = (site, skip, limit, filters = {}, port) => async (dispatch, getState) => {
    try {
        const data = {
            limit,
            skip,
            filters
        };

        const response = await axios.post(`/api/products/by/search`, data, {
            proxy: {
                host: 'localhost',
                port: port
            },
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
        });

        return dispatch(setFilteredResultData(response.data));
    } catch (error) {
        return dispatch(shopError(error.response.data.error));
    }
};

export const getExtraFilteredProducts = (site, skip, limit, filters = {}) => async (dispatch, getState) => {
    try {
        const data = {
            limit,
            skip,
            filters
        };

        const response = await axios.post(`/api/products/by/search`, data, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        });

        dispatch(setExtraFilteredResultData(response.data));
        return true;
    } catch (error) {
        dispatch(shopError(error.response.data.error));
        return false;
    }
};

export const listSuggestions = (site, value) => async (dispatch, getState) => {
    try {
        const response = await axios.get(`/api/products/suggestion?search=${value}`);
        return response.data;
    } catch (error) {
        dispatch(shopError(error.response.data.error));
        return false;
    }
};

export const read = (site, productId) => async (dispatch, getState) => {
    try {
        const response = await axios.get(`/api/product/${productId}`);
        dispatch(setSingleProduct(response.data));
        return true;
    } catch (error) {
        dispatch(viewProductError(error.response.data.error));
        return false;
    }
};

export const readSSR = (site, productId, port) => async (dispatch, getState) => {
    try {
        const response = await axios.get(`/api/product/${productId}`,
            {
                proxy: {
                    host: 'localhost',
                    port: port
                }
            }
        );
        return dispatch(setSingleProduct(response.data));
    } catch (error) {
        return dispatch(viewProductError(error.response.data.error));
    }
};

export const listRelated = (site, productId) => async (dispatch, getState) => {
    try {
        const response = await axios.get(`/api/products/related/${productId}`);
        dispatch(setRelatedProducts(response.data));
        return true;
    } catch (error) {
        dispatch(viewProductError(error.response.data.error));
        return false;
    }
};

export const listRelatedSSR = (site, productId, port) => async (dispatch, getState) => {
    try {
        const response = await axios.get(`/api/products/related/${productId}`,
            {
                proxy: {
                    host: 'localhost',
                    port: port
                }
            }
        );
        return dispatch(setRelatedProducts(response.data));
    } catch (error) {
        return dispatch(viewProductError(error.response.data.error));
    }
};