import { useEffect, useState } from "react"
import { db, auth } from "../../firebase/config"
import { collection, doc, onSnapshot, query, orderBy } from "firebase/firestore"
import './ServicesComponent.css'

function Services() {
  const [user, setUser] = useState(null)
  const [servicesData, setServicesData] = useState([])
  const [servicesHeader, setServicesHeader] = useState({
    slogan: "",
    shortDescription: "",
  })

  // ✅ Watch auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser)
    return unsubscribe
  }, [])

  // ✅ Fetch services header + list
  useEffect(() => {
    if (!user) return

    // --- Header info ---
    const headerRef = doc(db, "users", user.uid, "servicesData", "header")
    const unsubHeader = onSnapshot(headerRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        setServicesHeader({
          slogan: data.slogan || "",
          shortDescription: data.shortDescription || "",
        })
      }
    })

    // --- Services list (ordered) ---
    const servicesRef = collection(db, "users", user.uid, "services")
    const servicesQuery = query(servicesRef, orderBy("order", "asc")) // 👈 sort by 'order'
    const unsubServices = onSnapshot(servicesQuery, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setServicesData(fetched)
    })

    return () => {
      unsubHeader()
      unsubServices()
    }
  }, [user])

  return (
    <div className="servicescontainer">
      {/* Header Section */}
      <div className="servicestext">
        <h5 id="servicesheadertext">WHAT WE OFFER</h5>
        <h2 id="serviceslogan">{servicesHeader.slogan}</h2>
        <span id="servicesshortdescription">{servicesHeader.shortDescription}</span>
      </div>

      {/* Services Listing */}
      <div className="servicesdescription">
        {servicesData.length > 0 ? (
          servicesData.map((service) => (
            <div className="servdescript" key={service.id}>
              <img
                src={
                  service.image ||
                  "https://via.placeholder.com/400x300?text=Service+Image" ||
                  "/placeholder.svg" ||
                  "/placeholder.svg"
                }
                alt={service.title || "Service image"}
              />
              <div className="service-content">
                <div className="service-icon">✓</div>
                <h3 className="service-title">{service.title || "Service"}</h3>
                <p id="servicedescription">{service.description || "No description provided."}</p>
                <h5 id="servicehire">Call Now: {service.phone || "0123456789"}</h5>
              </div>
            </div>
          ))
        ) : (
          <p>No services available yet.</p>
        )}
      </div>
    </div>
  )
}

export default Services
