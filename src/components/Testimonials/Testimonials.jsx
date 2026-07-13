import "./Testimonials.css";
import { FaStar } from "react-icons/fa";

const testimonials = [
  {
    name: "Rahul Sharma",
    role: "Small Business Owner",
    review:
      "InvoicePro has completely changed how we manage our invoices. It's simple, fast, and reliable.",
  },
  {
    name: "Priya Patel",
    role: "Freelancer",
    review:
      "The dashboard is clean and the reports help me track payments effortlessly.",
  },
  {
    name: "Amit Verma",
    role: "Startup Founder",
    review:
      "Managing customers and invoices has never been easier. Highly recommended.",
  },
];

function Testimonials() {
  return (
    <section className="testimonials">
      <div className="container">

        <h2>What Our Customers Say</h2>

        <p className="testimonial-subtitle">
          Thousands of businesses trust InvoicePro every day.
        </p>

        <div className="testimonial-grid">
          {testimonials.map((item, index) => (
            <div className="testimonial-card" key={index}>

              <div className="stars">
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
              </div>

              <p className="review">
                "{item.review}"
              </p>

              <h3>{item.name}</h3>

              <span>{item.role}</span>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Testimonials;