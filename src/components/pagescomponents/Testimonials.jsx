import React, { useEffect, useState } from "react"
import { db } from "../../firebase/config"
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
import "./Testimonials.css"

function Testimonials() {
  const [reviews, setReviews] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showRateModal, setShowRateModal] = useState(false)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [email, setEmail] = useState("")
  const [isAllowed, setIsAllowed] = useState(false)
  const [averageRating, setAverageRating] = useState(0)

  // ✅ Utility: Mask email
  const maskEmail = (email) => {
    if (!email || !email.includes("@")) return ""
    const [name, domain] = email.split("@")
    if (name.length <= 2) return email // short names unchanged
    const first = name.charAt(0)
    const last = name.charAt(name.length - 1)
    return `${first}...${last}@${domain}`
  }

  // 🔹 Fetch reviews + live average
  useEffect(() => {
    const reviewsRef = collection(db, "reviews")
    const q = query(reviewsRef, orderBy("timestamp", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      setReviews(fetched)

      if (fetched.length > 0) {
        const avg =
          fetched.reduce((sum, r) => sum + (r.rating || 0), 0) / fetched.length
        setAverageRating(avg.toFixed(1))
      } else {
        setAverageRating(0)
      }
    })
    return unsubscribe
  }, [])

  // 🔹 Verify email and check if already reviewed
  const handleEmailCheck = async () => {
    if (!email.trim()) {
      alert("Please enter your email.")
      return
    }

    try {
      // Check if email exists in users-rating collection
      const usersRef = collection(db, "users-rating")
      const q = query(usersRef, where("email", "==", email.trim()))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        alert("Email not found in our system. You are not allowed to review.")
        setIsAllowed(false)
        return
      }

      // Check if the same email already reviewed
      const reviewsRef = collection(db, "reviews")
      const q2 = query(reviewsRef, where("email", "==", email.trim()))
      const existing = await getDocs(q2)

      if (!existing.empty) {
        alert("You have already submitted a review.")
        setIsAllowed(false)
        return
      }

      setIsAllowed(true)
      alert("✅ Email verified! You can now leave your review.")
    } catch (error) {
      console.error("Error checking email:", error)
      alert("An error occurred while checking your email. Please try again.")
    }
  }

  // 🔹 Submit review
  const handleSubmitReview = async () => {
    if (!isAllowed) {
      alert("Please verify your email before submitting.")
      return
    }

    if (rating === 0 || reviewText.trim() === "") {
      alert("Please select a rating and write a review.")
      return
    }

    try {
      await addDoc(collection(db, "reviews"), {
        email,
        rating,
        reviewText,
        timestamp: serverTimestamp(),
      })
      alert("Thank you for your review!")
      setShowRateModal(false)
      setRating(0)
      setReviewText("")
      setEmail("")
      setIsAllowed(false)
    } catch (error) {
      console.error("Error adding review:", error)
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
              <span
                key={num}
                className={`star ${
                  num <= Math.round(averageRating) ? "filled" : ""
                }`}
              >
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

      {/* 🔹 Reviews Grid */}
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

      {/* 🔹 View All Modal */}
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

      {/* 🔹 Rate Modal */}
      {showRateModal && (
        <div className="modalOverlay" onClick={() => setShowRateModal(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h3>Leave a Review</h3>

            {/* Email Field */}
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="verifyButton" onClick={handleEmailCheck}>
              Verify Email
            </button>

            {/* Stars - Disabled until verified */}
            <div
              className={`starsInput ${!isAllowed ? "disabled" : ""}`}
              style={{
                pointerEvents: isAllowed ? "auto" : "none",
                opacity: isAllowed ? 1 : 0.4,
              }}
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

            {/* Review textarea - Disabled until verified */}
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder={
                isAllowed
                  ? "Write your review..."
                  : "Please verify your email first..."
              }
              disabled={!isAllowed}
              style={{ opacity: isAllowed ? 1 : 0.5 }}
            />

            <div className="modalButtons">
              <button className="submitButton" onClick={handleSubmitReview}>
                Submit
              </button>
              <button
                className="closeModal"
                onClick={() => setShowRateModal(false)}
              >
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
