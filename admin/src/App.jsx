import { AuthProvider } from './context/AuthContext'
import { TenantProvider } from './context/TenantContext'
import { ThemeProvider } from './context/ThemeContext'
import ErrorBoundary from './components/ErrorBoundary'
import AppRouter from './router'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <TenantProvider>
          <ThemeProvider>
            <AppRouter />
          </ThemeProvider>
        </TenantProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
