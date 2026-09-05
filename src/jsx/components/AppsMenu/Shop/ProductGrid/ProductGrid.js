import React, { Fragment } from "react";
import Products from "./Products";

/// Data
import productData from "../productData";

const ProductGrid = () => {
   return (
      <Fragment>         
            <div className="row">
               {productData.map((product, index) => (
                  <Products key={index} product={product} />
               ))}
            </div>
         
      </Fragment>
   );
};

export default ProductGrid;
