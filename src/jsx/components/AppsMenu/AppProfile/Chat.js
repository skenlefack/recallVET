import React from 'react';
import {Link} from 'react-router-dom';
import { IMAGES, SVGICON } from '../../../constant/theme';
// import {Dropdown} from 'react-bootstrap';

const chatList = [
    { image: IMAGES.contactd1, name:'Honey Risher', time:'6'},
    { image: IMAGES.contactd2, name:'Liam Antony', time:'7'},
    { image: IMAGES.contact1, name:'Ricky M', time:'8'},
    { image: IMAGES.contactd4, name:'Elijah James', time:'9'},
    { image: IMAGES.contactd5, name:'Oliver Noah', time:'10'},
    { image: IMAGES.contactd6, name:'Ricky Antony', time:'12'},
    { image: IMAGES.contact7, name:'Ankites Risher', time:'15'},
    { image: IMAGES.contact8, name:'Sofia Garcia', time:'18'},    
    { image: IMAGES.contact9, name:'Luca Ferrari', time:'20'},    
    { image: IMAGES.contact1, name:'Anna Petrova', time:'25'},    
    { image: IMAGES.contactd11, name:'Ahmed Hassan', time:'28'},    
    { image: IMAGES.contactd12, name:'Ingrid Jensen', time:'30'},    
    { image: IMAGES.contactd2, name:'Hiroshi Tanaka', time:'35'},    
    { image: IMAGES.contact3, name:'Ingrid Jensen', time:'40'},    
];

const mediaBlog = [
    {image: IMAGES.chat1},
    {image: IMAGES.chat2},
    {image: IMAGES.chat3},
    {image: IMAGES.chat4},
    {image: IMAGES.chat5},
    {image: IMAGES.chat2},
    {image: IMAGES.chat4},
    {image: IMAGES.chat1},
    {image: IMAGES.chat4},
    {image: IMAGES.chat5},
    {image: IMAGES.chat3},
];

const documents = [
    {title:'document.doc', image: IMAGES.doc},
    {title:'describe.mp4', image: IMAGES.playbtn},
    {title:'music.mp3', image: IMAGES.notes},
    {title:'project.pdf', image: IMAGES.pdf},
    {title:'songs.mp3', image: IMAGES.notes},
    {title:'details.doc', image: IMAGES.doc},
    {title:'document.doc', image: IMAGES.doc},
    {title:'describe.mp4', image: IMAGES.playbtn},
    {title:'music.mp3', image: IMAGES.notes},
    {title:'project.pdf', image: IMAGES.pdf},
    {title:'songs.mp3', image: IMAGES.notes},
    {title:'details.doc', image: IMAGES.doc},
];

