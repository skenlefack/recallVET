import React, { useContext  } from "react";

/// React router dom
import {  Routes, Route, Outlet } from "react-router-dom";

/// Css
import "./index.css";
import "./chart.css";
import "./step.css";

/// Layout
import Nav from "./layouts/nav";
import Footer from "./layouts/Footer";
import ScrollToTop from "./layouts/ScrollToTop";


/// Dashboard
import Home from "./components/Dashboard/Home";
import DashboardDark from "./components/Dashboard/DashboardDark";
import Demo1 from "./components/Dashboard/Demo/Demo1";
import Demo3 from "./components/Dashboard/Demo/Demo3";
import Demo4 from "./components/Dashboard/Demo/Demo4";
import Demo5 from "./components/Dashboard/Demo/Demo5";
import Demo6 from "./components/Dashboard/Demo/Demo6";
import Demo7 from "./components/Dashboard/Demo/Demo7";
import Demo8 from "./components/Dashboard/Demo/Demo8";


import Dashboard3 from "./components/Dashboard/Dashboard3"; 
import Dashboard4 from "./components/Dashboard/Dashboard4"; 
import Crm from "./components/Dashboard/Crm"; 
import Analytics from "./components/Dashboard/Analytics"; 
import Contacts from "./components/Dashboard/Contacts"; 
import Blog from "./components/Dashboard/Blog"; 

//Apps
import Chat from "./components/AppsMenu/AppProfile/Chat"; 
import AppProfile from "./components/AppsMenu/AppProfile/AppProfile";
import AppProfile2 from "./components/AppsMenu/AppProfile/AppProfile2";
import EditProfile from "./components/AppsMenu/AppProfile/EditProfile";
import PostDetails from "./components/AppsMenu/AppProfile/PostDetails";
import Compose from "./components/AppsMenu/Email/Compose/Compose";
import Inbox from "./components/AppsMenu/Email/Inbox/Inbox";
import Read from "./components/AppsMenu/Email/Read/Read";
import Calendar from "./components/AppsMenu/Calendar/Calendar";

/// Product List
import ProductGrid from "./components/AppsMenu/Shop/ProductGrid/ProductGrid";
import ProductList from "./components/AppsMenu/Shop/ProductList/ProductList";
import ProductDetail from "./components/AppsMenu/Shop/ProductGrid/ProductDetail";
import ProductOrder from "./components/AppsMenu/Shop/ProductOrder";
import Checkout from "./components/AppsMenu/Shop/Checkout/Checkout";
import Invoice from "./components/AppsMenu/Shop/Invoice/Invoice";
import Customers from "./components/AppsMenu/Shop/Customers/Customers";

/// Charts
import SparklineChart from "./components/charts/Sparkline";
import ChartJs from "./components/charts/Chartjs";
import RechartJs from "./components/charts/rechart";
import ApexChart from "./components/charts/apexcharts";

/// Bootstrap
import UiAccordion from "./components/bootstrap/Accordion";
import UiAlert from "./components/bootstrap/Alert";
import UiBadge from "./components/bootstrap/Badge";
import UiButton from "./components/bootstrap/Button";
import UiModal from "./components/bootstrap/Modal";
import UiButtonGroup from "./components/bootstrap/ButtonGroup";
import UiListGroup from "./components/bootstrap/ListGroup";
import UiCards from "./components/bootstrap/Cards";
import UiCarousel from "./components/bootstrap/Carousel";
import UiDropDown from "./components/bootstrap/DropDown";
import UiPopOver from "./components/bootstrap/PopOver";
import UiProgressBar from "./components/bootstrap/ProgressBar";
import UiTab from "./components/bootstrap/Tab";
import UiPagination from "./components/bootstrap/Pagination";
import UiGrid from "./components/bootstrap/Grid";
import UiTypography from "./components/bootstrap/Typography";

