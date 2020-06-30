import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import Layout from "./Layout";
import CartCard from "./CartCard";
import Checkout from "./Checkout";
import { cartError, listCart, listGuestCart, addCart } from "../actions/cart"
import { getCart, removeItem } from "./cartHelpers";
import { isAuthenticated, isServer } from "../auth";

class Cart extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            isDataFetched: false
        };
    }

    componentDidMount() {
        this._isMounted = true;
        if (isAuthenticated()) {
            this.loadCart();
        } else {
            let items = getCart();            
            this.loadGuestCart(items);
        }
        window.scrollTo(0, 0);
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    async loadGuestCart(items) {
        await this.props.listGuestCart(this.props.site, items).then(data => {
            if (this._isMounted) {
                this.setState({ isDataFetched: true });
            }            
            if (items.length > 0 && (this.props.products.length !== items.length)) 
            {                
                let keys = Object.keys(this.props.products.reduce((a, { info }) => Object.assign(a, { [info.pid]: undefined }), {}));
                keys = keys.map(function (item) {
                    return parseInt(item, 10);
                });                let filtered = items.filter(({ pid }) => !keys.includes(pid));

                filtered.forEach(element => {
                    removeItem(element.pid)
                });
            }
        });
    };

    async loadCart() {
        await this.props.listCart(this.props.site).then(data => {
            if (this._isMounted) {
                this.setState({ isDataFetched: true });
            }
        });
    };

    showItems = items => {
        return (
            <div>
                <h2>Your cart has {`${items.length}`} items</h2>
                <hr />
                {items.map((product, i) => (
                    <div key={i}>
                        <CartCard
                            product={product}
                            showAddToCartButton={false}
                            cartUpdate={true}
                            showRemoveProductButton={true}
                            site={this.props.site}
                        />
                        <br />
                    </div>
                ))}
            </div>
        );
    };

    noItemsMessage = () => (
        <h2>
            Your cart is empty. <br /> <Link to="/shop">Continue shopping</Link>
        </h2>
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
            <div>
                <Layout
                    title="Shopping Cart"
                    description="Manage your cart items. Add remove checkout or continue shopping."
                    className="container-fluid"
                >
                    <div className="row">
                        <div className="col-sm-6">
                            {this.showError()}
                            {(this.props.products != null && this.props.products.length > 0) ? this.showItems(this.props.products) : this.noItemsMessage()}
                        </div>

                        <div className="col-sm-6">
                            <h2 className="mb-4">Your cart summary</h2>
                            <hr />
                            {isAuthenticated() ? (
                                <Checkout products={this.props.products} site={this.props.site} />
                            ) : (this.props.site === "www") ?
                                    (
                                        <div>
                                            <h4>You must be <Link to="/signin">signed in</Link> to purchase the items.</h4>
                                            <h4>Or, <Link to="/signup">sign up</Link> now!</h4>
                                        </div>
                                    )
                                    :
                                    (                                        
                                    <div>Currently Signup, Signin, Purchase via multi-domain aren't implemented.</div>
                                    )
                            }
                        </div>
                    </div>
                </Layout>
            </div>
        );
    };
};

function mapStateToProps(state) {
    return {
        error: state.cart.error,
        products: state.cart.products
    };
}

const mapDispatchToProps = dispatch => {
    return {
        cartError: (error) => dispatch(cartError(error)),
        listCart: (site) => dispatch(listCart(site)),
        listGuestCart: (site, items) => dispatch(listGuestCart(site, items)),
    }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Cart));
