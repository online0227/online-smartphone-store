import React from "react";
import { withRouter } from 'react-router-dom';
import Menu from "./Menu";
import "../../styles/Layout.css";

const Layout = ({
    title = "Title",
    description = "Description",
    className,
    children
}) => (
        <div id="Layout">
            <div className="jumbotron">
                    <h2>{title}</h2>
                    <p className="lead">{description}</p>
            </div>
            <div className={className}>{children}</div>
        </div>
    );

export default withRouter(Layout);
