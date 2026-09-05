import React, {useState, useRef, useEffect} from 'react';
import {Link} from 'react-router-dom';
import { CSVLink } from 'react-csv';
import { IMAGES } from '../../../constant/theme';

const tableData = [
    {name: "Batman", name2 :'Liam Risher',profile: IMAGES.contact1, progresStyle: "primary-light", color:'primary', progresValue: "65%", assigne: '3', status: 'Inprogress',  duedate: '01 May 2023'},
    {name: "Mivy App", name2 :'Honey Risher', profile: IMAGES.contact2, progresStyle: "primary-light",color:'primary', progresValue: "55%", assigne: '3', status: 'Inprogress',  duedate: '08 June 2023'},
    {name: "Crypto App", name2 :'Ankites Risher', profile: IMAGES.contact1, progresStyle: "danger-light",color:'danger', progresValue: "50%", assigne: '2', status: 'Pending',  duedate: '14 Sep 2023'},
    {name: "Bender Project", name2 :'Oliver Noah', profile: IMAGES.contact8, progresStyle: "danger-light",color:'danger', progresValue: "55%", assigne: '3', status: 'Pending',  duedate: '22 Oct 2023'},
    {name: "Canary", name2 :'Elijah James', profile: IMAGES.contact2, progresStyle: "success-light",color:'success', progresValue: "40%", assigne: '4', status: 'Completed',  duedate: '16 Nov 2023'},

    {name: "Canary", name2 :'Elijah James', profile: IMAGES.contact2, progresStyle: "success-light",color:'success',  progresValue: "50%", assigne: '4', status: 'Completed',  duedate: '16 Nov 2023'},
    {name: "Mivy App", name2 :'Honey Risher', profile: IMAGES.contact2, progresStyle: "primary-light",color:'primary', progresValue: "55%", assigne: '3', status: 'Inprogress',  duedate: '08 June 2023'},
    {name: "Batman", name2 :'Liam Risher',profile: IMAGES.contact1, progresStyle: "primary-light", color:'primary', progresValue: "60%", assigne: '3', status: 'Inprogress',  duedate: '01 May 2023'},
    {name: "Bender Project", name2 :'Oliver Noah', profile: IMAGES.contact8, progresStyle: "danger-light",color:'danger', progresValue: "40%", assigne: '3', status: 'Pending',  duedate: '22 Oct 2023'},
    {name: "Crypto App", name2 :'Ankites Risher', profile: IMAGES.contact1, progresStyle: "danger-light", color:'danger', progresValue: "65%", assigne: '2', status: 'Pending',  duedate: '14 Sep 2023'},

    {name: "Mivy App", name2 :'Honey Risher', profile: IMAGES.contact2, progresStyle: "primary-light",color:'primary',  progresValue: "55%", assigne: '3', status: 'Inprogress',  duedate: '08 June 2023'},
    {name: "Batman", name2 :'Liam Risher',profile: IMAGES.contact1, progresStyle: "primary-light",color:'primary',  progresValue: "50%", assigne: '3', status: 'Inprogress',  duedate: '01 May 2023'},

];


const headers = [
    { label: "Project Name", key: "name" },
    { label: "Project Lead", key: "name2" },
    { label: "Status", key: "status" },
    { label: "Due Date", key: "duedate" },
];

const csvlink = {
    headers : headers,
    data : tableData,
    filename: "csvfile.csv"
}

