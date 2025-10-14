import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "../../firebase/config"
import "./Testimonials.css"

function Testimonials() {
  const { tenantId } = useSelector((state) => state.tenant)

  const [reviews, setReviews] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showRateModal, setShowRateModal] = useState(false)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [email, setEmail] = useState("")
  const [isAllowed, setIsAllowed] = useState(false)
  const [averageRating, setAverageRating] = useState(0)

  // ✅ Mask email for display
  const maskEmail = (email) => {
    if (!email || !email.includes("@")) return ""
    const [name, domain] = email.split("@")
    const first = name.charAt(0)
    const last = name.charAt(name.length - 1)
    return `${first}...${last}@${domain}`
  }

  // 🔹 Fetch reviews per tenant (FIXED: Changed from top-level to subcollection)
  useEffect(() => {
    if (!tenantId) return
    const reviewsRef = collection(db, "tenants", tenantId, "reviews")
    const q = query(reviewsRef, orderBy("timestamp", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      setReviews(fetched)
      const avg =
        fetched.length > 0
          ? fetched.reduce((sum, r) => sum + (r.rating || 0), 0) / fetched.length
          : 0
      setAverageRating(avg.toFixed(1))
    })
    return unsubscribe
  }, [tenantId])

  // 🔹 Check if user is allowed and hasn't reviewed yet
  const handleEmailCheck = async () => {
    if (!tenantId) return alert("Invalid tenant.")
    if (!email.trim()) return alert("Please enter your email.")

    try {
      // Check if email is in allowed list
      const usersRef = collection(db, "tenants", tenantId, "users-rating")
      const q = query(usersRef, where("email", "==", email.trim()))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        alert("You are not allowed to submit a review.")
        setIsAllowed(false)
        return
      }

      // Check if they already reviewed
      const reviewsRef = collection(db, "tenants", tenantId, "reviews")
      const q2 = query(reviewsRef, where("email", "==", email.trim()))
      const existing = await getDocs(q2)
      if (!existing.empty) {
        alert("You have already submitted a review.")
        setIsAllowed(false)
        return
      }

      setIsAllowed(true)
      alert("✅ Verified! You can now leave a review.")
    } catch (err) {
      console.error(err)
      alert("Error verifying email.")
    }
  }

  // 🔹 Submit review
  const handleSubmitReview = async () => {
    if (!tenantId) return
    if (!isAllowed) return alert("Please verify your email first.")
    if (rating === 0 || reviewText.trim() === "") return alert("Please select a rating and enter a review.")

    try {
      const reviewsRef = collection(db, "tenants", tenantId, "reviews")
      await addDoc(reviewsRef, {
        email,
        rating,
        reviewText,
        timestamp: serverTimestamp(),
      })
      alert("✅ Thank you for your feedback!")
      setShowRateModal(false)
      setEmail("")
      setRating(0)
      setReviewText("")
      setIsAllowed(false)
    } catch (err) {
      console.error(err)
      alert("Error submitting review.")
    }
  }

  const visibleReviews = reviews.slice(0, 6)

  return (
    <div className="testimonialsContainer">
      <div className="testimonialHeader">
        <h2>Customer Testimonials</h2>
        <div className="averageRatingDisplay">
          <div className="starDisplay">
            {[1, 2, 3, 4, 5].map((num) => (
              <span key={num} className={`star ${num <= Math.round(averageRating) ? "filled" : ""}`}>
                ★
              </span>
            ))}
          </div>
          <p>{averageRating} / 5</p>
        </div>
        <button className="rateMeButton" onClick={() => setShowRateModal(true)}>
          Rate Me
        </button>
      </div>

      {/* Reviews Grid */}
      <div className="testimonialGrid">
        {visibleReviews.length > 0 ? (
          visibleReviews.map((r) => (
            <div className="testimonialCard" key={r.id}>
              <h4>{maskEmail(r.email)}</h4>
              <p className="stars">
                {"★".repeat(r.rating)}
                {"☆".repeat(5 - r.rating)}
              </p>
              <p className="reviewText">{r.reviewText}</p>
            </div>
          ))
        ) : (
          <p>No reviews yet.</p>
        )}
      </div>

      {reviews.length > 6 && (
        <button className="viewMoreButton" onClick={() => setShowModal(true)}>
          View More
        </button>
      )}

      {/* All Reviews Modal */}
      {showModal && (
        <div className="modalOverlay" onClick={() => setShowModal(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h3>All Reviews</h3>
            {reviews.map((r) => (
              <div className="testimonialCard" key={r.id}>
                <h4>{maskEmail(r.email)}</h4>
                <p className="stars">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </p>
                <p>{r.reviewText}</p>
              </div>
            ))}
            <button className="closeModal" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Rate Modal */}
      {showRateModal && (
        <div className="modalOverlay" onClick={() => setShowRateModal(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h3>Leave a Review</h3>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="verifyButton" onClick={handleEmailCheck}>
              Verify Email
            </button>

            <div
              className={`starsInput ${!isAllowed ? "disabled" : ""}`}
              style={{ pointerEvents: isAllowed ? "auto" : "none", opacity: isAllowed ? 1 : 0.4 }}
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <span
                  key={num}
                  className={`star ${num <= (hover || rating) ? "filled" : ""}`}
                  onClick={() => setRating(num)}
                  onMouseEnter={() => setHover(num)}
                  onMouseLeave={() => setHover(0)}
                >
                  ★
                </span>
              ))}
            </div>

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder={isAllowed ? "Write your review..." : "Please verify your email first..."}
              disabled={!isAllowed}
              style={{ opacity: isAllowed ? 1 : 0.5 }}
            />

            <div className="modalButtons">
              <button className="submitButton" onClick={handleSubmitReview}>
                Submit
              </button>
              <button className="closeModal" onClick={() => setShowRateModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Testimonials