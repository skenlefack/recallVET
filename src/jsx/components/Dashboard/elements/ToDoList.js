import React from 'react';
import {Link} from 'react-router-dom';
// import { SVGICON } from '../../../constant/theme';
import DraggableBlog from './DraggableBlog';

// const listData = [
//     {id:"input1", title: 'Compete this projects Monday', styleChange: 'text-warning', icon: SVGICON.Stopboard},
//     {id:"input2", title: 'Compete this projects Sunday', styleChange: 'text-success', icon: SVGICON.RightClick},
//     {id:"input3", title: 'Compete this projects Tuesday', styleChange: 'text-warning', icon: SVGICON.Stopboard},
//     {id:"input4", title: 'Compete this projects Wednesday',styleChange: 'text-success', icon: SVGICON.RightClick},
//     {id:"input5", title: 'Compete this projects Friday', styleChange: 'text-warning', icon: SVGICON.Stopboard}
// ];

const ToDoList = ({openModal}) => {
    return (
        <>
            <div className="card overflow-hidden">
                <div className="card-header flex-wrap">
                    <div>
                        <h4 className="card-title">My To Do Items</h4>
                    </div>
                    <div className="d-flex">
                        <Link to="/contacts" className="btn btn-link text-primary btn-sm">View All</Link>
                        <Link to={"#"} className="btn btn-link text-info btn-sm text-black" onClick={()=>openModal(true)}> + Add To Do</Link>
                    </div>
                </div>
                <div className="card-body p-0">
                    <div className="dt-do-bx">
                        <div className="draggable-zone dropzoneContainer to-dodroup dz-scroll">                            
                            <DraggableBlog />
                        </div>
                    </div>	
                </div>
            </div>  
        </>
    );
};

export default ToDoList;