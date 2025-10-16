//user facing app
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { db } from "../firebase/config"
import { doc, onSnapshot } from "firebase/firestore"
import Slider from "react-slick"
import Services from "../components/pagescomponents/Services"
import Testimonials from "../components/pagescomponents/Testimonials"
import Footer from "../components/pagescomponents/Footer"
import Navbar from "../components/Navbar"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import "./pagestyling/Home.css"
import NewsLetter from "../components/pagescomponents/NewsLetter"

function Home() {
  const { tenantId } = useSelector((state) => state.tenant)
  const [homeData, setHomeData] = useState({
    bannerImages: [],
    rightImage: "",
    tagline: "Reliable 24/7",
    slogan: "The best service you need",
    shortDescription: "Professional services for your business needs.",
    rightImageFit: "cover",
    taglineColor: "#222222",
    sloganColor: "#222222",
    shortDescriptionColor: "#444444",
    primaryButtonText: "Book for a service",
    primaryButtonBgColor: "#f4b400",
    primaryButtonTextColor: "#000000",
    secondaryButtonText: "Call: 0123456789",
    secondaryButtonBgColor: "transparent",
    secondaryButtonTextColor: "#ffffff",
    secondaryButtonBorderColor: "#ffffff",
  })

  const [navbarColors, setNavbarColors] = useState({
    background: "transparent",
    links: "#ffffff",
    logoText: "#ffffff",
  })

  useEffect(() => {
    if (!tenantId) return

    const homepageRef = doc(db, "tenants", tenantId, "data", "homepage")
    const unsubscribeHome = onSnapshot(homepageRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        setHomeData((prev) => ({
          ...prev,
          ...data,
          bannerImages: Array.isArray(data.bannerImages)
            ? data.bannerImages
            : data.bannerImage
              ? [data.bannerImage]
              : [],
          rightImageFit: data.rightImageFit || "cover",
          taglineColor: data.taglineColor || "#222222",
          sloganColor: data.sloganColor || "#222222",
          shortDescriptionColor: data.shortDescriptionColor || "#444444",
          primaryButtonText: data.primaryButtonText || "Book for a service",
          primaryButtonBgColor: data.primaryButtonBgColor || "#f4b400",
          primaryButtonTextColor: data.primaryButtonTextColor || "#000000",
          secondaryButtonText: data.secondaryButtonText || "Call: 0123456789",
          secondaryButtonBgColor: data.secondaryButtonBgColor || "transparent",
          secondaryButtonTextColor: data.secondaryButtonTextColor || "#ffffff",
          secondaryButtonBorderColor: data.secondaryButtonBorderColor || "#ffffff",
        }))
      }
    })

    const navbarRef = doc(db, "tenants", tenantId, "data", "navbarColors")
    const unsubscribeNav = onSnapshot(navbarRef, (docSnap) => {
      if (docSnap.exists()) setNavbarColors(docSnap.data())
    })

    return () => {
      unsubscribeHome()
      unsubscribeNav()
    }
  }, [tenantId])

  const bannerImages =
    homeData.bannerImages && homeData.bannerImages.length > 0
      ? homeData.bannerImages
      : ["https://via.placeholder.com/1600x900?text=Banner+1"]

  const sliderSettings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    fade: true,
    speed: 800,
    swipeToSlide: true,
    pauseOnHover: false,
  }

  return (
    <div className="homecontainer">
      {/* Navbar over banner */}
      

      {/* Banner */}
      <div className="bannerSection">
        <Slider {...sliderSettings} className="bannerSlider">
          {bannerImages.map((img, i) => (
            <div key={i} className="bannerSlide">
              <img src={img || "/placeholder.svg"} alt={`Banner ${i}`} className="bannerImage" />
            </div>
          ))}
        </Slider>

        <div className="bannerOverlay">
          <div className="textSection">
            <h4 style={{ color: homeData.taglineColor }}>{homeData.tagline}</h4>
            <h1 style={{ color: homeData.sloganColor }}>{homeData.slogan}</h1>
            <p style={{ color: homeData.shortDescriptionColor }}>{homeData.shortDescription}</p>

            <div className="homeActionButtons">
              <button 
                className="primaryBtn"
                style={{
                  backgroundColor: homeData.primaryButtonBgColor,
                  color: homeData.primaryButtonTextColor,
                }}
              >
                {homeData.primaryButtonText}
              </button>
              <button 
                className="secondaryBtn"
                style={{
                  backgroundColor: homeData.secondaryButtonBgColor,
                  color: homeData.secondaryButtonTextColor,
                  borderColor: homeData.secondaryButtonBorderColor,
                }}
              >
                {homeData.secondaryButtonText}
              </button>
            </div>
          </div>

          <div className="rightImageWrapper">
            {/* <img
              src={homeData.rightImage || "https://via.placeholder.com/500x600?text=Right+Image"}
              alt="Right"
              className="rightImage"
              style={{ objectFit: homeData.rightImageFit || "cover" }}
            /> */}
          </div>
        </div>
      </div>

      <div className="homeServices">
        <Services />
      </div>

      <div className="homeTestimonials">
        <Testimonials />
      </div>

      <NewsLetter />

      <Footer />
    </div>
  )
}

export default Home