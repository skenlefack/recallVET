import React, { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import DropFile from "./DropFile";

const Compose = () => {
	const [openMailBar, setOpenMailBar] = useState();
  return (
    <Fragment>
		<div className="row">
			<div className="col-lg-12">
				<div className="card mb-0 h-auto border-0">
					<div className="card-body">
						<div className="row gx-0">
							<div className={`col-xl-2 col-xxl-3 col-lg-3 email-left-body ${openMailBar ? "active" : " "}`}>
								<div className="email-left-box dz-scroll pt-3 ps-0" id="email-left">
									<div className="p-0">
										<Link to="/email-compose" className="btn text-white btn-block">
											<i className="fa-solid fa-plus me-2"></i>Compose Email
										</Link>
									</div>
									<div className="mail-list rounded ">
										<Link to="/email-inbox" className="list-group-item active">
											<i className="fa-regular fa-envelope align-middle"></i>
											Inbox
											<span className="badge badge-purple badge-sm float-end rounded">
											2
											</span>
										</Link>
										<Link to="/email-compose" className="list-group-item">
											<i className="fa-regular fa-paper-plane align-middle"></i>
											Sent
										</Link>
										<Link to="/email-compose" className="list-group-item">
											<i className="fa-regular fa-star align-middle"></i>
											Favorite											
										</Link>
										<Link to="/email-compose" className="list-group-item">
											<i className="fa-regular fa-file align-middle"></i>
											Draft
										</Link>
										<Link to="/email-compose" className="list-group-item">
											<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" >
												<path d="M15.4425 10.0575L10.065 15.435C9.92569 15.5745 9.76026 15.6851 9.57816 15.7606C9.39606 15.8361
												9.20087 15.8749 9.00375 15.8749C8.80663 15.8749 8.61144 15.8361 8.42934 15.7606C8.24724 15.6851 8.08181 15.5745 7.9425 15.435L1.5 9V1.5H9L15.4425
												7.9425C15.7219 8.22354 15.8787 8.60372 15.8787 9C15.8787 9.39628 15.7219 9.77646 15.4425 10.0575Z"
												stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
												<path d="M5.25 5.25H5.268" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
											</svg>
											Important
										</Link>
										<Link to="#" className="list-group-item"><i className="fa-regular fa-clock align-middle"></i> Scheduled</Link>
										<Link to="#" className="list-group-item ">
											<svg width="15" height="15" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path d="M5.5 8.25L11 13.75L16.5 8.25" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
											</svg>
											{" "} Move
										</Link>
									</div>
									<div className="mail-list rounded overflow-hidden mt-4 ">
										<div className="intro-title d-flex justify-content-between my-0">
											<h5>Categories</h5>								
										</div>
									<Link to="/email-inbox" className="list-group-item change">Work </Link>
									<Link to="/email-inbox" className="list-group-item change">Private </Link>
									<Link to="/email-inbox" className="list-group-item change">Support</Link>
									<Link to="/email-inbox" className="list-group-item change">Social</Link>
									</div>
								</div>
							</div>
							<div className="col-xl-10 col-xxl-9 col-lg-9">
								<div className="email-right-box ms-0">
									<div className="d-flex align-items-center px-3">
										<h4 className="card-title d-sm-none d-block">Email</h4>
										<div className={`email-tools-box float-end mb-2 ${openMailBar ? "active" : " "}`} onClick={()=>setOpenMailBar(!openMailBar)}>	
											<i className="fa-solid fa-list-ul"></i>
										</div>
									</div>
									
									<div className="compose-wrapper mt-3" id="compose-content">
										<div className="compose-content">
											<form action="#">
												<div className="mb-3">
													<input
														type="text"
														className="form-control bg-transparent"
														placeholder=" To:"
													/>
												</div>
												<div className="mb-3">
													<input type="text" className="form-control bg-transparent" placeholder=" Subject:"/>
												</div>
												<div className="mb-3">
													<textarea id="email-compose-editor" className="textarea_editor form-control bg-transparent" rows="5"
														placeholder="Enter text ..."
													></textarea>
												</div>
											</form>
											<h5 className="my-3"><i className="fa fa-paperclip me-2"></i> Attatchment</h5>
											<DropFile />
										</div>
										<div className="text-start mt-4 mb-3">
											<button className="btn btn-primary btn-sl-sm me-2 light" type="button">
												<span className="me-2">
													<i className="fa fa-paper-plane" />
												</span>
												Send
											</button>
											<button
												className="btn btn-danger light btn-sl-sm"
												type="button"
											>
												<span className="me-2">
													<i className="fa fa-times" />
												</span>
												Discard
											</button>
										</div>
									</div>	
								</div>	
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	
    </Fragment>
  );
};

export default Compose;
