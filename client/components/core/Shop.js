import React, { Component } from "react";
import { withRouter } from 'react-router-dom';
import Layout from "./Layout";
import { connect } from 'react-redux';
import Card from "./Card";
import queryString from "query-string";
import { getCategories, shopError, getFilteredProducts, getExtraFilteredProducts, setCategoryData } from "../actions/apiCore";
import { isServer } from "../auth";
import { prices } from "./fixedPrices";
import Checkbox from "./Checkbox";
import RadioBox from "./RadioBox";
import Search from "./Search";

import "./Shop.css"

class Shop extends Component {
    constructor(props) {
        super(props);
        this.state = {
            myFilters: {
                filters: { cid: [], price: [], name: "" }
            },
            limit: 8,
            skip: 0,
            size: 0,
            error: "",
            isDataFetched: false
        };

        this.init = this.init.bind(this);
        this.loadFilteredResults = this.loadFilteredResults.bind(this);
        this.loadMore = this.loadMore.bind(this);
        this.loadMoreButton = this.loadMoreButton.bind(this);
        this.handleFilters = this.handleFilters.bind(this);
        this.handlePrice = this.handlePrice.bind(this);
        this.reset = this.reset.bind(this);
    }

    componentDidMount() {        const parsed = queryString.parse(this.props.location.search);
        const newFilters = { ...this.state.myFilters };
        newFilters.filters["name"] = parsed.search;
        this.setState({ myFilters: newFilters });

        this.init();
        this.loadFilteredResults(this.state.myFilters.filters);
        window.scrollTo(0, 0);
    }

    async init() {
        await this.props.getCategories(this.props.site).then(data => {
        });
    };

    async loadFilteredResults(newFilters) {
        await this.props.getFilteredProducts(this.props.site, this.state.skip, this.state.limit, newFilters).then(data => {
            if (data) {
                this.setState({
                    size: this.props.filtered_result_info.length,
                    skip: 0
                });
            }
            this.setState({ isDataFetched: true })
        });
    };

    async loadMore() {
        let toSkip = this.state.skip + this.state.limit;
        await this.props.getExtraFilteredProducts(this.props.site, toSkip, this.state.limit, this.state.myFilters.filters).then(data => {
            if (data) {
                this.setState({
                    size: this.props.filtered_result_info.length,
                    skip: toSkip
                })
            }
        });
    };

    loadMoreButton = () => {
        const loadedCount = this.state.size - this.state.skip;

        return (
            this.state.size > 0 &&
            loadedCount >= this.state.limit && (
                <button onClick={this.loadMore} className="btn btn-warning mb-5">
                    Load more
                </button>
            )
        );
    };

    handleSearch = (filters) => {
        this.checkboxRef.clearState();
        this.radioboxRef.clearState();
        this.props.setCategoryData([]);
        this.setState({
            myFilters: {
                filters: { cid: [], price: [], name: filters }
            },
            limit: 8,
            skip: 0,
            size: 0,
            error: ""
        }, () => {
            this.init();
            this.loadFilteredResults(this.state.myFilters.filters);
        });
    }

    handleFilters = (filters, filterBy) => {
        let newFilters = {};

        this.setState({
            skip: 0
        }, () => {
            newFilters = { ...this.state.myFilters };
            newFilters.filters[filterBy] = filters;

            if (filterBy === "price") {
                let priceValues = this.handlePrice(filters);
                newFilters.filters[filterBy] = priceValues;
            }

            this.loadFilteredResults(this.state.myFilters.filters);
            this.setState({
                myFilters: newFilters
            })
        });

    };

    handlePrice = value => {
        const data = prices;
        let array = [];

        for (let key in data) {
            if (data[key]._id === parseInt(value)) {
                array = data[key].array;
            }
        }
        return array;
    };

    reset = () => {
        this.props.history.push("/shop")
        this.searchRef.clearState();
        this.checkboxRef.clearState();
        this.radioboxRef.clearState();
        this.props.setCategoryData([]);

        this.setState({
            myFilters: {
                filters: { cid: [], price: [], name: "" }
            },
            limit: 8,
            skip: 0,
            size: 0,
            error: ""
        }, () => {
            this.init();
            this.loadFilteredResults(this.state.myFilters.filters);
        });
    }

    render() {
        if (!isServer && !this.state.isDataFetched) {
            return null;
        }

        return (
            <div>
                <Layout
                    title="Shop Page"
                    description="Search and find smartphones of your choice"
                    className="container-fluid"
                >
                    <div className="row">
                        <div className="col-sm-3 reset-button">
                            <button
                                onClick={this.reset}
                                className="btn btn-outline-warning mt-2 mb-2"
                            >
                                <i className="fas fa-times icon-margin"></i>Reset all search conditions
                        </button>
                        </div>
                        <div className="col-sm-9 search-size">
                            <Search
                                site={this.props.site}
                                childRef={ref => (this.searchRef = ref)}
                                handleSearch={filters =>
                                    this.handleSearch(filters)
                                }
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-3">
                            <h2>Filter by categories</h2>
                            <ul>
                                <Checkbox
                                    childRef={ref => (this.checkboxRef = ref)}
                                    categories={this.props.category_info}
                                    handleFilters={filters =>
                                        this.handleFilters(filters, "cid")
                                    }
                                />
                            </ul>

                            <h2>Filter by price range</h2>
                            <div>
                                <RadioBox
                                    childRef={ref => (this.radioboxRef = ref)}
                                    prices={prices}
                                    handleFilters={filters =>
                                        this.handleFilters(filters, "price")
                                    }
                                />
                            </div>
                        </div>
                        <div className="col-sm-9">
                            <h2>Products</h2>
                            <div className="row">
                                {this.props.filtered_result_info && this.props.filtered_result_info.map((product, i) => (
                                    <div key={i} className="col-md-6 col-lg-4 col-xl-3">
                                        <Card product={product} site={this.props.site} />
                                    </div>
                                ))}
                            </div>
                            <hr />
                            {this.loadMoreButton()}
                        </div>
                    </div>
                </Layout>
            </div>
        );
    };
};

function mapStateToProps(state) {
    return {
        filtered_result_info: state.core.filtered_result_info,
        shop_error: state.core.shop_error,
        category_info: state.core.category_info
    };
}

const mapDispatchToProps = dispatch => {
    return {
        setCategoryData: (site) => dispatch(setCategoryData(site)),
        shopError: (error) => dispatch(shopError(error)),
        getCategories: (site) => dispatch(getCategories(site)),
        getFilteredProducts: (site, skip, limit, newFilters) => dispatch(getFilteredProducts(site, skip, limit, newFilters)),
        getExtraFilteredProducts: (site, skip, limit, newFilters) => dispatch(getExtraFilteredProducts(site, skip, limit, newFilters))
    }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Shop));
