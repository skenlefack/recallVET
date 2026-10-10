import { AuthProvider } from './context/AuthContext'
import { TenantProvider } from './context/TenantContext'
import AppRouter from './router'

function App() {
  return (
    <AuthProvider>
      <TenantProvider>
        <AppRouter />
      </TenantProvider>
    </AuthProvider>
  )
}

export default App
