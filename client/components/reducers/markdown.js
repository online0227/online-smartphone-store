import {
    FETCH_SUCCESS,
    FETCH_ERROR,
} from '../actions/markdown';

export default function (state = {}, action) {
    switch (action.type) {
      case FETCH_SUCCESS:
              return {
          ...state,
          content: action.payload
        }
      case FETCH_ERROR:
        return {
          ...state,
          error: action.payload
        }
      default:
        return state
    }
  }
  