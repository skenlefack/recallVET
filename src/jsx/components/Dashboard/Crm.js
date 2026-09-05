import React from 'react';
import {Link} from 'react-router-dom';
import loadable from "@loadable/component";
import pMinDelay from "p-min-delay";

import { IMAGES, SVGICON } from '../../constant/theme';
import TotalProfitBar from './elements/TotalProfitBar';
import GrowthDounut from './elements/GrowthDounut';
import TrafficDounut from './elements/TrafficDounut';
import CrmTimelineChart from './elements/CrmTimelineChart';
import CrmMarketArea from './elements/CrmMarketArea';

const SaleAreaChart = loadable(() =>
	pMinDelay(import("./elements/SaleAreaChart"), 1000)
);
const CrmExtranalChart = loadable(() =>
	pMinDelay(import("./elements/CrmExtranalChart"), 1000)
);


const projectList = [
    {title:'UI Kit Design', number1:'100', number2:'200', bg:'primary', icon:'fa-brands fa-uikit text-primary'},
    {title:'CRM Dashboard', number1:'90', number2:'100', bg:'secondary', icon:'fa-sharp fa-solid fa-star text-secondary'},
    {title:'Website Designing', number1:'80', number2:'100',bg:'success', icon:'fas fa-asterisk text-success'},
    {title:'Software Dovelopment', number1:'150', number2:'200', icon:SVGICON.Worldweb, iconbox : true},
    {title:'App Dovelopment', number1:'75', number2:'100',bg:'danger', icon:'fas fa-mobile-alt text-danger'},
    {title:'UI Kit Design', number1:'100', number2:'200',bg:'primary', icon:'fa-brands fa-uikit text-primary'},
    {title:'CRM Dashboard', number1:'90', number2:'100',bg:'secondary', icon:'fa-sharp fa-solid fa-star text-secondary'},
    {title:'Website Designing', number1:'80', number2:'100',bg:'success', icon:'fas fa-asterisk text-success'},
    {title:'Software Dovelopment', number1:'150', number2:'200', icon:SVGICON.Worldweb, iconbox : true},   
];

const netwrokBlog = [
    {image:IMAGES.dribble, title:'Dribble', price:'12,348', bg:'primary' , percent:'+36' },
    {image:IMAGES.facebook, title:'Facebook', price:'10,048', bg:'danger' , percent:'+33' },
    {image:IMAGES.instagram, title:'Instagram', price:'09,059', bg:'info' , percent:'-10' },
    {image:IMAGES.linkdin, title:'Linkedin', price:'13,259', bg:'success' , percent:'-14' },
    {image:IMAGES.pinterest, title:'Pinterest', price:'15,586', bg:'primary' , percent:'-21' },
];
const meetingList = [
    {image:IMAGES.contact1, title:'Liam Risher',  bg:'primary', status:'Businessman'},
    {image:IMAGES.contact2, title:'Oliver Noah', bg:'primary', status:'Businessman'},
    {image:IMAGES.contact3, title:'Donald Benjamin', bg:'success', status:'Accountant'},
    {image:IMAGES.contact6, title:'Elijah James',  bg:'info', status:'Manager'},
    {image:IMAGES.contact5, title:'William Risher', bg:'info', status:'Manager'},
];

const tableList = [
    {name:'American Express', amount:'522', total:'4,522'},
    {name:'Master Card', amount:'756', total:'1,1256'},
    {name:'Visa Card', amount:'3.4125', total:'5,1236'},
    {name:'American Express', amount:'522', total:'4,522'},
    {name:'Master Card', amount:'756', total:'1,1256'},
    {name:'Visa Card', amount:'3.415', total:'5,1236'},
    {name:'American Express', amount:'522', total:'1,110'},
];

