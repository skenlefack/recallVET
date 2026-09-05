import React from "react";
import { Link } from "react-router-dom";
import bgimg from  './../../images/student-bg.jpg'
import error from  './../../images/error.png'
const Error503 = () => {
   return (
      <div className="authincation" style={{backgroundImage: `url(${bgimg})`, backgroundRepeat:"no-repeat", backgroundSize:"cover"}}>
         <div className="container">
            <div className="row h-100 align-items-center">
                  <div className="col-lg-6 col-sm-12">
                     <div className="form-input-content  error-page">
                        <h1 className="error-text text-primary">503</h1>
                        <h4>Service Unavailable</h4>
                        <p>Sorry, we are under maintenance!</p>
                        <Link to={"/dashboard"} className="btn btn-primary light">Back to Home</Link>
                     </div>
                  </div>
                  <div className="col-lg-6 col-sm-12">
                     <img className="move-2 error-media" src={error} alt="error" />
                  </div>
            </div>
         </div>
      </div>
   );
};

export default Error503;
