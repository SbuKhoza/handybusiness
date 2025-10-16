"use client"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Provider } from "react-redux"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { store } from "./redux/store/store"
import { detectTenantId, validateTenant } from "./utils/tenantDetection"
import { setTenantId, setTenantData, setLoading, setError } from "./redux/slices/tenantSlice"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import About from "./pages/About"
import Service from "./pages/Service"
import Projects from "./pages/Projects"
import Contact from "./pages/Contact"
import PageNotFound from "./pages/Pagenotfound"

function TenantInitializer({ children }) {
  const dispatch = useDispatch()
  const { tenantId, loading, error } = useSelector((state) => state.tenant)

  useEffect(() => {
    const initializeTenant = async () => {
      try {
        dispatch(setLoading(true))
        const detectedTenantId = await detectTenantId()
        const tenantData = await validateTenant(detectedTenantId)

        dispatch(setTenantId(detectedTenantId))
        dispatch(setTenantData(tenantData))
        dispatch(setLoading(false))
      } catch (err) {
        console.error("[v0] Failed to initialize tenant:", err)
        dispatch(setError(err.message))
      }
    }

    if (!tenantId) {
      initializeTenant()
    }
  }, [dispatch, tenantId])

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
        }}
      >
        Loading...
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h2>Unable to Load Site</h2>
        <p style={{ color: "#dc3545", marginTop: "10px" }}>{error}</p>
        <p style={{ marginTop: "20px", color: "#666" }}>Please check your domain configuration or contact support.</p>
      </div>
    )
  }

  return children
}

function App() {
  return (
    <Provider store={store}>
      <TenantInitializer>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/service" element={<Service />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
      </TenantInitializer>
    </Provider>
  )
}

export default App
