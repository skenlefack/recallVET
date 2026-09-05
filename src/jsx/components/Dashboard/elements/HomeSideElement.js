import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { IMAGES } from '../../../constant/theme';

const friendList = [
    {
        subitem : [
            {title:'Tony', image: IMAGES.Friends3},
            {title:'Lucas', image: IMAGES.contact2},
            {title:'Oliver', image: IMAGES.contact3},
            {title:'Karen', image: IMAGES.Friends2},
        ],
    },
    {
        subitem : [
            {title:'Donald', image: IMAGES.contact1},
            {title:'Elijah', image: IMAGES.contactd4},
            {title:'Tony', image: IMAGES.Friends4},
            {title:'Karen', image: IMAGES.Friends1},
        ]
    },
];

const mediaBlog = [
    {title:'Development planning', date:'20 ', week:'Tue', time:'12.05 PM'},
    {title:'Desinging planning', date:'03 ', week:'Wed', time:'06.10 AM'},
    {title:'Frontend designing', date:'05 ', week:'Fri', time:'09.25 PM'},
    {title:'Software planning', date:'21 ', week:'Thu', time:'10.07 AM'},
];

const HomeSideElement = () => {
    const [startDate, setStartDate] = useState(new Date());
    return (
        <>
            <div className="card">
                <div className="my-calendar dz-scroll event-scroll">
                    <div className="card-body schedules-cal p-2 dz-calender">                        
                        <DatePicker selected={startDate} className="form-control" 
                            onChange={(date) => setStartDate(date)}
                            dateFormat="MM-dd-yyyy"
                            inline
                        /> 
                        <div className="events">
                            <h6>events</h6>
                            <div className="">
                                {mediaBlog.map((data, index)=>(
                                    <div className="event-media" key={index}>                                        
                                        <div className="d-flex align-items-center">
                                            <div className="event-box">
                                                <h5 className="mb-0">{data.date}</h5>
                                                <span className="text-black">{data.week}</span>
                                            </div>
                                            <div className="event-data ms-2">
                                                <h5 className="mb-0"><Link to={"/contacts"}>{data.title}</Link></h5>
                                                <span>w3it Technologies</span>
                                            </div>
                                        </div>
                                        <span>{data.time}</span>
                                    
                                    </div>
                                ))}                                
                            </div>	
                        </div>
                        <div className="contacts-group">	
                            <div className="group-list d-flex align-items-center justify-content-between">
                                <h6 className="mb-0">Contacts</h6>
                                <a href="contacts.html" className="btn-link text-primary">View All</a>
                            </div>	
                            <div>
                                <div className="friend-list1">
                                    {friendList.map((item, index)=>(
                                        <div className="d-flex" key={index}>
                                            {item.subitem.map((data, ind)=>(
                                                <Link to={"/contacts"} key={ind}>
                                                    <div className="friend-user">
                                                        <img src={data.image} className="avatar avatar-lg" alt="" />
                                                        <p>{data.title}</p>
                                                    </div>
                                                </Link>	
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>  
                        </div>	
                    </div>
                </div>
            </div>
           
        </>
    );
};

export default HomeSideElement;