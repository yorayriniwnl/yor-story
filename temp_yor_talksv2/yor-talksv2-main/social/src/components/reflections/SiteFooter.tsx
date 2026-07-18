const YEAR = new Date().getFullYear()

const SITE_PROFILE = {
  name: 'Ayush Roy',
  summary: 'Founder of Yor Zenith and a B.Tech student in Computer Science & Communication Engineering at KIIT, building thoughtful full-stack products with Next.js.',
  email: 'ayushroy.dev@gmail.com',
  phone: '+91 8918940799',
  linkedinLabel: 'linkedin.com/in/yorayriniwnl',
  linkedinHref: 'https://linkedin.com/in/yorayriniwnl',
  githubHref: 'https://github.com/yorayriniwnl',
  portfolioHref: 'https://yorayriniwnl.in',
}

export default function SiteFooter() {
  return (
    <footer className="rf-footer" aria-label="Yor Ayrin contact and profiles">
      <div className="rf-footer-grid">
        <div className="rf-footer-identity">
          <div className="rf-footer-brand" aria-hidden="true">YR.</div>
          <p className="rf-footer-brand-label">YOR AYRIN <span>/ PRIVATE PRACTICE</span></p>
        </div>

        <section className="rf-footer-overview" aria-labelledby="footer-about">
          <h2 id="footer-about" className="rf-footer-label">ABOUT</h2>
          <p className="rf-footer-tagline">
            {SITE_PROFILE.summary}
          </p>
        </section>

        <nav className="rf-footer-profiles" aria-label="Professional profiles">
          <h2 className="rf-footer-label">PROFILES</h2>
          <ul className="rf-footer-links">
            <li>
              <a href={SITE_PROFILE.portfolioHref} target="_blank" rel="noopener noreferrer">
                <span>PORTFOLIO</span><b aria-hidden="true">↗</b>
              </a>
            </li>
            <li>
              <a href={SITE_PROFILE.githubHref} target="_blank" rel="noopener noreferrer">
                <span>GITHUB</span><b aria-hidden="true">↗</b>
              </a>
            </li>
          </ul>
        </nav>

        <section className="rf-footer-contact-section" aria-labelledby="footer-contact">
          <h2 id="footer-contact" className="rf-footer-label">DIRECT CONTACT</h2>
          <address className="rf-footer-contact" aria-label={`Contact ${SITE_PROFILE.name}`}>
            <a href={`mailto:${SITE_PROFILE.email}`}>
              <span className="rf-footer-contact-kind">EMAIL</span>
              <span>{SITE_PROFILE.email}</span>
            </a>
            <a href={`tel:${SITE_PROFILE.phone.replace(/\s/g, '')}`}>
              <span className="rf-footer-contact-kind">PHONE</span>
              <span>{SITE_PROFILE.phone}</span>
            </a>
            <a href={SITE_PROFILE.linkedinHref} target="_blank" rel="noopener noreferrer">
              <span className="rf-footer-contact-kind">LINKEDIN</span>
              <span>{SITE_PROFILE.linkedinLabel}</span>
            </a>
          </address>
          <div className="rf-footer-transmission">
            <p className="rf-footer-freq">FREQ 52.0 MHz // YOR AYRIN</p>
            <div className="rf-footer-status">
              <i aria-hidden="true" />
              <span>SIGNAL ACTIVE</span>
            </div>
          </div>
        </section>
      </div>
      <div className="rf-footer-bottom">
        <p className="rf-footer-copy">
          &copy; {YEAR} {SITE_PROFILE.name}. ALL TRANSMISSIONS PERSONAL.
        </p>
        <p className="rf-footer-location">BUILT IN INDIA</p>
      </div>
    </footer>
  )
}
