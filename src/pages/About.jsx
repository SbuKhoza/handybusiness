import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { db } from "../firebase/config"
import { collection, doc, onSnapshot, query, orderBy } from "firebase/firestore"
import "./About.css"

function About() {
  const { tenantId } = useSelector((state) => state.tenant)

  const [aboutHeader, setAboutHeader] = useState({
    title: "",
    subtitle: "",
    bannerImage: "",
  })
  const [sections, setSections] = useState([])

  useEffect(() => {
    if (!tenantId) return

    const headerRef = doc(db, "tenants", tenantId, "data", "aboutHeader")
    const unsubHeader = onSnapshot(headerRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        setAboutHeader({
          title: data.title || "",
          subtitle: data.subtitle || "",
          bannerImage: data.bannerImage || "",
        })
      }
    })

    const sectionsRef = collection(db, "tenants", tenantId, "aboutSections")
    const sectionsQuery = query(sectionsRef, orderBy("order", "asc"))
    const unsubSections = onSnapshot(sectionsQuery, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setSections(fetched)
    })

    return () => {
      unsubHeader()
      unsubSections()
    }
  }, [tenantId])

  return (
    <div className="about-container">
      {/* Banner Section */}
      {aboutHeader.bannerImage && (
        <div className="about-banner">
          <img src={aboutHeader.bannerImage} alt="About banner" className="banner-img" />
          <div className="banner-overlay">
            <h1 className="banner-title">{aboutHeader.title || "About Us"}</h1>
            <p className="banner-subtitle">{aboutHeader.subtitle}</p>
          </div>
        </div>
      )}

      {/* Header without banner */}
      {!aboutHeader.bannerImage && (
        <div className="about-header">
          <h1 className="about-title">{aboutHeader.title || "About Us"}</h1>
          <p className="about-subtitle">{aboutHeader.subtitle}</p>
        </div>
      )}

      {/* Content Sections */}
      <div className="about-content">
        {sections.length > 0 ? (
          sections.map((section, index) => (
            <div
              key={section.id}
              className={`content-section ${index % 2 === 0 ? "section-left" : "section-right"}`}
            >
              {section.image && (
                <div className="section-image-wrapper">
                  <img src={section.image} alt={section.title} className="section-img" />
                </div>
              )}
              <div className="section-text">
                <h2 className="section-heading">{section.title}</h2>
                <p className="section-paragraph">{section.content}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-content">
            <p>No content available yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default About