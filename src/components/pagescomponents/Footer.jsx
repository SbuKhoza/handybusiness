import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { db } from "../../firebase/config";
import { doc, onSnapshot } from "firebase/firestore";
import "./Footer.css";

// ✅ Use React Icons instead of SVGs
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

function Footer() {
  const { tenantId } = useSelector((state) => state.tenant);

  const [footerData, setFooterData] = useState({
    companyName: "Your Company",
    companyDescription: "Your business description goes here.",
    quickLinks: [
      { text: "Home", url: "/" },
      { text: "About", url: "/about" },
      { text: "Contact", url: "/contact" },
    ],
    address: "Your Address Here",
    email: "info@yourcompany.com",
    phone: "+27 00 000 0000",
    facebook: "",
    twitter: "",
    linkedin: "",
    instagram: "",
    copyrightText: "© 2025 Your Company. All rights reserved.",
    privacyPolicyUrl: "/privacy",
    termsOfServiceUrl: "/terms",
    backgroundColor: "#2b2d42",
    textColor: "#e0e0e0",
    headingColor: "#ffffff",
    linkColor: "#a0a0a0",
    linkHoverColor: "#f4b400",
    accentColor: "#4361ee",
    bottomBarBgColor: "#1a1b2e",
  });

  useEffect(() => {
    if (!tenantId) return;

    const footerRef = doc(db, "tenants", tenantId, "data", "footer");
    const unsubscribe = onSnapshot(footerRef, (docSnap) => {
      if (docSnap.exists()) {
        setFooterData((prev) => ({ ...prev, ...docSnap.data() }));
      }
    });

    return () => unsubscribe();
  }, [tenantId]);

  return (
    <footer
      className="footer"
      style={{
        backgroundColor: footerData.backgroundColor,
        color: footerData.textColor,
      }}
    >
      <div className="footer-container">
        {/* Company Section */}
        <div className="footer-column">
          <h3
            className="footer-heading"
            style={{
              color: footerData.headingColor,
              borderBottomColor: footerData.accentColor,
            }}
          >
            {footerData.companyName}
          </h3>
          <p className="footer-description">{footerData.companyDescription}</p>

          {/* ✅ Social Media Icons (Dynamic Links from Firestore) */}
          <div className="social-icons">
            {footerData.facebook && (
              <a
                href={footerData.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="Facebook"
              >
                <FaFacebookF />
              </a>
            )}
            {footerData.twitter && (
              <a
                href={footerData.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="Twitter"
              >
                <FaTwitter />
              </a>
            )}
            {footerData.instagram && (
              <a
                href={footerData.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
            )}
            {footerData.linkedin && (
              <a
                href={footerData.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn />
              </a>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-column">
          <h3
            className="footer-heading"
            style={{
              color: footerData.headingColor,
              borderBottomColor: footerData.accentColor,
            }}
          >
            Quick Links
          </h3>
          <ul className="footer-links">
            {footerData.quickLinks.map((link, index) => (
              <li key={index}>
                <Link
                  to={link.url}
                  style={{ color: footerData.linkColor }}
                  onMouseEnter={(e) =>
                    (e.target.style.color = footerData.linkHoverColor)
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.color = footerData.linkColor)
                  }
                >
                  {link.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Us */}
        <div className="footer-column">
          <h3
            className="footer-heading"
            style={{
              color: footerData.headingColor,
              borderBottomColor: footerData.accentColor,
            }}
          >
            Contact Us
          </h3>
          <div className="contact-info">
            <div className="contact-item">
              <span>{footerData.address}</span>
            </div>
            <div className="contact-item">
              <a href={`mailto:${footerData.email}`} style={{ color: footerData.linkColor }}>
                {footerData.email}
              </a>
            </div>
            <div className="contact-item">
              <a href={`tel:${footerData.phone}`} style={{ color: footerData.linkColor }}>
                {footerData.phone}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className="footer-bottom"
        style={{ backgroundColor: footerData.bottomBarBgColor }}
      >
        <div className="footer-bottom-container">
          <p className="copyright">
            {footerData.copyrightText} | by
            <a href="https://malloyagroup.co.za" target="_blank" rel="noreferrer">
              {" "}
              MalloyaTech
            </a>
          </p>
          <div className="footer-bottom-links">
            <Link to={footerData.privacyPolicyUrl} style={{ color: footerData.linkColor }}>
              Privacy Policy
            </Link>
            <Link to={footerData.termsOfServiceUrl} style={{ color: footerData.linkColor }}>
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
