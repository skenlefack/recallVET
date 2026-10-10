import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'

// Lazy loading spinner
const Loading = () => <div className="d-flex justify-content-center align-items-center py-5"><div className="spinner-border text-success" /></div>
const L = ({ children }) => <Suspense fallback={<Loading />}>{children}</Suspense>

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

// Dashboard
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'))
const AnalyticsDashboard = lazy(() => import('./pages/dashboard/AnalyticsDashboard'))

// Clinic
const PartyList = lazy(() => import('./pages/clinic/PartyList'))
const PartyForm = lazy(() => import('./pages/clinic/PartyForm'))
const AnimalList = lazy(() => import('./pages/clinic/AnimalList'))
const AnimalForm = lazy(() => import('./pages/clinic/AnimalForm'))
const AppointmentList = lazy(() => import('./pages/clinic/AppointmentList'))
const AppointmentForm = lazy(() => import('./pages/clinic/AppointmentForm'))
const EncounterList = lazy(() => import('./pages/clinic/EncounterList'))
const EncounterForm = lazy(() => import('./pages/clinic/EncounterForm'))
const VaccinationList = lazy(() => import('./pages/clinic/VaccinationList'))
const VaccinationForm = lazy(() => import('./pages/clinic/VaccinationForm'))
const LabRequestList = lazy(() => import('./pages/clinic/LabRequestList'))
const LabRequestForm = lazy(() => import('./pages/clinic/LabRequestForm'))
const ProtocolList = lazy(() => import('./pages/clinic/ProtocolList'))
const PrescriptionList = lazy(() => import('./pages/clinic/PrescriptionList'))
const PrescriptionForm = lazy(() => import('./pages/clinic/PrescriptionForm'))
const InvoiceList = lazy(() => import('./pages/clinic/InvoiceList'))
const InvoiceForm = lazy(() => import('./pages/clinic/InvoiceForm'))
const AppointmentCalendar = lazy(() => import('./pages/clinic/AppointmentCalendar'))
const HospitalizationList = lazy(() => import('./pages/clinic/HospitalizationList'))
const HospitalizationForm = lazy(() => import('./pages/clinic/HospitalizationForm'))
const SurgeryList = lazy(() => import('./pages/clinic/SurgeryList'))
const SurgeryForm = lazy(() => import('./pages/clinic/SurgeryForm'))

// Farm
const FarmList = lazy(() => import('./pages/farm/FarmList'))
const FarmForm = lazy(() => import('./pages/farm/FarmForm'))
const FarmView = lazy(() => import('./pages/farm/FarmView'))
const HerdList = lazy(() => import('./pages/farm/HerdList'))
const HerdForm = lazy(() => import('./pages/farm/HerdForm'))
const VisitList = lazy(() => import('./pages/farm/VisitList'))
const VisitForm = lazy(() => import('./pages/farm/VisitForm'))
const HealthEventList = lazy(() => import('./pages/farm/HealthEventList'))
const HealthEventForm = lazy(() => import('./pages/farm/HealthEventForm'))

// Pharmacy
const ProductList = lazy(() => import('./pages/pharmacy/ProductList'))
const ProductForm = lazy(() => import('./pages/pharmacy/ProductForm'))
const SupplierList = lazy(() => import('./pages/pharmacy/SupplierList'))
const SupplierForm = lazy(() => import('./pages/pharmacy/SupplierForm'))
const PurchaseOrderList = lazy(() => import('./pages/pharmacy/PurchaseOrderList'))
const PurchaseOrderForm = lazy(() => import('./pages/pharmacy/PurchaseOrderForm'))
const GoodsReceiptForm = lazy(() => import('./pages/pharmacy/GoodsReceiptForm'))
const StockOverview = lazy(() => import('./pages/pharmacy/StockOverview'))
const StockMovementList = lazy(() => import('./pages/pharmacy/StockMovementList'))
const StockMovementForm = lazy(() => import('./pages/pharmacy/StockMovementForm'))
const DispenseList = lazy(() => import('./pages/pharmacy/DispenseList'))
const DispenseForm = lazy(() => import('./pages/pharmacy/DispenseForm'))
const SalesList = lazy(() => import('./pages/pharmacy/SalesList'))
const RetailSaleForm = lazy(() => import('./pages/pharmacy/RetailSaleForm'))

