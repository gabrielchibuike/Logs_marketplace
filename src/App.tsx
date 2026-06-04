import { AppProvider, useApp } from './context/AppContext'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { CatalogView } from './views/CatalogView'
import { GeneratorView } from './views/GeneratorView'
import { DashboardView } from './views/DashboardView'
import { WalletView } from './views/WalletView'

function AppContent() {
  const { activeTab } = useApp();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'catalog':
        return <CatalogView />;
      case 'generator':
        return <GeneratorView />;
      case 'dashboard':
        return <DashboardView />;
      case 'wallet':
        return <WalletView />;
      default:
        return <CatalogView />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-cyber-dark text-slate-100 cyber-grid scanline relative">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {renderActiveView()}
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
