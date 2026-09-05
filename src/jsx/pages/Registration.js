import React,{useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import { connect, useDispatch } from 'react-redux';
import {
    loadingToggleAction,
    signupAction,
} from '../../store/actions/AuthActions';
// image

import { IMAGES } from "../constant/theme";

function Register(props) {

    const [email, setEmail] = useState('');
    let errorsObj = { email: '', password: '' };
    const [errors, setErrors] = useState(errorsObj);
    const [password, setPassword] = useState('');

    const dispatch = useDispatch();
	const navigate = useNavigate();

    function onSignUp(e) {
        e.preventDefault();
        let error = false;
        const errorObj = { ...errorsObj };
        if (email === '') {
            errorObj.email = 'Email is Required';
            error = true;
        }
        if (password === '') {
            errorObj.password = 'Password is Required';
            error = true;
        }
        setErrors(errorObj);
        if (error) return;
        dispatch(loadingToggleAction(true));
        dispatch(signupAction(email, password, navigate));
    }
	const [showPassword, setShowPassword] = useState(false);
	return (
		<>
			<div className="page-wraper">				
				<div className="authincation">
					<div className="container-fluid">
						<div className="row h-100">
							<div className="col-lg-6 col-md-12 col-sm-12 mx-auto align-self-center">
								<div className="login-form">
									<div className="text-center">
										<h3 className="title">Sign up your account</h3>
										<p>Sign in to your account to start using W3Admin</p>
									</div>
									{props.errorMessage && (
										<div className='text-danger  p-1 my-2'>
											{props.errorMessage}
										</div>
									)}
									{props.successMessage && (
										<div className='text-success p-1 my-2'>
											{props.successMessage}
										</div>
									)}									
									<form  onSubmit={onSignUp}>
										<div className="mb-4">
											<label className="mb-1 text-dark">Username</label>
											<input name="dzName2" required="" className="form-control" placeholder="User Name" type="text" />
										</div>
										<div className="mb-4">
											<label className="mb-1 text-dark">Email</label>											
											<input value={email} onChange={(e) => setEmail(e.target.value)} className="form-control" placeholder="hello@example.com"/>
											{errors.email && <div className="text-danger fs-12">{errors.email}</div>}
										</div>
										<div className="mb-4 position-relative">
											<label className="mb-1 text-dark">Password</label>											
											<input 
												type={`${showPassword ? "text" : "password"}`}
												value={password}
												onChange={(e) =>
													setPassword(e.target.value)
												}
												className="form-control"
												placeholder="passowrd"
											/>
											<span 
												className="show-pass eye" 
												onClick={() => setShowPassword(!showPassword)}
											>													
												{showPassword ===  false ? (<i className="fa fa-eye-slash" />) : (<i className="fa fa-eye" />)}									
											</span>
											
											{errors.password && <div className="text-danger fs-12">{errors.password}</div>}
										</div>
										<div className="form-row d-flex justify-content-between mt-4 mb-2">
											<div className="mb-4">
												<div className="form-check custom-checkbox mb-3">
													<input type="checkbox" className="form-check-input" id="customCheckBox1" />
													<label className="form-check-label mt-1" htmlFor="customCheckBox1">Remember my preference</label>
												</div>
											</div>
											<div className="mb-4">
												<Link to="/login"   className="btn-link text-primary">Sign in</Link>
											</div>
										</div>
										<div className="text-center mb-4">
											<button type="submit" className="btn btn-primary light btn-block">Sign Up</button>
										</div>
										<h6 className="login-title"><span>Or continue with</span></h6>
										
										<div className="mb-3">
											<ul className="d-flex align-self-center justify-content-center">
												<li><Link target="_blank" to="https://www.facebook.com/dexignzone" className="fab fa-facebook-f btn-facebook"></Link></li>
												<li><Link target="_blank" to="https://www.google.com/" className="fab fa-google-plus-g btn-google-plus mx-2"></Link></li>
												<li><Link target="_blank" to="https://www.linkedin.com/in/dexignzone" className="fab fa-linkedin-in btn-linkedin me-2"></Link></li>
												<li><Link target="_blank" to="https://twitter.com/dexignzones" className="fab fa-twitter btn-twitter"></Link></li>
											</ul>
										</div>										
									</form>
								</div>
							</div>
							<div className="col-xl-6 col-lg-6">
								<div className="pages-left h-100">
									<div className="login-content">
										<Link to={"#"}><img src={IMAGES.logofull} className="mb-3" alt="" /></Link>		
										<p>Your true value is determined by how much more you give in value than you take in payment. ...</p>
									</div>
									<div className="login-media text-center">
										<img src={IMAGES.login} alt="" />
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

const mapStateToProps = (state) => {
    return {
        errorMessage: state.auth.errorMessage,
        successMessage: state.auth.successMessage,
        showLoading: state.auth.showLoading,
    };
};

export default connect(mapStateToProps)(Register);

