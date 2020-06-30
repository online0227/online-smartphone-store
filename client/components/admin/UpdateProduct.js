import React, { Component } from 'react';
import { withRouter, NavLink, Redirect } from "react-router-dom";
import { connect } from 'react-redux';
import Layout from "../core/Layout";
import { adminError, getCategories, createProduct, getProduct, updateProduct } from '../actions/admin';
import { isServer } from "../auth";
import AdminSideMenu from "./AdminSideMenu";

import "./UpdateProduct.css"

import ReactQuill, { Quill } from 'react-quill'; import { ImageUpload } from 'quill-image-upload';
import 'react-quill/dist/quill.snow.css';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';

Quill.register('modules/imageUpload', ImageUpload);

const min_length = 200;
const max_length = 5000;

class UpdateProduct extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isDelPhotoChecked: false,
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

        this.modules = {
            imageUpload: {
                url: 'https://api.imgur.com/3/image', method: 'POST', name: 'image', withCredentials: false, headers: {
                    Authorization: 'Client-ID fbb0eaff25e10c1',
                }, callbackOK: (serverResponse, next) => {
                    next(serverResponse.data.link);
                }, callbackKO: serverError => {
                    alert(serverError);
                }, checkBeforeSend: (file, next) => { next(file); }
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
    }

    componentDidMount() {
        this.props.adminError('');
        this.init(this.props.match.params.productId);
        window.scrollTo(0, 0);
    }

    async init(productId) {
        const { site } = this.props;
        await this.props.getProduct({ site, productId }).then(data => {
            if (data.error) {
                this.props.adminError(data.error);
            } else {
                const jsonDesc = JSON.parse(data.description);

                var cfg = {};
                var converter = new QuillDeltaToHtmlConverter(jsonDesc.ops, cfg);
                var html = converter.convert(); this.setState({
                    body: html,
                    initialContent: JSON.parse(data.description),
                    editorState: JSON.parse(data.description),
                    name: data.name,
                    price: data.price,
                    cid: data.cid,
                    shipping: data.shipping,
                    quantity: data.quantity,
                    formData: new FormData(),
                }); this.state.formData.set("name", data.name);
                this.state.formData.set("price", data.price);
                this.state.formData.set("cid", data.cid);
                this.state.formData.set("shipping", data.shipping);
                this.state.formData.set("quantity", data.quantity); this.initCategories();
            }
        });
    };

    async initCategories() {
        await this.props.getCategories(this.props.site).then(data => {
            if (data.error) {
                this.props.adminError(data.error);
            } else {
                this.setState({
                    categories: data,
                    isDataFetched: true
                });
            }
        });
    };

    preview = () => {
        return (
            <div dangerouslySetInnerHTML={{ __html: this.state.body }} />
        );
    }

    goBack = () => (
        <div className="mt-5">
            <NavLink
                className="text-warning"
                to="/admin/products" exact
            >
                Back to Product List
                        </NavLink>
        </div>
    );

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
        const productId = this.props.match.params.productId;

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
        const unprivilegedEditor = this.reactQuillRef.makeUnprivilegedEditor(editor); this.state.formData.set("description", JSON.stringify(unprivilegedEditor.getContents()));
        this.state.formData.set("deletePhoto", this.state.isDelPhotoChecked);
        if (this.state.isDelPhotoChecked) {
            this.state.formData.delete("photo");
        }

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

            const promise = this.props.updateProduct({ site, productId }, formData);
            promise.then(response => {
                if (response) {
                    this.props.history.push("/admin/products");
                } else {
                    this.setState({
                        success: false
                    })
                }
            })
        });
    };

    showError = () => (
        <div
            className="alert alert-danger"
            style={{ display: this.props.error ? "" : "none" }}
        >
            {this.props.error}
        </div>
    );

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
    };

    handleToggle = () => {
        this.setState({
            isDelPhotoChecked: !this.state.isDelPhotoChecked,
        });
    };

    newPostForm = () => {
        const { editorState, initialContent } = this.state;
        return (
            <form className="mb-3" onSubmit={this.clickSubmit}>
                <h4>Post Photo (Max 5 images, each 5MB)</h4>

                <div className="form-check">
                    <input
                        checked={this.state.isDelPhotoChecked}
                        onChange={this.handleToggle}
                        type="checkbox"
                        className="form-check-input"
                    />
                    <label className="form-check-label">Delete photos</label>
                </div>
                <div className="form-group">
                    <label className="btn btn-secondary">
                        <input
                            onChange={this.handleChange("photo")}
                            disabled={(this.state.isDelPhotoChecked) ? "disabled" : ""}
                            type="file"
                            name="photo"
                            accept="image/*"
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
                    <label className="text-muted">Category (leave it if you don't want to change)</label>
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
                    <label className="text-muted">Shipping (leave it if you don't want to change)</label>
                    <select value={+ this.state.shipping}
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
                    className="btn btn-outline-primary">Update Product</button>
            </form>
        )
    };

    render() {
        if (!isServer && !this.state.isDataFetched) {
            return null;
        }

        return (
            <Layout
                title="Add a new product"
                description={`G'day ${this.props.user.name}, ready to add a new product?`}
            >
                <div className="row">
                    <div className="col-md-3">
                        <AdminSideMenu />
                    </div>
                    <div className="col-md-9">
                        <div className="col-md-8">
                            {this.goBack()}
                            {this.showError()}
                            {this.newPostForm()}
                        </div>
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
        createProduct: ({ site, failed }, formData) => dispatch(createProduct({ site, failed }, formData)),
        getProduct: ({ site, productId }) => dispatch(getProduct({ site, productId })),
        updateProduct: ({ site, productId }, formData) => dispatch(updateProduct({ site, productId }, formData))
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UpdateProduct));
