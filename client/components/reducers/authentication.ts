import {
    AuthState,
    USER_INFO,
    SIGN_IN,
    SIGN_OUT,
    SIGN_ERROR,
    SET_CURRENT_USER,
    AuthActionTypes
} from "../types/authentication"

const initialState: AuthState = {
    error: '', logged: false, user: ""
};

export function AuthReducer(state = initialState, action: AuthActionTypes): AuthState {
    switch (action.type) {
        case USER_INFO:
            return { ...state, user: action.user };
        case SIGN_IN:
            return { ...state, error: '', logged: true };
        case SIGN_OUT:
            return { ...state, error: '', logged: false };
        case SIGN_ERROR:
            return { ...state, error: action.payload };
        case SET_CURRENT_USER:
            return { ...state, error: '', logged: true, user: action.user };
        default:
            return state;
    }
};