import { createStore, applyMiddleware, compose } from "redux";
import reducers from "./components/reducers"
import thunk from "redux-thunk";

const composeEnhancers =
  typeof window === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose

const enhancer = composeEnhancers(applyMiddleware(thunk))

export default initialState => {
  const store = createStore(reducers, initialState, enhancer)

  if (module.hot) {
    module.hot.accept("./components/reducers", () =>
      store.replaceReducer(require("./components/reducers"))
    )
  }

  return store
}
