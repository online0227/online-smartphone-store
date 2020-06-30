import React, { Component } from 'react';
import { RouteComponentProps, withRouter, Link } from "react-router-dom";
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { AppState } from "../reducers";
import { adminError, createCategory } from '../actions/admin';
import { AnyAction } from 'redux';
import Layout from "../core/Layout";
import AdminSideMenu from "./AdminSideMenu";
import * as $ from 'jquery';

interface IAttributeProps {
    site: string;
}

interface IStateProps {
    user: string;
    error: string;
}

interface IDispatchProps {
    adminError: (error) => any;
    createCategory: ({ site, name, failed }) => any;
}

type PropsTypes = IAttributeProps & IStateProps & IDispatchProps & RouteComponentProps<any>;

interface IReactStates {
    name: string;
    prevName: string;
    isSubmitting: boolean;
    success: boolean;
}

type StateTypes = IReactStates;

class AddCategory extends Component<PropsTypes, StateTypes> {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            prevName: "",
            isSubmitting: false,
            success: false
        };
    }

    componentDidMount() {
        window.scrollTo(0, 0);
    }

    clickSubmit = e => {
        const { site } = this.props;
        const { name } = this.state;
        e.preventDefault();
        if (this.state.isSubmitting) return;

        if (!this.state.isSubmitting) {
            const imagePath = require(`../../images/spinner.gif`)
            $('#submit').html(`<img src="${imagePath}"/>`);
            this.setState({ isSubmitting: true });
        }

        const failed = () => {
            $('#submit').html('Submit');
            this.setState({ isSubmitting: false });
        };

        const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
        return sleep(300).then(() => {
            const promise = this.props.createCategory({ site, name, failed });
            promise.then(response => {
                if (response) {
                    this.props.adminError('');
                    $('#submit').html('Submit');
                    this.setState({
                        isSubmitting: false,
                        success: true,
                        prevName: this.state.name,
                        name: ""
                    })
                } else {
                    this.setState({
                        success: false
                    })
                }
            })
        });
    };

    handleChange = e => {
        this.props.adminError("");
        this.setState({ name: e.target.value });
    };

    newCategoryForm = () => (
        <form onSubmit={this.clickSubmit}>
            <div className="form-group">
                <label className="text-muted">Name</label>
                <input
                    type="text"
                    className="form-control"
                    onChange={this.handleChange}
                    value={this.state.name}
                    autoFocus
                    required
                />
            </div>
            <button
                id="submit"
                type="submit"
                value="Submit"
                name="submit"
                className="btn btn-outline-primary">Create Category</button>
        </form>
    );

    showSuccess = () => {
        if (this.state.success) {
            return <h3 className="text-success">{this.state.prevName} is created</h3>;
        }
    };

    showError = () => {
        if (this.props.error) {
            return <h3 className="text-danger">Category should be unique</h3>;
        }
    };

    render() {
        return (
            <Layout
                title="Add a new category"
                description={`G'day ${this.props.user['name']}, ready to add a new category?`}
                className="container-fluid"
            >
                <div className="row">
                    <div className="col-md-3">
                        <AdminSideMenu />
                    </div>
                    <div className="col-md-9">
                        <div className="col-md-8">
                            {this.showSuccess()}
                            {this.showError()}
                            {this.newCategoryForm()}
                        </div>
                    </div>
                </div>
            </Layout>
        );
    };
};

function mapStateToProps(state: AppState): IStateProps {
    return {
        user: state.auth.user,
        error: state.admin.error
    };
}

const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, AnyAction>): IDispatchProps => {
    return {
        adminError: async (error) => await dispatch(adminError(error)),
        createCategory: async ({ site, name, failed }) => await dispatch(createCategory({ site, name, failed }))
    };
};

export default withRouter(
    connect<IStateProps, IDispatchProps, RouteComponentProps<any>>(
        mapStateToProps, mapDispatchToProps
    )(AddCategory));