const Chat = () => {
    return (        
        <div className="row gx-0">
            <div className="col-xl-12">
                <div className="card overflow-hidden">
                    <div className="card-body p-0">
                        <div className="row gx-0">                                
                            <div className="col-xl-3 col-lg-6 col-sm-5 chat-border mobile-chat chat-left-area">
                                <div className="chat-p shaprate">
                                    <div className="d-flex align-items-center">
                                        <img src={IMAGES.contact5} className="avatar avatar-md  rounded-circle" alt="" />
                                        <div className="ms-2">
                                            <h6 className="mb-0">K Kumar Gaur</h6>
                                            <span>web Designer</span>	
                                        </div>	
                                    </div>
                                    <div className="icon-box bg-primary-light">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M17.3389 6.35305L16.8202 5.45298C16.3814 4.69138 15.4089 4.42864 14.6463 4.86564V4.86564C14.2832 5.07949 13.85 5.14017 13.4422 5.03428C13.0344 4.92839 12.6855 4.66464 12.4723 4.30118C12.3352 4.07016 12.2616 3.80704 12.2588 3.53841V3.53841C12.2711 3.10773 12.1087 2.69038 11.8083 2.38143C11.508 2.07249 11.0954 1.89826 10.6646 1.89844H9.61956C9.19745 1.89843 8.79274 2.06664 8.49498 2.36583C8.19722 2.66502 8.03096 3.07053 8.03299 3.49264V3.49264C8.02048 4.36415 7.31038 5.06405 6.43879 5.06396C6.17016 5.06117 5.90703 4.98749 5.67601 4.85038V4.85038C4.91336 4.41339 3.94091 4.67612 3.5021 5.43772L2.94527 6.35305C2.50699 7.1137 2.76615 8.08555 3.52498 8.52697V8.52697C4.01823 8.81174 4.32209 9.33803 4.32209 9.90759C4.32209 10.4771 4.01823 11.0034 3.52498 11.2882V11.2882C2.76711 11.7267 2.50767 12.6961 2.94527 13.4545V13.4545L3.47158 14.3622C3.67719 14.7332 4.02215 15.007 4.43014 15.1229C4.83813 15.2389 5.27551 15.1875 5.6455 14.9801V14.9801C6.00921 14.7678 6.44264 14.7097 6.84943 14.8185C7.25622 14.9274 7.60268 15.1942 7.81178 15.5598C7.94889 15.7908 8.02257 16.0539 8.02536 16.3225V16.3225C8.02536 17.203 8.73911 17.9167 9.61956 17.9167H10.6646C11.5421 17.9168 12.2546 17.2076 12.2588 16.3302V16.3302C12.2567 15.9067 12.424 15.5001 12.7234 15.2006C13.0229 14.9012 13.4295 14.7339 13.853 14.736C14.121 14.7431 14.383 14.8165 14.6157 14.9495V14.9495C15.3764 15.3878 16.3482 15.1287 16.7897 14.3698V14.3698L17.3389 13.4545C17.5514 13.0896 17.6098 12.655 17.501 12.247C17.3922 11.839 17.1252 11.4912 16.7592 11.2806V11.2806C16.3931 11.07 16.1261 10.7222 16.0173 10.3142C15.9085 9.90613 15.9669 9.47156 16.1794 9.10668C16.3177 8.86532 16.5178 8.66521 16.7592 8.52697V8.52697C17.5134 8.08579 17.772 7.11962 17.3389 6.36068V6.36068V6.35305Z" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                                            <ellipse cx="10.1459" cy="9.90749" rx="2.1968" ry="2.1968" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                </div>
                                <div className="c-list">
                                    <div className="input-group search-area">
                                        <input type="text" className="form-control" placeholder="Search" />
                                        <span className="input-group-text">
                                            <Link to={"#"}>
                                                <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <circle cx="8.82495" cy="9.32491" r="6.74142" stroke="#252525" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M13.5137 14.3638L16.1568 16.9999" stroke="#252525" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </Link>
                                        </span>
                                    </div>
                                </div>
                                <div className="people-list dz-scroll">
                                    {chatList.map((item, index)=>(
                                        <div className="chat-p style-1" key={index}>
                                            <div className="d-flex align-items-center">
                                                <img src={item.image} className="avatar avatar-md  rounded-circle" alt="" />
                                                <div className="ms-2">
                                                    <h6 className="mb-0"><Link to={"#"}>{item.name}</Link></h6>
                                                    <span><strong>You:</strong> Welcome back </span>	
                                                </div>	
                                            </div>
                                            <span>{item.time} min</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="col-xl-5 col-lg-6 col-sm-7 chat-border">
                                <div className="chat-p shaprate">
                                    <div className="d-flex align-items-center">
                                        <img src={IMAGES.contact5} className="avatar avatar-md  rounded-circle" alt="" />
                                        <div className="ms-2">
                                            <h6 className="mb-0"><Link to={"#"}>K Kumar Gaur</Link></h6>
                                            <span>
                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <circle cx="7" cy="7" r="6" fill="#3AC977" stroke="white" strokeWidth="2"/>
                                                </svg>{" "}
                                            online</span>	
                                        </div>	
                                    </div>
                                    <div className="chat-admin">
                                        <div className="icon-box bg-info mx-1 chat-toggle">
                                            <i className="fa-solid fa-list-ul text-white"></i>
                                        </div>
                                        <div className="icon-box bg-success-light mx-1">
                                            {SVGICON.CallIcon}
                                        </div>{" "}
                                        <div className="icon-box bg-primary-light mx-1">
                                            {SVGICON.Video}
                                        </div>
                                        
                                    </div>
                                </div>
                                <div className="chat-box-area style-2 dz-scroll" id="chartBox2">
                                    <span className="text-center d-block mb-4">25/04/2023</span>	
                                    <div className="media justify-content-end align-items-end ms-auto">
                                        <div className="message-sent w-auto">                                                
                                            <p>Even the all-powerful Pointing has no controls an<br />
                                                almost unorthographic life One day however a lind text by the <br />
                                                name of Lorem Ipsum decided to World of Grammar. Aenean <br />
                                                vulputate eleifend tellus. Aenean leo ligula.
                                            </p>
                                            <span className="fs-12 mb-3 d-block">9.30 AM</span>
                                        </div>
                                    </div>	
                                    <div className="media">
                                        <div className="message-received w-auto">
                                            <div className="d-flex">
                                                <img src={IMAGES.contact2} className="avatar rounded-circle" alt="" />
                                                <div className="ms-1 text">
                                                    <p className="mb-1">Good morning</p>
                                                    <p className="mb-3">Can you arrange schedule for next meeting?</p>
                                                    <span>12:45 PM</span>
                                                </div>	
                                            </div>
                                        </div>
                                        
                                    </div>
                                    <span className="text-center d-block mb-4">Today</span>
                                    <div className="media justify-content-end align-items-end ms-auto">
                                        <div className="message-sent w-auto">
                                            <p className="mb-1">Very Good morning</p>
                                            <p className="mb-1">Okay, I’ll arrange it soon. i noftify you when</p>
                                            <p className="mb-1">Very Good morning</p>
                                            <p>Okay, I’ll arrange it soon. i noftify you when it’s done<br />
                                                +91-235 2574 2566<br />
                                                kk Sharma<br />
                                                pan card eeer2063i</p>
                                            <span className="fs-12">9.30 AM</span>
                                        </div>
                                    </div>
                                </div>	
                                <div className="message-send style-2">
                                    <div className="type-massage style-1">
                                        <div className="input-group">
                                            <textarea rows="1" className="form-control" placeholder="Hello Hanuman..."></textarea>
                                        </div>
                                    </div>
                                    <button type="button" className="btn btn-primary light p-2  d-flex align-items-center">
                                        Send{" "}
                                        {SVGICON.Attachment}
                                    </button>
                                </div>	
                            </div>
                            <div className="col-xl-4 file-media dz-scroll">
                                <div className="chat-meadia">
                                    <h4 className=" card-title">Media</h4>
                                    <ul className="image-list">
                                        {
                                            mediaBlog.map((item, index)=>(
                                               <li key={index}>
                                                   <img src={item.image} alt={`media${index+1}`}  key={index}/>
                                               </li> 
                                            ))
                                        }            
                                        <li className="all-media"><Link to={"#"}><span>50+</span><img src={IMAGES.chat5} alt="" /></Link></li>  
                                    </ul>
                                </div>
                                <div className="chat-meadia">
                                    <h4 className=" fs-16">Files</h4>
                                    <div className="file-list row dz-scroll">
                                        {documents.map((item, ind)=>(
                                            <div className="text-center col-xl-4 col-6 filie-l-icon" key={ind}>
                                                <img src={item.image} alt="" />
                                                <h5>{item.title}</h5>
                                                <small>3 Items December 27th, 2023 04:56 AM - 10.0 MB</small>
                                            </div>
                                        ))}                                          
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
    );
};

export default Chat;