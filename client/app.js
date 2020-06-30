import React from "react"
import ReactDOM from "react-dom"
import AppRoot from "./components/AppRoot"
import { AppContainer } from "react-hot-loader"
import { Provider } from "react-redux"
import Cookies from 'js-cookie';
import configureStore from "./store"
import { signIn } from './components/actions';
const store = configureStore(window.INITIAL_STATE);
const cookie = Cookies.getJSON('mywebsite');
if (cookie) {
  store.dispatch(signIn());
}

function render(Component) {
  const renderMethod = module.hot ? ReactDOM.render : ReactDOM.hydrate;
  renderMethod(
    <Provider store={store}>
      <AppContainer>
        <Component />
      </AppContainer>
    </Provider>,
    document.getElementById("root")
  );
}

render(AppRoot)

if (module.hot) {
  module.hot.accept("./components/AppRoot.tsx", () => {
    const NewAppRoot = require("./components/AppRoot.tsx").default
    render(NewAppRoot)
  })
}
