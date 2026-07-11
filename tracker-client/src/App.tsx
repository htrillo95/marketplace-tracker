import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppDataProvider } from './context/AppDataContext'
import { Layout } from './components/Layout'
import { DashboardPage } from './pages/DashboardPage'
import { SearchWorkspacePage } from './pages/SearchWorkspacePage'

function App() {
  return (
    <BrowserRouter>
      <AppDataProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="search/:id" element={<SearchWorkspacePage />} />
            <Route path="manage" element={<Navigate to="/" replace />} />
            <Route path="searches" element={<Navigate to="/" replace />} />
            <Route path="watchlist" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AppDataProvider>
    </BrowserRouter>
  )
}

export default App
