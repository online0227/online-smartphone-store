import axios from 'axios';
import Cookies from 'js-cookie';

export const USER_INFO = 'USER_INFO';
export const SIGN_IN = 'SIGN_IN';
export const SIGN_OUT = 'SIGN_OUT';
export const SIGN_ERROR = 'SIGN_ERROR';
export const FETCH_MESSAGE = 'FETCH_MESSAGE';
export const FETCH_SUCCESS = "FETCH_SUCCESS";
export const FETCH_ERROR = "FETCH_ERROR";
export const SET_CURRENT_USER = 'SET_CURRENT_USER';

export function syncCurrentUser(data="") {
    return (dispatch) => {
        return dispatch({
            type: SET_CURRENT_USER,
            user: data
        });
    }
}

export function userData(data="") {
    return (dispatch) => {
        return dispatch({
            type: USER_INFO,
            user: data
        });
    }
}

export function signError(error='') {
    return (dispatch) => {
        return dispatch({
            type: SIGN_ERROR,
            payload: error
        });
    }
}

export function signIn() {
    return (dispatch) => {
        return dispatch({
            type: SIGN_IN
        });
    }
}

export function signOut() {
    return (dispatch) => {        return dispatch({
            type: SIGN_OUT
        });
    }
}

export const socialLogin = (site, user, cart = []) => async (dispatch, getState) => {
    try {
        const response = await axios.post(`/api/social-login`, { user: user, cart: cart }, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        });
        Cookies.set('mywebsite', {token:response.data.token, user: response.data.user});        
        dispatch(signIn());
        dispatch(userData(response.data));
        return response.data;
    } catch (error) {
        dispatch(signError(error.response.data.error));
        return false;
    }
}

export const signUp = ({site, email, password, name, failed = null, cart = []}) => async (dispatch, getState) => {
        try {
            const response = await axios.post(`/api/signup`, { name, email, password, cart }, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                }
            });
            return true;

        } catch (error) {
            if(failed) failed();            dispatch(signError(error.response.data.error));
            return false;
        }
}

export const Login = ({site, email, password, failed = null, cart = []}) => async (dispatch, getState) => {
    try {
        const response = await axios.post(`/api/signin`, {email, password, cart}, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        });

        Cookies.set('mywebsite', {token:response.data.token, user: response.data.user});
        dispatch(signIn());
        return dispatch(userData(response.data));

    } catch (error) {
        if(failed) failed();
        return dispatch(signError(error.response.data.error));
    }
}

export const fetchUser = (site) => async (dispatch, getState) => {
    try {        const cookies = Cookies.getJSON('mywebsite');
        const userInfo = cookies.user;
        return dispatch(syncCurrentUser(userInfo));
    } catch (err) {
        dispatch(signError(err))
        return false;
    }
};

export const fetchUserSSR = (site, cookie) => async (dispatch, getState) => {
    if (!site || !cookie) return
    try {        let userInfo = JSON.parse(cookie).user;
        dispatch(syncCurrentUser(userInfo));
        return true;
    } catch (err) {
        dispatch(signError(err))
        return false;
    }
}

export const fetchSignOut = (site) => async (dispatch, getState) => {
    try {
        const response = await axios.get(`/api/signout`);
        Cookies.remove('mywebsite');
        dispatch(signOut());
        return response.data;
    } catch (error) {
        dispatch(signError(error.response.data.error));
        return false;
    }
}
  
