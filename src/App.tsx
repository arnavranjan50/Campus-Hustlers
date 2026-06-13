import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Services from './pages/Services'
import Hackathons from './pages/Hackathons'
import Dashboard from './pages/Dashboard'
import Payment from './pages/Payment'
import Login from './pages/Login'
import Signup from './pages/Signup'
import About from './pages/About'
import FAQ from './pages/FAQ'
import BookingSuccess from './pages/BookingSuccess'
import Loader from './components/Loader'

function App() {
  const location = useLocation()
  const [loading, setLoading] = useState(true)

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && <Loader onFinished={() => setLoading(false)} />}
      </AnimatePresence>

      <div className="app">
        <Navbar />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/hackathons" element={<Hackathons />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/booking-success" element={<BookingSuccess />} />
          </Routes>
        </AnimatePresence>
        <Footer />
      </div>
    </>
  )
}

export default App
