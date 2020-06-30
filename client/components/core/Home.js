import React, { Component } from "react";
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Link, animateScroll as scroll, scroller } from "react-scroll";
import ScrollAnimation from 'react-animate-on-scroll';
import CountUp from 'react-countup';
import VisibilitySensor from 'react-visibility-sensor';

import Card from "./Card";
import { getProductsBySell, getProductsByArrival, coreError } from "../actions/apiCore";
import { isServer } from "../auth";
import Search from "./Search"
import "./Home.css"

class Home extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            isSubmitting: false,
            success: false,
            isDataFetched: false,
            currentScroll: 0,
            prevPath: ''
        };
    }

    componentDidMount() {
        this._isMounted = true;
        document.addEventListener('scroll', this.trackScrolling.bind(this));        this.loadProductsBySell();
        this.loadProductsByArrival();
        window.scrollTo(0, 0);
    }

    componentWillUnmount() {
        document.removeEventListener('scroll', this.trackScrolling);
        this._isMounted = false;
    }

    trackScrolling = () => {
        if (this._isMounted)
            this.setState({ currentScroll: window.scrollY });
    };
    async loadProductsBySell() {
        const { site } = this.props;
        const sortBy = "sold";
        await this.props.getProductsBySell({ site, sortBy }).then(data => {
        });
    };

    async loadProductsByArrival() {
        const { site } = this.props;
        const sortBy = "createdAt";
        await this.props.getProductsByArrival({ site, sortBy }).then(data => {
            if (this._isMounted) {
                this.setState({ isDataFetched: true });            }
        });
    };

    render() {
        if (!isServer && !this.state.isDataFetched) {
            return null;
        }        let MarkdownData;
        try {
            MarkdownData = require(`../../../data/${this.props.site}/Homepage.md`);        } catch (err) {
            return null;
        }

        return (
            <div>
                <div id="home">
                    <div className="landing">
                        <div className="home-wrap">
                            <div className="home-inner" style={{
                                backgroundImage: "url(" + MarkdownData.backgroundImage + ")"
                            }}>
                            </div>
                        </div>
                    </div>

                    <div className="caption text-center">
                        <ScrollAnimation animateIn="bounceInUp" duration={1.0} animateOnce={true}>
                            <h1>{MarkdownData.title}</h1>
                        </ScrollAnimation>

                        <ScrollAnimation animateIn="bounceInUp" duration={1.2} animateOnce={true}>
                            <h3>Search the product</h3>
                            <div className="container mb-3">
                                <Search
                                    site={this.props.site}
                                    transparent={true}
                                />
                            </div>
                            <h3>OR</h3>
                        </ScrollAnimation>

                        <ScrollAnimation className="animate-zindex-problem-fix" animateIn="bounceInUp" duration={1.2} animateOnce={true}>
                            <Link
                                to="new_arrivals"
                                smooth={true}
                            >
                                <div className="btn btn-outline-light btn-lg" style={{ cursor: "pointer" }}>Browse the products</div>
                            </Link>
                        </ScrollAnimation>
                    </div>

                    <Link
                        activeClass="active"
                        to="new_arrivals"
                        spy={true}
                        smooth={true}
                        offset={7}
                        duration={500}
                    >

                        <ScrollAnimation animateIn="bounce" initiallyVisible={true} offset={0} style={{ opacity: (1 - this.state.currentScroll / 500) }}>
                            <div className="down-arrow">
                                <div className="arrow d-md-block">
                                    <i className="fas fa-angle-down" aria-hidden="true"></i>
                                </div>
                            </div>
                        </ScrollAnimation>

                    </Link>
                    <div className="search_bar"></div>
                </div>

                <div id="new_arrivals" className="offset">
                    <div className="row padding">

                        <div className="col-12">
                            <ScrollAnimation animateIn="fadeInUp" duration={1.0} animateOnce={true}>
                                <h3 className="heading">New Arrivals</h3>
                                <div className="heading-underline"></div>
                            </ScrollAnimation>
                        </div>


                    </div>

                    <div className="container-fluid">
                        <div className="row justify-content-md-center text-center">
                            {this.props.productsByArrival.map((product, i) => {
                                return (
                                    <div className="col-xl-3 col-lg-4 col-sm-6" key={i}>
                                        <ScrollAnimation animateIn={((i % 4) < 2) ? "bounceInLeft" : "bounceInRight"} duration={1.0} delay={.2} animateOnce={true}>
                                            <Card product={product} site={this.props.site} />
                                        </ScrollAnimation>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div id="best_sellers" className="offset">
                    <div className="row padding">
                        <div className="col-12">
                            <ScrollAnimation animateIn="fadeInUp" duration={1.0} animateOnce={true}>
                                <h3 className="heading">Best Sellers</h3>
                                <div className="heading-underline"></div>
                            </ScrollAnimation>
                        </div>
                    </div>

                    <div className="container-fluid">
                        <div className="row justify-content-md-center text-center">
                            {this.props.productsBySell.map((product, i) => {
                                return (
                                    <div className="col-xl-3 col-lg-4 col-sm-6" key={i}>
                                        <ScrollAnimation animateIn={((i % 4) < 2) ? "bounceInLeft" : "bounceInRight"} duration={1.0} delay={.2} animateOnce={true} >
                                            <Card product={product} site={this.props.site} />
                                        </ScrollAnimation>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* counter start */}
                <div id="skills" className="offset">

                    <div className="jumbotron">
                        <div className="narrow">
                            <ScrollAnimation animateIn="fadeInUp" duration={1.0}>
                                <div className="col-12">
                                    <h3 className="heading">Our Store</h3>
                                    <div className="heading-underline"></div>
                                </div>
                            </ScrollAnimation>

                            <ScrollAnimation animateIn="fadeInUp" duration={1.0}>
                                <div className="row text-center">
                                    <div className="col-sm-6 col-md-3">
                                        <div className="skill">
                                            <span className="fa-layers fa-4x">
                                                <i className="fas fa-clock"></i>
                                            </span>
                                            <h3>
                                                <CountUp start={0} end={100} delay={0} duration={5.0} redraw={true}>
                                                    {({ countUpRef, start }) => (
                                                        <div>
                                                            <VisibilitySensor onChange={start} delayedCall>
                                                                <span ref={countUpRef} />
                                                            </VisibilitySensor>
                                                        </div>
                                                    )}
                                                </CountUp>
                                            </h3>
                                            <p>Products</p>
                                        </div>
                                    </div>

                                    <div className="col-sm-6 col-md-3">
                                        <div className="skill">
                                            <span className="fa-layers fa-4x">
                                                <i className="fab fa-codepen"></i>
                                            </span>
                                            <h3>
                                                <CountUp start={0} end={199} delay={0} duration={5.0} redraw={true}>
                                                    {({ countUpRef, start }) => (
                                                        <div>
                                                            <VisibilitySensor onChange={start} delayedCall>
                                                                <span ref={countUpRef} />
                                                            </VisibilitySensor>
                                                        </div>
                                                    )}
                                                </CountUp>
                                            </h3>
                                            <p>Users</p>
                                        </div>
                                    </div>

                                    <div className="col-sm-6 col-md-3">
                                        <div className="skill">
                                            <span className="fa-layers fa-4x">
                                                <i className="fas fa-cloud-download-alt" data-fa-transform="left-1"></i>
                                            </span>
                                            <h3>
                                                <CountUp start={0} end={237} delay={0} duration={5.0} redraw={true}>
                                                    {({ countUpRef, start }) => (
                                                        <div>
                                                            <VisibilitySensor onChange={start} delayedCall>
                                                                <span ref={countUpRef} />
                                                            </VisibilitySensor>
                                                        </div>
                                                    )}
                                                </CountUp>
                                            </h3>
                                            <p>Orders</p>
                                        </div>
                                    </div>

                                    <div className="col-sm-6 col-md-3">
                                        <div className="skill">
                                            <span className="fa-layers fa-4x">
                                                <i className="fas fa-users" data-fa-transform="left-2"></i>
                                            </span>
                                            <h3>
                                                <CountUp start={0} end={1024} delay={0} duration={5.0} redraw={true}>
                                                    {({ countUpRef, start }) => (
                                                        <div>
                                                            <VisibilitySensor onChange={start} delayedCall>
                                                                <span ref={countUpRef} />
                                                            </VisibilitySensor>
                                                        </div>
                                                    )}
                                                </CountUp>
                                            </h3>
                                            <p>Supports</p>
                                        </div>
                                    </div>

                                </div>
                            </ScrollAnimation>

                            <div className="os-animation" data-animation="fadeInUp">
                                <div className="narrow text-center">
                                    <div className="col-12">
                                        <p className="lead">Want to ask about the products, support, or anything else in private?</p>
                                        <Link
                                            to="contact"
                                            smooth={true}
                                        >
                                            <div className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>Question & Support</div>
                                        </Link>
                                        <Link
                                            to="contact"
                                            smooth={true}
                                        >
                                            <div className="btn btn-turquoise btn-sm" style={{ cursor: "pointer" }}>Contact for else</div>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
                {/* counter end */}
            </div>
        );
    };
};

function mapStateToProps(state) {
    return {
        error: state.core.error,
        content: state.markdown.content,
        productsBySell: state.core.productsBySell,
        productsByArrival: state.core.productsByArrival
    };
}

const mapDispatchToProps = dispatch => {
    return {
        coreError: (error) => dispatch(coreError(error)),
        getProductsBySell: ({ site, sortBy }) => dispatch(getProductsBySell({ site, sortBy })),
        getProductsByArrival: ({ site, sortBy }) => dispatch(getProductsByArrival({ site, sortBy })),    }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Home));
