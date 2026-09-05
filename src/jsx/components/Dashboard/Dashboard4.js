import React from 'react';
import {Link} from 'react-router-dom';
import { SVGICON } from '../../constant/theme';
import VisitorLineChart from './elements/VisitorLineChart';
import TotalRevenuBar from './elements/TotalRevenuBar';
import SatisfactionArea from './elements/SatisfactionArea';
import RealityBarChart from './elements/RealityBarChart';
import VolumeServiceChart from './elements/VolumeServiceChart';
import SvgWorldMap from './elements/SvgWorldMap';


const cardsBlog = [
    {title:'Total Sales', number:'$2k', color:'bg-primary-light', svg:SVGICON.CheckRight},
    {title:'Total Order', number:'700', diffstyle :'diposit-bg', color:'bg-secondary-light', svg:SVGICON.Trolly},
    {title:'Product Sold', number:'3', diffstyle :'diposit-bg', color:'expenses-card', svg:SVGICON.DollerBlack},
    {title:'New Customers', number:'10', diffstyle :'diposit-bg', color:'bg-success-light', svg:SVGICON.DollerBlack},
];

const tableData = [
    {id:'01', name:'Home Decor Range', barpercent:'45%', stoke:'In stock', color:'primary' },
    {id:'02', name:'Disney Princess Pink Bag', barpercent:'60%', stoke:'In stock', color:'primary' },
    {id:'03', name:'Bathroom Essentials', barpercent:'30%', stoke:'Out of Stock', color:'danger' },
    {id:'04', name:'Home Decor Range', barpercent:'45%', stoke:'In stock', color:'primary' },
    {id:'05', name:'Disney Princess Pink Bag', barpercent:'45%', stoke:'In stock', color:'primary' },
    {id:'06', name:'Bathroom Essentials', barpercent:'60%', stoke:'In stock', color:'primary' },
    {id:'07', name:'Home Decor Range', barpercent:'30%', stoke:'Out of Stock', color:'danger' },
];

const Dashboard4 = () => {
    return (
        <>
            <h3 className="head-title">Dashboard</h3>
            <div className="row">
                <div className="col-xl-7 col-xxl-8">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">Today's Sales</h4>
                            <Link to={"#"} className="btn btn-small btn-primary light-light">View</Link>
                        </div>
                        <div className="card-body pb-0">
                            <div className="row">
                                {cardsBlog.map((item, index)=>(
                                    <div className="col-xl-3 col-md-3 col-6" key={index}>
                                        <div className={`card ${item.color}`}>
                                            <div className={`card-body ${item.diffstyle}`}>
                                                {index === 0 ?
                                                    <div className="icon-box mb-2">
                                                        {item.svg}
                                                    </div>
                                                    :
                                                    <div className="icon-box mb-2 rounded-circle">
                                                        {item.svg}
                                                    </div>
                                                }
                                                <div className="crm-cart-data">
                                                    <p>{item.number}</p>
                                                    <h6 className="mb-0">{item.title}</h6>
                                                    <span className="d-block font-w600 text-black mt-1">45+ Form Yesterday</span>
                                                </div>	
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-5 col-xxl-4 col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">Visitor insights</h4>
                        </div>
                        <div className="card-body pb-0 ps-1">                            
                            <VisitorLineChart />
                        </div>
                    </div>
                </div>
                <div className="col-xl-6 col-xxl-12 col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">Total Revenue</h4>
                        </div>
                        <div className="card-body">                            
                            <TotalRevenuBar />
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-xxl-6 col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">Customer Satisfaction</h4>
                        </div>
                        <div className="card-body p-0">
                            <SatisfactionArea />
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-xxl-6 col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">Target vs Reality</h4>
                        </div>
                        <div className="card-body">                            
                            <RealityBarChart />
                        </div>
                    </div>
                </div>
                <div className="col-xl-6 col-xxl-12">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">Top Products</h4>
                        </div>
                        <div className="card-body py-0 px-0">
                            <div className="table-responsive active-projects">
                                <table id="projects-tbl2" className="table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Name</th>
                                            <th>Popularity</th>
                                            <th className="text-center">Stoke</th>
                                            
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tableData.map((item, index)=>(
                                            <tr key={index}>
                                                <td>{item.id}</td>
                                                <td className="text-black">{item.name}</td>
                                                <td>
                                                    <div className="progress-box tbl-progress-box">
                                                        <div className="progress">
                                                            <div className={`progress-bar bg-${item.color}-light`} style={{width: item.barpercent, height:"10px", borderRadius:"8px" }}></div>
                                                        </div>
                                                        <span className={`text-${item.color}`}>{item.barpercent}</span>
                                                    </div>
                                                </td>
                                                <td className="text-center"><span className={`badge badge-sm light border-0 badge-${item.color}`}>{item.stoke}</span></td>
                                            </tr>
                                        ))}                                        
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-xxl-6 col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">Sales Mapping by Country</h4>
                        </div>
                        <div className="card-body pb-0">
                            <div id="world-map" className="sales-map">
                                <SvgWorldMap />
                            </div>  
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-xxl-6 col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">Volume vs Service Level</h4>
                        </div>
                        <div className="card-body pb-0">                            
                            <VolumeServiceChart />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard4;
