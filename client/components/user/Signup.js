import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { signError, signUp } from '../actions';
import Layout from "../core/Layout";
import { getCart, emptyCart, itemTotal } from "../core/cartHelpers";
import ReCAPTCHA from "react-google-recaptcha";
import { RECAPTCHA_SITE_KEY } from "../../config";
import SocialLogin from "./SocialLogin";
import { listGuestCart } from "../actions/cart"

const RECAPTCHA_DELAY = 1500;

class Signup extends Component {
    constructor(props) {        super(props);
        this.state = {
            name: "",
            email: "",
            password: "",
            isSubmitting: false,
            success: false,
            recaptchaValue: "[empty]",
            recaptchaLoad: false,
            recaptchaExpired: false,
            recaptchaLoaded: false,
            guestcartTransferred: false,
        };
        this._reCaptchaRef = React.createRef();
    }

    componentDidMount() {
        this.props.signError('');        window.scrollTo(0, 0);

        setTimeout(() => {
            this.setState({ recaptchaLoad: true });
        }, RECAPTCHA_DELAY);
    }

    handleRecaptchaChange = recaptchaValue => {
        this.setState({ recaptchaValue });
        if (recaptchaValue === null) {
            this.setState({ recaptchaExpired: true });
        } else {
            this.setState({ recaptchaExpired: false });
        }
    };

    asyncScriptOnLoad = () => {
        this.setState({ recaptchaLoaded: true });
    };

    handleChange = stateName => event => {
        this.setState({ [stateName]: event.target.value })
    };

    clickSubmit = e => {
        if (this.state.recaptchaExpired === true || this.state.recaptchaLoaded === false || this.state.recaptchaValue === "[empty}"
            || this.state.recaptchaLoad === false) {
            return;
        }

        const { name, email, password } = this.state;
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
            this.setState({ isSubmitting: false });        };

        const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
        return sleep(300).then(() => {
            const promise = this.props.signUp({ site, email, password, name, failed, cart });            promise.then(response => {
                if (response) {
                    if (itemTotal() > 0) {
                        this.setState({ guestcartTransferred: true })
                    }                    emptyCart(() => {

                    });                    let items = getCart();
                    this.props.listGuestCart(this.props.site, items).then(data => {

                    });

                    this.props.signError('');
                    $('#submit').html('Submit');
                    this.setState({
                        name: "",
                        email: "",
                        password: "",
                        isSubmitting: false,
                        success: true,
                        recaptchaValue: "[empty]",
                        recaptchaExpired: false,
                    });
                    this._reCaptchaRef.current.reset();
                } else {
                    this.setState({
                        success: false,
                        recaptchaValue: "[empty]",
                        recaptchaExpired: false,
                    })
                    this._reCaptchaRef.current.reset();
                }
            })
        });


    }

    signUpForm = () => (
        <form>
            <div className="form-group">
                <label className="text-muted">Name</label>
                <input
                    onChange={this.handleChange("name")}
                    type="text"
                    className="form-control"
                    value={this.state.name}
                />
            </div>

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
            <div style={{ marginBottom: "1.0rem" }}>
                <ReCAPTCHA
                    onChange={this.handleRecaptchaChange}
                    ref={this._reCaptchaRef}
                    sitekey={RECAPTCHA_SITE_KEY}
                    asyncScriptOnLoad={this.asyncScriptOnLoad}
                />
            </div>

            <button onClick={this.clickSubmit}
                disabled={!this.state.recaptchaLoaded || this.state.recaptchaValue === "[empty]"
                    || this.state.recaptchaValue === null
                }
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

    showSuccess = () => (
        <div>
            <div
                className="alert alert-info"
                style={{ display: this.state.success ? "" : "none" }}
            >
                New account is created. Please <Link to="/signin">Signin</Link>.
            </div>
            <div
                className="alert alert-info"
                style={{ display: this.state.guestcartTransferred ? "" : "none" }}
            >
                All the items in your cart has been transferred to your account.
            </div>
        </div>
    );

    render() {
        return (
            <Layout
                title="Signup"
                description="Signup to Online Smartphone Store"
                className="container col-md-8 offset-md-2"
            >
                {this.showSuccess()}
                {this.showError()}
                <SocialLogin
                    site={this.props.site}
                />
                <hr />
                {this.signUpForm()}
            </Layout>
        );
    };
};

function mapStateToProps(state) {
    return {
        error: state.auth.error
    };
}

const mapDispatchToProps = dispatch => {
    return {
        signError: (error) => dispatch(signError(error)),
        signUp: ({ site, email, password, name, failed, cart }) => dispatch(signUp({ site, email, password, name, failed, cart })),
        listGuestCart: (site, items) => dispatch(listGuestCart(site, items))
    }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Signup));
