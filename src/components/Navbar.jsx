import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db, auth } from "../firebase/config";
import { doc, onSnapshot } from "firebase/firestore";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoData, setLogoData] = useState(null);
  const [navbarColors, setNavbarColors] = useState({
    background: "transparent",
    links: "#ffffff",
    logoText: "#ffffff",
  });

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        // Logo
        const logoRef = doc(db, "logos", user.uid);
        onSnapshot(logoRef, (docSnap) => {
          if (docSnap.exists()) setLogoData(docSnap.data());
          else setLogoData(null);
        });

        // Navbar colors
        const navbarRef = doc(db, "navbarColors", user.uid);
        onSnapshot(navbarRef, (docSnap) => {
          if (docSnap.exists()) setNavbarColors(docSnap.data());
        });
      } else {
        setLogoData(null);
        setNavbarColors({
          background: "transparent",
          links: "#ffffff",
          logoText: "#ffffff",
        });
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav style={{ backgroundColor: navbarColors.background || "transparent" }} className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link
            to="/"
            onClick={closeMenu}
            style={{ color: navbarColors.logoText || "#ffffff" }}
          >
            {logoData?.type === "image" && logoData.url ? (
              <img src={logoData.url} alt="Logo" className="logo-image" />
            ) : (
              <span className="logo-text">{logoData?.text || "MY LOGO"}</span>
            )}
          </Link>
        </div>

        <div className="menu-icon" onClick={toggleMenu}>
          <div className={menuOpen ? "bar open" : "bar"}></div>
          <div className={menuOpen ? "bar open" : "bar"}></div>
          <div className={menuOpen ? "bar open" : "bar"}></div>
        </div>

        <ul className={menuOpen ? "nav-menu active" : "nav-menu"}>
          {["Home", "About", "Services", "Projects", "Contact"].map((link) => (
            <li key={link}>
              <Link
                to={`/${link.toLowerCase()}`}
                onClick={closeMenu}
                style={{ color: navbarColors.links || "#ffffff" }}
              >
                {link}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
