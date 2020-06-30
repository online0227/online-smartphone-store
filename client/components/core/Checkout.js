import React, { Component } from "react";
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { braintreeError, getBraintreeClientToken, processPayment, createOrder } from "../actions/apiCore";
import { emptyCart } from "../actions/cart"
import { isAuthenticated, isServer } from "../auth";
import DropIn from "braintree-web-drop-in-react";

class Checkout extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            isSubmitting: false,
            success: false,
            address: "",
            instance: {},
            loading: false,
            isDataFetched: false
        };
    }

    componentDidMount() {
        this._isMounted = true;
        this.getToken();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    async getToken() {
        await this.props.getBraintreeClientToken(this.props.site).then(data => {
            if (this._isMounted) {
                this.setState({ isDataFetched: true });
            }
        });
    };

    handleAddress = event => {
        if (this._isMounted) {
            this.setState({ address: event.target.value });
        }
    };

    getTotal = () => {
        if (this.props.products && this.props.products.length)
            return this.props.products.reduce((currentValue, nextValue) => {
                return currentValue + nextValue.count * nextValue.info.price;
            }, 0);
        else
            return 0;
    };

    showCheckout = () => {
        return isAuthenticated() ? (
            <div>{this.showDropIn()}</div>
        ) : (
                <Link to="/signin">
                    <button className="btn btn-primary">Sign in to checkout</button>
                </Link>
            );
    };

    buy = () => {
        if (this._isMounted) {
            this.setState({ loading: true });
        }        let nonce;
        let getNonce = this.state.instance
            .requestPaymentMethod()
            .then(data => {                nonce = data.nonce;
                const paymentData = {
                    paymentMethodNonce: nonce,
                    amount: this.getTotal()
                };

                this.props.processPayment(this.props.site, paymentData).then(response => {
                    const createOrderData = {
                        products: this.props.products,
                        transaction_id: response.transaction.id,
                        amount: response.transaction.amount,
                        address: this.state.address
                    };

                    this.props.createOrder(this.props.site, createOrderData).then(response => {
                        this.props.emptyCart(this.props.site).then(response2 => {
                            if (response2 === true) {                                if (this._isMounted) {
                                    this.setState({
                                        loading: false,
                                        success: true
                                    })
                                }                            }
                        });
                    });
                })
                    .catch(error => {
                        this.props.braintreeError(error);
                        if (this._isMounted) {
                            this.setState({ loading: false });
                        }
                    });
            })
            .catch(error => {
                this.props.braintreeError(error.message);
            });
    };

    showSuccess = success => (        <div
            className="alert alert-info"
            style={{ display: success ? "" : "none" }}
        >
            Thanks! Your payment was successful!
        </div>
    );    showDropIn = () => (
        <div onBlur={() => this.props.braintreeError("")}>
            {this.props.braintree_info.clientToken !== null && this.props.products.length > 0 ? (
                <div>
                    <div className="form-group mb-3">
                        <label className="text-muted">Delivery address:</label>
                        <textarea
                            onChange={this.handleAddress}
                            className="form-control"
                            value={this.state.address}
                            placeholder="Type your delivery address here..."
                        />
                    </div>
                    {this.props.braintree_info &&
                        <DropIn
                            options={{
                                authorization: this.props.braintree_info.clientToken,
                                paypal: {
                                    flow: "vault"
                                }
                            }}
                            onInstance={instance => {
                                if (this._isMounted)
                                    this.setState({ instance: instance })
                            }
                            }
                        />}
                    <button onClick={this.buy} className="btn btn-success btn-block">
                        Pay
                    </button>
                </div>
            ) : null}
        </div>
    );

    render() {
        if (!isServer && !this.state.isDataFetched) {
            return null;
        }

        return (
            <div>
                <h2>Total: ${this.getTotal()}</h2>
                {this.showSuccess(this.state.success)}
                {this.showCheckout()}
            </div>
        );
    };
};

function mapStateToProps(state) {
    return {        braintree_info: state.core.braintree_info,
        braintree_error: state.core.braintree_error
    };
}

const mapDispatchToProps = dispatch => {
    return {
        braintreeError: (error) => dispatch(braintreeError(error)),
        getBraintreeClientToken: (site) => dispatch(getBraintreeClientToken(site)),
        processPayment: (site, paymentData) => dispatch(processPayment(site, paymentData)),
        createOrder: (site, createOrderData) => dispatch(createOrder(site, createOrderData)),
        emptyCart: (site) => dispatch(emptyCart(site))
    }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Checkout));
