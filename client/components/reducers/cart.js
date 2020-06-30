import {
    LIST_CART,
    CART_ERROR
} from '../actions/cart';

const initialState = {
    error: '', products: []
  };

export default function (state = initialState, action) {
    switch (action.type) {        case LIST_CART:
            return {...state, error: '', products: action.products};
        case CART_ERROR:
            return {...state, error: action.payload};
        default:
            return state;
    }
};
