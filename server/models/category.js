const mongoose = require("mongoose");
import {counter} from './sequence';

const categorySchema = new mongoose.Schema(
    {
        cid: Number,
        name: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32,
            unique: true
        }
    },
    {
        id: false, 
        timestamps: true 
    }
);

categorySchema.pre('save', function (next) {
    const doc = this;

    const name = 'category_counter';
    counter.findByIdAndUpdate({_id: name}, {$inc: { seq: 1 } }, {upsert: true , new: true}, function(err, result) {
        if(err) {
            return next(err);
        }

        doc.cid = result.seq;        next();
    });
});

module.exports = mongoose.model("Category", categorySchema);
