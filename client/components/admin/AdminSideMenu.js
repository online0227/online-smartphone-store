import React from "react";
import { NavLink } from 'react-router-dom';

const AdminSideMenu = () => (
    <div>
        <div className="card mb-3">
            <h4 className="card-header">Menu</h4>
            <ul className="list-group">
                <li className="list-group-item">
                    <NavLink
                        className="nav-link"
                        activeStyle={{
                            color: "#1ebba3"
                        }}
                        to="/admin" exact
                    >
                        Dashboard Home
                        </NavLink>
                </li>
            </ul>
        </div>
        <div className="card mb-3">
            <h4 className="card-header">Ecommerce Menu</h4>
            <ul className="list-group">
                <li className="list-group-item">
                    <NavLink
                        className="nav-link"
                        activeStyle={{
                            color: "#1ebba3"
                        }}
                        to="/admin/create/category" exact
                    >
                        Create Category
                        </NavLink>
                </li>
                <li className="list-group-item">
                    <NavLink
                        className="nav-link"
                        activeStyle={{
                            color: "#1ebba3"
                        }}
                        to="/admin/create/product" exact
                    >
                        Create Product
                        </NavLink>
                </li>
                <li className="list-group-item">
                    <NavLink
                        className="nav-link"
                        activeStyle={{
                            color: "#1ebba3"
                        }}
                        to="/admin/orders" exact
                    >
                        View Orders
                        </NavLink>
                </li>
                <li className="list-group-item">
                    <NavLink
                        className="nav-link"
                        activeStyle={{
                            color: "#1ebba3"
                        }}
                        to="/admin/products"
                    >
                        Manage Products
                        </NavLink>
                </li>
            </ul>
        </div>
    </div>
);

export default AdminSideMenu;
