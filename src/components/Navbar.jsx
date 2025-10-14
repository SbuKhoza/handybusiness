import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { db } from "../firebase/config"
import { doc, onSnapshot } from "firebase/firestore"
import "./Navbar.css"

function Navbar() {
  const { tenantId } = useSelector((state) => state.tenant)

  const [logo, setLogo] = useState(null)
  const [navbarColors, setNavbarColors] = useState({
    background: "rgba(0, 0, 0, 0.15)",
    links: "#ffffff",
    logoText: "#ffffff",
  })

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

  // Scroll effect (darken navbar when scrolling)
  useEffect(() => {
  const navbar = document.querySelector(".navbar")

  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled")
    } else {
      navbar.classList.remove("scrolled")
    }
  }

  window.addEventListener("scroll", handleScroll)
  return () => window.removeEventListener("scroll", handleScroll)
}, [])


  return (
    <nav
      className="navbar"
      style={{
        backgroundColor: navbarColors.background || "transparent",
      }}
    >
      <div className="navbar-container">
        <div className="logo">
          {logo ? (
            logo.type === "text" ? (
              <h2 style={{ color: navbarColors.logoText, margin: 0 }}>{logo.text}</h2>
            ) : (
              <img
                src={logo.url || "/placeholder.svg"}
                alt="Logo"
                className="logo-image"
              />
            )
          ) : (
            <h2 style={{ color: navbarColors.logoText, margin: 0 }}>Business</h2>
          )}
        </div>

        <ul className="nav-menu">
          <li>
            <Link to="/" style={{ color: navbarColors.links }}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" style={{ color: navbarColors.links }}>
              About
            </Link>
          </li>
          <li>
            <Link to="/services" style={{ color: navbarColors.links }}>
              Services
            </Link>
          </li>
          <li>
            <Link to="/projects" style={{ color: navbarColors.links }}>
              Projects
            </Link>
          </li>
          <li>
            <Link to="/contact" style={{ color: navbarColors.links }}>
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
