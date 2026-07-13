
import "./Hero.css";

function Hero() {
  return (
    <section className="hero">
      <div className="container hero-container">

        <div className="hero-left">
          <span className="hero-tag">
            Simple & Smart Invoicing
          </span>

          <h1>
            Create Professional Invoices in Minutes
          </h1>

          <p>
            Manage customers, generate invoices, track payments,
            and grow your business with an easy-to-use invoicing
            platform.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn">
              Get Started
            </button>

            <button className="secondary-btn">
              Learn More
            </button>
          </div>
        </div>

        <div className="hero-right">
          <div className="dashboard-preview">
            Dashboard Preview
          </div>
        </div>

      </div>
    </section>
  );
}

export default Hero;