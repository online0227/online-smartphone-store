export interface AuthState {
    error: string;
    logged: boolean;
    user: string;
}

export const USER_INFO = "USER_INFO";
export const SIGN_IN = "SIGN_IN";
export const SIGN_OUT = "SIGN_OUT";
export const SIGN_ERROR = "SIGN_ERROR";
export const SET_CURRENT_USER = "SET_CURRENT_USER";

interface UserInfoAction {
    type: typeof USER_INFO;
    user: string;
}

interface SignInAction {
    type: typeof SIGN_IN;
}

interface SignOutAction {
    type: typeof SIGN_OUT;
}

interface SignErrorAction {
    type: typeof SIGN_ERROR;
    payload: string;
}

interface SetCurrentUserAction {
    type: typeof SET_CURRENT_USER;
    user: string;
}

export type AuthActionTypes = UserInfoAction | SignInAction | SignOutAction | SignErrorAction | SetCurrentUserAction;