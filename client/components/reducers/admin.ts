import {
    AdminState,
    ADMIN_ERROR,
    LIST_ORDER,
    LIST_ORDER_STATUS,
    AdminActionTypes
} from '../types/admin';

const initialState: AdminState = {
    error: '',
    orders: [],
    order_status: []
};

export function AdminReducer(state = initialState, action: AdminActionTypes) : AdminState {
    switch (action.type) {
        case ADMIN_ERROR:
            return { ...state, error: action.payload };
        case LIST_ORDER:
            return { ...state, error: '', orders: action.orders };
        case LIST_ORDER_STATUS:
            return { ...state, error: '', order_status: action.order_status };
        default:
            return state;
    }
};