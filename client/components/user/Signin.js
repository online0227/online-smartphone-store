import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { Login } from '../actions';
import { signError } from '../actions';
import Layout from "../core/Layout";
import SocialLogin from "./SocialLogin";
import { listCart } from "../actions/cart"
import { getCart, emptyCart } from "../core/cartHelpers";

class Signin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            email: "",
            password: "",
            isSubmitting: false
        };
    }

    componentDidMount() {
        this.props.signError('');        window.scrollTo(0, 0);
    }

    handleChange = stateName => event => {
        this.setState({ [stateName]: event.target.value })
    };

    clickSubmit = e => {
        const { email, password } = this.state;
        const { site } = this.props;
        e.preventDefault();

        let cart = getCart();

        const { isSubmitting } = this.state;

        if (isSubmitting) return;

        if (!isSubmitting) {
            const imagePath = require(`../../images/spinner.gif`)
            $('#submit').html(`<img src="${imagePath}"/>`);            this.setState({ isSubmitting: true });
        }

        const failed = () => {
            $('#submit').html('Submit');
            this.setState({ isSubmitting: false });
        };

        const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
        return sleep(300).then(() => {
            const promise = this.props.Login({ site, email, password, failed, cart });

            promise.then(data => {
                if (this.state.isSubmitting == true) {                    emptyCart(() => {

                    });                    this.props.listCart(this.props.site).then(unused => {
                        if (data.user.user.role === 0) {                            this.props.history.push("/dashboard");                        } else if (data.user.user.role === 1) {
                            this.props.history.push("/admin");                        }                    });
                }
            })


        });

    };

    signInForm = () => (
        <form>
            <div className="form-group">
                <label className="text-muted">Email</label>
                <input
                    onChange={this.handleChange("email")}
                    type="email"
                    className="form-control"
                    value={this.state.email}
                />
            </div>

            <div className="form-group">
                <label className="text-muted">Password</label>
                <input
                    onChange={this.handleChange("password")}
                    type="password"
                    className="form-control"
                    value={this.state.password}
                />
            </div>
            <button onClick={this.clickSubmit}
                id="submit"
                type="submit"
                value="Submit"
                name="submit"
                className="btn btn-primary">
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
        return (
            <Layout
                title="Signin"
                description="Signin to Online Smartphone Store"
                className="container col-md-8 offset-md-2"
            >
                {this.showError()}
                <SocialLogin
                    site={this.props.site}
                />
                <hr />
                {this.signInForm()}
            </Layout>
        );
    };
};

function mapStateToProps(state) {
    return {
        error: state.auth.error,
        user: state.auth.user
    };
}

const mapDispatchToProps = dispatch => {
    return {
        signError: (error) => dispatch(signError(error)),
        listCart: (site) => dispatch(listCart(site)),
        Login: ({ site, email, password, redirect, failed, cart }) => dispatch(Login({ site, email, password, failed, cart }))
    }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Signin));