const Crm = () => {
    return (
        <>
            <h3 className="head-title">CRM</h3>
            <div className="row">
                <div className="col-xl-4 col-xxl-3 col-sm-6">
                    <div className="card overflow-hidden">
                        <div className="card-body">
                            <div className="c-con">
                                <h4 className="card-title mb-0">Congratulations <strong>Hanu!!</strong><img src={IMAGES.partypopper} alt="" /></h4>
                                <span>Best seller of the week</span>
                            </div>
                            <div className="c-con-3d">
                                <div className="c-con-prise">
                                    <h3 className="mb-0 text-primary">$43.9k</h3>
                                    <span className="d-block mb-2">98% of target 🧡 </span>
                                    <Link to={"#"} className="btn btn-primary light light btn-sm">View Sale</Link>
                                </div>
                                <img src={IMAGES.object} alt="" />
                            </div>	
                        </div>
                    </div>
                </div>
                <div className="col-xl-2 col-xxl-3 col-sm-6">
                    <div className="card crm-cart bg-secondary-light">
                        <div className="card-header border-0 pb-0 diposit-bg">
                            <span className="text-black fs-16">+38% {""}<i className="fa-solid fa-chevron-up ms-1" /></span>
                            <div className="icon-box">                               
                                {SVGICON.DollerBlack}
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="crm-cart-data">
                                <p>252$</p>
                                <h6 className="d-block mb-3 text-black">Total Sales</h6>
                                <span className="badge bg-white text-black border-0">Last 4 Month</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-2 col-xxl-3 col-sm-4">
                    <div className="card crm-cart bg-primary-light">
                        <div className="card-header border-0 pb-0 diposit-bg">
                            <span className="text-black fs-16">+34% {""}<i className="fa-solid fa-chevron-up ms-1" /></span>
                            <div className="icon-box">
                                <svg id="_x31__px" height="15" viewBox="0 0 24 24" width="15" xmlns="http://www.w3.org/2000/svg"><path d="m17.5 13c-3.584 0-6.5-2.916-6.5-6.5s2.916-6.5 6.5-6.5 6.5 2.916 6.5 6.5-2.916 6.5-6.5 6.5zm0-12c-3.033 0-5.5 2.467-5.5 5.5s2.467 5.5 5.5 5.5 5.5-2.467 5.5-5.5-2.467-5.5-5.5-5.5z"/><path d="m17.5 10c-.276 0-.5-.224-.5-.5v-6c0-.276.224-.5.5-.5s.5.224.5.5v6c0 .276-.224.5-.5.5z"/><path d="m20.5 7h-6c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h6c.276 0 .5.224.5.5s-.224.5-.5.5z"/><path d="m19.5 17h-13c-.238 0-.443-.168-.49-.402l-2-10c-.03-.147.009-.299.103-.415.095-.116.237-.183.387-.183h4c.276 0 .5.224.5.5s-.224.5-.5.5h-3.39l1.8 9h12.18l.277-1.385c.054-.271.317-.448.588-.392.271.054.446.317.392.588l-.357 1.787c-.047.234-.252.402-.49.402z"/><path d="m6.5 17c-.233 0-.442-.164-.49-.402l-2.479-12.394c-.14-.699-.759-1.206-1.471-1.206h-.001l-1.559.002c-.276 0-.5-.224-.5-.5s.223-.5.5-.5l1.558-.002h.002c1.188 0 2.219.845 2.452 2.01l2.478 12.394c.054.271-.122.534-.392.588-.033.007-.066.01-.098.01z"/><path d="m21.5 19h-17c-.827 0-1.5-.673-1.5-1.5s.673-1.5 1.5-1.5h2c.276 0 .5.224.5.5s-.224.5-.5.5h-2c-.276 0-.5.224-.5.5s.224.5.5.5h17c.276 0 .5.224.5.5s-.224.5-.5.5z"/><path d="m8 24c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2zm0-3c-.551 0-1 .449-1 1s.449 1 1 1 1-.449 1-1-.449-1-1-1z"/><path d="m17 24c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2zm0-3c-.551 0-1 .449-1 1s.449 1 1 1 1-.449 1-1-.449-1-1-1z"/></svg>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="crm-cart-data">
                                <p className="text-black">256k</p>
                                <h6 className="d-block mb-3 text-black">Total Orders</h6>
                                <span className="badge bg-white text-black border-0">Last 6 Month</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-2 col-xxl-3 col-sm-4 clm-chart">
                    <div className="card crm-cart">
                        <div className="card-header border-0 pb-0">
                            <div>
                                <h4 className="mb-0">$5,655<small className="text-danger ms-2">-33%</small></h4>
                                <h6 className="mb-0">Total Profit</h6>
                            </div>	
                        </div>
                        <div className="card-body custome-tooltip">
                            <TotalProfitBar />
                        </div>
                    </div>
                </div>
                <div className="col-xl-2 col-xxl-3 col-sm-4">
                    <div className="card crm-cart">
                        <div className="card-header border-0 pb-0">
                            <div>
                                <h4 className="mb-0">$5,586<small className="text-success ms-2">+59%</small></h4>
                                <h6 className="mb-0">Total Growth</h6>
                            </div>	
                        </div>
                        <div className="card-body d-flex justify-content-center pt-2">
                           <GrowthDounut />
                        </div>
                    </div>
                </div>
                <div className="col-xl-4">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title mb-0">Organic Traffic</h4>
                        </div>
                        <div className="card-body custome-tooltip">
                            <div className="d-flex justify-content-center">
                                <TrafficDounut />
                            </div>
                            <ul className="lang-chart">
                                <li><i className="fa-sharp fa-regular fa-circle-dot" />Html</li>
                                <li><i className="fa-sharp fa-regular fa-circle-dot" />Css</li>
                                <li><i className="fa-sharp fa-regular fa-circle-dot" />scss</li>
                                <li><i className="fa-sharp fa-regular fa-circle-dot" />c++</li>
                                <li><i className="fa-sharp fa-regular fa-circle-dot" />JavaScript</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="col-xl-8">
                    <div className="card overflow-hidden">
                        <div className="card-header">
                            <h4 className="card-title mb-0">Project Timeline</h4>
                        </div>
                        <div className="card-body pb-0 pe-0 ">
                            <div className="row">
                                <div className="col-xl-9 col-xxl-8 col-md-8">
                                    <CrmTimelineChart />
                                </div>
                                <div className="col-xl-3 col-xxl-4 col-md-4 c-line">
                                    <div className="crm-p-list">
                                        <h4 className="card-title mb-0">Project List</h4>
                                    </div>	
                                    <div className="dz-scroll project-scroll">
                                        {projectList.map((item, index)=>(                                        
                                            <div className="p-list" key={index}>                                                
                                                {item.iconbox ? 
                                                    <div className="icon-box bg-info-light">   
                                                        {SVGICON.Worldweb}
                                                    </div>
                                                    :
                                                    <div className={`icon-box bg-${item.bg}-light`}>
                                                        <i className={item.icon} />
                                                    </div>
                                                }
                                                
                                                <div className="ms-2">
                                                    <h6 className="mb-0">{item.title}</h6>
                                                    <span>Task {item.number1}/{item.number2}</span>
                                                </div>
                                            </div>
                                        ))}                                     
                                    </div>
                                </div>
                            </div>
                        </div>           
                    </div>   
                 
                </div>
                <div className="col-xl-4 col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title mb-0">Monthly Overview</h4>
                        </div>
                        <div className="card-body py-0 custome-tooltip">                            
                            <CrmMarketArea />
                            <div>
                                <h4 className="mb-0">80%</h4>
                                <p>Your sales performance is 49% 😀 better compared to last week</p>
                            </div>
                        </div>
                        <div className="card-footer border-0 pt-0">
                            <Link to={"#"} className="btn btn-primary light light btn-block">View Details</Link>
                        </div>
                    </div>
                </div>
                <div className="col-xl-4 col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title mb-0">Social Networking</h4>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <div className="d-flex align-items-center">
                                    <h4 className="mb-0">26,368</h4>
                                    <span className="text-success font-w600 ms-2">
                                        <i className="mdi mdi-menu-up"></i>
                                        <small>62%</small>
                                    </span>
                                </div>
                                <small>Last 2 Year Visits</small>
                            </div>
                            <ul className="sociallinks">                               
                                {netwrokBlog.map((item, ind)=>(
                                    <li className="d-flex" key={ind}>
                                        <div className="icon">
                                            <img src={item.image} className="avatar avatar-md" alt="" />
                                        </div>
                                        <div className="d-flex flex-wrap align-items-center justify-content-between w-100">
                                            <div className="ms-2">
                                                <h6 className="mb-0">{item.title}</h6>
                                                <small>Social Media</small>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <span className="font-w500 text-primary">{item.price}</span>
                                                <span className={`badge badge-sm light border-0 ms-2 badge-${item.bg}`} >{item.percent}%</span>
                                            </div>
                                        </div>
                                    </li>
                                ))}                              
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="col-xl-4 col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title mb-0">Yearly Income</h4>
                        </div>
                        <div className="card-body custome-tooltip">                            
                            <SaleAreaChart  height={250}/>
                            <p className="mt-5 mb-0">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the </p>
                        </div>
                    </div>
                </div>
                <div className="col-xl-4 col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title mb-0">Meeting Plane</h4>
                        </div>
                        <div className="card-body">
                            <ul className="sociallinks">                               
                                 {meetingList.map((item, ind)=>(
                                    <li className="d-flex" key={ind}>
                                        <div className="icon">
                                            <img src={item.image} className="avatar avatar-md" alt="" />
                                        </div>
                                        <div className="d-flex flex-wrap align-items-center justify-content-between w-100">
                                            <div className="ms-2">
                                                <h6 className="mb-0">{item.title}</h6>
                                                <small><i className="fa-solid fa-calendar-days me-2"></i><span>21 Jul | 08:20-10:30</span></small>
                                            </div>
                                            <span className={`badge badge-sm border-0 light ms-2 badge-${item.bg}`}>{item.status}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>            
                </div>
                <div className="col-xl-4 col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title mb-0">External Data</h4>
                        </div>
                        <div className="card-body custome-tooltip pb-0">
                            <ul className="crm-ads-list">
                                <li>
                                    <div className="dots-crm">
                                        <span className="dots bg-primary-light"></span>
                                        <h6>Google Ads</h6>
                                    </div>	
                                    <span>$512k</span>
                                    <h6>83%<i className="fa-solid fa-chevron-up ms-2 text-primary"></i></h6>
                                </li>
                                <li>
                                    <div className="dots-crm">
                                        <span className="dots bg-secondary-light"></span>
                                        <h6>Fb Analytics</h6>
                                    </div>
                                    <span>$86.2k</span>
                                    <h6>58%<i className="fa-solid fa-chevron-down ms-2 text-secondary"></i></h6>
                                </li>
                                <li>
                                    <div className="dots-crm">
                                        <span className="dots bg-danger-light"></span>
                                        <h6>Dribble User</h6>
                                    </div>	
                                    <span>$45.2k</span>
                                    <h6>58%<i className="fa-solid fa-chevron-down ms-2 text-danger"></i></h6>
                                </li>
                            </ul>                            
                            <CrmExtranalChart />
                        </div>
                    </div>
                </div>
                <div className="col-xl-4 col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title mb-0">Payment History</h4>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive payment-tbl">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Card</th>
                                            <th className="text-center">Amount</th>
                                            <th className="text-center">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tableList.map((item, ind)=>(
                                            <tr key={ind}>
                                                <td>
                                                    <h6>{item.name}</h6>
                                                </td>
                                                <td>
                                                    <span>${item.amount}</span>
                                                </td>
                                                <td>
                                                    <span>${item.total}</span>
                                                </td>
                                            </tr>
                                        ))}    
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div> 
        </>
    );
};

export default Crm;