import { SVGICON } from "../../constant/theme";

export const MenuList = [
    //Content
    // {
    //     title: 'YOUR COMPANY',
    //     classsChange: 'menu-title'
    // },
    //Dashboard
    {
        title: 'Dashboard',	
        classsChange: 'mm-collapse',		
        iconStyle: SVGICON.Home,
        extratitle : 'Dashboard',        
        content: [
            
            {
                title: 'Dashboard Light',
                to: 'dashboard',					
            },
            {
                title: 'Dashboard Dark',
                to: 'dashboard-dark',                
            },
            {
                title : "Dashboard 3",
                to : 'index-3'
            },
            {
                title:'Dashboard 4',
                to:'index-4'
            },
            {
                title:'CRM',
                to:'crm'
            },
            {
                title:'Analytics',
                to:'analytics'
            },
        ],
    },
    {   
        title:'Contacts',
        iconStyle: SVGICON.ContactSvg,
        to: 'contacts',
    },
    {   
        title:'Blog',
        iconStyle: SVGICON.Blog,
        to: 'blog',
    },

    {
        title: 'OUR FEATURES',
        classsChange: 'menu-title'
    },
   
    //Apps
    {
        title: 'Apps',	
        classsChange: 'mm-collapse',
        // update:"New",
        iconStyle:SVGICON.Apps,
        extratitle : 'Apps',
        content: [
            {
                title:'Chat',
                to: 'chat',                
            },
            {
                title: "Users Manager",
                hasMenu : true,
                // update:'New',
                // extratitle : 'Users Manager',   
                content: [
                    // {
                    //     title:"User",
                    //     to:'/user',
                    // },
                    // {
                    //     title:'Add User',
                    //     to:'/edit-profile'
                    // },
                    // {
                    //     title:'Roles Listing',
                    //     to:'/user-roles',
                    // },
                    // {
                    //     title:'Add Roles',
                    //     to:'/add-role'
                    // },
                    {
                        title: 'Profile 1',
                        to: 'app-profile'
                    },
                    {
                        title: 'Profile 2',
                        to: 'app-profile-2'
                    },
                    {
                        title: 'Edit Profile',
                        to: 'edit-profile'
                    },
                    {
                        title: 'Post Details',
                        to: 'post-details'
                    },
                ],
            },
            // {
            //     title:'Customer Manager',
            //     hasMenu : true,            
            //     content : [
            //         {
            //             title:'Customer',
            //             to:'/customer'
            //         },
            //         {
            //             title:'Customer Profile',
            //             to:'/customer-profile'
            //         },
            //     ],
            // },
            
            {
                title: 'Email',
                hasMenu : true,
                content: [
                    {
                        title: 'Compose',
                        to: 'email-compose',
                    },
                    {
                        title: 'Index',
                        to: 'email-inbox',
                    },
                    {
                        title: 'Read',
                        to: 'email-read',
                    }
                ],
            },
            {
                title:'Calendar',
                to: 'app-calender'
            },
           
            
            {
                title: 'Shop',                
                hasMenu : true,
                content: [
                    {
                        title: 'Product Grid',
                        to: 'ecom-product-grid',
                    },
                    {
                        title: 'Product List',
                        to: 'ecom-product-list',
                    },
                    {
                        title: 'Product Details',
                        to: 'ecom-product-detail',
                    },
                    {
                        title: 'Order',
                        to: 'ecom-product-order',
                    },
                    {
                        title: 'Checkout',
                        to: 'ecom-checkout',
                    },
                    {
                        title: 'Invoice',
                        to: 'ecom-invoice',
                    },
                    {
                        title: 'Customers',
                        to: 'ecom-customers',
                    },
                ],
            },
        ],
    },
    //Charts
    {
        title: 'Charts',	
        classsChange: 'mm-collapse',
        iconStyle: SVGICON.Charts,
        extratitle : 'Charts',
        content: [
            
            {
                title: 'RechartJs',
                to: 'chart-rechart',					
            },
            {
                title: 'Chartjs',
                to: 'chart-chartjs',					
            },
            {
                title: 'Sparkline',
                to: 'chart-sparkline',					
            },
            {
                title: 'Apexchart',
                to: 'chart-apexchart',					
            },
        ]
    },
    //Boosttrap
    {
        title: 'Bootstrap',	
        classsChange: 'mm-collapse',
        iconStyle: SVGICON.Bootstrap,	
        extratitle : 'Bootstrap',
        content: [
            {
                title: 'Accordion',
                to: 'ui-accordion',					
            },
            {
                title: 'Alert',
                to: 'ui-alert',					
            },
            {
                title: 'Badge',
                to: 'ui-badge',					
            },
            {
                title: 'Button',
                to: 'ui-button',					
            },
            {
                title: 'Modal',
                to: 'ui-modal',					
            },
            {
                title: 'Button Group',
                to: 'ui-button-group',					
            },
            {
                title: 'List Group',
                to: 'ui-list-group',					
            },
            {
                title: 'Cards',
                to: 'ui-card',					
            },
            {
                title: 'Carousel',
                to: 'ui-carousel',					
            },
            {
                title: 'Dropdown',
                to: 'ui-dropdown',					
            },
            {
                title: 'Popover',
                to: 'ui-popover',					
            },
            {
                title: 'Progressbar',
                to: 'ui-progressbar',					
            },
            {
                title: 'Tab',
                to: 'ui-tab',					
            },
            {
                title: 'Typography',
                to: 'ui-typography',					
            },
            {
                title: 'Pagination',
                to: 'ui-pagination',					
            },
            {
                title: 'Grid',
                to: 'ui-grid',					
            },
        ]
    },
    //plugins
    {
        title:'Plugins',
        classsChange: 'mm-collapse',
        iconStyle : SVGICON.Plugins,
        extratitle : 'Plugins',
        content : [
            {
                title:'Select 2',
                to: 'uc-select2',
            },
            // {
            //     title:'Noui Slider',
            //     to: 'uc-noui-slider',
            // },
            {
                title:'Sweet Alert',
                to: 'uc-sweetalert',
            },
            {
                title:'Toastr',
                to: 'uc-toastr',
            },
            {
                title:'Jqv Map',
                to: 'map-jqvmap',
            },
            {
                title:'Light Gallery',
                to: 'uc-lightgallery',
            },
        ]
    },
    //Widget
    {   
        title:'Widget',
        //classsChange: 'mm-collapse',
        iconStyle: SVGICON.Widget,
        to: 'widget-basic',
    },
    //Forms
    {
        title:'Forms',
        classsChange: 'mm-collapse',
        iconStyle: SVGICON.Forms,
        extratitle : 'Forms',
        content : [
            {
                title:'Form Elements',
                to: 'form-element',
            },
            {
                title:'Wizard',
                to: 'form-wizard',
            },
            {
                title:'CkEditor',
                to: 'form-ckeditor',
            },
            {
                title:'Pickers',
                to: 'form-pickers',
            },
            {
                title:'Form Validate',
                to: 'form-validation',
            },

        ]
    },
    //Table
    {
        title:'Table',
        classsChange: 'mm-collapse',
        iconStyle:SVGICON.Table,
        extratitle : 'Table',
        content : [
            {
                title:'Table Filtering',
                to: 'table-filtering',
            },
            {
                title:'Table Sorting',
                to: 'table-sorting',
            },
            {
                title:'Bootstrap',
                to: 'table-bootstrap-basic',
            },
           

        ]
    },
    //Pages
    {
        title:'Pages',
        classsChange: 'mm-collapse',
        iconStyle: SVGICON.Pages,
        extratitle : 'Pages',
        content : [
            {
                title:'Error',
                hasMenu : true,
                content : [
                    {
                        title: 'Error 400',
                        to : 'page-error-400',
                    },
                    {
                        title: 'Error 403',
                        to : 'page-error-403',
                    },
                    {
                        title: 'Error 404',
                        to : 'page-error-404',
                    },
                    {
                        title: 'Error 500',
                        to : 'page-error-500',
                    },
                    {
                        title: 'Error 503',
                        to : 'page-error-503',
                    },
                ],
            },
            {
                title:'Lock Screen',
                to: 'page-lock-screen',
            },
            {
                title:"Empty Page",
                to:'empty-page'
            }

        ]
    },
    
]