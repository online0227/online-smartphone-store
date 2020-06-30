import React, { Component } from 'react';
import { withRouter, Redirect, Link } from "react-router-dom";
import { connect } from 'react-redux';
import { getPurchaseHistory } from '../actions/apiUser';
import { fetchUser } from '../actions'
import Layout from "../core/Layout";
import moment from "moment";
import { isServer } from "../auth";
import UserSideMenu from "./UserSideMenu"

class UserDashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isDataFetched: false
        };
    }

    componentDidMount() {
        this.fetchUser();
        this.init();
        window.scrollTo(0, 0);
    }

    async fetchUser() {
        await this.props.fetchUser(this.props.site).then(response => {

        });
    };

    async init() {
        await this.props.getPurchaseHistory(this.props.site).then(response => {
            if (response)
                this.setState({ isDataFetched: true });
        });
    };

    userInfo = () => {
        return (
            <div className="card mb-5">
                <h3 className="card-header">User Information</h3>
                <ul className="list-group">
                    <li className="list-group-item">{this.props.user.name}</li>
                    <li className="list-group-item">{this.props.user.email}</li>
                    <li className="list-group-item">
                        {this.props.user.role === 1 ? "Admin" : "Registered User"}
                    </li>
                </ul>
            </div>
        );
    };

    purchaseHistory = history => {
        return (
            <div className="card mb-5">
                <h3 className="card-header">Purchase history</h3>
                <ul className="list-group">
                    <li className="list-group-item">
                        {this.props.history.map((h, i) => {
                            return (
                                <div key={i}>
                                    <h3>Order Status: {h.status}</h3>
                                    <hr />
                                    {h.products.map((p, index) => {                                        const totalPrice = p.quantity * p.price;
                                        return (
                                            <div key={index}>
                                                <h6>Product name: {p.name}</h6>
                                                <h6>
                                                    Product price: ${p.price}
                                                </h6>
                                                <h6>
                                                    Quantity: ${p.quantity}
                                                </h6>
                                                <h6>
                                                    Total Price: ${totalPrice}
                                                </h6>
                                                <h6>
                                                    Purchased date:{" "}
                                                    {moment(
                                                        h.createdAt
                                                    ).fromNow()}
                                                </h6>
                                                {i !== this.props.history.length - 1 ?
                                                (<br />) : (<div></div>)}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </li>
                </ul>
            </div>
        );
    };

    render() {
        if (!isServer && !this.state.isDataFetched) {
            return null;
        }

        return (
            <div>
                <Layout
                    title="Dashboard"
                    description={`G'day ${this.props.user.name}!`}
                    className="container-fluid"
                >
                    <div className="row">
                        <div className="col-md-3">
                            <UserSideMenu />
                        </div>
                        <div className="col-md-9">
                            {this.userInfo()}
                            {this.purchaseHistory(this.props.history)}
                        </div>
                    </div>
                </Layout>
            </div>
        );
    };
};

function mapStateToProps(state) {
    return {
        user: state.auth.user,
        history: state.user.history,
    };
}

const mapDispatchToProps = dispatch => {
    return {
        userError: (error) => dispatch(userError(error)),
        getPurchaseHistory: (site) => dispatch(getPurchaseHistory(site)),
        fetchUser: (site) => dispatch(fetchUser(site))
    }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UserDashboard));
