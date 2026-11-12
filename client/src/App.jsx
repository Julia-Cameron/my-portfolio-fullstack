// Main application component for the portfolio site. Handles routing and layout

import './App.css';
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import StarryBackground from './pages/StarryBackground';

// Import all page components and necessary libraries for routing

import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Services from './pages/Services';
import Projects from './pages/Projects';
import Education from './pages/Education';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Footer from './Footer';

// Main App component definition starts here.

function App() {
  const [session, setSession] = useState(null);

  return (
    <>
      <StarryBackground />      {/* Render the starry background for the entire application. */}
      <Router>
        <div className="app-container">
          {/* Navigation Bar */}
          <nav className="navbar">
            <div className="nav-logo-container">
              {/* Use the owner's initials until a custom logo is added. */}
              <div className="nav-logo-box">
                JC
              </div>
              <span className="nav-title">My Portfolio</span>
            </div>

            <div className="nav-links">
              <NavLink to="/" end className="nav-link">Home</NavLink>
              <NavLink to="/about" className="nav-link">About</NavLink>
              <NavLink to="/contact" className="nav-link">Contact</NavLink>
              <NavLink to="/services" className="nav-link">Services</NavLink>
              <NavLink to="/projects" className="nav-link">Projects</NavLink>
              <NavLink to="/education" className="nav-link">Education</NavLink>
              <NavLink to="/signin" className="nav-link">{session ? 'Account' : 'Sign In'}</NavLink>
              {!session && <NavLink to="/signup" className="nav-link">Sign Up</NavLink>}
            </div>
          </nav>

          <div className="content-container">
            {/* The current URL decides which page appears in this area. */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact session={session} />} />
              <Route path="/services" element={<Services session={session} />} />
              <Route path="/projects" element={<Projects session={session} />} />
              <Route path="/education" element={<Education session={session} />} />
              <Route path="/signin" element={<SignIn session={session} setSession={setSession} />} />
              <Route path="/signup" element={<SignUp session={session} />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router >
    </>
  );
}

export default App;   // Export the main App component for use in index.js
