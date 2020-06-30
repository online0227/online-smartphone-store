import axios from 'axios';
import Cookies from 'js-cookie';

export const ADMIN_ERROR = 'ADMIN_ERROR';
export const LIST_ORDER = 'LIST_ORDER';
export const LIST_ORDER_STATUS = 'LIST_ORDER_STATUS';

export function adminError(error = '') {
    return (dispatch) => {
        return dispatch({
            type: ADMIN_ERROR,
            payload: error
        });
    }
}

export function ordersData(data = []) {
    return (dispatch) => {
        return dispatch({
            type: LIST_ORDER,
            orders: data
        });
    }
}

export function orderStatusData(data = []) {
    return (dispatch) => {
        return dispatch({
            type: LIST_ORDER_STATUS,
            order_status: data
        });
    }
}

export const getCategories = (site) => async (dispatch, getState) => {
    try {
        const response = await axios.get(`/api/categories`);
        return response.data;
    } catch (error) {
        if (failed) failed();
        dispatch(adminError(error.response.data.error));
        return false;
    }
};

export const createCategory = ({ site, name, failed = null }) => async (dispatch, getState) => {
    try {
        const cookie = Cookies.getJSON('mywebsite');
        const token = cookie.token;
        const uid = cookie.user.uid;

        const response = await axios.post(`/api/category/create/${uid}`, { name }, {
            headers: {
                authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        });

        return true;

    } catch (error) {
        if (failed) failed();
        dispatch(adminError(error.response.data.error));
        return false;
    }
};

export const createProduct = ({ site, failed = null }, formData) => async (dispatch, getState) => {
    try {
        const cookie = Cookies.getJSON('mywebsite');
        const token = cookie.token;
        const uid = cookie.user.uid;

        const response = await axios.post(`/api/product/create/${uid}`, formData, {
            headers: {
                authorization: `Bearer ${token}`,
                Accept: "application/json",
            }
        });
        return response.data;

    } catch (error) {
        if (failed) failed();
        dispatch(adminError(error.response.data.error));
        return false;
    }
};

export const updateProduct = ({ site, productId }, formData) => async (dispatch, getState) => {
    try {
        const cookie = Cookies.getJSON('mywebsite');
        const token = cookie.token;
        const uid = cookie.user.uid;

        const response = await axios.put(`/api/product/${productId}/${uid}`, formData, {
            headers: {
                authorization: `Bearer ${token}`,
                Accept: "application/json",
            }
        });
        return response.data;

    } catch (error) {
        dispatch(adminError(error.response.data.error));
        return false;
    }
};

export const getProducts = (site) => async (dispatch, getState) => {
    try {
        const response = await axios.get(`/api/products?limit=undefined`);
        return response.data;

    } catch (error) {
        dispatch(adminError(error.response.data.error));
        return false;
    }
};

export const getProduct = ({ site, productId }) => async (dispatch, getState) => {
    try {
        const response = await axios.get(`/api/product/${productId}`);
        return response.data;

    } catch (error) {
        dispatch(adminError(error.response.data.error));
        return false;
    }
};


export const deleteProduct = ({ site, productId }) => async (dispatch, getState) => {
    try {
        const cookie = Cookies.getJSON('mywebsite');
        const token = cookie.token;
        const uid = cookie.user.uid;

        const response = await axios.delete(`/api/product/${productId}/${uid}`, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;

    } catch (error) {
        dispatch(adminError(error.response.data.error));
        return false;
    }
};

export const listOrders = (site) => async (dispatch, getState) => {
    try {
        const cookie = Cookies.getJSON('mywebsite');
        const token = cookie.token;
        const uid = cookie.user.uid;

        const response = await axios.get(`/api/order/list/${uid}`, {
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        dispatch(ordersData(response.data));
        return true;

    } catch (error) {
        dispatch(adminError(error.response.data.error));
        return false;
    }
};

export const getStatusValues = (site) => async (dispatch, getState) => {
    try {
        const cookie = Cookies.getJSON('mywebsite');
        const token = cookie.token;
        const uid = cookie.user.uid;

        const response = await axios.get(`/api/order/status-values/${uid}`, {
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        dispatch(orderStatusData(response.data));
        return true;

    } catch (error) {
        dispatch(adminError(error.response.data.error));
        return false;
    }
};

export const updateOrderStatus = ({ site, orderId, status }) => async (dispatch, getState) => {
    try {
        const cookie = Cookies.getJSON('mywebsite');
        const token = cookie.token;
        const uid = cookie.user.uid;

        const response = await axios.put(`/api/order/${orderId}/status/${uid}`, { status, orderId }, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        dispatch(listOrders());
        return true;

    } catch (error) {
        dispatch(adminError(error.response.data.error));
        return false;
    }
};


