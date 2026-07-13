import "./Features.css";

import {
  FaFileInvoiceDollar,
  FaUsers,
  FaMoneyCheckAlt,
  FaChartBar,
  FaChartLine,
  FaShieldAlt,
} from "react-icons/fa";

const features = [
  {
    icon: <FaFileInvoiceDollar />,
    title: "Create Invoices",
    description:
      "Generate professional invoices quickly with an easy-to-use interface.",
  },
  {
    icon: <FaUsers />,
    title: "Manage Customers",
    description:
      "Store customer details and organize all client information in one place.",
  },
  {
    icon: <FaMoneyCheckAlt />,
    title: "Track Payments",
    description:
      "Keep track of paid, unpaid, and overdue invoices effortlessly.",
  },
  {
    icon: <FaChartBar />,
    title: "Business Reports",
    description:
      "Access sales reports and monitor your business performance.",
  },
  {
    icon: <FaChartLine />,
    title: "Smart Analytics",
    description:
      "Understand revenue, expenses, and growth with visual insights.",
  },
  {
    icon: <FaShieldAlt />,
    title: "Secure & Reliable",
    description:
      "Your business data is protected with modern security practices.",
  },
];

function Features() {
  return (
    <section className="features">
      <div className="container">
        <h2 className="section-title">
          Everything you need to manage your business
        </h2>

        <p className="section-subtitle">
          Powerful tools designed to simplify invoicing and business management.
        </p>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon">{feature.icon}</div>

              <h3>{feature.title}</h3>

              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;