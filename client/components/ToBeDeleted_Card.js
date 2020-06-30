
import React from "react";

const ToBeDeleted_Card = ({
    product
}) => {
    return (
        <div>
            Product Name : {product.name}<br/>
            Product Description : {product.description}<br/>
            Product Quantity : {product.quantity}<br/>
            <br/>
        </div>
    );
};

export default ToBeDeleted_Card;