/// Plugins
import Select2 from "./components/PluginsMenu/Select2/Select2";
import MainSweetAlert from "./components/PluginsMenu/SweetAlert/SweetAlert";
import Toastr from "./components/PluginsMenu/Toastr/Toastr";
import JqvMap from "./components/PluginsMenu/JqvMap/JqvMap";
import Lightgallery from "./components/PluginsMenu/Lightgallery/Lightgallery";
// Widget
import Widget from "./pages/Widget";
/// Table
import SortingTable from "./components/table/SortingTable/SortingTable";
import FilteringTable from "./components/table/FilteringTable/FilteringTable";
import BootstrapTable from "./components/table/BootstrapTable";
/// Form
import Element from "./components/Forms/Element/Element";
import Wizard from "./components/Forms/Wizard/Wizard";
import CkEditor from "./components/Forms/CkEditor/CkEditor";
import Pickers from "./components/Forms/Pickers/Pickers";
import FormValidation from "./components/Forms/FormValidation/FormValidation";
/// Pages
import LockScreen from "./pages/LockScreen";
import Error400 from "./pages/Error400";
import Error403 from "./pages/Error403";
import Error404 from "./pages/Error404";
import Error500 from "./pages/Error500";
import Error503 from "./pages/Error503";

import EmptyPage from "./pages/EmptyPage";

import { ThemeContext } from "../context/ThemeContext";
const Markup = () => {   
  const allroutes = [ 
    { url: "index-3", component: <Dashboard3 /> },
    { url: "index-4", component: <Dashboard4 /> },
    { url: "crm", component: <Crm /> },
    { url: "analytics", component: <Analytics /> },
    { url: "contacts", component: <Contacts /> },
    { url: "chat", component: <Chat /> },
  
  //Apps    
    { url: "app-profile", component: <AppProfile /> },
    { url: "app-profile-2", component: <AppProfile2 /> },
    { url: "edit-profile", component: <EditProfile /> },
    { url: "post-details", component: <PostDetails /> },  
    { url: "email-compose", component: <Compose /> },
    { url: "email-inbox", component: <Inbox /> },
    { url: "email-read", component: <Read /> },
    { url: "app-calender", component: <Calendar /> },

  // Shop
    { url: "ecom-product-grid", component: <ProductGrid /> },
    { url: "ecom-product-list", component: <ProductList /> },
    { url: "ecom-product-detail", component: <ProductDetail /> },
    { url: "ecom-product-order", component: <ProductOrder /> },
    { url: "ecom-checkout", component: <Checkout /> },
    { url: "ecom-invoice", component: <Invoice /> },
    { url: "ecom-customers", component: <Customers /> },
  // Chart
    { url: "chart-sparkline", component: <SparklineChart /> },
    { url: "chart-chartjs", component: <ChartJs /> },    
    { url: "chart-apexchart", component: <ApexChart /> },
    { url: "chart-rechart", component: <RechartJs /> },
  // Bootstrap
    { url: "ui-accordion", component: <UiAccordion /> },
    { url: "ui-alert", component: <UiAlert /> },
    { url: "ui-badge", component: <UiBadge /> },
    { url: "ui-button", component: <UiButton /> },
    { url: "ui-modal", component: <UiModal /> },
    { url: "ui-button-group", component: <UiButtonGroup /> },
    { url: "ui-list-group", component: <UiListGroup /> },
    { url: "ui-card", component: <UiCards />},
    { url: "ui-carousel", component: <UiCarousel /> },
    { url: "ui-dropdown", component: <UiDropDown /> },
    { url: "ui-popover", component: <UiPopOver /> },
    { url: "ui-progressbar", component: <UiProgressBar /> },
    { url: "ui-tab", component: <UiTab /> },
    { url: "ui-pagination", component: <UiPagination /> },
    { url: "ui-typography", component: <UiTypography /> },
    { url: "ui-grid", component: <UiGrid /> },  
  // Plugin
    { url: "uc-select2", component: <Select2 /> },
    { url: "uc-sweetalert", component: <MainSweetAlert /> },
    { url: "uc-toastr", component: <Toastr /> },
    { url: "map-jqvmap", component: <JqvMap /> },
    { url: "uc-lightgallery", component: <Lightgallery /> },
  // Widget
    { url: "widget-basic", component: <Widget /> },
  // Form
    { url: "form-element", component: <Element /> },
    { url: "form-wizard", component: <Wizard /> },
    { url: "form-ckeditor", component: <CkEditor /> },
    { url: "form-pickers", component: <Pickers /> },
    { url: "form-validation", component: <FormValidation /> },
  // table
    { url: 'table-filtering', component: <FilteringTable /> },
    { url: 'table-sorting', component: <SortingTable /> },
    { url: "table-bootstrap-basic", component: <BootstrapTable /> },    
    
    { url: "empty-page", component: <EmptyPage /> },

];   
    return (
        <>
          <Routes>              
            <Route path='/page-lock-screen' element= {<LockScreen />} />
            <Route path='/page-error-400' element={<Error400/>} />            
            <Route path='/page-error-403' element={<Error403/>} />
            <Route path='/page-error-404' element={<Error404/>} />
            <Route path='/page-error-500' element={<Error500/>} />
            <Route path='/page-error-503' element={<Error503/>} />    
            <Route element ={<HomeLayout />} >
              <Route path="/" element={<Home />}></Route>
              <Route path="/dashboard" element={<Home />}></Route>                
              <Route path="/dashboard-dark" element={<DashboardDark />}></Route>                
              <Route path="/light-sidebar" element={<Demo1 />} /> 
              <Route path="/compact-sidebar" element={<Demo3 />} />
              <Route path="/horizontal-sidebar" element={<Demo4 />} />
              <Route path="/horizontal-sidebar-compact" element={<Demo5 />} />
              <Route path="/horizontal-sidebar-modern" element={<Demo6 />} />
              <Route path="/sidebar-modern" element={<Demo7 />} />
              <Route path="/sidebar-mini" element={<Demo8 />} />
            </Route>
            <Route  element={<MainLayout />} > 
                {allroutes.map((data, i) => (
                  <Route
                    key={i}
                    exact
                    path={`${data.url}`}
                    element={data.component}
                  />
                ))}
            </Route>    
            <Route  element={<LayoutExtra />} >                 
              <Route path="/blog" element={<Blog />} />
            </Route>              
        </Routes>     
        <ScrollToTop />          
      </>
    );       
};

