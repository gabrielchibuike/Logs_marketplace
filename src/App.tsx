import { AppProvider } from './context/AppContext'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { CatalogView } from './views/CatalogView'
import { GeneratorView } from './views/GeneratorView'
import { DashboardView } from './views/DashboardView'
import { AdminView } from './views/AdminView'
import { AuthModal } from './components/AuthModal'
import { LandingView } from './views/LandingView'
import { TermsView } from './views/TermsView'
import { PrivacyView } from './views/PrivacyView'
import { EscrowRulesView } from './views/EscrowRulesView'
import { DisputeResolutionView } from './views/DisputeResolutionView'
import { ResetPasswordView } from './views/ResetPasswordView'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-bg text-brand-text relative transition-smooth">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
        <Routes>
          <Route path="/" element={<LandingView />} />
          <Route path="/marketplace" element={<CatalogView />} />
          <Route path="/generator" element={<GeneratorView />} />
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/admin" element={<AdminView />} />
          <Route path="/terms" element={<TermsView />} />
          <Route path="/privacy" element={<PrivacyView />} />
          <Route path="/escrow-rules" element={<EscrowRulesView />} />
          <Route path="/dispute-resolution" element={<DisputeResolutionView />} />
          <Route path="/reset-password" element={<ResetPasswordView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <AuthModal />
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  )
}

export default App
