import React, { Component } from 'react';
import { withRouter, Link } from "react-router-dom";
import { connect } from 'react-redux';
import Layout from "../core/Layout";
import { adminError, listOrders, getStatusValues, updateOrderStatus } from '../actions/admin';
import { isServer } from "../auth";
import moment from "moment";
import AdminSideMenu from "./AdminSideMenu";

class Orders extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isSubmitting: false,
            success: false,
            isDataFetched: false
        };
    }

    componentDidMount() {
        this.loadOrders();
        this.loadStatusValues();
        window.scrollTo(0, 0);
    }

    async loadOrders() {
        await this.props.listOrders(this.props.site).then(data => {
            if (data.error) {
                this.props.adminError(data.error);
            }
        });
    };

    async loadStatusValues() {
        await this.props.getStatusValues(this.props.site).then(data => {
            if (data.error) {
                this.props.adminError(data.error);
            } else {
                this.setState({
                    isDataFetched: true
                });
            }
        });
    };

    showOrdersLength = () => {
        if (this.props.orders.length > 0) {
            return (<h1 className="text-danger display-4">
                Total orders: {this.props.orders.length}
            </h1>
            );
        } else {
            return <h1 className="text-danger">No orders</h1>;
        }
    };

    handleStatusChange = (e, orderId) => {
        const status = e.target.value;
        const { site } = this.props;
        this.props.updateOrderStatus({ site, orderId, status }).then(
            data => {
                if (data.error) {
                    console.log("Status update failed");
                }
            }
        );
    };

    showStatus = o => (
        <div className="form-group">
            <h3 className="mark mb-4">Status: {o.status}</h3>
            <select
                className="form-control"
                onChange={e => this.handleStatusChange(e, o.oid)}
            >
                <option>Update Status</option>
                {this.props.order_status.map((status, index) => (
                    <option key={index} value={status}>
                        {status}
                    </option>
                ))}
            </select>
        </div>
    );

    showInput = (key, value) => (<div className="input-group mb-2 mr-sm-2">
        <div className="input-group-prepend" >
            <div className="input-group-text" >{key}</div>
        </div>
        <input
            type="text"
            value={value}
            className="form-control"
            style={{ backgroundColor: "#53595f" }}
            readOnly
        />
    </div>
    );

    render() {
        if (!isServer && !this.state.isDataFetched) {
            return null;
        }

        return (<Layout
            title="Orders"
            description={`G'day ${
                this.props.user.name
                }, you can manage all the orders here`}
            className="container-fluid"
        >
            <div className="row">
                <div className="col-md-3">
                    <AdminSideMenu />
                </div>
                <div className="col-md-9">
                    <div className="col-md-8">
                        {this.showOrdersLength()}

                        {this.props.orders.map((o, oIndex) => {
                            return (<div
                                className="mt-5"
                                key={oIndex}
                                style={{ borderBottom: "5px solid indigo" }}
                            >
                                <h2 className="mb-5">
                                    <span className="bg-primary">
                                        Order ID: {o.oid}
                                    </span>
                                </h2>

                                <ul className="list-group mb-2">
                                    <li className="list-group-item">
                                        {this.showStatus(o)}
                                    </li>
                                    <li className="list-group-item">
                                        Transaction ID: {o.transaction_id}
                                    </li>
                                    <li className="list-group-item">
                                        Amount: ${o.amount}
                                    </li>
                                    <li className="list-group-item">
                                        Ordered by: {o.name}
                                    </li>
                                    <li className="list-group-item">
                                        Ordered on:{" "}
                                        {moment(o.createdAt).fromNow()}
                                    </li>
                                    <li className="list-group-item">
                                        Delivery address: {o.address}
                                    </li>
                                </ul>

                                <h3 className="mt-4 mb-4 font-italic">
                                    Total products in the order:{" "}
                                    {o.products.length}
                                </h3>

                                {o.products.map((p, pIndex) => (
                                    <div
                                        className="mb-4"
                                        key={pIndex}
                                        style={{
                                            padding: "20px",
                                            border: "1px solid indigo"
                                        }}
                                    >
                                        {this.showInput("Product name", p.name)}
                                        {this.showInput("Product price", p.price)}
                                        {this.showInput("Product total", p.quantity)}
                                        {this.showInput("Product Id", p.pid)}
                                    </div>
                                ))}

                            </div>
                            );
                        })}

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
        orders: state.admin.orders,
        order_status: state.admin.order_status
    };
}

const mapDispatchToProps = dispatch => {
    return {
        adminError: (error) => dispatch(adminError(error)),
        listOrders: (site) => dispatch(listOrders(site)),
        getStatusValues: (site) => dispatch(getStatusValues(site)),
        updateOrderStatus: ({ site, orderId, status }) => dispatch(updateOrderStatus({ site, orderId, status })),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Orders));