const ActiveProjects = () => {
    const [data, setData] = useState(
		document.querySelectorAll("#projects-tbl_wrapper tbody tr")
	);
	const sort = 6;
	const activePag = useRef(0);
	const [test, settest] = useState(0);
	const chageData = (frist, sec) => {
		for (var i = 0; i < data.length; ++i) {
			if (i >= frist && i < sec) {
				data[i].classList.remove("d-none");
			} else {
				data[i].classList.add("d-none");
			}
		}
	};
   
   useEffect(() => {
      setData(document.querySelectorAll("#projects-tbl_wrapper tbody tr"));
	}, [test]);

   activePag.current === 0 && chageData(0, sort);
   let paggination = Array(Math.ceil(data.length / sort))
      .fill()
      .map((_, i) => i + 1);
	const onClick = (i) => {
		activePag.current = i;
		chageData(activePag.current * sort, (activePag.current + 1) * sort);
		settest(i);
	};
       
    return (
        <>
          <div className="card">
            <div className="card-body p-0">
                <div className="table-responsive active-projects shorting">                
                    <div className="tbl-caption d-flex justify-content-between flex-wrap align-items-center">
                        <h4 className="card-title mb-0">Active Projects</h4>
                        <div>                            
                            <CSVLink {...csvlink} className="btn btn-primary light btn-sm "><i className="fa-solid fa-file-excel" /> Export Report </CSVLink>                             
                        </div>
                    </div>
                    <div id="projects-tbl_wrapper" className="dataTables_wrapper no-footer">
                        <table id="projects-tbl" className="table ItemsCheckboxSec dataTable no-footer mb-0">
                            <thead>
                                <tr>                                    
                                    <th>Project Name</th>
                                    <th>Project Lead</th>
                                    <th>Progress</th>
                                    <th>Assignee</th>
                                    <th>Status</th>
                                    <th>Due Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map((item, index)=>(
                                    <tr key={index}>                                        
                                        <td>{item.name}</td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <img src={item.profile} className="avatar rounded-circle" alt="" />
                                                <p className="mb-0 ms-2">{item.name2}</p>	
                                            </div>
                                        </td>
                                        <td className="pe-0">
                                            <div className="progress-box tbl-progress-box">
                                                <div className="progress">
                                                    <div 
                                                        className={`progress-bar bg-${item.progresStyle}`} 
                                                        style={{width: item.progresValue , height:"10px", borderRadius:"8px"}} >
                                                    </div>
                                                </div>
                                                <span className={`text-${item.color}`}>{item.progresValue}</span>
                                            </div>
                                        </td>
                                        <td className="pe-0">
                                            <div className="avatar-list avatar-list-stacked">
                                                {
                                                    item.assigne === '2' ?
                                                        <>
                                                            <img src={IMAGES.contact9} className="avatar rounded-circle" alt="" />{" "}
                                                            <img src={IMAGES.contact2} className="avatar rounded-circle" alt="" />                                                        
                                                        </>
                                                    
                                                    :
                                                    item.assigne === '3' ?
                                                        <>
                                                            <img src={IMAGES.contact5} className="avatar rounded-circle" alt="" />{" "}
                                                            <img src={IMAGES.contact6} className="avatar rounded-circle" alt="" />{" "}
                                                            <img src={IMAGES.contact7} className="avatar rounded-circle" alt="" />
                                                        </>
                                                    
                                                    :
                                                    item.assigne === '4' ?
                                                        <>
                                                            <img src={IMAGES.contact9}className="avatar rounded-circle" alt="" />{" "}
                                                            <img src={IMAGES.contact8} className="avatar rounded-circle" alt="" />{" "}
                                                            <img src={IMAGES.contact7} className="avatar rounded-circle" alt="" />{" "}
                                                            <img src={IMAGES.contact6} className="avatar rounded-circle" alt="" />
                                                        </>
                                                    :
                                                    <img src={IMAGES.contact1} className="avatar rounded-circle" alt="" />
                                                    
                                                }
                                            </div>
                                        </td>
                                        <td className="pe-0">
                                            <span className={`badge light border-0 badge-${item.color}`}>{item.status}</span>
                                        </td>
                                        <td>
                                            <span>{item.duedate}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            
                        </table>
                        <div className="d-sm-flex text-center justify-content-between align-items-center">
                            <div className="dataTables_info">
                                Showing {activePag.current * sort + 1} to{" "}
                                {data.length > (activePag.current + 1) * sort
                                    ? (activePag.current + 1) * sort
                                    : data.length}{" "}
                                of {data.length} entries
                            </div>
                            <div
                                className="dataTables_paginate paging_simple_numbers"
                                id="example2_paginate"
                            >
                                <Link
                                    className="paginate_button previous disabled"
                                    to="#"
                                    onClick={() =>
                                    activePag.current > 0 &&
                                    onClick(activePag.current - 1)
                                    }
                                >
                                    <i className="fa-solid fa-angle-left" />
                                </Link>
                                <span>
                                    {paggination.map((number, i) => (
                                    <Link
                                        key={i}
                                        to="#"
                                        className={`paginate_button  ${
                                            activePag.current === i ? "current" : ""
                                        } `}
                                        onClick={() => onClick(i)}
                                    >
                                        {number}
                                    </Link>
                                    ))}
                                </span>
                                <Link
                                    className="paginate_button next"
                                    to="#"
                                    onClick={() =>
                                    activePag.current + 1 < paggination.length &&
                                    onClick(activePag.current + 1)
                                    }
                                >
                                    <i className="fa-solid fa-angle-right" />
                                </Link>
                            </div>
                        </div> 
                    </div>
                </div>
            </div>
            </div>
        
        </>
    );
};

export default ActiveProjects;