import axios from 'axios';
import Cookies from 'js-cookie';

export const USER_ERROR = 'USER_ERROR';
export const HISTORY_INFO = 'HISTORY_INFO';

export function userError(error = '') {
    return (dispatch) => {
        return dispatch({
            type: USER_ERROR,
            payload: error
        });
    }
}

export function historyData(data = "") {
    return (dispatch) => {
        return dispatch({
            type: HISTORY_INFO,
            history: data
        });
    }
}

export const getPurchaseHistory = (site) => async (dispatch, getState) => {
    try {
        const cookies = Cookies.getJSON('mywebsite');
        const token = cookies.token;
        const uid = cookies.user.uid;
        
        const response = await axios.get(`/api/orders/by/user/${uid}`, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });
        dispatch(historyData(response.data));
        return true;
    } catch (error) {
        console.log("error : ", error)
        dispatch(userError(error.response.data.error));
        return false;
    }
};

export const read = (site) => async (dispatch, getState) => {
    try {
        const cookies = Cookies.getJSON('mywebsite');
        const token = cookies.token;
        const uid = cookies.user.uid;

        const response = await axios.get(`/api/user/${uid}`, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });        return response.data;
    } catch (error) {
        dispatch(userError(error));
        return false;
    }
};

export const update = (site, data) => async (dispatch, getState) => {
    try {
        const cookies = Cookies.getJSON('mywebsite');
        const token = cookies.token;
        const uid = cookies.user.uid;
        
        let user = { name : data.name, email : data.email, password : data.password }

        const response = await axios.put(`/api/user/${uid}`, user, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        dispatch(userError(error.response.data.error));
        return false;
    }
};

export const updateUser = (site, user, next) => async (dispatch, getState) => {
    try {
        const cookie = Cookies.getJSON('mywebsite');
        const token = cookie.token;
        const { uid, email, name, role } = user;
        Cookies.set('mywebsite', { token: token, user: { uid, email, name, role } });

        next();
    } catch (error) {
        dispatch(userError(error));
        return false;
    }
};