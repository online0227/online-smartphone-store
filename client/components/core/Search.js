import React, { Component } from "react";
import { withRouter } from 'react-router-dom';
import Autosuggest from "react-autosuggest";
import { connect } from 'react-redux';
import queryString from "query-string";
import PropTypes from 'prop-types';
import { coreError, getCategories, listSuggestions } from "../actions/apiCore";
import { isServer } from "../auth";
import "./Search.css"

function getSuggestionValue(suggestion) {
    return suggestion.name;
}

function renderSuggestion(suggestion) {
    return (
        <span>{suggestion.name}</span>
    );
}

class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            suggestions: [],
            isDataFetched: false
        };
    }

    componentDidMount() {
        const { childRef } = this.props;
        childRef(this);

        this.init(); const parsed = queryString.parse(this.props.location.search);
        if (parsed.search !== undefined) {
            this.setState({ value: parsed.search })
        }
    }

    componentWillUnmount() {
        const { childRef } = this.props;
        childRef(undefined);
    }

    async init() {
        await this.props.getCategories(this.props.site).then(data => {
            this.setState({ categories: data });
            this.setState({ isDataFetched: true });
        });
    };

    onChange = (event, { newValue, method }) => {
        this.setState({
            value: newValue
        });
    };

    onSuggestionsFetchRequested = ({ value }) => {
        if (value && value.length > 0) {
            this.props.listSuggestions(this.props.site, value).then(data => {
                this.setState({
                    suggestions: data
                });
            });
        }
    };

    onSuggestionsClearRequested = () => {
        this.setState({
            suggestions: []
        });
    };

    searchData = () => {
        const query = queryString.stringify({ search: this.state.value });
        this.props.history.push(`/shop?${query}`);
        this.props.handleSearch(this.state.value);
    };

    searchSubmit = e => {
        e.preventDefault();
        this.searchData();
    };

    handleChange = name => event => { };

    clearState() {
        this.setState({
            value: '',
            suggestions: [],
            categories: []
        })
    }

    searchForm = () => {
        const { value, suggestions } = this.state;
        const inputProps = {
            value,
            onChange: this.onChange
        };
        return (
            <form onSubmit={this.searchSubmit}>
                <span
                    className="input-group-text"
                    style={{ backgroundColor: this.props.transparent ? "unset" : "" }}
                >
                    <div className="input-group input-group-lg no-flex-wrap">
                        {/* input-group-prepend: select박스의 상하 위치를 센터에 맞춰준다. */}
                        {/* <div className="input-group-prepend">
                            <select
                                className="btn mr-2"
                                onChange={this.handleChange("category")}
                            >
                                <option value="All">All</option>
                                {this.state.categories.map((c, i) => (
                                    <option key={i} value={c._id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div> */}

                        <Autosuggest
                            suggestions={suggestions}
                            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                            getSuggestionValue={getSuggestionValue}
                            renderSuggestion={renderSuggestion}
                            inputProps={inputProps} />

                        {/* <Autosuggest
                            multiSection={true}
                            suggestions={suggestions}
                            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                            getSuggestionValue={getSuggestionValue}
                            renderSuggestion={renderSuggestion}
                            renderSectionTitle={renderSectionTitle}
                            getSectionSuggestions={getSectionSuggestions}
                            inputProps={inputProps} /> */}

                        {/* <input
                            type="search"
                            className="form-control"
                            onChange={this.handleChange("search")}
                            placeholder="Search by name"
                        /> */}
                    </div>
                    <div
                        className="btn input-group-append"
                        style={{ border: "none" }}
                    >
                        <button className="input-group-text"><i className="fas fa-search"></i></button>
                    </div>
                </span>
            </form>
        );
    };

    render() {
        if (!isServer && !this.state.isDataFetched) {
            return null;
        }

        return (
            <div>{this.searchForm()}</div>);
    };
};

Search.defaultProps = {
    handleSearch: () => { },
    childRef: () => { },
    transparent: false
};

Search.propTypes = {
    handleSearch: PropTypes.func,
    childRef: PropTypes.func,
    transparent: PropTypes.bool
};

function mapStateToProps(state) {
    return {
        error: state.core.error,
    };
}

const mapDispatchToProps = dispatch => {
    return {
        coreError: (error) => dispatch(coreError(error)),
        getCategories: (site) => dispatch(getCategories(site)),
        listSuggestions: (site, value) => dispatch(listSuggestions(site, value))
    }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Search));