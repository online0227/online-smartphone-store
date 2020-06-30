import React, { Component } from 'react';
import { withRouter, Link, NavLink } from "react-router-dom";
import { connect } from 'react-redux';
import Layout from "../core/Layout";
import { fetchUser } from '../actions'
import { isServer } from "../auth";
import AdminSideMenu from "./AdminSideMenu";

class AdminDashboard extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            isDataFetched: false
        };
    }

    componentDidMount() {
        this._isMounted = true;
        this.fetchUser();
        window.scrollTo(0, 0);
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    async fetchUser() {
        await this.props.fetchUser(this.props.site).then(response => {
            if (this._isMounted) {
                this.setState({ isDataFetched: true });
            }
        });
    };

    adminInfo = () => {
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
                            <AdminSideMenu />
                        </div>
                        <div className="col-md-9">
                            {this.adminInfo()}
                        </div>
                    </div>
                </Layout>
            </div>
        );
    };
};

function mapStateToProps(state) {
    return {
        user: state.auth.user
    };
}

const mapDispatchToProps = dispatch => {
    return {
        fetchUser: (site) => dispatch(fetchUser(site))
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AdminDashboard));
