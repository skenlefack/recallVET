import React, { Fragment } from "react";
import Nouislider from "nouislider-react";
import PageTitle from "../../../layouts/PageTitle";


const MainNouiSlider = () => {
  return (
    <Fragment>
      <PageTitle motherMenu="Components" activeMenu="UI Slider" />
      <div className="row">
        <div className="col-xl-4">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Basic slider</h4>
            </div>
            <div className="card-body">
              <div id="basic-slider">
                <Nouislider
                  accessibility
                  start={10}
                  step={10}
                  range={{
                    min: 0,
                    max: 100,
                  }}
                  
                />
                
              </div>
            </div>
          </div> 
        </div>
        
      </div>
    </Fragment>
  );
};

export default MainNouiSlider;
