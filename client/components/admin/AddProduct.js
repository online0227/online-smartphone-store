import React, { Component } from 'react';
import { withRouter, Link } from "react-router-dom";
import { connect } from 'react-redux';
import Layout from "../core/Layout";
import { adminError, getCategories, createProduct } from '../actions/admin';
import { isServer } from "../auth";
import AdminSideMenu from "./AdminSideMenu";

import ReactQuill, { Quill } from 'react-quill'; import { ImageUpload } from 'quill-image-upload';
import 'react-quill/dist/quill.snow.css';
import "./AddProduct.css";

Quill.register('modules/imageUpload', ImageUpload);

const min_length = 200;
const max_length = 5000;

class AddProduct extends Component {
    constructor(props) {
        super(props);
        this.state = {
            body: "",
            name: "",
            price: "",
            categories: [],
            cid: "",
            shipping: "",
            quantity: "",
            photo: "",
            createdProduct: "",
            formData: "",
            isSubmitting: false,
            success: false,
            isDataFetched: false,
            showPreview: false,
            isMaxLength: false,
            currentLength: 0,
            isMinSatisfied: false
        };

        this.props.adminError("");

        this.modules = {
            imageUpload: {
                url: 'https://api.imgur.com/3/image', method: 'POST', name: 'image', withCredentials: false, headers: {
                    Authorization: 'Client-ID fbb0eaff25e10c1',
                }, callbackOK: (serverResponse, next) => {
                    next(serverResponse.data.link);
                }, callbackKO: serverError => {
                    alert(serverError);
                }, checkBeforeSend: (file, next) => {
                    next(file);
                }
            },
            toolbar: {
                container: [
                    [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }, { 'color': [] }, { 'background': [] }],
                    [{ size: [] }],
                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' },
                    { 'indent': '-1' }, { 'indent': '+1' }],
                    ['link', 'image', 'video'],
                    ['clean'],
                ]
            },
            clipboard: {
                matchVisual: false,
            }
        };

        this.formats = [
            'header', 'font', 'color', 'background', 'size',
            'bold', 'italic', 'underline', 'strike', 'blockquote',
            'list', 'bullet', 'indent',
            'link', 'image', 'video'
        ]

        this.preview = this.preview.bind(this);
        this.handleChangeQuill = this.handleChangeQuill.bind(this);
    };

    handleChangeQuill(html) {
        this.setState({ body: html }, () => {
            const editor = this.reactQuillRef.getEditor();
            const unprivilegedEditor = this.reactQuillRef.makeUnprivilegedEditor(editor);
            const curLength = unprivilegedEditor.getLength() - 1;
            this.setState({ currentLength: curLength });

            if (curLength >= min_length) {
                this.setState({ isMinSatisfied: true })
                this.props.adminError("");
            } else {
                this.setState({ isMinSatisfied: false })
            }

            if (curLength > max_length) {
                this.setState({ isMaxLength: true })
            } else {
                this.setState({ isMaxLength: false })
            }
        });
    }

    componentDidMount() {
        this.loadCategories();
        window.scrollTo(0, 0);
    };

    async loadCategories() {
        await this.props.getCategories(this.props.site).then(data => {
            if (data.error) {
                this.props.adminError(data.error);
            } else {
                this.setState({
                    categories: data,
                    formData: new FormData(),
                    isDataFetched: true
                });
            }
        });
    };

    handleChange = name => event => {
        if (name === "photo" && event.target.files.length > 5) {
            alert("You can only attach maximum 5 images");
            event.target.value = null;
            return false;
        }

        if (name === "photo") {
            for (const value of event.target.files) {
                this.state.formData.append(name, value)
            }
        } else {
            const value = event.target.value;
            this.state.formData.set(name, value);
            this.setState({ [name]: event.target.value });
        }
    };

    clickSubmit = event => {
        const { site } = this.props;
        const { formData } = this.state;
        event.preventDefault();

        if (this.state.isSubmitting) return;

        if (!this.state.isSubmitting) {
            const imagePath = require(`../../images/spinner.gif`)
            $('#submit').html(`<img src="${imagePath}"/>`);
            this.setState({ isSubmitting: true });
        }

        this.setState({ success: false })

        const failed = () => {
            $('#submit').html('Submit');
            this.setState({ isSubmitting: false });
        }; const editor = this.reactQuillRef.getEditor();
        const unprivilegedEditor = this.reactQuillRef.makeUnprivilegedEditor(editor);
        this.state.formData.set("description", JSON.stringify(unprivilegedEditor.getContents()));
        const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
        return sleep(300).then(() => {
            if (this.state.isMaxLength) {
                failed();
                return;
            }

            if (this.state.isMinSatisfied === false) {
                failed();
                this.props.adminError("Description must have at least 200 characters")
                return;
            }

            if (
                !this.state.name ||
                !this.state.price ||
                !this.state.cid || this.state.quantity < 1 ||
                this.state.shipping === "") {
                failed();
                this.props.adminError("All fields are required, also check if you have 0 quantity.");
                return;
            }

            const promise = this.props.createProduct({ site, failed }, formData);
            promise.then(response => {
                if (response) {
                    this.props.adminError('');
                    $('#submit').html('Submit');
                    this.setState({
                        body: "",
                        name: "",
                        price: "",
                        categories: [],
                        cid: "",
                        shipping: "",
                        quantity: "",
                        photo: "",
                        createdProduct: response.name,
                        formData: "",
                        isSubmitting: false,
                        success: true,
                        showPreview: false,
                        isMaxLength: false,
                        currentLength: 0,
                        isMinSatisfied: false
                    })
                    this.fileInput.value = "";
                    this.props.getCategories(this.props.site).then(data => {
                        if (data.error) {
                            this.props.adminError(data.error);
                        } else {
                            this.setState({
                                categories: data,
                                formData: new FormData()
                            });
                        }
                    });
                } else {
                    this.setState({
                        success: false
                    })
                }
                window.scrollTo(0, 0);
            })
        });
    };

    preview = () => {
        return (
            <div dangerouslySetInnerHTML={{ __html: this.state.body }} />
        );
    }

    newPostForm = () => {

        return (
            <form className="mb-3" onSubmit={this.clickSubmit}>
                <h4>Post Photo (Max 5 images, each 5MB)</h4>
                <div className="form-group">
                    <label className="btn btn-secondary">
                        <input
                            onChange={this.handleChange("photo")}
                            type="file"
                            name="photo"
                            accept="image/*"
                            ref={ref => this.fileInput = ref}
                            multiple
                        />
                    </label>
                </div>

                <div className="form-group">
                    <label className="text-muted">Name</label>
                    <input
                        onChange={this.handleChange("name")}
                        type="text"
                        className="form-control"
                        value={this.state.name}
                    />
                </div>
                <div className="form-group">
                    <label className="text-muted">Description</label>
                    {this.state.isMaxLength && (
                        <div
                            className="alert alert-danger"
                        >
                            Maximum length reached
                        </div>
                    )}
                    <h6>Current Length : {this.state.currentLength} (Maximum {max_length})</h6>
                    <div>
                        <ReactQuill
                            value={this.state.body}
                            theme="snow"
                            formats={this.formats}
                            modules={this.modules}
                            onChange={e => this.handleChangeQuill(e)}
                            ref={(el) => { this.reactQuillRef = el }}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <div
                        className="btn btn-outline-primary mt-2 mb-2"
                        onClick={() => this.setState({ showPreview: !this.state.showPreview })}
                        style={{ cursor: "pointer" }}
                    >
                        Show/Hide Preview
                    </div>
                    <br />
                    {this.state.showPreview && (
                        <div>{this.preview()}</div>
                    )}
                </div>

                <div className="form-group">
                    <label className="text-muted">Price</label>
                    <input
                        onChange={this.handleChange("price")}
                        type="number"
                        className="form-control"
                        value={this.state.price}
                    />
                </div>

                <div className="form-group">
                    <label className="text-muted">Category</label>
                    <select
                        value={this.state.cid}
                        onChange={this.handleChange("cid")}
                        className="form-control"
                    >
                        <option>Please select</option>
                        {this.state.categories &&
                            this.state.categories.map((c, i) => (
                                <option key={i} value={c.cid}>
                                    {c.name}
                                </option>
                            ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="text-muted">Shipping</label>
                    <select
                        value={this.state.shipping}
                        onChange={this.handleChange("shipping")}
                        className="form-control"
                    >
                        <option>Please select</option>
                        <option value="0">No</option>
                        <option value="1">Yes</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="text-muted">Quantity</label>
                    <input
                        onChange={this.handleChange("quantity")}
                        type="number"
                        className="form-control"
                        value={this.state.quantity}
                    />
                </div>
                <button
                    id="submit"
                    type="submit"
                    value="Submit"
                    name="submit"
                    className="btn btn-outline-primary">Create Product</button>
            </form>
        )
    };

    showSuccess = () => (
        <div
            className="alert alert-info"
            style={{ display: this.state.success ? "" : "none" }}
        >
            <h2>{`${this.state.createdProduct}`} is created!</h2>
        </div>
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
            <Layout
                title="Add a new product"
                description={`G'day ${this.props.user.name}, ready to add a new product?`}
                className="container-fluid"
            >
                <div className="row">
                    <div className="col-md-3">
                        <AdminSideMenu />
                    </div>
                    <div className="col-md-8">
                        {this.showSuccess()}
                        {this.showError()}
                        {this.newPostForm()}
                    </div>
                </div>
            </Layout>
        );
    };
};

function mapStateToProps(state) {
    return {
        user: state.auth.user,
        error: state.admin.error
    };
}

const mapDispatchToProps = dispatch => {
    return {
        adminError: (error) => dispatch(adminError(error)),
        getCategories: (site) => dispatch(getCategories(site)),
        createProduct: ({ site, failed }, formData) => dispatch(createProduct({ site, failed }, formData))
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AddProduct));
