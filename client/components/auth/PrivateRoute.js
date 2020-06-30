import React from "react";
import { Route, Redirect } from "react-router-dom";
import { isServer, isAuthenticated } from "./index";

const PrivateRoute = ({ render: UniversalComponent, ...rest }) => (
    <Route
        {...rest}
        render={props =>
            isServer || isAuthenticated() ? (                <UniversalComponent {...props} />            ) : (                <Redirect
                    to={{
                        pathname: "/",
                        state: { from: props.location }
                    }}
                />
            )
        }
    />
);

export default PrivateRoute;