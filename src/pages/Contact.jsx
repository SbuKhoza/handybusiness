"use client"

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
          <img
            src={contactData.bannerImage || "/placeholder.svg"}
            alt="Contact banner"
            className="contact-banner-img"
          />
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
                <div className="contact-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 7l-10 7L2 7" />
                  </svg>
                </div>
                <div className="contact-card-content">
                  <h3>Email</h3>
                  <a href={`mailto:${contactData.email}`} className="contact-link">
                    {contactData.email}
                  </a>
                </div>
              </div>
            )}

            {contactData.phone && (
              <div className="contact-card">
                <div className="contact-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                </div>
                <div className="contact-card-content">
                  <h3>Phone</h3>
                  <a href={`tel:${contactData.phone}`} className="contact-link">
                    {contactData.phone}
                  </a>
                </div>
              </div>
            )}

            {contactData.address && (
              <div className="contact-card">
                <div className="contact-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="contact-card-content">
                  <h3>Address</h3>
                  <p className="contact-text">{contactData.address}</p>
                </div>
              </div>
            )}

            {contactData.workingHours && (
              <div className="contact-card">
                <div className="contact-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <div className="contact-card-content">
                  <h3>Working Hours</h3>
                  <p className="contact-text">{contactData.workingHours}</p>
                </div>
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
                      className="social-icon"
                      title="Facebook"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                  )}
                  {contactData.twitter && (
                    <a
                      href={contactData.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-icon"
                      title="Twitter"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                  )}
                  {contactData.instagram && (
                    <a
                      href={contactData.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-icon"
                      title="Instagram"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                  )}
                  {contactData.linkedin && (
                    <a
                      href={contactData.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-icon"
                      title="LinkedIn"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
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
