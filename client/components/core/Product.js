import React, { Component } from "react";
import { withRouter } from 'react-router-dom';
import Layout from "./Layout";
import { connect } from 'react-redux';
import ProductCard from "./ProductCard";
import { read, listRelated } from "../actions/apiCore";
import { isServer } from "../auth";

class Product extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            isDataFetched: false
        };
        this.loadSingleProduct = this.loadSingleProduct.bind(this);
        this.loadRelatedProducts = this.loadRelatedProducts.bind(this);
    }

    componentDidMount() {
        this._isMounted = true;
        this.loadSingleProduct(this.props.match.params.productId);
        window.scrollTo(0, 0);
    }    componentDidUpdate(prevProps) {
        if (prevProps.match.params.productId !== this.props.match.params.productId) {
            if (this.props.match.params.productId !== undefined) {
                this.loadSingleProduct(this.props.match.params.productId);
                window.scrollTo(0, 0);
            }
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    async loadSingleProduct(productId) {
        await this.props.read(this.props.site, productId).then(res => {
            if (this._isMounted) {
                if (res) {
                    this.loadRelatedProducts(productId);
                }
            }
        });
    };

    async loadRelatedProducts(productId) {
        await this.props.listRelated(this.props.site, productId).then(res => {
            if (this._isMounted)
                this.setState({ isDataFetched: true });
        });
    }

    render() {
        if (!isServer && !this.state.isDataFetched) {
            return null;
        }

        return (
            <Layout
                title={this.props.single_product && this.props.single_product.name}
                description={
                    this.props.single_product &&
                    this.props.single_product.cat &&
                    this.props.single_product.cat.name
                }
                className="container-fluid"
            >
                <div className="row">
                    <div className="col-sm-8">
                        {this.props.single_product && this.props.single_product.description && (
                            <ProductCard product={this.props.single_product} site={this.props.site} showViewProductButton={false} />
                        )}
                    </div>

                    <div className="col-sm-4">
                        <h4>Related products</h4>
                        {this.props.related_products.map((p, i) => (
                            <div key={i} className="mb-3">
                                <ProductCard product={p} site={this.props.site} showDescription={false} isRelated={true} />
                            </div>
                        ))}
                    </div>
                </div>
            </Layout>
        );
    };
};

function mapStateToProps(state) {
    return {
        single_product: state.core.single_product,
        related_products: state.core.related_products,
        view_product_error: state.core.view_product_error
    };
}

const mapDispatchToProps = dispatch => {
    return {
        read: (site, productId) => dispatch(read(site, productId)),
        listRelated: (site, productId) => dispatch(listRelated(site, productId)),
    }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Product));
