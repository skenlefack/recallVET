import React from 'react';
import {Link} from 'react-router-dom';
import loadable from "@loadable/component";
import pMinDelay from "p-min-delay";

import { IMAGES, SVGICON } from '../../constant/theme';

import SaleAreaChart from './elements/SaleAreaChart';
import ReportCommanChart from './elements/ReportCommanChart';

const EarningBarChart = loadable(() =>
	pMinDelay(import("./elements/EarningBarChart"), 1000)
);
const TotalSaleBar = loadable(() =>
	pMinDelay(import("./elements/TotalSaleBar"), 1000)
);

const cardBlog = [
    {icon:'fa-solid fa-basketball', name:'Dribble', subtitle:'@statistics',  percent:'+23'},
    {icon:'fa-brands fa-facebook-f', name:'Facebook', subtitle:'@fb',  percent:'-33'},
    {icon:'fa-brands fa-amazon', name:'Amazone', subtitle:'@hemsr',  percent:'-23'},
    {icon:'fa-brands fa-behance', name:'Behance', subtitle:'@behan',  percent:'+25'},
    {icon:'fa-brands fa-aws', name:'AWS', subtitle:'@awes',  percent:'+30'},
    {icon:'fa-brands fa-instagram', name:'Insta', subtitle:'@abcd',  percent:'-32'},
];
const chartCardBlog = [
    {title:'Earning', amount:'2,256', svg: SVGICON.DollerBlack, chartcolor:'#FF7C7C', color:'danger'},
    {title:'Profit', amount:'3,367', svg: SVGICON.DollerBlack, chartcolor:'var(--primary)', color:'primary'},
    {title:'Expense', amount:'3,567', svg: SVGICON.SmallCalendar, chartcolor:'#58bad7', color:'info'},
];

const saleCardBlog = [
    {name:'Sales', number:'$5,536', color:'danger', icon:'fa-chart-simple text-black', },
    {name:'Customer', number:'4,613k', color:'primary', icon:'fa-user primary-black', },
    {name:'Products', number:'1,536k', color:'info', icon:'fa-box text-black', },
    {name:'Products', number:'1,536k', color:'secondary', icon:'fa-user text-black', },
];

const countryData = [
    {image:IMAGES.India, name:'India', doller:'9,525', color:'primary', percent:'25.8%', },
    {image: IMAGES.Canada, name:'Canada', doller:'5,365', color:'secondary ', percent:'18.5%', },
    {image: IMAGES.Russia, name:'Russia', doller:'1,653', color:'info', percent:'59.5%', },
    {image: IMAGES.Uk, name:'Kingdom', doller:'3,165', color:'success', percent:'60.5%', },
    {image: IMAGES.Aus, name:'Aus', doller:'9,525', color:'primary', percent:'25.8%', },
    {image: IMAGES.Usa, name:'Usa', doller:'5,365', color:'secondary', percent:'18.5%', },
    {image: IMAGES.Germany, name:'Germany', doller:'1,653', color:'info', percent:'59.5%', },
    {image: IMAGES.Uae, name:'Uae', doller:'3,162', color:'success', percent:'60.5%', },
    {image: IMAGES.China, name:'China', doller:'1,235', color:'secondary', percent:'60.5%', },
    {image: IMAGES.Canada, name:'Canada', doller:'2,224', color:'primary', percent:'25.8%', },
];

const activityBlog = [
    {circle:'#ff7c7c', title:'Bubles Studios have 5 available', time:'8', color:'#81a5f9'},
    {circle:'#d9d9d9', title:'Highspeed Design Team have', time:'4', color:'#eeac27'},
    {circle:'#eee', title:'Bubles Studios have 5 available', time:'2', color:'#53d0b2'},
    {circle:'#eee', title:'Elextra Studios has invited you', time:'3', color:'#81a5f9'},
    {circle:'#eee', title:'Kleon Studios have 5 available', time:'5', color:'#eeac27'},
    {circle:'#eee', title:'Elextra Studios has invited you', time:'6', color:'#53d0b2'},
    {circle:'#eee', title:'Highspeed Design Team have', time:'7', color:'#81a5f9'},
];

