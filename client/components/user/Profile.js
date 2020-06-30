import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { getPurchaseHistory, read, update, updateUser } from '../actions/apiUser';
import Layout from "../core/Layout";
import { isServer } from "../auth";
import UserSideMenu from "./UserSideMenu"

class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            email: "",
            password: "",
            error: false,
            success: false,
            isDataFetched: false
        };
    }

    componentDidMount() {
        this.init();
        window.scrollTo(0, 0);
    }

    async init() {
        await this.props.read(this.props.site).then(data => {
            if (data)
                this.setState({ name: data.name, email: data.email, isDataFetched: true });
        });
    };

    handleChange = name => e => {
        this.setState({ error: false, [name]: e.target.value })
    };

    clickSubmit = e => {
        const { name, email, password } = this.state;
        const { site } = this.props;
        e.preventDefault();
        this.props.update(site, { name, email, password }).then(data => {
            if (data) {
                this.props.updateUser(site, data, () => {
                    this.setState({
                        name: data.name,
                        email: data.email,
                    });
                    this.props.history.push("/dashboard");
                });
            }
        }
        );
    };

    profileUpdate = (name, email, password) => (
        <form>
            <div className="form-group">
                <label className="text-muted">Name</label>
                <input
                    type="text"
                    onChange={this.handleChange("name")}
                    className="form-control"
                    value={name}
                />
            </div>
            <div className="form-group">
                <label className="text-muted">Email</label>
                <input
                    type="email"
                    onChange={this.handleChange("email")}
                    className="form-control"
                    value={email}
                />
            </div>
            <div className="form-group">
                <label className="text-muted">New Password (Leave it blank if you don't want to change)</label>
                <input
                    type="password"
                    onChange={this.handleChange("password")}
                    className="form-control"
                    value={password}
                />
            </div>

            <button onClick={this.clickSubmit} className="btn btn-primary">
                Submit
            </button>
        </form>
    );

    showError = () => (
        <div
            className="alert alert-danger"
            style={{ display: this.props.error ? "" : "none" }}
        >
            {this.props.error}
        </div>
    );

    render() {
        if (!isServer && !this.state.isDataFetched) {
            return null;
        }

        return (
            <Layout
                title="Profile"
                description="Update your profile"
                className="container-fluid"
            >
                <div className="row">
                    <div className="col-md-3">
                        <UserSideMenu />
                    </div>
                    <div className="col-md-9">
                        <h2 className="mb-4">Profile update</h2>
                        {this.showError()}
                        <div className="col-md-8">
                            {this.profileUpdate(this.state.name, this.state.email, this.state.password)}
                        </div>
                    </div>
                </div>


            </Layout>
        );
    };
};

function mapStateToProps(state) {
    return {
        error: state.user.error,
        user: state.auth.user,
    };
}

const mapDispatchToProps = dispatch => {
    return {
        getPurchaseHistory: (site) => dispatch(getPurchaseHistory(site)),
        read: (site) => dispatch(read(site)),
        update: (site, { name, email, password }) => dispatch(update(site, { name, email, password })),
        updateUser: (site, user, next) => dispatch(updateUser(site, user, next))
    }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Profile));
