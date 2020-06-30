"use strict";

const uniqueMessage = error => {
    let output;
    try {
        let fieldName = error.message.substring(
            error.message.lastIndexOf(".$") + 2,
            error.message.lastIndexOf("_1")
        );
        output =
            fieldName.charAt(0).toUpperCase() +
            fieldName.slice(1) +
            " already exists";
    } catch (ex) {
        output = "Unique field already exists";
    }

    return output;
};

exports.errorHandler = error => {
    let message = "";

    if (error.code) {
        switch (error.code) {
            case 11000:
            case 11001:
                message = uniqueMessage(error);
                break;
            default:
                message = "Something went wrong";
        }
    } else {
        if (error.errorors) {
            for (let errorName in error.errorors) {
                if (error.errorors[errorName].message)
                    message = error.errorors[errorName].message;
            }
        } else if (error.errors) {
            for (let title in error.errors) {
                if (error.errors[title].message)
                    message = error.errors[title].message;
            }
        }
    }

    return message;
};