// Settings
const Profile = lazy(() => import('./pages/settings/Profile'))
const SubscriptionPage = lazy(() => import('./pages/settings/Subscription'))
const TeamManagement = lazy(() => import('./pages/settings/TeamManagement'))
const TenantSettings = lazy(() => import('./pages/settings/TenantSettings'))
const ReferenceData = lazy(() => import('./pages/settings/ReferenceData'))
const BillingPage = lazy(() => import('./pages/settings/Billing'))

// Public pages
const AcceptInvite = lazy(() => import('./pages/auth/AcceptInvite'))

// Notifications
const NotificationList = lazy(() => import('./pages/notifications/NotificationList'))

// Superadmin
const PlatformDashboard = lazy(() => import('./pages/superadmin/PlatformDashboard'))
const TenantListAdmin = lazy(() => import('./pages/superadmin/TenantList'))
const TenantDetailAdmin = lazy(() => import('./pages/superadmin/TenantDetail'))
const SubscriptionListAdmin = lazy(() => import('./pages/superadmin/SubscriptionList'))
const UserListAdmin = lazy(() => import('./pages/superadmin/UserList'))
const DemoRequestListAdmin = lazy(() => import('./pages/superadmin/DemoRequestList'))
const ContactListAdmin = lazy(() => import('./pages/superadmin/ContactList'))
const AuditLogAdmin = lazy(() => import('./pages/superadmin/AuditLog'))

