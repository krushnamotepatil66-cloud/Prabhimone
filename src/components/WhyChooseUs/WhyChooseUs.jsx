import "./WhyChooseUs.css";

import {
  FaBolt,
  FaLock,
  FaCloud,
  FaMobileAlt,
  FaGlobe,
  FaSmile,
} from "react-icons/fa";

const benefits = [
  {
    icon: <FaSmile />,
    title: "Easy to Use",
    description: "Simple interface that anyone can learn in minutes."
  },
  {
    icon: <FaBolt />,
    title: "Lightning Fast",
    description: "Generate invoices and manage customers instantly."
  },
  {
    icon: <FaLock />,
    title: "Secure Platform",
    description: "Your data is protected with modern security."
  },
  {
    icon: <FaCloud />,
    title: "Cloud Based",
    description: "Access your business from anywhere."
  },
  {
    icon: <FaMobileAlt />,
    title: "Responsive",
    description: "Works beautifully on desktop, tablet and mobile."
  },
  {
    icon: <FaGlobe />,
    title: "Multi Device",
    description: "Use your account across all your devices."
  }
];

function WhyChooseUs() {
  return (
    <section className="why">
      <div className="container">

        <h2>Why Businesses Choose InvoicePro</h2>

        <p className="subtitle">
          Everything you need to simplify invoicing and business management.
        </p>

        <div className="benefits">

          {benefits.map((item, index) => (
            <div className="benefit-card" key={index}>
              <div className="icon">
                {item.icon}
              </div>

              <h3>{item.title}</h3>

              <p>{item.description}</p>
            </div>
          ))}

        </div>

        <div className="stats">

          <div className="stat">
            <h2>10K+</h2>
            <p>Active Users</p>
          </div>

          <div className="stat">
            <h2>50K+</h2>
            <p>Invoices Created</p>
          </div>

          <div className="stat">
            <h2>99.9%</h2>
            <p>Platform Uptime</p>
          </div>

        </div>

      </div>
    </section>
  );
}

export default WhyChooseUs;