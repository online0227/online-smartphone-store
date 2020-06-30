import React, { Fragment, Component } from "react";
import { withRouter, NavLink } from "react-router-dom";
import { connect } from 'react-redux';
import { Link as AniLink, animateScroll as scroll, scroller } from "react-scroll";
import { fetchSignOut, signOut } from '../actions';
import { countCart, listCart, listGuestCart } from "../actions/cart"
import { getCart } from "./cartHelpers";
import { isAuthenticated, isServer } from "../auth";

class Menu extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            currentScroll: 0,
            cart_count: 0,
            isDataFetched: false,
            menuToggled: false
        };
    }

    componentDidMount() {
        this._isMounted = true;
        document.addEventListener('scroll', this.trackScrolling.bind(this));

        if (isAuthenticated()) {
            this.loadCart();
        } else {
            let items = getCart();
            this.loadGuestCart(items);
        }
    }

    componentWillUnmount() {
        document.removeEventListener('scroll', this.trackScrolling);
        this._isMounted = false;
    }
    async loadGuestCart(items) {
        await this.props.listGuestCart(this.props.site, items).then(data => {
            if (this._isMounted) {
                this.setState({ isDataFetched: true });
            }            if (items.length > 0 && (this.props.products.length !== items.length)) {                let keys = Object.keys(this.props.products.reduce((a, { info }) => Object.assign(a, { [info.pid]: undefined }), {}));
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

    trackScrolling = () => {
        if (this._isMounted)
            this.setState({ currentScroll: window.scrollY });
    };

    isActive = (history, path) => {
        if (history.location.pathname === path) {
            return { color: "#ff9900" };
        } else {
            return { color: "#ffffff" };
        }
    };
    menuLogin = () => {
        let navigateTo = "/signin"
        if (!this.props.logged) {
            return (
                <Fragment>
                    <li className="nav-item">
                        {(this.props.site === "www") ? (
                            <NavLink
                                className="nav-link"
                                activeStyle={{
                                    color: "#1ebba3"
                                }}
                                to={navigateTo}
                                onClick={(e) => { if (this.menu.classList.contains("show")) { this.inputElement.click() } }}
                            >
                                Signin
                            </NavLink>)
                            :
                            (                                <div></div>
                            )}

                    </li>

                    <li className="nav-item">
                        {(this.props.site === "www") ? (
                            <NavLink
                                className="nav-link"
                                activeStyle={{
                                    color: "#1ebba3"
                                }}
                                to="/signup"
                                onClick={(e) => { if (this.menu.classList.contains("show")) { this.inputElement.click() } }}
                            >
                                Signup
                            </NavLink>
                        ) : (                                <div></div>
                            )}
                    </li>
                </Fragment>
            );
        }        else {
            return (
                <Fragment>
                    {isAuthenticated() && (
                        <li className="nav-item">
                            <NavLink
                                className="nav-link"
                                activeStyle={{
                                    color: "#1ebba3"
                                }}
                                to="/dashboard"
                                onClick={(e) => { if (this.menu.classList.contains("show")) { this.inputElement.click() } }}
                            >
                                Dashboard
                            </NavLink>
                        </li>
                    )}

                    {isAuthenticated() && isAuthenticated().user.role === 1 && (
                        <li className="nav-item">
                            <NavLink
                                className="nav-link"
                                activeStyle={{
                                    color: "#1ebba3"
                                }}
                                to="/admin"
                                onClick={(e) => { if (this.menu.classList.contains("show")) { this.inputElement.click() } }}
                            >
                                Admin
                            </NavLink>
                        </li>
                    )}

                    <li className="nav-item">
                        <span
                            className="nav-link"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                                this.props.fetchSignOut(this.props.site).then(data => {                                    let items = getCart();
                                    this.loadGuestCart(items).then(data => {
                                        this.props.history.push("/");
                                    })                                });                            }
                            }
                        >
                            Signout
                        </span>
                    </li>
                </Fragment>
            );
        }
    };

    render() {
        if (!isServer && !this.state.isDataFetched) {
            return null;
        }

        return (
            <nav
                className={`navbar navbar-expand-lg fixed-top ${((this.state.currentScroll > 150) || this.state.menuToggled) ? 'solid' : ''}`}
                style={{ zIndex: "100" }}
            >
                <div className="container-fluid">
                    <a className="navbar-brand" href={"/"} ><img src="/public/img/logo.png" alt="" /></a>
                    {/* make this button as a ref which allows us to use it programatically */}
                    <button onClick={() => this.setState({ menuToggled: !this.state.menuToggled })} ref={input => this.inputElement = input} className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarResponsive">
                        <span className="custom-toggler-icon"><i className="fas fa-bars"></i></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarResponsive" ref={input => this.menu = input}>
                        <ul className="navbar-nav ml-auto">
                            <li className="nav-item">
                                <NavLink
                                    className="nav-link"
                                    activeStyle={{
                                        color: "#1ebba3"
                                    }}
                                    exact to="/"
                                    onClick={(e) => { if (this.menu.classList.contains("show")) { this.inputElement.click() } }}
                                >
                                    Home
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink
                                    className="nav-link"
                                    activeStyle={{
                                        color: "#1ebba3"
                                    }}
                                    to="/shop"
                                    onClick={(e) => { if (this.menu.classList.contains("show")) { this.inputElement.click() } }}
                                >
                                    Shop
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink
                                    className="nav-link"
                                    activeStyle={{
                                        color: "#1ebba3"
                                    }}
                                    exact to="/cart"
                                    onClick={(e) => { if (this.menu.classList.contains("show")) { this.inputElement.click() } }}
                                >
                                    Carts{" "}
                                    <sup>
                                        <small className="cart-badge">{this.props.products.length}</small>
                                    </sup>
                                </NavLink>
                            </li>
                            {this.menuLogin()}
                            {/* {isAuthenticated() && isAuthenticated().user.role === 1 && (
                                <li className="nav-item">
                                    <Link
                                        className="nav-link"
                                        to="/admin/dashboard"
                                    >
                                        Dashboards
                                    </Link>
                                </li>
                            )} */}
                        </ul>
                    </div>
                </div>
                {this.state.currentScroll > 500 ?
                    (
                        <AniLink
                            className="top-scroll"
                            style={{ display: "inline" }}
                            to="root"
                            smooth={true}
                            duration={500}
                        >
                            <i className="fas fa-angle-up"></i>
                        </AniLink>
                    )
                    :
                    (
                        <AniLink
                            className="top-scroll"
                            style={{ display: "none" }}
                            to="root"
                            smooth={true}
                            duration={500}
                        >
                            <i className="fas fa-angle-up"></i>
                        </AniLink>
                    )
                }
            </nav>
        );
    }

};


function mapStateToProps(state) {
    return {
        logged: state.auth.logged,
        products: state.cart.products
    };
}

const mapDispatchToProps = dispatch => {
    return {
        signOut: () => dispatch(signOut()),
        fetchSignOut: (site) => dispatch(fetchSignOut(site)),
        countCart: (site) => dispatch(countCart(site)),
        listCart: (site) => dispatch(listCart(site)),
        listGuestCart: (site, items) => dispatch(listGuestCart(site, items))
    }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Menu));

