
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { listGuestCart, addCart, removeCart, updateCart } from "../actions/cart"
import Lightbox from 'react-image-lightbox';
import { isAuthenticated, isServer } from "../auth";
import { getCart, updateItem, removeItem } from "./cartHelpers";

import "../../styles/CartCard.css"

class CartCard extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            isSubmitting: false,
            success: false,
            isImageOpen: false,
            count: this.props.product.count,
            isDataFetched: false
        };
    }

    componentDidMount() {
        this._isMounted = true;
        if (this._isMounted) {
            this.setState({ isDataFetched: true });
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    componentDidUpdate(prevProps) {
        if (prevProps.product.count !== this.props.product.count) {
            this.setState({ count: this.props.product.count });
        }
    }

    showViewButton = showViewProductButton => {
        return (
            showViewProductButton && (
                <Link to={`/shop/product/${this.props.product.info.pid}`} className="mr-2">
                    <button className="btn btn-outline-primary mt-2 mb-2">
                        View Product
                    </button>
                </Link>
            )
        );
    };

    addToCart = () => {

        const productId = this.props.product.info.pid;
        const { site } = this.props;

        this.props.addCart({ site, productId }).then(data => {
            this.props.history.push("/cart")
        })
    };

    showAddToCart = showAddToCartButton => {
        return (
            showAddToCartButton && (
                <button
                    onClick={this.addToCart}
                    className="btn btn-outline-warning mt-2 mb-2"
                >
                    Add to cart
                </button>
            )
        );
    };

    showRemoveButton = showRemoveProductButton => {
        return (
            showRemoveProductButton && (
                <button
                    onClick={() => {
                        if (isAuthenticated()) {
                            const productId = this.props.product.info.pid;
                            const { site } = this.props;
                            this.props.removeCart({ site, productId }).then(data => {
                            });
                        } else {
                            removeItem(this.props.product.info.pid);
                            let items = getCart();
                            this.props.listGuestCart(this.props.site, items).then(data => {
                            });
                        }
                    }}
                    className="btn btn-outline-danger mt-2 mb-2"
                >
                    Remove Product
                </button>
            )
        );
    };

    showStock = quantity => {
        return quantity > 0 ? (
            <span className="badge badge-primary badge-pill">In Stock</span>
        ) : (
                <span className="badge badge-primary badge-pill">Out of Stock</span>
            );
    };

    handleChange = () => (event) => {
        if (this._isMounted)
            this.setState({ count: (event.target.value < 1 && event.target.value !== "") ? 1 : event.target.value });
    };

    updateTheCart = (productId) => {
        if (isAuthenticated()) {
            if (this.state.count != this.props.product.count) {
                const { site } = this.props;
                const new_count = this.state.count;
                this.props.updateCart({ site, productId, new_count });
                alert("Updated.");
            }
        } else {
            if (this.state.count != this.props.product.count) {
                updateItem(productId, this.state.count);
                alert("Updated.");
            }
        }
    };

    showCartUpdateOptions = cartUpdate => {
        return (
            cartUpdate && (
                <div>
                    <div className="input-group mb-3">
                        <div className="input-group-prepend">
                            <span className="input-group-text">
                                Adjust Quantity
                            </span>
                        </div>
                        <input
                            type="number"
                            className="form-control"
                            value={this.state.count}
                            onChange={this.handleChange()}
                        />
                        <button
                            onClick={() => { this.updateTheCart(this.props.product.info.pid) }}
                        >
                            Update the item
                        </button>
                    </div>
                </div>
            )
        );
    };

    render() {
        if (!isServer && !this.state.isDataFetched) {
            return null;
        }

        return (
            <div className="cartcard">
                <div className="card-header name">{this.props.product.info.name}</div>
                <div className="card-body">
                    <div className={this.props.product.info.photo[0] ? "home-products-img" : ""}>
                        <img
                            src={this.props.product.info.photo[0] ? this.props.product.info.photo[0] : "/public/img/no-prod-img.png"}
                            alt={this.props.product.info.name}
                            className="mb-3"
                            style={{ maxHeight: "500px" }}
                            onClick={() => {
                                if (this._isMounted)
                                    this.setState({ isImageOpen: true });
                            }}
                        />
                        {this.state.isImageOpen && this.props.product.info.photo[0] && (
                            <Lightbox
                                mainSrc={this.props.product.info.photo[0]}
                                onCloseRequest={() => {
                                    if (this._isMounted)
                                        this.setState({ isImageOpen: false })
                                }}
                            />
                        )}
                    </div>

                    <h1>${this.props.product.info.price}</h1>
                    {this.showStock(this.props.product.info.quantity)}
                    <br />

                    {this.showViewButton(this.props.showViewProductButton)}

                    {this.showAddToCart(this.props.showAddToCartButton)}

                    {this.showRemoveButton(this.props.showRemoveProductButton)}

                    {this.showCartUpdateOptions(this.props.cartUpdate)}
                </div>
            </div>
        );
    };
};

CartCard.defaultProps = {
    showViewProductButton: true, showAddToCartButton: true,
    cartUpdate: false,
    showRemoveProductButton: false
};

function mapStateToProps(state) {
    return {

    };
}

const mapDispatchToProps = dispatch => {
    return {
        listGuestCart: (site, items) => dispatch(listGuestCart(site, items)),
        addCart: ({ site, productId }) => dispatch(addCart({ site, productId })),
        removeCart: ({ site, productId }) => dispatch(removeCart({ site, productId })),
        updateCart: ({ site, productId, new_count }) => dispatch(updateCart({ site, productId, new_count }))
    }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CartCard));
