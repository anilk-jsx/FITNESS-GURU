import React, { useEffect, useRef, useState } from "react";
import "./Membership.css";

const Membership = () => {
  const [inView, setInView] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const sectionRef = useRef(null);
  const cardsRef = useRef(null);
  const [activeCard, setActiveCard] = useState(1);

  const pricingPlans = {
    monthly: {
      basic: { price: 1499, period: "month" },
      premium: { price: 2499, period: "month" },
      elite: { price: 3999, period: "month" },
    },
    quarterly: {
      basic: { price: 3999, period: "3 months", savings: "10%" },
      premium: { price: 6499, period: "3 months", savings: "13%" },
      elite: { price: 10499, period: "3 months", savings: "12%" },
    },
    annually: {
      basic: { price: 14999, period: "year", savings: "17%" },
      premium: { price: 23999, period: "year", savings: "20%" },
      elite: { price: 38999, period: "year", savings: "19%" },
    },
  };

  const planFeatures = {
    basic: [
      "Full gym access",
      "Locker room facilities",
      "Basic fitness assessment",
      "Mobile app access",
      "Community support",
    ],
    premium: [
      "Everything in Basic",
      "Group fitness classes",
      "Personal training session",
      "Wellness center access",
      "Nutrition consultation",
      "Guest passes (2/month)",
    ],
    elite: [
      "Everything in Premium",
      "Unlimited personal training",
      "Priority class booking",
      "Massage therapy sessions",
      "Custom meal planning",
      "VIP locker room access",
    ],
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px",
      },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const container = cardsRef.current;
    if (!container) return;

    const handleScroll = () => {
      const cards = container.querySelectorAll(".pricing-card");

      const center = container.scrollLeft + container.offsetWidth / 2;

      let closestIndex = 0;
      let minDistance = Infinity;

      cards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;

        const distance = Math.abs(center - cardCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      setActiveCard(closestIndex);
    };

    container.addEventListener("scroll", handleScroll);

    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
  const container = cardsRef.current;
  if (!container) return;

  // only carousel mode
  if (window.innerWidth >= 1024) return;

  const cards = container.querySelectorAll(".pricing-card");
  const middleCard = cards[1]; // Premium card

  if (!middleCard) return;

  const scrollTo =
    middleCard.offsetLeft -
    container.offsetWidth / 2 +
    middleCard.offsetWidth / 2;

  container.scrollTo({
    left: scrollTo,
    behavior: "auto", // IMPORTANT → no animation on refresh
  });
}, []);

  const handlePlanChange = (plan) => {
    if (plan === selectedPlan) return;

    setIsChangingPlan(true);

    setTimeout(() => {
      setSelectedPlan(plan);
      setTimeout(() => {
        setIsChangingPlan(false);
      }, 50);
    }, 150);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN").format(price);
  };

  return (
    <section
      id="membership"
      ref={sectionRef}
      className={`membership-section ${inView ? "in-view" : ""}`}
    >
      {/* Background Elements */}
      <div className="membership-bg-elements">
        <div className="membership-circle membership-circle-1"></div>
        <div className="membership-circle membership-circle-2"></div>
        <div className="membership-circle membership-circle-3"></div>
        <div className="membership-circle membership-circle-4"></div>
        <div className="membership-gradient-overlay"></div>
      </div>

      <div className="membership-container">
        {/* Section Header */}
        <div className="membership-header">
          <span className="membership-tag">Pricing Plans</span>
          <h2 className="membership-title">
            Choose Your <span className="highlight">Membership</span>
          </h2>
          <p className="membership-subtitle">
            Select the perfect plan to start your fitness journey with us
          </p>
        </div>

        {/* Plan Toggle */}
        <div className="plan-toggle">
          <button
            className={`toggle-btn ${selectedPlan === "monthly" ? "active" : ""}`}
            onClick={() => handlePlanChange("monthly")}
          >
            Monthly
          </button>
          <button
            className={`toggle-btn ${selectedPlan === "quarterly" ? "active" : ""}`}
            onClick={() => handlePlanChange("quarterly")}
          >
            Quarterly
          </button>
          <button
            className={`toggle-btn ${selectedPlan === "annually" ? "active" : ""}`}
            onClick={() => handlePlanChange("annually")}
          >
            Annually
          </button>
        </div>

        {/* Pricing Cards */}
        <div
          ref={cardsRef}
          className={`pricing-cards swipe-carousel ${
            isChangingPlan ? "plan-changing" : "plan-changed"
          }`}
        >
          {/* Basic Plan */}
          <div className={`pricing-card basic-card ${activeCard === 0 ? "center-card" : ""}`}>
            <div className="card-header">
              <h3 className="plan-name">Basic</h3>
              {pricingPlans[selectedPlan].basic.savings && (
                <div className="savings-badge">
                  Save {pricingPlans[selectedPlan].basic.savings}
                </div>
              )}
            </div>
            <div
              className={`price-section ${isChangingPlan ? "price-changing" : "price-changed"}`}
            >
              <span className="currency">₹</span>
              <span className="price">
                {formatPrice(pricingPlans[selectedPlan].basic.price)}
              </span>
              <span className="period">
                per {pricingPlans[selectedPlan].basic.period}
              </span>
            </div>
            <ul className="features-list">
              {planFeatures.basic.map((feature, index) => (
                <li key={index} className="feature-item">
                  <svg
                    className="check-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button className="plan-btn basic-btn">Get Started</button>
          </div>

          {/* Premium Plan */}
          <div className={`pricing-card premium-card popular ${activeCard === 1 ? "center-card" : ""}`}>
            <div className="popular-badge">POPULAR</div>
            <div className="card-header">
              <h3 className="plan-name">Premium</h3>
              {pricingPlans[selectedPlan].premium.savings && (
                <div className="savings-badge">
                  Save {pricingPlans[selectedPlan].premium.savings}
                </div>
              )}
            </div>
            <div
              className={`price-section ${isChangingPlan ? "price-changing" : "price-changed"}`}
            >
              <span className="currency">₹</span>
              <span className="price">
                {formatPrice(pricingPlans[selectedPlan].premium.price)}
              </span>
              <span className="period">
                per {pricingPlans[selectedPlan].premium.period}
              </span>
            </div>
            <ul className="features-list">
              {planFeatures.premium.map((feature, index) => (
                <li key={index} className="feature-item">
                  <svg
                    className="check-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button className="plan-btn premium-btn">Most Popular</button>
          </div>

          {/* Elite Plan */}
          <div className={`pricing-card elite-card ${activeCard === 2 ? "center-card" : ""}`}>
            <div className="card-header">
              <h3 className="plan-name">Elite</h3>
              {pricingPlans[selectedPlan].elite.savings && (
                <div className="savings-badge">
                  Save {pricingPlans[selectedPlan].elite.savings}
                </div>
              )}
            </div>
            <div
              className={`price-section ${isChangingPlan ? "price-changing" : "price-changed"}`}
            >
              <span className="currency">₹</span>
              <span className="price">
                {formatPrice(pricingPlans[selectedPlan].elite.price)}
              </span>
              <span className="period">
                per {pricingPlans[selectedPlan].elite.period}
              </span>
            </div>
            <ul className="features-list">
              {planFeatures.elite.map((feature, index) => (
                <li key={index} className="feature-item">
                  <svg
                    className="check-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button className="plan-btn elite-btn">Go Elite</button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="membership-footer">
          <p className="footer-text">
            All memberships include access to our state-of-the-art facilities
            and expert guidance
          </p>
          <div className="payment-info">
            <span className="payment-text">
              Secure payment • Cancel anytime • Money-back guarantee
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Membership;
