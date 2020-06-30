import React from "react";
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import axios from 'axios';
import { server_address } from "../../config";

const checkAuth = (props) => {
    if (!props.auth.logged) {
        alert("You must login in order to contact the admin.");
    }
}

const sendEmail = async (props, e) => {
    const form_name = document.getElementById("form_name").value;
    const form_email = document.getElementById("form_email").value;
    const form_message = document.getElementById("form_message").value;

    e.preventDefault();
    if (!props.auth.logged) {
        alert("You must login in order to contact the admin");
    } else {
        const confirmed = confirm("Are you sure to contact admin?")
        if (confirmed) {
            const site = props.site;

            try {
                await axios({
                    method: "POST",
                    url: `/send-email`,
                    data: {
                        name: form_name,
                        email: form_email,
                        messageHtml: form_message
                    }
                }).then(response => {
                    alert(response.data.message);
                });
            } catch (error) {
                alert("Message couldn't be sent. Reason : " + error);
            }
        }
    }

};

const Footer = (props) => {
    let protocol;

    if(server_address.includes("https")) {
        protocol = "https://multi1." + server_address.split("://")[1];
    } else {
        protocol = "http://multi1." + server_address.split("://")[1];
    }

    return (
        <div id="contact" className="offset">
            <footer>
                <div className="row">

                    <div className="col-md-5">
                        <img src="/public/img/logo.png" alt="" />
                        <p>Online Smartphone Store is fully responsive minimum ecommerce website built with React/Redux, Node.js, Typescript and 
                            Mongo DB via REST. Server-side rendering, Code-splitting, multi-domain, and hot-reload features are also implemented. 
                            Visit <a style={{color:"#b3d7ff"}} href={protocol}>{protocol}</a> to 
                            check multi-domain feature.</p>
                        <strong>Our Location</strong>
                        <p>100 Street Name<br />Our City, BC M3N 2G8</p>
                        <strong>Contact Info</strong>
                        <p>(888) 888-8888<br />email@email.com</p>
                        <a href="#"><i className="fab fa-facebook-square"></i></a>
                        <a href="#"><i className="fab fa-twitter-square"></i></a>
                        <a href="#"><i className="fab fa-instagram"></i></a>
                        <a href="#"><i className="fab fa-reddit-square"></i></a>
                        <a href="#"><i className="fab fa-linkedin"></i></a>
                    </div>

                    <div className="col-md-7">
                        <h3>Contact Us</h3>

                        <form id="contact-form" method="post" action="#" onSubmit={(e) => sendEmail(props, e)} >

                            <div className="messages"></div>
                            <div className="controls">

                                <div className="form-group">
                                    <input id="form_name" onMouseDown={() => checkAuth(props)} type="text" name="name" className="form-control" placeholder="Enter your name." required="required" />
                                </div>

                                <div className="form-group">
                                    <input id="form_email" onMouseDown={() => checkAuth(props)} type="email" name="email" className="form-control" placeholder="Enter your email." required="required" />
                                </div>

                                <div className="form-group">
                                    <textarea id="form_message" onMouseDown={() => checkAuth(props)} name="message" className="form-control" placeholder="Add your message." rows="4" required="required"></textarea>
                                </div>

                                <input type="submit" className="btn btn-outline-light btn-sm" value="Send message" />
                            </div>
                        </form>
                    </div>
                    <hr className="socket" />
                    &copy; Online Smartphone Store.
        </div>
            </footer>
        </div>
    )
};

function mapStateToProps(state) {
    return {
        auth: state.auth
    };
}

const mapDispatchToProps = dispatch => {
    return {
    }
};export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Footer));