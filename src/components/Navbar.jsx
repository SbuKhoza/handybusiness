// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db, auth } from "../firebase/config";
import { doc, onSnapshot } from "firebase/firestore";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoData, setLogoData] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const logoRef = doc(db, "logos", user.uid);
        onSnapshot(logoRef, (docSnap) => {
          if (docSnap.exists()) {
            setLogoData(docSnap.data());
          } else {
            setLogoData(null);
          }
        });
      } else {
        setLogoData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Dynamic Logo */}
        <div className="navbar-logo">
          <Link to="/" onClick={closeMenu}>
            {logoData?.type === "image" && logoData.url ? (
              <img src={logoData.url} alt="Logo" className="logo-image" />
            ) : (
              <span className="logo-text">{logoData?.text || "MY LOGO"}</span>
            )}
          </Link>
        </div>

        {/* Hamburger Icon */}
        <div className="menu-icon" onClick={toggleMenu}>
          <div className={menuOpen ? "bar open" : "bar"}></div>
          <div className={menuOpen ? "bar open" : "bar"}></div>
          <div className={menuOpen ? "bar open" : "bar"}></div>
        </div>

        {/* Nav Links */}
        <ul className={menuOpen ? "nav-menu active" : "nav-menu"}>
          <li><Link to="/" onClick={closeMenu}>Home</Link></li>
          <li><Link to="/about" onClick={closeMenu}>About</Link></li>
          <li><Link to="/services" onClick={closeMenu}>Services</Link></li>
          <li><Link to="/projects" onClick={closeMenu}>Projects</Link></li>
          <li><Link to="/contact" onClick={closeMenu}>Contact</Link></li>
          
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
