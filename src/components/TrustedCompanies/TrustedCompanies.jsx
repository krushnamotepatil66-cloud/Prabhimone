import "./TrustedCompanies.css";

function TrustedCompanies() {
  const companies = [
    "Microsoft",
    "Google",
    "Amazon",
    "Adobe",
    "Spotify",
    "Netflix"
  ];

  return (
    <section className="trusted">
      <div className="container">
        <p className="trusted-title">
          Trusted by businesses around the world
        </p>

        <div className="company-grid">
          {companies.map((company) => (
            <div className="company-card" key={company}>
              {company}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustedCompanies;