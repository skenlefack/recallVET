import React from 'react';
import { Dropdown } from 'react-bootstrap';

import { IMAGES, SVGICON } from '../../constant/theme';
import ReportCommanChart from './elements/ReportCommanChart';
import TrafficUpdateBar from './elements/TrafficUpdateBar';
import SalesStatisticsArea from './elements/SalesStatisticsArea';
import TotalSaleLineChart from './elements/TotalSaleLineChart';
import ActiveUserChart from './elements/ActiveUserChart';
import ActiveUserChart2 from './elements/ActiveUserChart2';
import SalesFigureChart from './elements/SalesFigureChart';

const updateCard = [
    {title:'Add visitors', number:'3,569',  chartcolor:'#fff', cardcolor:'bg-primary-light', svg: SVGICON.PlusUser },
    {title:'Sessions Start', number:'8:30 PM',  chartcolor:'#000', cardcolor:'bg-warning-light', svg: SVGICON.TimerWatch },
    {title:'Total Live', number:'5,586',  chartcolor:'#000', cardcolor:'expenses-card', svg: SVGICON.SimpleUser },
];

const visitCard = [
    {title:'Orders', number:'5,286'},
    {title:'Today', number:'1,113'},
    {title:'This Month', number:'6,282'},
    {title:'Profit', number:'2,545'},
];

const marketTable = [    
    { image: IMAGES.dribble, title:'Dribble', name:'Meta', icon:'up', changes:'2.556', price:'4,3655',status:'Active', color:'success' },
    { image: IMAGES.facebook, title:'Facebook', name:'Space', icon:'down', changes:'2.556', price:'3,2342',status:'Inactive', color:'danger' },
    { image: IMAGES.instagram, title:'Instagram', name:'Meta', icon:'up', changes:'4.556', price:'1,1255',status:'Active', color:'success' },
    { image: IMAGES.linkdin, title:'Linkedin', name:'Meta', icon:'down', changes:'2.556', price:'6,4612',status:'Deactive', color:'danger' },
];

const marketTable2 = [    
    { image: IMAGES.bing, title:'Bing', name:'Meta', icon:'up', changes:'2.556', price:'4,3655',status:'Active', color:'success' },
    { image: IMAGES.twitter, title:'Twitter Ads', name:'Tesla', icon:'down', changes:'1.556', price:'3,2342',status:'Pending', color:'primary' },
    { image: IMAGES.whatsapp, title:'Whatsapp Ads', name:'Meta', icon:'up', changes:'3.556', price:'1,1255',status:'Active', color:'success' }
];

const cardChartBlog = [
    {title:'Total Sale', number:'1,255', color:'primary', chartcolor:'var(--primary)'},
    {title:'Total Purchase', number:'5,552', color:'danger', chartcolor:'#FF7C7C'},
    {title:'Active Customers', number:'3,431k', color:'info', chartcolor:'#58bad7'},
];

const chartCard = [
    {image:IMAGES.piechart, number1:'1,555k', color:'success', number2:'1,6532k', number3:'7:03:13', id:'1'},
    {image:IMAGES.piechart2, number1:'2,142k ', color:'primary', number2:'1,583k', number3:'5:22:23', id:'2'},
];

const salesTable = [
    { image:IMAGES.dribble, title:'Dribble', subtitle:'Social Networking', date:'22 May 2023', budget:'3.55'},
    { image:IMAGES.whatsapp, title:'Whatsapp ', subtitle:'Service Provider', date:'12 June 2023', budget:'8.58'},
    { image:IMAGES.facebook, title:'Facebook', subtitle:'Social Networking', date:'30 April 2023', budget:'5.12'},
    { image:IMAGES.bing, title:'Bing', subtitle:'Search Engine', date:'21 June 2023', budget:'9.68'},
    { image:IMAGES.linkdin, title:'Linkedin', subtitle:'Social Networking ', date:'22 May 2023', budget:'1.12'},
];

const Dashboard3 = () => {
    return (
        <>
            <h3 className="head-title">Dashboard</h3>  
                <div className="row">
                    <div className="col-xl-7 same-card">
                        <div className="card">
                            <div className="card-header">
                                <h4 className="card-title">Traffic Update</h4>
                            </div>
                            <div className="card-body pb-0 custome-tooltip">
                                <div className="row">
                                    {updateCard.map((item, ind)=>(
                                        <div className="col-xl-4 col-sm-4" key={ind}>
                                            <div className={`card ${item.cardcolor}`}>
                                                <div className="card-header p-2 border-0">
                                                    <div className="d-flex diposit-bg">
                                                        <div className="icon-box  rounded-circle">
                                                            {item.svg}
                                                        </div>
                                                        <div className="ms-2 add-visit">
                                                            <h6 className="mb-0">{item.title}</h6>
                                                            <h3>{item.number}</h3>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="card-body p-0 custome-tooltip">
                                                    <ReportCommanChart                                                      
                                                        color={item.chartcolor} 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}                                    
                                </div>
                                <TrafficUpdateBar />
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-5 same-card">
                        <div className="card">
                            <div className="card-header">
                                <h4 className="card-title mb-0">Sales statistics</h4>
                            </div>
                            <div className="card-body pb-0 custome-tooltip">
                                <div className="row">
                                    {visitCard.map((item, ind)=>(
                                        <div className="col-xl-3 col-6 or-series" key={ind}>
                                            <div className="card text-center">
                                                <div className="card-body add-visit p-2">
                                                    <h6 className="mb-0">{item.title}</h6>
                                                    <h3>{item.number}</h3>
                                                </div>
                                            </div>
                                        </div>
                                    ))}                                 
                                </div>                               
                                <SalesStatisticsArea />
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-8">
                        <div className="row">
                            <div className="col-xl-12">
                                <div className="card">
                                    <div className="card-header">
                                        <h4 className="card-title mb-0">Market Update</h4>
                                    </div>
                                    <div className="card-body p-0">
                                        <div className="table-responsive active-projects task-table">                                            
                                            <table id="empoloyeestbl2" className="table market-update">
                                                <thead>
                                                    <tr>
                                                        <th>Company Name</th>
                                                        <th>Client</th>
                                                        <th>Changes</th>
                                                        <th>Budget</th>
                                                        <th>Status</th>
                                                        <th className="text-center">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="heading-data">
                                                        <td colSpan="5" className="text-start">Today</td>
                                                        <td className="text-center">
                                                            {SVGICON.DotCircle}
                                                        </td>
                                                    </tr>
                                                    {marketTable.map((item, ind)=>(
                                                        <tr key={ind}>
                                                            <td>
                                                                <div className="d-flex align-items-center">
                                                                    <img src={item.image} className="avatar avatar-md" alt="" />
                                                                    <div className="ms-2 dr-data">
                                                                        <h6 className="mb-0">{item.title}</h6>
                                                                        <span>50 Template</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>{item.name}</td>
                                                            <td className={`text-${item.color}`}><i className={`fa-solid me-1 fa-arrow-trend-${item.icon}`}></i> {item.changes}</td>
                                                            <td className="text-black">${item.price}</td>
                                                            <td><span className={`badge light badge-sm border-0 badge-${item.color}`}>{item.status}</span></td>
                                                            <td className="text-center">
                                                                <Dropdown>
                                                                    <Dropdown.Toggle as="div" className="btn-link i-false">
                                                                        {SVGICON.DropThreeDot}
                                                                    </Dropdown.Toggle>
                                                                    <Dropdown.Menu className="dropdown-menu-right" align="end">
                                                                        <Dropdown.Item>Edit</Dropdown.Item>
                                                                        <Dropdown.Item>Delete</Dropdown.Item>
                                                                    </Dropdown.Menu>
                                                                </Dropdown>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    <tr className="heading-data">
                                                        <td colSpan="5" className="text-start">Yesterday</td>
                                                        <td className="text-center">
                                                            {SVGICON.DotCircle}                                                            
                                                        </td>
                                                    </tr>
                                                    {marketTable2.map((item, ind)=>(
                                                        <tr key={ind}>
                                                            <td>
                                                                <div className="d-flex align-items-center">
                                                                    <img src={item.image} className="avatar avatar-md" alt=""/>
                                                                    <div className="ms-2 dr-data">
                                                                        <h6 className="mb-0">{item.title}</h6>
                                                                        <span>30-50 Ads</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>Meta</td>
                                                            <td className={`text-${item.color}`}><i className={`fa-solid me-1 fa-arrow-trend-${item.icon}`}></i> {item.changes}</td>
                                                            <td className="text-black">${item.price}</td>
                                                            <td><span className={`badge light badge-sm border-0 badge-${item.color}`}>{item.status}</span></td>
                                                            <td className="text-center">
                                                                <Dropdown>
                                                                    <Dropdown.Toggle as="div" className="btn-link i-false">
                                                                        {SVGICON.DropThreeDot}
                                                                    </Dropdown.Toggle>
                                                                    <Dropdown.Menu className="dropdown-menu-right">
                                                                        <Dropdown.Item>Edit</Dropdown.Item>
                                                                        <Dropdown.Item>Delete</Dropdown.Item>
                                                                    </Dropdown.Menu>
                                                                </Dropdown>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>        
                                        </div>    
                                    </div>    
                                </div>    
                            </div> 
                            {cardChartBlog.map((item, index)=>(
                                <div className="col-xl-4 col-md-4" key={index}>
                                    <div className="card sale-card">
                                        <div className="card-header pb-0 border-0 align-items-baseline">
                                            <div>
                                                <span>{item.title}</span>
                                                <h4>${item.number} <i className="fa-solid fa-arrow-trend-up ms-1"></i></h4>
                                            </div>
                                            <span className={`badge border-0 badge-sm  light badge-${item.color}`}>3.5<i className="fa-solid fa-caret-up ms-1"></i></span>
                                        </div>
                                        <div className="card-body p-0 custome-tooltip">                                        
                                            <TotalSaleLineChart colorTheme={item.chartcolor}/>
                                        </div>
                                        <div className="card-footer border-0">
                                            <span className={`tag bg-${item.color}-light`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                                            </span>
                                        </div>	
                                    </div>
                                </div>   
                            ))}
                            {chartCard.map((item, ind)=>(
                                <div className="col-xl-12" key={ind}>
                                    <div className="card">
                                        <div className="card-header border-0 chart-card flex-wrap">
                                            <div className="d-flex align-items-center sm-mb-0 mb-2">
                                                <img src={item.image} alt="" />
                                                <div className="ms-2">
                                                    <h4 className="mb-0">{item.number1} <small className={`fs-12 text-${item.color}`}><i className="fa-solid fa-arrow-trend-down mx-2"></i>(3.56)</small></h4>
                                                    <span>Lorem Ipsum</span>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center sm-mb-0 mb-2">
                                                <div className="icon-box bg-primary-light rounded-circle">
                                                    {SVGICON.doubleHeart}
                                                </div>
                                                <div className="ms-2">
                                                    <h4 className="mb-0">{item.number2} <small className={`fs-12 text-${item.color}`}><i className="fa-solid fa-arrow-trend-up mx-2"></i>(5.66)</small></h4>
                                                    <span>Lorem Ipsum</span>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center sm-mb-0 mb-2">
                                                <div className="icon-box bg-secondary-light rounded-circle">
                                                    {SVGICON.shiled}
                                                </div>
                                                <div className="ms-2">
                                                    <h4 className="mb-0">{item.number3}<small className={`fs-12 text-${item.color}`}><i className="fa-solid fa-arrow-trend-down mx-2"></i>(3.56)</small></h4>
                                                    <span>Total Time</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}                            
                        </div>
                    </div>
                    <div className="col-xl-4">
                        <div className="row">
						    <div className="col-xl-6 col-sm-6 same-card">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between">
                                            <div className="icon-box bg-info-light rounded-circle">
                                               {SVGICON.doubleHeart}
                                            </div>
                                            <div className="total-projects">
                                                <h4 className="text-info count">67%</h4> 
                                                <span className="d-block">Free Hours</span>
                                                <small>56% average</small>
                                            </div>
                                        </div>                                        
                                        <ActiveUserChart />
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-6 col-sm-6 same-card">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between">
                                            <div className="icon-box bg-secondary-light rounded-circle">
                                                {SVGICON.shiled}
                                            </div>
                                            <div className="total-projects">
                                                <h4 className="secondary-text count">57%</h4> 
                                                <span className="d-block">Productiveness</span>
                                                <small>61% average</small>
                                            </div>
                                        </div>                                        
                                        <ActiveUserChart2 />
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-12">
                                <div className="card">
                                    <div className="card-header">
                                        <h4 className="card-title mb-0">Sales figures</h4>
                                    </div>
                                    <div className="card-body p-0">                                        
                                        <SalesFigureChart />
                                        <div>
                                            <div className="table-responsive active-projects task-table">
                                                <table id="empoloyeestbl3" className="table market-update">
                                                    <thead>
                                                        <tr>
                                                            <th>App Name</th>
                                                            <th>Date</th>
                                                            <th>Budget</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>                                                        
                                                        {salesTable.map((item, ind)=>(
                                                            <tr key={ind}>
                                                                <td>
                                                                    <div className="d-flex align-items-center">
                                                                        <img src={item.image} className="avatar avatar-md" alt="" />
                                                                        <div className="ms-2 dr-data">
                                                                            <h6 className="mb-0">{item.title}</h6>
                                                                            <span>{item.subtitle}</span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td>{item.date}</td>
                                                                <td>${item.budget}k</td>
                                                            </tr>
                                                        ))}                                                       
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        </>
    );
};

export default Dashboard3;