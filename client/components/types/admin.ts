export interface AdminState {
    error: string;
    orders: string[];
    order_status: string[];
}

export const ADMIN_ERROR = "ADMIN_ERROR";
export const LIST_ORDER = "LIST_ORDER";
export const LIST_ORDER_STATUS = "LIST_ORDER_STATUS";

interface AdminErrorAction {
    type: typeof ADMIN_ERROR;
    payload: string;
}

interface ListOrderAction {
    type: typeof LIST_ORDER;
    orders: string[];
}

interface ListOrderStatusAction {
    type: typeof LIST_ORDER_STATUS;
    order_status: string[];
}

export type AdminActionTypes = AdminErrorAction | ListOrderAction | ListOrderStatusAction;