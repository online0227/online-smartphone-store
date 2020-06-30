import {
    USER_ERROR,
    HISTORY_INFO
} from '../actions/apiUser';

const initialState = {
    error: '',
    history: []
};

export default function (state = initialState, action) {
    switch (action.type) {
        case USER_ERROR:
            return { ...state, error: action.payload };
        case HISTORY_INFO:
            return { ...state, error: '', history: action.history };
        default:
            return state;
    }
};