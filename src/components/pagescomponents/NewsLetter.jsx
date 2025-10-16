import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { db } from "../../firebase/config"
import { doc, collection, query, where, getDocs, addDoc, serverTimestamp, onSnapshot } from "firebase/firestore"
import "./NewsLetter.css"

function NewsLetter() {
  const { tenantId } = useSelector((state) => state.tenant)

  const [settings, setSettings] = useState({
    title: "Subscribe to Our Newsletter",
    description: "Get the latest updates and news delivered to your inbox.",
    buttonText: "Subscribe",
    bgColor: "#667eea",
    textColor: "#ffffff",
    buttonBgColor: "#ffffff",
    buttonTextColor: "#667eea",
    enabled: true,
  })
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })

  useEffect(() => {
    if (!tenantId) return

    const settingsRef = doc(db, "tenants", tenantId, "data", "newsletterSettings")
    const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        setSettings({
          title: data.title || "Subscribe to Our Newsletter",
          description: data.description || "Get the latest updates and news delivered to your inbox.",
          buttonText: data.buttonText || "Subscribe",
          bgColor: data.bgColor || "#667eea",
          textColor: data.textColor || "#ffffff",
          buttonBgColor: data.buttonBgColor || "#ffffff",
          buttonTextColor: data.buttonTextColor || "#667eea",
          enabled: data.enabled !== undefined ? data.enabled : true,
        })
      }
    })

    return () => {
      unsubSettings()
    }
  }, [tenantId])

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSubscribe = async (e) => {
    e.preventDefault()
    setMessage({ text: "", type: "" })

    // Add tenantId check
    if (!tenantId) {
      setMessage({ text: "Configuration error. Please refresh the page.", type: "error" })
      return
    }

    if (!email.trim()) {
      setMessage({ text: "Please enter your email address.", type: "error" })
      return
    }

    if (!validateEmail(email)) {
      setMessage({ text: "Please enter a valid email address.", type: "error" })
      return
    }

    setLoading(true)

    try {
      const subscribersRef = collection(db, "tenants", tenantId, "newsletterSubscribers")
      
      // Try to check for existing subscriber, but don't fail if we can't read
      try {
        const q = query(subscribersRef, where("email", "==", email.toLowerCase()))
        const snapshot = await getDocs(q)

        if (!snapshot.empty) {
          setMessage({ text: "You're already subscribed!", type: "info" })
          setLoading(false)
          return
        }
      } catch (readError) {
        // If we can't read (which is expected based on your rules), just proceed with create
        console.log("Cannot check existing subscribers (expected behavior):", readError.message)
      }

      // Add new subscriber
      await addDoc(subscribersRef, {
        email: email.toLowerCase(),
        subscribedAt: serverTimestamp(),
        status: "active"
      })

      setMessage({ text: "Successfully subscribed! Thank you!", type: "success" })
      setEmail("")
    } catch (err) {
      console.error("Error subscribing:", err)
      console.error("Error code:", err.code)
      console.error("Error message:", err.message)
      
      // More specific error message
      if (err.code === "permission-denied") {
        setMessage({ text: "Permission error. Please contact support.", type: "error" })
      } else if (err.message && err.message.includes("already subscribed")) {
        setMessage({ text: "You're already subscribed!", type: "info" })
      } else {
        setMessage({ text: "Something went wrong. Please try again.", type: "error" })
      }
    } finally {
      setLoading(false)
    }
  }

  // Don't render if newsletter is disabled or tenantId is missing
  if (!settings.enabled || !tenantId) {
    return null
  }

  return (
    <div
      className="newsletter-container"
      style={{
        backgroundColor: settings.bgColor,
        color: settings.textColor,
      }}
    >
      <div className="newsletter-content">
        <h2 className="newsletter-title">{settings.title}</h2>
        <p className="newsletter-description">{settings.description}</p>

        <form onSubmit={handleSubscribe} className="newsletter-form">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="newsletter-input"
            disabled={loading}
          />
          <button
            type="submit"
            className="newsletter-button"
            style={{
              backgroundColor: settings.buttonBgColor,
              color: settings.buttonTextColor,
            }}
            disabled={loading}
          >
            {loading ? "Subscribing..." : settings.buttonText}
          </button>
        </form>

        {message.text && (
          <div className={`newsletter-message message-${message.type}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  )
}

export default NewsLetter