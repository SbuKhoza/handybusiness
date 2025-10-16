import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { db } from "../firebase/config"
import { doc, onSnapshot } from "firebase/firestore"
import "./Contact.css"

function Contact() {
  const { tenantId } = useSelector((state) => state.tenant)

  const [contactData, setContactData] = useState({
    title: "",
    subtitle: "",
    bannerImage: "",
    headerBgColor: "#667eea",
    titleColor: "#ffffff",
    email: "",
    phone: "",
    address: "",
    workingHours: "",
    mapEmbedUrl: "",
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
  })

  useEffect(() => {
    if (!tenantId) return

    const contactRef = doc(db, "tenants", tenantId, "data", "contactPage")
    const unsubContact = onSnapshot(contactRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        setContactData({
          title: data.title || "",
          subtitle: data.subtitle || "",
          bannerImage: data.bannerImage || "",
          headerBgColor: data.headerBgColor || "#667eea",
          titleColor: data.titleColor || "#ffffff",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          workingHours: data.workingHours || "",
          mapEmbedUrl: data.mapEmbedUrl || "",
          facebook: data.facebook || "",
          twitter: data.twitter || "",
          instagram: data.instagram || "",
          linkedin: data.linkedin || "",
        })
      }
    })

    return () => {
      unsubContact()
    }
  }, [tenantId])

  return (
    <div className="contact-container">
      {/* Banner Section */}
      {contactData.bannerImage && (
        <div className="contact-banner">
          <img src={contactData.bannerImage} alt="Contact banner" className="contact-banner-img" />
          <div className="contact-banner-overlay">
            <h1 className="contact-banner-title" style={{ color: contactData.titleColor }}>
              {contactData.title || "Contact Us"}
            </h1>
            <p className="contact-banner-subtitle" style={{ color: contactData.titleColor }}>
              {contactData.subtitle}
            </p>
          </div>
        </div>
      )}

      {/* Header without banner */}
      {!contactData.bannerImage && (
        <div
          className="contact-header"
          style={{
            backgroundColor: contactData.headerBgColor,
            background: contactData.headerBgColor,
          }}
        >
          <h1 className="contact-title" style={{ color: contactData.titleColor }}>
            {contactData.title || "Contact Us"}
          </h1>
          <p className="contact-subtitle" style={{ color: contactData.titleColor }}>
            {contactData.subtitle}
          </p>
        </div>
      )}

      {/* Contact Content */}
      <div className="contact-content">
        <div className="contact-grid">
          {/* Contact Information Cards */}
          <div className="contact-info-section">
            <h2 className="section-heading">Get In Touch</h2>

            {contactData.email && (
              <div className="contact-card">
                <div className="contact-icon">📧</div>
                <h3>Email</h3>
                <a href={`mailto:${contactData.email}`} className="contact-link">
                  {contactData.email}
                </a>
              </div>
            )}

            {contactData.phone && (
              <div className="contact-card">
                <div className="contact-icon">📞</div>
                <h3>Phone</h3>
                <a href={`tel:${contactData.phone}`} className="contact-link">
                  {contactData.phone}
                </a>
              </div>
            )}

            {contactData.address && (
              <div className="contact-card">
                <div className="contact-icon">📍</div>
                <h3>Address</h3>
                <p className="contact-text">{contactData.address}</p>
              </div>
            )}

            {contactData.workingHours && (
              <div className="contact-card">
                <div className="contact-icon">🕐</div>
                <h3>Working Hours</h3>
                <p className="contact-text">{contactData.workingHours}</p>
              </div>
            )}

            {/* Social Media Links */}
            {(contactData.facebook || contactData.twitter || contactData.instagram || contactData.linkedin) && (
              <div className="social-links">
                <h3>Follow Us</h3>
                <div className="social-icons">
                  {contactData.facebook && (
                    <a
                      href={contactData.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-icon facebook"
                      title="Facebook"
                    >
                      f
                    </a>
                  )}
                  {contactData.twitter && (
                    <a
                      href={contactData.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-icon twitter"
                      title="Twitter"
                    >
                      𝕏
                    </a>
                  )}
                  {contactData.instagram && (
                    <a
                      href={contactData.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-icon instagram"
                      title="Instagram"
                    >
                      📷
                    </a>
                  )}
                  {contactData.linkedin && (
                    <a
                      href={contactData.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-icon linkedin"
                      title="LinkedIn"
                    >
                      in
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Google Maps */}
          {contactData.mapEmbedUrl && (
            <div className="map-section">
              <h2 className="section-heading">Find Us</h2>
              <div className="map-container">
                <iframe
                  src={contactData.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Location Map"
                ></iframe>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Contact