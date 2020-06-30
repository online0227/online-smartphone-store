import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { addCart } from "../actions/cart";
import { addItem } from "./cartHelpers";
import Lightbox from 'react-image-lightbox';
import { isAuthenticated, isServer } from "../auth";

class Card extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            isSubmitting: false,
            success: false,
            isImageOpen: false,
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

    showViewButton = showViewProductButton => {
        return (
            showViewProductButton && (
                <Link to={`/shop/product/${this.props.product.pid}`} className="mr-2">
                    <button className="btn btn-outline-primary mt-2 mb-2">
                        View Product
                    </button>
                </Link>
            )
        );
    };

    addToCart = () => {

        const productId = this.props.product.pid;
        const { site } = this.props;

        if (isAuthenticated()) {
            this.props.addCart({ site, productId }).then(data => {
                this.props.history.push("/cart")
            })
        } else {
            addItem(productId, () => {
                this.props.history.push("/cart");
            });
        }
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

    showStock = quantity => {
        return quantity > 0 ? (
            <span className="badge badge-primary badge-pill">In Stock</span>
        ) : (
                <span className="badge badge-primary badge-pill">Out of Stock</span>
            );
    };

    render() {
        if (!isServer && !this.state.isDataFetched) {
            return null;
        }

        return (
            <div className="card">
                <div className="card-header name">{this.props.product.name}</div>
                <div className="card-body">
                    <div className={this.props.product.photo[0] ? "home-products-img" : ""}>
                        <img
                            src={this.props.product.photo[0] ? this.props.product.photo[0] : "/public/img/no-prod-img.png"}
                            alt={this.props.product.name}
                            className="mb-3"
                            style={{ maxHeight: "100%", maxWidth: "100%" }}
                            onClick={() => {
                                if (this._isMounted)
                                    this.setState({ isImageOpen: true });
                            }}
                        />
                        {this.state.isImageOpen && this.props.product.photo[0] && (
                            <Lightbox
                                mainSrc={this.props.product.photo[0]}
                                onCloseRequest={() => {
                                    if (this._isMounted)
                                        this.setState({ isImageOpen: false })
                                }}
                            />
                        )}
                    </div>

                    <h1>${this.props.product.price}</h1>
                    {this.showStock(this.props.product.quantity)}
                    <br />

                    {this.showViewButton(this.props.showViewProductButton)}

                    {this.showAddToCart(this.props.showAddToCartButton)}
                </div>
            </div>
        );
    };
};

Card.defaultProps = {
    showViewProductButton: true,
    showAddToCartButton: true
};

function mapStateToProps(state) {
    return {

    };
}

const mapDispatchToProps = dispatch => {
    return {
        addCart: ({ site, productId }) => dispatch(addCart({ site, productId }))
    }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Card));