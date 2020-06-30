const express = require("express");
const fs = require('fs-extra');
const server = express()
const path = require("path");
const expressStaticGzip = require("express-static-gzip")
const webpack = require("webpack");
const webpackHotServerMiddleware = require("webpack-hot-server-middleware");

const configDevClient = require("../config/webpack.dev-client.js");
const configDevServer = require("../config/webpack.dev-server.js");
const configProdClient = require("../config/webpack.prod-client.js");
const configProdServer = require("../config/webpack.prod-server.js");

const config = require("./config");
const isProd = process.env.NODE_ENV === "production"
const isDev = !isProd
const PORT = config.port || process.env.PORT;
const INTERNAL_PORT = config.internal_port || process.env.INTERNAL_PORT;
let isBuilt = false

const http = require('http');
const https = require('https'); require("dotenv").config();

const mongoose = require("mongoose");
const morgan = require("morgan"); const bodyParser = require("body-parser"); const cookieParser = require("cookie-parser"); const cors = require("cors"); const expressValidator = require("express-validator"); mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    user: process.env.MONGO_USER,
    pass: process.env.MONGO_PASSWORD
  })
  .then(() => console.log("DB Connected")); server.use(morgan("dev")); server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

server.use(cookieParser());
server.use(expressValidator());
server.use(cors()); const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");
const braintreeRoutes = require("./routes/braintree");
const orderRoutes = require("./routes/order");
const cartRoutes = require("./routes/cart");
server.use("/api", authRoutes);
server.use("/api", userRoutes);
server.use("/api", categoryRoutes);
server.use("/api", productRoutes);
server.use("/api", braintreeRoutes);
server.use("/api", orderRoutes);
server.use("/api", cartRoutes); 

const nodemailer = require('nodemailer');
server.post("/send-email", (req, res, next) => {
  const form_email = req.body.email;
  const form_name = req.body.name;
  const form_messageHtml = req.body.messageHtml;
  let transport = nodemailer.createTransport({
    host: process.env.SMTP_ADDRESS,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_ID,
      pass: process.env.SMTP_PASSWORD
    }
  });

  const message = {
    from: form_email, to: process.env.ADMIN_EMAIL, subject: 'message from Online Smartphone Store',
    text: `${form_name} (${form_email})\n\n` + form_messageHtml
  };

  transport.sendMail(message, function (err, info) {
    if (err) {
      return res.status(404).json(err)
    } else {
      res.json({
        message: "email sent successfully"
      });
    }
  });
});
const public_path = path.resolve('wwwroot', '../public/');
server.use('/public', express.static(public_path));

const done = () => {
  if (isBuilt) return;
  let internal = http.createServer(server);

  internal.listen(INTERNAL_PORT, () => {
    isBuilt = true
    console.log(
      `Internal server listening on http://*.localhost:${INTERNAL_PORT}`
    )
  })

  var myServer;

  if (config.ssl) {
    myServer = https.createServer({
      key: fs.readFileSync(config.ssl_key), cert: fs.readFileSync(config.ssl_cert)
    },
      server);
  } else {
    myServer = http.createServer(server);
  }

  myServer.listen(PORT, () => {
    isBuilt = true
    console.log(
      `Public server listening on http${config.ssl ? 's' : ''}://*.localhost:${PORT}`
    )
  })
}
const marked = require("marked");
const yaml = require("yaml-front-matter")
server.get("/api/markdown", (req, res) => {
  const site = req.hostname.split(".")[0]

  if (!site) {
    throw new Error("No site provided")
  }

  let file: any = undefined;
  (site === "localhost" || site === "www") ?
    file = path.resolve(__dirname, `../data/www/Homepage.md`)
    :
    file = path.resolve(__dirname, `../data/${site}/Homepage.md`)

  fs.readFile(file, "utf8", (err, data) => {
    if (err) {
      const regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/g; let site = "www";
      let found = regex.test(req.hostname);

      if (!found) {
        const regex2 = /^(?:[0-9A-Za-z]+\.){0,1}(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/g; found = regex2.test(req.hostname);
        site = req.hostname.split(".")[0];
      }

      if (found) {
        let file: any = path.resolve(__dirname, `../data/${site}/Homepage.md`);
        fs.readFile(file, "utf8", (err, data) => {
          if (err) {
            return res.status(400).json({
              error: "not a correct url"
            });
          } else {
            const obj = yaml.loadFront(data)
            obj.__content = marked(obj.__content)
            res.json(obj)
          }
        });
      } else {
        return res.status(400).json({
          error: "not a correct url"
        });
      }

    } else {
      const obj = yaml.loadFront(data)
      obj.__content = marked(obj.__content)
      res.json(obj)
    }
  })
})

if (isDev) {
  const compiler = webpack([configDevClient, configDevServer])

  const clientCompiler = compiler.compilers[0]
  const serverCompiler = compiler.compilers[1]

  const webpackDevMiddleware = require("webpack-dev-middleware")(
    compiler,
    configDevClient.devServer
  )

  const webpackHotMiddlware = require("webpack-hot-middleware")(
    clientCompiler,
    configDevClient.devServer
  )

  server.use(webpackDevMiddleware)
  server.use(webpackHotMiddlware)

  server.use(webpackHotServerMiddleware(compiler))

  console.log("Middleware enabled")
  done()
} else {
  webpack([configProdClient, configProdServer]).run((err, stats) => {
    const clientStats = stats.toJson().children[0]
    const render = require("../build/prod-server-bundle.js").default
    console.log(
      stats.toString({
        colors: true
      })
    )

    server.use(
      expressStaticGzip("dist", {
        enableBrotli: true
      })
    )

    server.use(render({ clientStats }))
    done()
  })
}
