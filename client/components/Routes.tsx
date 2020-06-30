import React from "react"
import { Route, Link, withRouter } from "react-router-dom"
import universal from "react-universal-component"
import { Switch, Redirect } from "react-router"
import universalImport from 'babel-plugin-universal-import/universalImport.js'
import path from 'path'
import AdminRoute from "./auth/AdminRoute";
import PrivateRoute from "./auth/PrivateRoute";
import Menu from "./core/Menu"
import Footer from "./core/Footer"

import "../styles/ToBeDeleted_nav.css"
import 'react-image-lightbox/style.css';
import "react-responsive-carousel/lib/styles/carousel.min.css";

import config from "../config";
import Loading from "./core/Loading";

const UniversalComponent: any = universal(props => universalImport({
  chunkName: props => props.page,
  path: props => path.join(__dirname, `./${props.page}`),
  resolve: props => require.resolveWeak(`./${props.page}`),
  load: props => Promise.all([
    import(`./${props.page}`).catch(err => {
      window.location.href = `${config.server_address}/NotFound`;
    }),
    import(`../styles/${props.site}/theme.css`).catch(err => {
      window.location.href = `${config.server_address}/NotFound`;
    }),

  ]).then(proms => {
    return proms[0]
  })
}), {
  onError: error => {
    console.log("error : ", error);
    window.location.href = `${config.server_address}/NotFound`;
  }, loading: <Loading />,
  loadingTransition: false,
});
export default (props) => {
  let site = "www"; if (typeof window != "undefined" && window.location.hostname != config.domain && window.location.hostname !== "localhost") {
    site = window.location.hostname.split(".")[0];
  } else if (props.staticContext) {
    site = props.staticContext.site;
  }

  return (
    <div>
      <Menu site={site} />
      <Switch>
        <Route
          exact path="/"
          render={({ staticContext, match }: any) => {
            return <UniversalComponent site={site} match={match} page="core/Home" />
          }}
        />

        <Route
          exact path="/shop"
          render={({ staticContext, match }: any) => {
            return <UniversalComponent site={site} match={match} page="core/Shop" />
          }}
        />

        <Route
          path="/shop/product/:productId"
          render={({ staticContext, match }: any) => {
            return <UniversalComponent site={site} match={match} page="core/Product" />
          }}
        />

        <Route
          path="/signin"
          render={({ staticContext, match }: any) => {
            return <UniversalComponent site={site} match={match} page="user/Signin" />
          }}
        />

        <Route
          path="/signup"
          render={({ staticContext, match }: any) => {
            return <UniversalComponent site={site} match={match} page="user/Signup" />
          }}
        />

        <PrivateRoute
          exact path="/dashboard"
          render={({ staticContext, match }: any) => {
            return <UniversalComponent site={site} match={match} exact page="user/UserDashboard" />
          }}
        />

        <PrivateRoute
          path="/dashboard/edit/profile"
          render={({ staticContext, match }: any) => {
            return <UniversalComponent site={site} match={match} exact page="user/Profile" />
          }}
        />

        <AdminRoute
          exact path="/admin"
          render={({ staticContext, match }: any) => {
            return <UniversalComponent site={site} match={match} page="admin/AdminDashboard" />
          }}
        />

        <AdminRoute
          path="/admin/create/category"
          render={({ staticContext, match }: any) => {
            return <UniversalComponent site={site} match={match} page="admin/AddCategory" />
          }}
        />

        <AdminRoute
          path="/admin/create/product"
          render={({ staticContext, match }: any) => {
            return <UniversalComponent site={site} match={match} page="admin/AddProduct" />
          }}
        />

        <AdminRoute
          path="/admin/orders"
          render={({ staticContext, match }: any) => {
            return <UniversalComponent site={site} match={match} page="admin/Orders" />
          }}
        />

        <AdminRoute
          exact path="/admin/products"
          render={({ staticContext, match }: any) => {
            return <UniversalComponent site={site} match={match} page="admin/ManageProducts" />
          }}
        />

        <AdminRoute
          path="/admin/products/update/:productId"
          render={({ staticContext, match }: any) => {
            return <UniversalComponent site={site} match={match} page="admin/UpdateProduct" />
          }}
        />

        <Route
          path="/cart"
          render={({ staticContext, match }: any) => {
            return <UniversalComponent site={site} match={match} exact page="core/Cart" />
          }}
        />

        <Route
          render={({ staticContext, match }: any) => {
            return <UniversalComponent site={site} match={match} page="core/NotFound" />
          }}
        />

      </Switch>
      <Footer site={site} />
    </div>
  );
}
