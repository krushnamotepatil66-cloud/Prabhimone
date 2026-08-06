import "./Pricing.css";
import { FaCheck } from "react-icons/fa";

const plans = [
  {
    name: "Starter",
    price: "₹49",
    period: "/month",
    button: "Get Started",
    featured: false,
    features: [
      "5 Invoices / Month",
      "2 Users",
      "Email Support",
      "Basic Dashboard",
    ],
  },
  {
    name: "Professional",
    price: "₹99",
    period: "/month",
    button: "Start Free Trial",
    featured: true,
    features: [
      "Unlimited Invoices",
      "Unlimited Users",
      "Advanced Reports",
      "Payment Tracking",
      "Priority Support",
    ],
  },
  {
    name: "Enterprise",
    price: "₹149",
    period: "/month",
    button: "Start Free Trial",
    featured: false,
    features: [
      "Everything Included",
      "Dedicated Manager",
      "Custom Integrations",
      "API Access",
      "24/7 Support",
    ],
  },
];

function Pricing() {
  return (
    <section className="pricing">
      <div className="container">

        <h2>Choose the Right Plan</h2>

        <p className="pricing-subtitle">
          Flexible pricing for individuals, growing businesses and enterprises.
        </p>

        <div className="pricing-grid">

          {plans.map((plan, index) => (
            <div
              className={`pricing-card ${plan.featured ? "featured" : ""}`}
              key={index}
            >

              {plan.featured && (
                <span className="badge">Most Popular</span>
              )}

              <h3>{plan.name}</h3>

              <div className="price">
                {plan.price}
                <span>{plan.period}</span>
              </div>

              <ul>
                {plan.features.map((item, i) => (
                  <li key={i}>
                    <FaCheck className="check-icon" />
                    {item}
                  </li>
                ))}
              </ul>

              <button>{plan.button}</button>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default Pricing;