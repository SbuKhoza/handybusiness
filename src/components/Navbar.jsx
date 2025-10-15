import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link, useLocation } from "react-router-dom"
import { db } from "../firebase/config"
import { doc, onSnapshot } from "firebase/firestore"
import "./Navbar.css"

function Navbar() {
  const { tenantId } = useSelector((state) => state.tenant)
  const location = useLocation()
  const isHomePage = location.pathname === "/"

  const [logo, setLogo] = useState(null)
  const [navbarColors, setNavbarColors] = useState({
    background: "rgba(0, 0, 0, 0.15)",
    links: "#ffffff",
    logoText: "#ffffff",
    scrolledBackground: "rgb(5, 4, 4)",
    scrolledLinks: "#ffffff",
    scrolledLogoText: "#ffffff",
    otherPagesBackground: "#ffffff",
    otherPagesLinks: "#000000",
    otherPagesLogoText: "#000000",
  })
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!tenantId) return

    const logoRef = doc(db, "tenants", tenantId, "data", "logo")
    const unsubLogo = onSnapshot(logoRef, (docSnap) => {
      if (docSnap.exists()) setLogo(docSnap.data())
    })

    const navbarRef = doc(db, "tenants", tenantId, "data", "navbarColors")
    const unsubNav = onSnapshot(navbarRef, (docSnap) => {
      if (docSnap.exists()) {
        setNavbarColors({
          background: docSnap.data().background || "rgba(0, 0, 0, 0.15)",
          links: docSnap.data().links || "#ffffff",
          logoText: docSnap.data().logoText || "#ffffff",
          scrolledBackground: docSnap.data().scrolledBackground || "rgb(5, 4, 4)",
          scrolledLinks: docSnap.data().scrolledLinks || "#ffffff",
          scrolledLogoText: docSnap.data().scrolledLogoText || "#ffffff",
          otherPagesBackground: docSnap.data().otherPagesBackground || "#ffffff",
          otherPagesLinks: docSnap.data().otherPagesLinks || "#000000",
          otherPagesLogoText: docSnap.data().otherPagesLogoText || "#000000",
        })
      }
    })

    return () => {
      unsubLogo()
      unsubNav()
    }
  }, [tenantId])

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Determine which colors to use
  const getCurrentColors = () => {
    if (!isHomePage) {
      // Other pages use their own colors
      return {
        background: navbarColors.otherPagesBackground || "#ffffff",
        links: navbarColors.otherPagesLinks || "#000000",
        logoText: navbarColors.otherPagesLogoText || "#000000",
      }
    }
    
    // Homepage uses initial or scrolled colors
    if (isScrolled) {
      return {
        background: navbarColors.scrolledBackground || "rgb(5, 4, 4)",
        links: navbarColors.scrolledLinks || "#ffffff",
        logoText: navbarColors.scrolledLogoText || "#ffffff",
      }
    }
    
    return {
      background: navbarColors.background || "transparent",
      links: navbarColors.links || "#ffffff",
      logoText: navbarColors.logoText || "#ffffff",
    }
  }

  const currentColors = getCurrentColors()

  return (
    <nav
      className={`navbar ${isScrolled ? 'scrolled' : ''}`}
      style={{
        backgroundColor: currentColors.background,
      }}
    >
      <div className="navbar-container">
        <div className="logo">
          <Link to="/" style={{ textDecoration: 'none' }}>
            {logo ? (
              logo.type === "text" ? (
                <h2 style={{ color: currentColors.logoText, margin: 0 }}>{logo.text}</h2>
              ) : (
                <img
                  src={logo.url || "/placeholder.svg"}
                  alt="Logo"
                  className="logo-image"
                />
              )
            ) : (
              <h2 style={{ color: currentColors.logoText, margin: 0 }}>Business</h2>
            )}
          </Link>
        </div>

        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
          <div className={`bar ${menuOpen ? 'open' : ''}`}></div>
          <div className={`bar ${menuOpen ? 'open' : ''}`}></div>
          <div className={`bar ${menuOpen ? 'open' : ''}`}></div>
        </div>

        <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <li>
            <Link to="/" style={{ color: currentColors.links }} onClick={() => setMenuOpen(false)}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" style={{ color: currentColors.links }} onClick={() => setMenuOpen(false)}>
              About
            </Link>
          </li>
          <li>
            <Link to="/services" style={{ color: currentColors.links }} onClick={() => setMenuOpen(false)}>
              Services
            </Link>
          </li>
          <li>
            <Link to="/projects" style={{ color: currentColors.links }} onClick={() => setMenuOpen(false)}>
              Projects
            </Link>
          </li>
          <li>
            <Link to="/contact" style={{ color: currentColors.links }} onClick={() => setMenuOpen(false)}>
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar