import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import GoogleLogin from 'react-google-login';
import { getCart, emptyCart } from "../core/cartHelpers";
import { socialLogin } from '../actions';
import { google_login_clientid } from "../../config"
import { listCart } from "../actions/cart"

class SocialLogin extends Component {
    constructor() {
        super();
        this.state = {
            redirectToReferrer: false
        };
    }

    responseGoogle = response => {
        const tokenId = response.tokenId;
        const user = {
            tokenId: tokenId
        };

        let cart = getCart();
        this.props.socialLogin(this.props.site, user, cart).then(data => {
            emptyCart(() => {
                    
            });            this.props.listCart(this.props.site).then(unused => {
                if (data.user.role === 0) {
                    this.props.history.push("/dashboard");                } else if (data.user.role === 1) {
                    this.props.history.push("/admin");                }            });
        });
    };

    render() {        const { redirectToReferrer } = this.state;
        if (redirectToReferrer) {
            return <Redirect to="/" />;
        }

        return (
            <GoogleLogin
                clientId={google_login_clientid}
                buttonText="Login with Google"
                onSuccess={this.responseGoogle}
                onFailure={this.responseGoogle}
            />
        );
    }
};

function mapStateToProps(state) {
    return {

    };
}

const mapDispatchToProps = dispatch => {
    return {
        listCart: (site) => dispatch(listCart(site)),
        socialLogin: (site, user, cart) => dispatch(socialLogin(site, user, cart))
    }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SocialLogin));
