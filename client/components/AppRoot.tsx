import React from "react"
import { Router } from "react-router-dom"
import Routes from "./Routes"
import { createMemoryHistory, createBrowserHistory } from 'history';
import { isServer } from "./auth";

export const history = isServer
    ? createMemoryHistory()
    : createBrowserHistory();

export default class extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <Router key={Math.random()} history={history}>
        <Routes />
      </Router>
    )
  }
}