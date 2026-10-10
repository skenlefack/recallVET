import { AuthProvider } from './context/AuthContext'
import { TenantProvider } from './context/TenantContext'
import ErrorBoundary from './components/ErrorBoundary'
import AppRouter from './router'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <TenantProvider>
          <AppRouter />
        </TenantProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