const Analytics = () => {
    return (
        <>
            <h3 className="head-title">Analytcs</h3>  
            <div className="row">
                <div className="col-xl-6">
                    <div className="card overflow-hidden">
                        <div className="card-body">
                            <div className="any-card">
                                <div className="c-con">
                                    <h4 className="heading mb-0">Congratulations <strong>Hanu!!</strong>
                                        <img src={IMAGES.partypopper} alt="" />
                                    </h4>
                                    <span>Best seller of the week</span>
                                    <p className="mt-3">Lorem Ipsum is simply dummy 😎 text of the printing and typesetting industry.</p>                                        
                                    <Link to={"#"} className="btn btn-primary light">View Profile</Link>
                                </div>
                                <img src={IMAGES.developer} className="harry-img" alt="" />                                
                            </div>	
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-md-6">
                    <div className="card bg-primary-light">
                        <div className="card-header border-0">
                            <h4 className="heading mb-0 text-black">Overview of Sales 😎</h4>
                        </div>
                        <div className="card-body pb-0">
                            <div className="row">
                                <div className="col-xl-12">
                                    <div className="card sales-bx">
                                        <div className="card-body">
                                            <img src={IMAGES.sales} alt="" />
                                            <h4>$3,651</h4>
                                            <span>Total Sales</span>
                                        </div>	
                                    </div>	
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-md-6">
                    <div className="card">
                        <div className="card-header border-0">
                            <div className="d-flex align-items-center">
                                <div className="icon-box icon-box-md  bg-primary-light">
                                    {SVGICON.SmallCalendar}
                                </div>
                                <div className="ms-2">
                                    <h6 className="mb-0">Total</h6>
                                    <span>2520</span>
                                </div>
                            </div>	
                        </div>
                        <div className="card-body p-0 custome-tooltip">                            
                            <SaleAreaChart height={120}/>
                        </div>
                    </div>
                </div>
                <div className="col-xl-12">
                    <div className="card bg-secondary-light analytics-card">
                        <div className="card-body mt-4 pb-1">
                            <div className="row align-items-center"> 
                                <div className="col-xl-2">
                                    <h3 className="mb-3">Analytics</h3>
                                    <p className="mb-0  pb-4">Yout statistics for<br/> 1 month period.</p>
                                </div>
                                <div className="col-xl-10">
                                    <div className="row">
                                        {cardBlog.map((data, index)=>(
                                            <div className="col-xl-2 col-sm-4 col-6 social-cards" key={index}>
                                                <div className="card ov-card">
                                                    <div className="card-body">
                                                        <div className="ana-box">	
                                                            <div className="ic-n-bx">
                                                                <div className="icon-box icon-box-md  bg-primary-light rounded-circle">
                                                                    <i className={data.icon} />
                                                                </div>
                                                            </div>
                                                            <div className="anta-data">
                                                                <h5>{data.name}</h5>
                                                                <span>{data.subtitle}</span>
                                                                <h3>{data.percent}%</h3>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}                                       
                                    </div>
                                </div>
                            </div>
                        </div>	
                    </div>
                </div>
                <div className="col-xl-6 col-xxl-12">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="heading mb-0">Reports Of Earning</h4>
                        </div>
                        <div className="card-body pb-0">
                            <div className="row align-items-center">
                                {chartCardBlog.map((data, index)=>(
                                    <div className="col-xl-4 col-sm-4" key={index}>	
                                        <div className="card">
                                            <div className="card-header border-0 p-2">
                                                <div className="d-flex align-items-center">
                                                    <div className={`icon-box bg-${data.color}-light`}>
                                                       {data.svg}
                                                    </div>
                                                    <div className="ms-2">
                                                        <h6 className="mb-0">{data.title}</h6>
                                                        <span>${data.amount}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-body p-0 custome-tooltip">                                                
                                                <ReportCommanChart                                                      
                                                    color={data.chartcolor} 
                                                />
                                            </div>
                                        </div>                                    
                                    </div>
                                ))}                               
                                <div className="col-xl-3 ">
                                    <h3>$5,6641</h3>	
                                    <p>Lorem Ipsum is simply dummy text</p>
                                </div>
                                <div className="col-xl-9 custome-tooltip">
                                    <EarningBarChart />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-xxl-6 col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="heading mb-0">Country Sale</h4>	
                        </div>
                        <div className="card-body p-0 py-3">
                            <ul className="country-sale dz-scroll">
                                {countryData.map((item, ind)=>(
                                    <li className="d-flex" key={ind}>
                                        <div className="country-flag">
                                            <img src={item.image} alt="" />
                                        </div>
                                        <div className="d-flex flex-wrap align-items-center justify-content-between w-100">
                                            <div className="ms-2">
                                                <h6 className="mb-0">${item.doller}</h6>
                                                <small>{item.name}</small>
                                            </div>
                                            <span className={`badge badge-sm badge-${item.color} light  border-0 ms-2`}>{item.percent}
                                                <i className={`fa-solid fa-chevron-${ind % 2 === 0 ? 'up' : 'down'} ms-2`} />
                                            </span>
                                        </div>
                                    </li>
                                ))}
                              
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-xxl-6 col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="heading mb-0">Activity Log</h4>
                        </div>
                        <div className="card-body px-0">
                            <div className="activity-sale dz-scroll">
                                {activityBlog.map((item, ind)=>(
                                    <div className="d-flex recent-activity" key={ind}>
                                        <span className="me-3 activity">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 17 17">
                                                <circle cx="8.5" cy="8.5" r="8.5" fill={item.circle}></circle>
                                            </svg>
                                        </span>
                                        <div className="d-flex align-items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 71 71">
                                                <g transform="translate(-457 -443)">
                                                <rect width="71" height="71" rx="12" transform="translate(457 443)" fill="#c5c5c5"></rect>
                                                <g transform="translate(457 443)">
                                                    <rect data-name="placeholder" width="71" height="71" rx="12" fill={item.color}></rect>
                                                    <circle data-name="Ellipse 12" cx="18" cy="18" r="18" transform="translate(15 20)" fill="#fff"></circle>
                                                    <circle data-name="Ellipse 11" cx="11" cy="11" r="11" transform="translate(36 15)" fill="#ffe70c" 
                                                    style={{mixBlendMode: "multiply",isolation: "isolate"}}></circle>
                                                </g>
                                                </g>
                                            </svg>
                                            <div className="ms-3 active-data">
                                                <h5 className="mb-1">{item.title}</h5>
                                                <span>{item.time} min ago</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                               
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-6 col-md-6">
                    <div className="row">
                        {saleCardBlog.map((data, index)=>(
                            <div className="col-xl-6 col-sm-6" key={index}>
                                <div className="card">
                                    <div className="card-body d-flex justify-content-between align-items-center">
                                        <div className="d-flex sales-data">
                                            <div className={`icon-box icon-box-md bg-${data.color}-light me-1`}>
                                                <i className={`fa-solid ${data.icon}`}></i>
                                            </div>
                                            <div className="ms-2">
                                                <h4 className="mb-0">{data.number}</h4>
                                                <p className="mb-0">{data.name}</p>
                                            </div>
                                        </div>
                                        <Link to={"#"}><i className={`fa-solid fa-chevron-right text-${data.color}`} /></Link>
                                    </div>
                                </div>
                            </div>
                        ))}                        
                    </div>
                </div>
                <div className="col-xl-6 col-md-6">
                    <div className="card">
                        <div className="card-header border-0 pb-0">
                            <h4 className="heading mb-0">Total Sale</h4>
                        </div>
                        <div className="card-body pb-0">
                            <TotalSaleBar />
                        </div>
                    </div>
                </div>

            </div>    
        </>
    );
};

export default Analytics;