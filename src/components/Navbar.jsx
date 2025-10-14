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

  useEffect(() => {
    if (!tenantId) return

    const logoRef = doc(db, "tenants", tenantId, "data", "logo")
    const unsubLogo = onSnapshot(logoRef, (docSnap) => {
      if (docSnap.exists()) {
        setLogo(docSnap.data())
      }
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

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector(".navbar")
      if (window.scrollY > 50) {
        navbar.style.backgroundColor = "rgba(0,0,0,0.85)"
      } else {
        navbar.style.backgroundColor = "transparent"
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className="navbar"
      style={{
        padding: "15px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div className="logo">
        {logo ? (
          logo.type === "text" ? (
            <h2 style={{ color: navbarColors.logoText, margin: 0 }}>{logo.text}</h2>
          ) : (
            <img src={logo.url || "/placeholder.svg"} alt="Logo" style={{ height: "40px" }} />
          )
        ) : (
          <h2 style={{ color: navbarColors.logoText, margin: 0 }}>Business</h2>
        )}
      </div>

      <ul style={{ display: "flex", gap: "20px", listStyle: "none", margin: 0, padding: 0 }}>
        <li>
          <Link to="/" style={{ color: navbarColors.links, textDecoration: "none" }}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/about" style={{ color: navbarColors.links, textDecoration: "none" }}>
            About
          </Link>
        </li>
        <li>
          <Link to="/services" style={{ color: navbarColors.links, textDecoration: "none" }}>
            Services
          </Link>
        </li>
        <li>
          <Link to="/projects" style={{ color: navbarColors.links, textDecoration: "none" }}>
            Projects
          </Link>
        </li>
        <li>
          <Link to="/contact" style={{ color: navbarColors.links, textDecoration: "none" }}>
            Contact
          </Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
