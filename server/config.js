module.exports = {
    // common settings
    port: 3001,         // public accessible port
    internal_port:9843, // port reserved to the system for server-side rendering. Make sure you turn on firewall to block any public access on this port.
    ssl_key: "privkey.pem", // you can place it at root folder. No need if you don't use ssl.
    ssl_cert: "fullchain.pem", // you can place it at root folder. No need if you don't use ssl.

    // localhost example
    ssl: false,
    server_address: "http://localhost:3001",
    domain: "localhost",
    RECAPTCHA_SITE_KEY: "",

    // domain example
    // ssl: true,
    // server_address: "https://example.com",
    // domain: "example.com",
    // RECAPTCHA_SITE_KEY: "",
};
