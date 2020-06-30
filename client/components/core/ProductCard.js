import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import moment from "moment";
import Lightbox from 'react-image-lightbox';
import { Carousel } from 'react-responsive-carousel';
import { addCart } from "../actions/cart"
import { addItem } from "./cartHelpers";
import { isAuthenticated, isServer } from "../auth";
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';

import "./ProductCard.css";

class ProductCard extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            isSubmitting: false,
            success: false,
            isImageOpen: false,
            currentSlide: 0,
            isDataFetched: false
        };
        this.updateCurrentSlide = this.updateCurrentSlide.bind(this);
        this.showImage = this.showImage.bind(this);
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
        if (prevProps.match.params.productId !== this.props.match.params.productId) {
            if (this.props.match.params.productId !== undefined) {
                this.setState({
                    isSubmitting: false,
                    success: false,
                    isImageOpen: false,
                    currentSlide: 0,
                });
            }
        }
    }

    next = () => {
        if (this._isMounted)
            this.setState((state) => ({
                currentSlide: state.currentSlide + 1,
            }));
    };

    prev = () => {
        if (this._isMounted)
            this.setState((state) => ({
                currentSlide: state.currentSlide - 1,
            }));
    };

    updateCurrentSlide = (index) => {
        this.setState({
            currentSlide: index,
        });
    };

    showViewButton = showViewProductButton => {
        return (
            showViewProductButton && (
                <NavLink
                    to={`/shop/product/${this.props.product.pid}`}
                    className="mr-2"
                >
                    <button className="btn btn-outline-primary mt-2 mb-2">
                        View Product
                    </button>
                </NavLink>
            )
        );
    };

    addToCart = () => {
        const productId = this.props.product.pid;
        const { site } = this.props;

        if (isAuthenticated()) {
            this.props.addCart({ site, productId }).then(data => {
                this.props.history.push("/cart");
            });
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
        return (
            <div className="productcard_in-stock">
                {quantity > 0 ? (
                    <span className="badge badge-primary badge-pill">In Stock</span>
                ) : (
                        <span className="badge badge-primary badge-pill">Out of Stock</span>
                    )}
            </div>
        )
    };


    convertDescToHtml = () => {
        const jsonDesc = JSON.parse(this.props.product.description);
        var cfg = {};
        var converter = new QuillDeltaToHtmlConverter(jsonDesc.ops, cfg);
        var __html = converter.convert();
        return (
            <div dangerouslySetInnerHTML={{ __html: __html }} />
        );
    }

    showImage = () => {
        return (
            <div>
                {this.state.isImageOpen && (
                    <Lightbox
                        reactModalProps={{ shouldReturnFocusAfterClose: false }}
                        mainSrc={this.props.product.photo[this.state.currentSlide]}
                        nextSrc={this.props.product.photo[(this.state.currentSlide + 1) % this.props.product.photo.length]}
                        prevSrc={this.props.product.photo[(this.state.currentSlide + this.props.product.photo.length - 1) % this.props.product.photo.length]}
                        onCloseRequest={() => {
                            if (this._isMounted)
                                this.setState({ isImageOpen: false })
                        }}
                        onMovePrevRequest={() => {
                            if (this._isMounted)
                                this.setState({
                                    currentSlide: (this.state.currentSlide + this.props.product.photo.length - 1) % this.props.product.photo.length,
                                })
                        }}
                        onMoveNextRequest={() => {
                            if (this._isMounted)
                                this.setState({
                                    currentSlide: (this.state.currentSlide + 1) % this.props.product.photo.length,
                                })
                        }}
                    />
                )}
                {this.props.product.photo.length > 0 && (
                    <Carousel
                        key={this.props.product.photo[0]}
                        dynamicHeight={true}
                        emulateTouch={true}
                        infiniteLoop={true}
                        selectedItem={this.state.currentSlide}
                        onChange={this.updateCurrentSlide}
                        onClickItem={() => {
                            if (this._isMounted)
                                this.setState({ isImageOpen: true })
                        }}
                    >
                        {this.props.product.photo.map((c, i) => (
                            <div
                                key={i}
                                style={{
                                    cursor: "zoom-in",
                                }}
                            >
                                <img
                                    className={!this.props.isRelated ? "carousel-inner" : "carousel-inner-related"}
                                    src={c}
                                />
                            </div>
                        ))}
                    </Carousel>
                )}
                {this.props.product.photo.length === 0 && (
                    <img
                        src="/public/img/no-prod-img.png"
                        style={{ maxHeight: "100%", maxWidth: "100%" }}
                    />
                )}
            </div>
        );
    };

    showDesc = () => {
        return (
            <div>
                {this.props.showDescription && (
                    <div>
                        <h2 className="productcard_prod-detail">Product Details</h2>
                        {this.convertDescToHtml()}
                    </div>
                )}
            </div>
        );
    }


    showMoment = () => {
        return (
            <div>
                Added on {moment(this.props.product.createdAt).fromNow()}
            </div>
        );
    }

    showCategory = () => {
        return (
            <div>
                Category: {this.props.product.cat && this.props.product.cat.name}
            </div>
        );
    }

    showPrice = () => {
        return (
            <h1>${this.props.product.price}</h1>
        );
    }

    render() {
        if (!isServer && !this.state.isDataFetched) {
            return null;
        }

        return (
            <div className="card">
                <div className="card-header name">{this.props.product.name}</div>
                <div className="card-body">
                    {this.showImage()}
                    {this.showPrice()}
                    {this.showStock(this.props.product.quantity)}
                    {this.showCategory()}
                    {this.showMoment()}

                    {this.showViewButton(this.props.showViewProductButton)}
                    {this.showAddToCart(this.props.showAddToCartButton)}
                    {this.showDesc()}
                </div>
            </div>
        );
    };
};

ProductCard.defaultProps = {
    showViewProductButton: true,
    showAddToCartButton: true,
    cartUpdate: false,
    showRemoveProductButton: false,
    showDescription: true,
    isRelated: false
};

function mapStateToProps(state) {
    return {

    };
}

const mapDispatchToProps = dispatch => {
    return {
        addCart: ({ site, productId }) => dispatch(addCart({ site, productId })),
    }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProductCard));
