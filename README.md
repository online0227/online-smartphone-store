# online-smartphone-store

How to run:
1. npm install
2. Create .env file in root folder
3. Copy and paste following text into .env, then set the values:
<pre>
DATABASE=mongodb://localhost:27017/your-mongo-db
MONGO_USER=
MONGO_PASSWORD=
JWT_SECRET=
BRAINTREE_MERCHANT_ID=
BRAINTREE_PUBLIC_KEY=
BRAINTREE_PRIVATE_KEY=
REACT_APP_GOOGLE_CLIENT_ID=
SMTP_ADDRESS=
SMTP_PORT=
SMTP_ID=
SMTP_PASSWORD=
ADMIN_EMAIL=
</pre>
4. Open client/config.js, then configure the settings.
5. Open server/config.js, then configure the settings.
6. Run it with "npm run dev" in development mode, or "npm run prod" in production mode.