function HomeLayout(){
  const { menuToggle } = useContext(ThemeContext);
  return(
    <div id="main-wrapper" className={`show ${ menuToggle ? "menu-toggle" : ""}`}>
        <Nav />
        <div className="outer-body" >
            <div className="inner-body">
              <div className="content-body" style={{ minHeight: window.screen.height - 45 }}>
                  <div className="container-fluid">
                    <Outlet /> 
                  </div>
              </div>
              <Footer changefoot="home-footer"/>
            </div>
        </div>
    </div>
  )
}

function MainLayout(){
  const { menuToggle } = useContext(ThemeContext);
  return(
      <div id="main-wrapper" className={`show ${ menuToggle ? "menu-toggle" : ""}`}>
        <Nav />
        <div className="outer-body" >
            <div className="inner-body">
              <div className="content-body" style={{ minHeight: window.screen.height - 45 }}>
                  <div className="container-fluid">
                    <Outlet /> 
                  </div>
              </div>
              <Footer changefoot="home"/>
            </div>
        </div>
      </div>
  )
}
function LayoutExtra(){
  const { menuToggle } = useContext(ThemeContext);
  return(
      <div id="main-wrapper" className={`show ${ menuToggle ? "menu-toggle" : ""}`}>
        <Nav />
        <div className="outer-body" >
            <div className="inner-body">
              <div className="content-body" style={{ minHeight: window.screen.height - 45 }}>
                  <div className="container">
                    <Outlet /> 
                  </div>
              </div>
              <Footer changefoot="home"/>
            </div>
        </div>
      </div>
  )
}


export default Markup;
