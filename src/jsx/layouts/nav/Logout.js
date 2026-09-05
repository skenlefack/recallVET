import React  from 'react';
import {connect, useDispatch } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { Logout } from '../../../store/actions/AuthActions';
import { isAuthenticated } from '../../../store/selectors/AuthSelectors';
// import { SVGICON } from '../../constant/theme';


function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    let location = useLocation();
    let navigate = useNavigate();
    let params = useParams();
    return (
      <Component
        {...props}
        router={{ location, navigate, params }}
      />
    );
  }

  return ComponentWithRouterProp;
}

function LogoutPage(props){
  const dispatch = useDispatch();
	const navigate = useNavigate();
    function onLogout() {
       dispatch(Logout(navigate));
    }
    return(
        <>
            <button className="dropdown-item ai-icon ms-1 logout-btn" onClick={onLogout}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13.3333 14.1663L17.4999 9.99967L13.3333 5.83301" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17.5 10H7.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg> {" "}
							  <span className="ms-2">Logout </span>              
            </button>
        </>
    )
} 
const mapStateToProps = (state) => {
    return {
        isAuthenticated: isAuthenticated(state),
    };
};

export default withRouter(connect(mapStateToProps)(LogoutPage));