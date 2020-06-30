import React from "react"
import { renderToString } from "react-dom/server"
import { StaticRouter } from "react-router"
import serialize from 'serialize-javascript';
import Routes from "../client/components/Routes"

import { flushChunkNames, clearChunks } from "react-universal-component/server"
import flushChunks from "webpack-flush-chunks"
import configureStore from "../client/store"
import { Provider } from "react-redux"
import { fetchUserSSR } from "../client/components/actions"
import {
  fetchProductsBySellSSR, fetchProductsByArrivalSSR, getBraintreeClientTokenSSR, getCategoriesSSR, getFilteredProductsSSR, readSSR,
  listRelatedSSR
} from "../client/components/actions/apiCore"
import { listCart_SSR } from "../client/components/actions/cart"

import { domain, port, internal_port } from "./config";

export default ({ clientStats }) => (req, res) => {
  let site = "www";
  if (req.hostname !== domain) {
    site = req.hostname.split(".")[0]
  }

  const slug = req.url.split("/").reverse()[0]
  const context = { url: site }
  const store = configureStore()

  const loadCart = (site) => {
    return store.dispatch(listCart_SSR(site, req.cookies.mywebsite, internal_port));
  }

  const loadBraintree = (site) => {
    return store.dispatch(getBraintreeClientTokenSSR(site, req.cookies.mywebsite, internal_port));
  }

  const loadUserLogin = (site) => {
    return store.dispatch(fetchUserSSR(site, req.cookies.mywebsite));
  }

  const loadProductsBySell = (site) => {
    const sortBy = "sold";
    return store.dispatch(fetchProductsBySellSSR({ site, sortBy }, internal_port));
  }

  const loadProductsByArrival = (site) => {
    const sortBy = "createdAt";
    return store.dispatch(fetchProductsByArrivalSSR({ site, sortBy }, internal_port));
  }

  const loadGetCategories = (site) => {
    return store.dispatch(getCategoriesSSR(site, internal_port));
  }

  const loadGetFilteredProducts = (site) => {
    const skip = 0;
    const limit = 8;
    const filter = { cid: [], price: [], name: "" };
    return store.dispatch(getFilteredProductsSSR(site, skip, limit, filter, internal_port));
  }

  const loadReadSSR = (site) => {
    return store.dispatch(readSSR(site, slug, internal_port));
  }

  const loadListRelatedSSR = (site) => {
    return store.dispatch(listRelatedSSR(site, slug, internal_port));
  }

  const app = () =>
    renderToString(
      <Provider store={store}>
        <StaticRouter location={req.originalUrl} context={context}>
          <Routes />
        </StaticRouter>
      </Provider>
    )

  const template = () => {
    const appOutput = app()
    clearChunks();
    const names = flushChunkNames();
    const { js, styles, cssHash } = flushChunks(clientStats, {
      chunkNames: names
    })
    return `
    <!DOCTYPE html>
        <html lang="en">
            <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Online Smartphone Store</title>
              <link rel="shortcut icon" href="/public/img/favicon.ico" />
              <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" />
              <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.2/animate.min.css" />
          ${styles}
        </head>
        <body>
          <div id="root">${appOutput}</div>
          <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
          <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
          <script src="https://use.fontawesome.com/releases/v5.9.0/js/all.js"></script>
          ${js}
          <script>
            window.INITIAL_STATE = ${serialize(store.getState())}
          </script>
          ${cssHash}
        </body>
      </html>
    `
  }

  loadUserLogin(site).then(_ => {
    if (req.originalUrl.match(/^\/$/)) {
      loadProductsBySell(site).then(_ => {
        loadProductsByArrival(site).then(_ => {
          res.send(template());
        })
      })
    }

    else if (req.originalUrl.match(/^\/shop$/)) {
      loadGetCategories(site).then(_ => {
        loadGetFilteredProducts(site).then(_ => {
          res.send(template());
        })
      })
    }

    else if (req.originalUrl.match(/^\/shop\/product\/[0-9]+$/)) {
      loadReadSSR(site).then(_ => {
        loadListRelatedSSR(site).then(_ => {
          res.send(template());
        })
      })
    }
    else {
      res.send(template());
    }

  })
}