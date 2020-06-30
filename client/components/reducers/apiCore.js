const _ = require("lodash");

import {
    CORE_ERROR,
    SHOP_ERROR,
    PRODUCTS_BYSELL_INFO,
    PRODUCTS_BYARRIVAL_INFO,
    BRAINTREE_INFO,
    CATEGORY_INFO,
    FILTERED_RESULT_INFO,
    EXPAND_FILTERED_RESULT_INFO,
    SINGLE_PRODUCT,
    RELATED_PRODUCTS,
    BRAINTREE_ERROR,
    VIEW_PRODUCT_ERROR
} from '../actions/apiCore';

const initialState = {
    error: '',
    shop_error: '',
    view_product_error: '',
    productsBySell: [],
    productsByArrival: [],
    braintree_error: '',
    braintree_info: [],
    category_info: [],
    filtered_result_info: [],
    single_product: {},
    related_products: []
};

export default function (state = initialState, action) {
    switch (action.type) {
        case CORE_ERROR:
            return { ...state, error: action.payload };
        case SHOP_ERROR:
            return { ...state, shop_error: action.payload };
        case BRAINTREE_ERROR:
            return { ...state, braintree_error: action.payload };
        case PRODUCTS_BYSELL_INFO:
            return { ...state, productsBySell: action.productsBySell };
        case PRODUCTS_BYARRIVAL_INFO:
            return { ...state, productsByArrival: action.productsByArrival };
        case BRAINTREE_INFO:
            return { ...state, braintree_info: action.braintree_info };
        case CATEGORY_INFO:
            return { ...state, category_info: action.category_info };
        case FILTERED_RESULT_INFO:
            return { ...state, filtered_result_info: action.filtered_result_info };
        case EXPAND_FILTERED_RESULT_INFO:
            return { ...state, filtered_result_info: state.filtered_result_info.concat(action.extra_filtered_result_info) };
        case SINGLE_PRODUCT:
            return { ...state, single_product: action.single_product };
        case RELATED_PRODUCTS:
            return { ...state, related_products: action.related_products };
        case VIEW_PRODUCT_ERROR:
            return { ...state, view_product_error: action.payload };
        default:
            return state;
    }
};