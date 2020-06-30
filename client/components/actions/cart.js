import axios from 'axios';
import Cookies from 'js-cookie';

export const ADD_CART = 'ADD_CART';
export const REMOVE_CART = 'REMOVE_CART';
export const LIST_CART = 'LIST_CART';
export const CART_ERROR = 'CART_ERROR';
export const CART_SUCCESS = 'CART_SUCCESS';

export function cartError(error = '') {
    return (dispatch) => {
        return dispatch({
            type: CART_ERROR,
            payload: error
        });
    }
}

export function cartData(data = []) {
    return (dispatch) => {
        return dispatch({
            type: LIST_CART,
            products: data
        });
    }
}

export const listGuestCart = (site, items) => async (dispatch, getState) => {
    try {
        const response = await axios.post(`/api/guest-cart`, items, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            }
        });

        return dispatch(cartData(response.data));
    } catch (error) {
        dispatch(cartError(error.response.data.error));
        return false;
    }
};

export const countCart = (site) => async (dispatch, getState) => {
    try {
        const cookies = Cookies.getJSON('mywebsite');
        const token = cookies.token;
        const uid = cookies.user.uid;

        const response = await axios.get(`/api/count-cart/${uid}`, {
            headers: {
                authorization: `Bearer ${token}`
            }
        });

        return response;
    } catch (error) {
        dispatch(cartError(error.response.data.error));
        return false;
    }
};

export const listCart = (site) => async (dispatch, getState) => {
    try {
        const cookies = Cookies.getJSON('mywebsite');
        const token = cookies.token;
        const uid = cookies.user.uid;

        const response = await axios.get(`/api/list-cart/${uid}`, {
            headers: {
                authorization: `Bearer ${token}`
            }
        });

        return dispatch(cartData(response.data));
    } catch (error) {
        dispatch(cartError(error.response.data.error));
        return false;
    }
};

export const listCart_SSR = (site, cookie = null, port) => async (dispatch, getState) => {
    try {
        const userInfo = JSON.parse(cookie);
        const uid = userInfo.user.uid;
        const token = userInfo.token;

        const response = await axios.get(`/api/list-cart/${uid}`, {
            proxy: {
                host: 'localhost',
                port: port
            },
            headers: {
                authorization: `Bearer ${token}`
            }
        });

        dispatch(cartData(response.data));
        return true;

    } catch (error) {
        dispatch(cartError(error.response.data.error));
        return false;
    }
};

export const addCart = ({ site, productId = -1 }) => async (dispatch, getState) => {
    try {
        const cookie = Cookies.getJSON('mywebsite');
        const token = cookie.token;
        const uid = cookie.user.uid;

        const response = await axios.post(`/api/add-cart/${uid}`, { productId }, {
            headers: {
                authorization: `Bearer ${token}`,
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        })

        dispatch(listCart(site));
        return true;

    } catch (error) {
        dispatch(cartError(error.response.data.error));
        return false;
    }
};

export const updateCart = ({ site, productId = -1, new_count }) => async (dispatch, getState) => {
    try {
        const cookie = Cookies.getJSON('mywebsite');
        const token = cookie.token;
        const uid = cookie.user.uid;

        const response = await axios.put(`/api/update-cart/${uid}`, { productId, new_count }, {
            headers: {
                authorization: `Bearer ${token}`,
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        })

        dispatch(listCart(site));
        return true;

    } catch (error) {
        dispatch(cartError(error.response.data.error));
        return false;
    }
};

export const removeCart = ({ site, productId = -1 }) => async (dispatch, getState) => {
    try {
        const cookie = Cookies.getJSON('mywebsite');
        const token = cookie.token;
        const uid = cookie.user.uid;

        const response = await axios.put(`/api/remove-cart/${uid}`, { productId }, {
            headers: {
                authorization: `Bearer ${token}`,
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        })

        dispatch(listCart(site));
        return true;

    } catch (error) {
        dispatch(cartError(error.response.data.error));
        return false;
    }
};

export const emptyCart = (site) => async (dispatch, getState) => {
    try {
        const cookie = Cookies.getJSON('mywebsite');
        const token = cookie.token;
        const uid = cookie.user.uid;

        const response = await axios.delete(`/api/empty-cart/${uid}`, {
            headers: {
                authorization: `Bearer ${token}`,
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        })

        dispatch(listCart(site));
        return true;

    } catch (error) {
        dispatch(cartError(error.response.data.error));
        return false;
    }
};