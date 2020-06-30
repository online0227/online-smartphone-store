const mongoose = require("mongoose");
const crypto = require("crypto");
const uuidv1 = require("uuid/v1");
import { counter } from './sequence';
const userSchema = new mongoose.Schema(
    {
        uid: Number,
        name: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32
        },
        email: {
            type: String,
            trim: true,
            required: true,
            unique: true
        },
        hashed_password: {
            type: String,
            required: true
        },
        about: {
            type: String,
            trim: true
        },
        salt: String,
        role: {
            type: Number,
            default: 0
        },
        history: {
            type: Array,
            default: []
        }    },
    { 
        id: false,
        timestamps: true 
    }
);userSchema
    .virtual("password")    .set(function (password) {        this._password = password;
        this.salt = uuidv1();
        this.hashed_password = this.encryptPassword(password);
    })
    .get(function () {
        return this._password;
    });userSchema.methods = {
    authenticate: function (plainText) {        return this.encryptPassword(plainText) === this.hashed_password;
    },

    encryptPassword: function (password) {        if (!password) return "";
        try {
            return crypto
                .createHmac("sha1", this.salt)
                .update(password)
                .digest("hex");
        } catch (err) {
            return "";
        }
    }
};userSchema.pre('save', function (next) {    const doc = this;

    const name = 'user_counter';    counter.findByIdAndUpdate({ _id: name }, { $inc: { seq: 1 } }, { upsert: true, new: true }, function (err, result) {
        if (err) {
            return next(err);
        }

        doc.uid = result.seq;        next();
    });
});

module.exports = mongoose.model("User", userSchema);
