import Navbar from "../components/Navbar/Navbar";
import Hero from "../components/Hero/Hero";
import TrustedCompanies from "../components/TrustedCompanies/TrustedCompanies";
import Features from "../components/Features/Features";
import DashboardPreview from "../components/DashboardPreview/DashboardPreview";
import WhyChooseUs from "../components/WhyChooseUs/WhyChooseUs";
import Testimonials from "../components/Testimonials/Testimonials";
import Pricing from "../components/Pricing/Pricing";
import FAQ from "../components/FAQ/FAQ";
import CTA from "../components/CTA/CTA";
import Footer from "../components/Footer/Footer";

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <TrustedCompanies />
      <Features />
      <DashboardPreview />
      <WhyChooseUs />
      <Testimonials />
      <Pricing />
        <FAQ />
        <CTA />
        <Footer />
    </>
  );
}

export default Home;