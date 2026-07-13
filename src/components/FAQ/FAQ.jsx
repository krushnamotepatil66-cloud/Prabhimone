import "./FAQ.css";
import { useState } from "react";

const data = [
  {
    question: "Is there a free plan?",
    answer: "No. but the base plan is for only ₹49 per month, which is very affordable for small businesses."
  },
  {
    question: "Can I upgrade later?",
    answer: "Yes. Upgrade anytime without losing your data."
  },
  {
    question: "Is my data secure?",
    answer: "We use industry-standard security practices to protect your information."
  },
  {
    question: "Can I use it on mobile?",
    answer: "Yes. The application is fully responsive."
  }
];

function FAQ() {

  const [open,setOpen]=useState(null);

  return(
    <section className="faq">

      <div className="container">

        <h2>Frequently Asked Questions</h2>

        {data.map((item,index)=>(

          <div
            className="faq-item"
            key={index}
            onClick={()=>setOpen(open===index?null:index)}
          >

            <div className="faq-question">

              <h3>{item.question}</h3>

              <span>{open===index?"−":"+"}</span>

            </div>

            {open===index &&

              <p>{item.answer}</p>

            }

          </div>

        ))}

      </div>

    </section>
  )

}

export default FAQ;