import React from "react";
import { Route, Redirect } from "react-router-dom";
import { isServer, isAuthenticated } from "./index";

const AdminRoute = ({ render: UniversalComponent, ...rest }) => (
    <Route
        {...rest}
        render={props =>
            isServer || (isAuthenticated() && isAuthenticated().user.role === 1) ? (                <UniversalComponent {...props} />            ) : (                <Redirect
                    to={{
                        pathname: "/",
                        state: { from: props.location }
                    }}
                />
            )
        }
    />
);

export default AdminRoute;