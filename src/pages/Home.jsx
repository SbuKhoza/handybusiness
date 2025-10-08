// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase/config";
import { doc, onSnapshot } from "firebase/firestore";
import Slider from "react-slick"; // ✅ Import slider
import Services from "../components/pagescomponents/Services";
import Testimonials from "../components/pagescomponents/Testimonials";
import Footer from "../components/pagescomponents/Footer";
import "slick-carousel/slick/slick.css"; // ✅ Import slick styles
import "slick-carousel/slick/slick-theme.css";
import "./pagestyling/Home.css";

function Home() {
  const [user, setUser] = useState(null);
  const [homeData, setHomeData] = useState({
    bannerImages: [],
    rightImage: "",
    tagline: "Reliable 24/7",
    slogan: "The best plumber you need",
    shortDescription:
      "From emergency repairs to complete plumbing services, our certified plumbers deliver safe, reliable, and affordable plumbing solutions for your home and business.",
  });

  // ✅ Watch for auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  // ✅ Fetch homepage data
  useEffect(() => {
    if (!user) return;
    const homepageRef = doc(db, "homepage", user.uid);
    const unsubscribe = onSnapshot(homepageRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setHomeData({
          ...data,
          bannerImages: Array.isArray(data.bannerImages)
            ? data.bannerImages
            : data.bannerImage
            ? [data.bannerImage]
            : [],
        });
      }
    });
    return unsubscribe;
  }, [user]);

  // ✅ Safe fallback images
  const bannerImages =
    homeData.bannerImages && homeData.bannerImages.length > 0
      ? homeData.bannerImages
      : [
          "https://via.placeholder.com/1600x900?text=Banner+1",
          "https://via.placeholder.com/1600x900?text=Banner+2",
        ];

  // ✅ Slick settings
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
  };

  return (
    <div className="homecontainer">
      {/* Banner Section */}
      <div className="bannerSection">
        <Slider {...sliderSettings} className="bannerSlider">
          {bannerImages.map((img, i) => (
            <div key={i} className="bannerSlide">
              <img src={img} alt={`Banner ${i}`} className="bannerImage" />
            </div>
          ))}
        </Slider>

        {/* Overlay Content */}
        <div className="bannerOverlay">
          <div className="textSection">
            <h4>{homeData.tagline}</h4>
            <h1>{homeData.slogan}</h1>
            <p>{homeData.shortDescription}</p>

            <div className="homeActionButtons">
              <button className="primaryBtn">Book for a service</button>
              <button className="secondaryBtn">Call: 0123456789</button>
            </div>
          </div>

          <div className="rightImageWrapper">
            <img
              src={
                homeData.rightImage ||
                "https://via.placeholder.com/500x600?text=Right+Image"
              }
              alt="Right"
              className="rightImage"
            />
          </div>
        </div>
      </div>

      {/* Sections Below */}
      <div className="homeServices">
        <Services />
      </div>

      <div className="homeTestimonials">
        <Testimonials />
      </div>

      <Footer />
    </div>
  );
}

export default Home;
