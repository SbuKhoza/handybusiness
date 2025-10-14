"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { db } from "../../firebase/config"
import { collection, doc, onSnapshot, query, orderBy } from "firebase/firestore"
import "./ServicesComponent.css"

function Services() {
  const { tenantId } = useSelector((state) => state.tenant)

  const [servicesData, setServicesData] = useState([])
  const [servicesHeader, setServicesHeader] = useState({
    slogan: "",
    shortDescription: "",
  })

  useEffect(() => {
    if (!tenantId) return

    const headerRef = doc(db, "tenants", tenantId, "data", "servicesHeader")
    const unsubHeader = onSnapshot(headerRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        setServicesHeader({
          slogan: data.slogan || "",
          shortDescription: data.shortDescription || "",
        })
      }
    })

    const servicesRef = collection(db, "tenants", tenantId, "services")
    const servicesQuery = query(servicesRef, orderBy("order", "asc"))
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
  }, [tenantId])

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
                src={service.image || "https://via.placeholder.com/400x300?text=Service+Image"}
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
