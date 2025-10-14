import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { db } from "../firebase/config"
import { doc, onSnapshot } from "firebase/firestore"

function Navbar() {
  const { tenantId } = useSelector((state) => state.tenant)
  const [logo, setLogo] = useState(null)
  const [navbarColors, setNavbarColors] = useState({
    background: "transparent",
    links: "#ffffff",
    logoText: "#ffffff",
  })
  const [menuOpen, setMenuOpen] = useState(false)

  // Load CMS data
  useEffect(() => {
    if (!tenantId) return

    const logoRef = doc(db, "tenants", tenantId, "data", "logo")
    const unsubLogo = onSnapshot(logoRef, (docSnap) => {
      if (docSnap.exists()) setLogo(docSnap.data())
    })

    const navbarRef = doc(db, "tenants", tenantId, "data", "navbarColors")
    const unsubNav = onSnapshot(navbarRef, (docSnap) => {
      if (docSnap.exists()) setNavbarColors(docSnap.data())
    })

    return () => {
      unsubLogo()
      unsubNav()
    }
  }, [tenantId])

  // Scroll transparency logic
  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector(".navbar")
      if (window.scrollY > 80) {
        navbar.style.backgroundColor = navbarColors.background !== "transparent"
          ? navbarColors.background
          : "rgba(0, 0, 0, 0.85)"
      } else {
        navbar.style.backgroundColor = "transparent"
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [navbarColors])

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="logo-text">
          {logo ? (
            logo.type === "text" ? (
              <Link to="/" style={{ color: navbarColors.logoText }}>
                {logo.text}
              </Link>
            ) : (
              <Link to="/">
                <img
                  src={logo.url || "/placeholder.svg"}
                  alt="Logo"
                  className="logo-image"
                />
              </Link>
            )
          ) : (
            <Link to="/" style={{ color: navbarColors.logoText }}>
              Business
            </Link>
          )}
        </div>

        {/* Hamburger */}
        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
          <span className={`bar ${menuOpen ? "open" : ""}`}></span>
          <span className={`bar ${menuOpen ? "open" : ""}`}></span>
          <span className={`bar ${menuOpen ? "open" : ""}`}></span>
        </div>

        {/* Menu Links */}
        <ul className={`nav-menu ${menuOpen ? "active" : ""}`}>
          {["Home", "About", "Services", "Projects", "Contact"].map((page) => (
            <li key={page}>
              <Link
                to={`/${page.toLowerCase() === "home" ? "" : page.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                style={{ color: navbarColors.links }}
              >
                {page}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
