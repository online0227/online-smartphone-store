import React from "react";
import { NavLink } from 'react-router-dom';

const UserSideMenu = () => (
    <div className="card">
        <h4 className="card-header">User Links</h4>
        <ul className="list-group">
            <li className="list-group-item">
                <NavLink 
                className="nav-link"
                activeStyle={{
                    color: "#1ebba3"
                }}
                to="/dashboard" exact
                >
                    Dashboard Home
                        </NavLink>
            </li>
            <li className="list-group-item">
                <NavLink 
                className="nav-link"
                activeStyle={{
                    color: "#1ebba3"
                }}
                to="/dashboard/edit/profile" exact
                >
                    Update Profile
                        </NavLink>
            </li>
        </ul>
    </div>
);

export default UserSideMenu;
