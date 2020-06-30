import React, { Component } from 'react';
import { withRouter, NavLink } from "react-router-dom";
import { connect } from 'react-redux';
import Layout from "../core/Layout";
import { getProducts, deleteProduct } from '../actions/admin';
import { isServer } from "../auth";
import AdminSideMenu from "./AdminSideMenu";
class ManageProducts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            products: [],
            isSubmitting: false,
            success: false,
            isDataFetched: false
        };
    }

    componentDidMount() {
        this.loadProducts();
        window.scrollTo(0, 0);
    }

    async loadProducts() {
        await this.props.getProducts(this.props.site).then(data => {
            if (data.error) {
                this.props.adminError(data.error);
            } else {
                this.setState({
                    products: data,
                    isDataFetched: true
                });
            }
        });
    };

    destroy = productId => {
        const { site } = this.props;
        this.props.deleteProduct({ site, productId }).then(data => {
            if (data.error) {
                console.log(data.error);
            } else {
                this.loadProducts();
            }
        });
    };

    render() {
        if (!isServer && !this.state.isDataFetched) {
            return null;
        }

        return (            <Layout
                title="Manage Products"
                description="Perform CRUD on products"
                className="container-fluid"
            >
                <div className="row">
                    <div className="col-md-3">
                        <AdminSideMenu />
                    </div>
                    <div className="col-md-9">
                        <div className="col-12">
                            <h2 className="text-center">
                                Total {this.state.products.length} products
                    </h2>
                            <hr />
                            <ul className="list-group">
                                {this.state.products.map((p, i) => (                                    <li
                                        key={i}
                                        className="list-group-item d-flex justify-content-between align-items-center"
                                    >
                                        <strong>{p.name}</strong>

                                        <NavLink
                                            className="nav-link"
                                            activeStyle={{
                                                color: "#1ebba3"
                                            }}
                                            to={`/admin/products/update/${p.pid}`} exact
                                        >
                                            <span className="badge badge-warning badge-pill">
                                                Update
                                            </span>
                                        </NavLink>

                                        <NavLink
                                        to={"#"}
                                            onClick={() => this.destroy(p.pid)}
                                            className="badge badge-danger badge-pill"
                                        >
                                            Delete
                                </NavLink>
                                    </li>
                                ))}
                            </ul>
                            <br />
                        </div>
                    </div>
                </div>
            </Layout>
        );
    };
};

function mapStateToProps(state) {
    return {
        user: state.auth.user,
        error: state.admin.error
    };
}

const mapDispatchToProps = dispatch => {
    return {
        adminError: (error) => dispatch(adminError(error)),
        getProducts: (site) => dispatch(getProducts(site)),
        deleteProduct: ({ site, productId }) => dispatch(deleteProduct({ site, productId }))
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ManageProducts));
