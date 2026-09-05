import React,{useState, useEffect, useContext} from "react";
import { Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { IMAGES} from "../../constant/theme";
import { ThemeContext } from "../../../context/ThemeContext";

import LogoutPage from './Logout';

const NotificationBlog =({classChange}) =>{
	return(
		<>
			<li>
				<div className="timeline-panel">
					<div className="media me-2">
						<img alt="images" width={50} src={IMAGES.Avatar} />
					</div>
					<div className="media-body">
						<h6 className="mb-1">Dr sultads Send you Photo</h6>
						<small className="d-block">29 July 2022 - 02:26 PM</small>
					</div>
				</div>
			</li>
			<li>
				<div className="timeline-panel">
					<div className={`media me-2 ${classChange}`}>KG</div>
					<div className="media-body">
						<h6 className="mb-1">Resport created successfully</h6>
						<small className="d-block">29 July 2022 - 02:26 PM</small>
					</div>
				</div>
			</li>
			<li>
				<div className="timeline-panel">
					<div className={`media me-2 ${classChange}`}><i className="fa fa-home" /></div>
					<div className="media-body">
						<h6 className="mb-1">Reminder : Treatment Time!</h6>
						<small className="d-block">29 July 2022 - 02:26 PM</small>
					</div>
				</div>
			</li>
		</>
	)
}

const Header = ({ onNote }) => {
	const [headerFix, setheaderFix] = useState(false);
	useEffect(() => {
		window.addEventListener("scroll", () => {
			setheaderFix(window.scrollY > 50);
		});
	}, []); 
	
  const [activeDrop, setActiveDrop] = useState(false);
  const { background, changeBackground  } = useContext(ThemeContext);
  function ChangeColor (){     
	if(background.value ==="light"){       
	  changeBackground({ value: "dark", label: "Dark" });   
	}
	else{
	  changeBackground({ value: "light", label: "Light" });   
	}
  }  
  return ( 
    <div className={`header ${headerFix ? "is-fixed" : ""}`}>
      <div className="header-content">
        <nav className="navbar navbar-expand">
          	<div className="collapse navbar-collapse justify-content-between">
				<div className="header-left">
					<div className="input-group search-area">
						<span className="input-group-text">
							<Link to={"#"}>
								<svg width="22" height="23" viewBox="0 0 22 23" fill="none" xmlns="http://www.w3.org/2000/svg">
									<circle cx="10.7861" cy="11.2859" r="8.23951" stroke="#252525" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
									<path d="M16.5168 17.4443L19.7472 20.6663" stroke="#252525" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
								</svg>
							</Link>
						</span>
						<input type="text" className="form-control" placeholder="Search" />
					</div>
				</div>
				<ul className="navbar-nav header-right">			
					<Dropdown as="li" className="nav-item dropdown notification_dropdown ">
						{/* <Dropdown.Toggle variant="" as="a" className="nav-link  i-false c-pointer open-cal" role="button">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path fillRule="evenodd" clipRule="evenodd" d="M20.8067 7.62358L20.1842 6.54349C19.6577 5.62957 18.4907 5.31429 17.5755 5.83869V5.83869C17.1399 6.09531 16.6201 6.16812 16.1307 6.04106C15.6413 5.91399 15.2226 5.59749 14.9668 5.16134C14.8023 4.88412 14.7139 4.56836 14.7105 4.24601V4.24601C14.7254 3.72919 14.5304 3.22837 14.17 2.85764C13.8096 2.48691 13.3145 2.27783 12.7975 2.27805H11.5435C11.037 2.27804 10.5513 2.47988 10.194 2.83891C9.83669 3.19795 9.63717 3.68456 9.63961 4.19109V4.19109C9.6246 5.23689 8.77248 6.07678 7.72657 6.07667C7.40421 6.07332 7.08846 5.98491 6.81123 5.82038V5.82038C5.89606 5.29598 4.72911 5.61126 4.20254 6.52519L3.53435 7.62358C3.00841 8.53636 3.3194 9.70258 4.23 10.2323V10.2323C4.8219 10.574 5.18653 11.2056 5.18653 11.889C5.18653 12.5725 4.8219 13.204 4.23 13.5458V13.5458C3.32056 14.0719 3.00923 15.2353 3.53435 16.1453V16.1453L4.16593 17.2346C4.41265 17.6798 4.8266 18.0083 5.31619 18.1474C5.80578 18.2866 6.33064 18.2249 6.77462 17.976V17.976C7.21108 17.7213 7.73119 17.6515 8.21934 17.7822C8.70749 17.9128 9.12324 18.233 9.37416 18.6716C9.5387 18.9489 9.62711 19.2646 9.63046 19.587V19.587C9.63046 20.6435 10.487 21.5 11.5435 21.5H12.7975C13.8505 21.5 14.7055 20.6491 14.7105 19.5961V19.5961C14.7081 19.088 14.9089 18.6 15.2682 18.2407C15.6275 17.8814 16.1155 17.6806 16.6236 17.6831C16.9452 17.6917 17.2596 17.7797 17.5389 17.9394V17.9394C18.4517 18.4653 19.6179 18.1543 20.1476 17.2437V17.2437L20.8067 16.1453C21.0618 15.7075 21.1318 15.186 21.0012 14.6963C20.8706 14.2067 20.5502 13.7893 20.111 13.5366V13.5366C19.6718 13.2839 19.3514 12.8665 19.2208 12.3769C19.0902 11.8873 19.1603 11.3658 19.4154 10.9279C19.5812 10.6383 19.8214 10.3982 20.111 10.2323V10.2323C21.0161 9.70286 21.3264 8.54346 20.8067 7.63274V7.63274V7.62358Z" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
								<circle cx="12.1751" cy="11.889" r="2.63616" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
							</svg>	
						</Dropdown.Toggle>
						<Dropdown.Menu  className=" dropdown-menu dropdown-menu-end" align="end">
							<div className="widget-timeline dz-scroll style-1 p-3 ps--active-y height370" id="DZ_W_TimeLine02">								
								<ul className="timeline">
									<li>
										<div className="timeline-badge primary" />
										<Link className="timeline-panel c-pointer text-muted" to="#">
											<span>10 minutes ago</span>
											<h6 className="mb-0"> Youtube, a video-sharing website, goes live{" "} <strong className="text-primary">$500</strong>.</h6>
										</Link>
									</li>
									<li>
										<div className="timeline-badge info"></div>
										<Link className="timeline-panel c-pointer text-muted" to="#">
											<span>20 minutes ago</span>
											<h6 className="mb-0">
												New order placed{" "}
												<strong className="text-info">#XF-2356.</strong>
											</h6>
											<p className="mb-0"> Quisque a consequat ante Sit amet magna at volutapt...</p>
										</Link>
									</li>
									<li>
										<div className="timeline-badge danger"></div>
										<Link className="timeline-panel c-pointer text-muted" to="#">
											<span>30 minutes ago</span>
										<h6 className="mb-0">
											john just buy your product{" "}
											<strong className="text-warning">Sell $250</strong>
										</h6>
										</Link>
									</li>
									<li>
										<div className="timeline-badge success"></div>
										<Link className="timeline-panel c-pointer text-muted" to="#">
										<span>15 minutes ago</span>
										<h6 className="mb-0">
											StumbleUpon is acquired by eBay.{" "}
										</h6>
										</Link>
									</li>
									<li>
										<div className="timeline-badge warning"></div>
										<Link className="timeline-panel c-pointer text-muted" to="#">
										<span>20 minutes ago</span>
										<h6 className="mb-0">
											Mashable, a news website and blog, goes live.
										</h6>
										</Link>
									</li>
									<li>
										<div className="timeline-badge dark"></div>
										<Link className="timeline-panel c-pointer text-muted" to="#">
											<span>20 minutes ago</span>
											<h6 className="mb-0">Mashable, a news website and blog, goes live.</h6>
										</Link>
									</li>
									<li>
										<div className="timeline-badge primary" />
										<Link className="timeline-panel c-pointer text-muted" to="#">
											<span>10 minutes ago</span>
											<h6 className="mb-0"> Youtube, a video-sharing website, goes live{" "} <strong className="text-primary">$500</strong>.</h6>
										</Link>
									</li>
									<li>
										<div className="timeline-badge info"></div>
										<Link className="timeline-panel c-pointer text-muted" to="#">
											<span>20 minutes ago</span>
											<h6 className="mb-0">
												New order placed{" "}
												<strong className="text-info">#XF-2356.</strong>
											</h6>
											<p className="mb-0"> Quisque a consequat ante Sit amet magna at volutapt...</p>
										</Link>
									</li>
									<li>
										<div className="timeline-badge danger"></div>
										<Link className="timeline-panel c-pointer text-muted" to="#">
										<span>30 minutes ago</span>
										<h6 className="mb-0">
											john just buy your product{" "}
											<strong className="text-warning">Sell $250</strong>
										</h6>
										</Link>
									</li>
									<li>
										<div className="timeline-badge success"></div>
										<Link className="timeline-panel c-pointer text-muted" to="#">
										<span>15 minutes ago</span>
										<h6 className="mb-0">
											StumbleUpon is acquired by eBay.{" "}
										</h6>
										</Link>
									</li>
								</ul>
								<div className="ps__rail-x" style={{ left: 0, bottom: 0 }}>
									<div className="ps__thumb-x" tabIndex={0} style={{ left: 0, width: 0 }}/>
								</div>
								<div className="ps__rail-y" style={{ top: 0, right: 0 }}>
									<div className="ps__thumb-y" tabIndex={0} style={{ top: 0, height: 0 }}/>
								</div>
							</div>
						</Dropdown.Menu> */}
					</Dropdown>	
					<Dropdown as="li" className="nav-item dropdown notification_dropdown">
						<Dropdown.Toggle className="nav-link i-false c-pointer" variant="" as="a">
							<svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M18 8.5C18 6.9087 17.3679 5.38258 16.2426 4.25736C15.1174 3.13214 13.5913 2.5 12 2.5C10.4087 2.5 8.88258 3.13214 7.75736 4.25736C6.63214 5.38258 6 6.9087 6 8.5C6 15.5 3 17.5 3 17.5H21C21 17.5 18 15.5 18 8.5Z" stroke="#111828" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
								<path d="M13.73 21.5C13.5542 21.8031 13.3019 22.0547 12.9982 22.2295C12.6946 22.4044 12.3504 22.4965 12 22.4965C11.6496 22.4965 11.3054 22.4044 11.0018 22.2295C10.6982 22.0547 10.4458 21.8031 10.27 21.5" stroke="#111828" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
							</svg>						
						</Dropdown.Toggle>
						<Dropdown.Menu align="end" className="mt-2 dropdown-menu dropdown-menu-end">
							<div className="widget-media dz-scroll p-3 height380">
								<ul className="timeline">
									<NotificationBlog classChange='media-info'/>
									<NotificationBlog classChange='media-success' />
									<NotificationBlog classChange='media-danger' />
									<NotificationBlog classChange='media-info' />
								</ul>
							<div className="ps__rail-x" style={{ left: 0, bottom: 0 }}>
								<div className="ps__thumb-x" tabIndex={0} style={{ left: 0, width: 0 }}/>
							</div>
							<div className="ps__rail-y" style={{ top: 0, right: 0 }}>
								<div className="ps__thumb-y" tabIndex={0} style={{ top: 0, height: 0 }}/>
							</div>
						</div>
						<Link className="all-notification" to="#">
							See all notifications <i className="ti-arrow-right" />
						</Link>
					</Dropdown.Menu>
					</Dropdown>
					<Dropdown as="li" className="nav-item dropdown notification_dropdown ">
						<Dropdown.Toggle variant="" as="a" className="nav-link  i-false c-pointer" onClick={() => onNote()}>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M17.9026 8.85156L13.4593 12.4646C12.6198 13.1306 11.4387 13.1306 10.5992 12.4646L6.11841 8.85156" stroke="#130F26" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
								<path fillRule="evenodd" clipRule="evenodd" d="M16.9089 21C19.9502 21.0084 22 18.5095 22 15.4384V8.57001C22 5.49883 19.9502 3 16.9089 3H7.09114C4.04979 3 2 5.49883 2 8.57001V15.4384C2 18.5095 4.04979 21.0084 7.09114 21H16.9089Z" stroke="#130F26" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
							</svg>						
						</Dropdown.Toggle>
					</Dropdown>						
					<li className="nav-item align-items-center header-border">
						<Link to={"/analytics"} className="btn btn-primary">Analytics</Link>
					</li>
					<li className="nav-item ps-3">
						<div className="header-profile2" >
							<Link to={"#"} className="nav-link" onClick={()=>setActiveDrop(!activeDrop)}>
								<div className="header-info2 d-flex align-items-center">
									<div className="header-media">
										<img src={IMAGES.headuser} className="avatar avatar-lg"  alt="profile" />
									</div>
									<div className="header-info">
										<h6>Thomas Fleming</h6>
										<p>info@gmail.com</p>
									</div>									
								</div>
							</Link>							
							<div className={`profile-box ${activeDrop ? 'active' : ''}`}>
								<div className="products">
									<div className="border-img">
										<img src={IMAGES.headuser} className="avatar" alt="" />
									</div>	
									<div className="ms-3">
										<h6 className="mb-0">Thomas Fleming</h6>
										<span className="d-block mb-1">demo@gmail.com</span>
										<span className="badge border-0 rounded">Pro Mamber</span>
									</div>	
								</div>
								<div className="account-setting">
									<Link to={"/app-profile-2"} className="ai-icon">
										<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M16.6666 17.5V15.8333C16.6666 14.9493 16.3154 14.1014 15.6903 13.4763C15.0652 12.8512 14.2173 12.5 13.3333 12.5H6.66658C5.78253 12.5 4.93468 12.8512 4.30956 13.4763C3.68444 14.1014 3.33325 14.9493 3.33325 15.8333V17.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
											<path d="M10.0001 9.16667C11.841 9.16667 13.3334 7.67428 13.3334 5.83333C13.3334 3.99238 11.841 2.5 10.0001 2.5C8.15913 2.5 6.66675 3.99238 6.66675 5.83333C6.66675 7.67428 8.15913 9.16667 10.0001 9.16667Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
										</svg>
										<span className="ms-2">Account Settings</span>
									</Link>
									<Link to={"/app-profile-1"} className="ai-icon ">
										<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M3.33341 3.33301H16.6667C17.5834 3.33301 18.3334 4.08301 18.3334 4.99967V14.9997C18.3334 15.9163 17.5834 16.6663 16.6667 16.6663H3.33341C2.41675 16.6663 1.66675 15.9163 1.66675 14.9997V4.99967C1.66675 4.08301 2.41675 3.33301 3.33341 3.33301Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
											<path d="M18.3334 5L10.0001 10.8333L1.66675 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
										</svg>
										<span className="ms-2">Subscription</span>
									</Link>
									<div className="d-flex align-items-center">
										<Link to={"#"} className="dropdown-item ai-icon">
											<div>
												<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
													<path d="M17.4999 10.6583C17.3688 12.0768 16.8365 13.4287 15.9651 14.5557C15.0938 15.6826 13.9195 16.5382 12.5797 17.0221C11.2398 17.5061 9.7899 17.5984 8.3995 17.2884C7.0091 16.9784 5.73575 16.2788 4.72844 15.2715C3.72113 14.2642 3.02153 12.9908 2.71151 11.6004C2.40148 10.21 2.49385 8.76007 2.9778 7.42025C3.46175 6.08042 4.31728 4.90614 5.44426 4.03479C6.57125 3.16345 7.92308 2.63109 9.34158 2.5C8.51109 3.62356 8.11146 5.00787 8.21536 6.40118C8.31926 7.79448 8.9198 9.10421 9.90775 10.0922C10.8957 11.0801 12.2054 11.6807 13.5987 11.7846C14.992 11.8885 16.3764 11.4888 17.4999 10.6583Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
												</svg>
												<span className="ms-2">Dark Mode</span>
											</div>
										</Link>
										<div className={`dz-layout ${background.value === "dark" ? 'dark' : 'light'}`} 										
											onClick={ChangeColor}
										>
											<i className="fas fa-sun sun"></i>
											<i className="fas fa-moon moon"></i>
										</div>	
									</div>
									<LogoutPage />									
								</div>
							</div>								
						</div>
					</li>						
				</ul>
			
			
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Header;