export default function AppRouter() {
  return (
    <Routes>
      {/* Auth */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/accept-invite" element={<L><AcceptInvite /></L>} />
      </Route>

      {/* App */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<L><Dashboard /></L>} />
        <Route path="/analytics" element={<L><AnalyticsDashboard /></L>} />

        {/* Notifications */}
        <Route path="/notifications" element={<L><NotificationList /></L>} />

        {/* Clinic */}
        <Route path="/clinic/parties" element={<L><PartyList /></L>} />
        <Route path="/clinic/parties/new" element={<L><PartyForm /></L>} />
        <Route path="/clinic/parties/:id" element={<L><PartyForm /></L>} />
        <Route path="/clinic/animals" element={<L><AnimalList /></L>} />
        <Route path="/clinic/animals/new" element={<L><AnimalForm /></L>} />
        <Route path="/clinic/animals/:id" element={<L><AnimalForm /></L>} />
        <Route path="/clinic/appointments" element={<L><AppointmentList /></L>} />
        <Route path="/clinic/appointments/new" element={<L><AppointmentForm /></L>} />
        <Route path="/clinic/appointments/:id" element={<L><AppointmentForm /></L>} />
        <Route path="/clinic/encounters" element={<L><EncounterList /></L>} />
        <Route path="/clinic/encounters/new" element={<L><EncounterForm /></L>} />
        <Route path="/clinic/encounters/:id" element={<L><EncounterForm /></L>} />
        <Route path="/clinic/vaccinations" element={<L><VaccinationList /></L>} />
        <Route path="/clinic/vaccinations/new" element={<L><VaccinationForm /></L>} />
        <Route path="/clinic/vaccinations/:id" element={<L><VaccinationForm /></L>} />
        <Route path="/clinic/lab" element={<L><LabRequestList /></L>} />
        <Route path="/clinic/lab/new" element={<L><LabRequestForm /></L>} />
        <Route path="/clinic/lab/:id" element={<L><LabRequestForm /></L>} />
        <Route path="/clinic/protocols" element={<L><ProtocolList /></L>} />
        <Route path="/clinic/prescriptions" element={<L><PrescriptionList /></L>} />
        <Route path="/clinic/prescriptions/new" element={<L><PrescriptionForm /></L>} />
        <Route path="/clinic/prescriptions/:id" element={<L><PrescriptionForm /></L>} />
        <Route path="/clinic/invoices" element={<L><InvoiceList /></L>} />
        <Route path="/clinic/invoices/new" element={<L><InvoiceForm /></L>} />
        <Route path="/clinic/invoices/:id" element={<L><InvoiceForm /></L>} />
        <Route path="/clinic/calendar" element={<L><AppointmentCalendar /></L>} />
        <Route path="/clinic/hospitalizations" element={<L><HospitalizationList /></L>} />
        <Route path="/clinic/hospitalizations/new" element={<L><HospitalizationForm /></L>} />
        <Route path="/clinic/hospitalizations/:id" element={<L><HospitalizationForm /></L>} />
        <Route path="/clinic/surgeries" element={<L><SurgeryList /></L>} />
        <Route path="/clinic/surgeries/new" element={<L><SurgeryForm /></L>} />
        <Route path="/clinic/surgeries/:id" element={<L><SurgeryForm /></L>} />

        {/* Farm */}
        <Route path="/farm/farms" element={<L><FarmList /></L>} />
        <Route path="/farm/farms/new" element={<L><FarmForm /></L>} />
        <Route path="/farm/farms/:id" element={<L><FarmView /></L>} />
        <Route path="/farm/farms/:id/edit" element={<L><FarmForm /></L>} />
        <Route path="/farm/herds" element={<L><HerdList /></L>} />
        <Route path="/farm/herds/new" element={<L><HerdForm /></L>} />
        <Route path="/farm/herds/:id" element={<L><HerdForm /></L>} />
        <Route path="/farm/visits" element={<L><VisitList /></L>} />
        <Route path="/farm/visits/new" element={<L><VisitForm /></L>} />
        <Route path="/farm/visits/:id" element={<L><VisitForm /></L>} />
        <Route path="/farm/health-events" element={<L><HealthEventList /></L>} />
        <Route path="/farm/health-events/new" element={<L><HealthEventForm /></L>} />
        <Route path="/farm/health-events/:id" element={<L><HealthEventForm /></L>} />

        {/* Pharmacy */}
        <Route path="/pharmacy/products" element={<L><ProductList /></L>} />
        <Route path="/pharmacy/products/new" element={<L><ProductForm /></L>} />
        <Route path="/pharmacy/products/:id" element={<L><ProductForm /></L>} />
        <Route path="/pharmacy/suppliers" element={<L><SupplierList /></L>} />
        <Route path="/pharmacy/suppliers/new" element={<L><SupplierForm /></L>} />
        <Route path="/pharmacy/suppliers/:id" element={<L><SupplierForm /></L>} />
        <Route path="/pharmacy/purchase-orders" element={<L><PurchaseOrderList /></L>} />
        <Route path="/pharmacy/purchase-orders/new" element={<L><PurchaseOrderForm /></L>} />
        <Route path="/pharmacy/purchase-orders/:id" element={<L><PurchaseOrderForm /></L>} />
        <Route path="/pharmacy/goods-receipts/new" element={<L><GoodsReceiptForm /></L>} />
        <Route path="/pharmacy/goods-receipts/:id" element={<L><GoodsReceiptForm /></L>} />
        <Route path="/pharmacy/stock" element={<L><StockOverview /></L>} />
        <Route path="/pharmacy/stock/movements" element={<L><StockMovementList /></L>} />
        <Route path="/pharmacy/stock/movement" element={<L><StockMovementForm /></L>} />
        <Route path="/pharmacy/dispensing" element={<L><DispenseList /></L>} />
        <Route path="/pharmacy/dispensing/new" element={<L><DispenseForm /></L>} />
        <Route path="/pharmacy/sales" element={<L><SalesList /></L>} />
        <Route path="/pharmacy/sales/new" element={<L><RetailSaleForm /></L>} />

        {/* Settings */}
        <Route path="/settings/profile" element={<L><Profile /></L>} />
        <Route path="/settings/subscription" element={<L><SubscriptionPage /></L>} />
        <Route path="/settings/team" element={<L><TeamManagement /></L>} />
        <Route path="/settings/tenant" element={<L><TenantSettings /></L>} />
        <Route path="/settings/reference" element={<L><ReferenceData /></L>} />
        <Route path="/settings/billing" element={<L><BillingPage /></L>} />

        {/* Superadmin */}
        <Route path="/superadmin/dashboard" element={<L><PlatformDashboard /></L>} />
        <Route path="/superadmin/tenants" element={<L><TenantListAdmin /></L>} />
        <Route path="/superadmin/tenants/:id" element={<L><TenantDetailAdmin /></L>} />
        <Route path="/superadmin/subscriptions" element={<L><SubscriptionListAdmin /></L>} />
        <Route path="/superadmin/users" element={<L><UserListAdmin /></L>} />
        <Route path="/superadmin/demo-requests" element={<L><DemoRequestListAdmin /></L>} />
        <Route path="/superadmin/contacts" element={<L><ContactListAdmin /></L>} />
        <Route path="/superadmin/audit-log" element={<L><AuditLogAdmin /></L>} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
