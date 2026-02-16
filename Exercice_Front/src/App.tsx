import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { PrescriptionsPage } from './features/prescriptions/pages/PrescriptionsPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-container">
            <h1 className="navbar-brand">Gestion des Prescriptions</h1>
            <ul className="navbar-menu">
              <li>
                <Link to="/" className="navbar-link">
                  Prescriptions
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<PrescriptionsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
