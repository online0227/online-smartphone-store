import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const CounterSchema = Schema({
    _id: {type: String, required: true},
    seq: { type: Number, default: 0 }
});

export const counter = mongoose.model('counter', CounterSchema);

export const Sequence = function() {
    const user_counter = () => {
        return new Promise((resolve, reject) => {
            counter.collection.insert({
                _id: "user_counter",
                seq: 1            }, function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    setTimeout(resolve, 10);
                }
            });
        });
    };

    const category_counter = () => {
        return new Promise((resolve, reject) => {
            counter.collection.insert({
                _id: "category_counter",
                seq: 1
            }, function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    setTimeout(resolve, 10);
                }
            });
        });
    };

    const product_counter = () => {
        return new Promise((resolve, reject) => {
            counter.collection.insert({
                _id: "product_counter",
                seq: 1
            }, function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    setTimeout(resolve, 10);
                }
            });
        });
    };

    const order_counter = () => {
        return new Promise((resolve, reject) => {
            counter.collection.insert({
                _id: "order_counter",
                seq: 1
            }, function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    setTimeout(resolve, 10);
                }
            });
        });
    };

    return Promise.race([
        user_counter(),
        category_counter(),
        product_counter(),
        order_counter()
    ])
};
