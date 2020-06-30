import fetch from "cross-fetch"

export const FETCH_SUCCESS = "FETCH_SUCCESS";
export const FETCH_ERROR = "FETCH_ERROR";

export function fetchSuccess(response) {
  return (dispatch) => {
    return dispatch({
      type: FETCH_SUCCESS,
      payload: response
    });
  }
}

export function fetchError(error) {
  return (dispatch) => {
    return dispatch({
      type: FETCH_ERROR,
      payload: error
    });
  }
}

export const fetchMD_Homepage = (site) => async (dispatch, getState) => {
  try {
    const response = await fetch(`/api/markdown`);    const items = await response.json()
    dispatch(fetchSuccess(items))

    return dispatch(fetchSuccess(items))
  } catch (err) {
    dispatch(fetchError(err))
  }
}
