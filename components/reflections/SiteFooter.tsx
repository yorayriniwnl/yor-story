const YEAR = new Date().getFullYear()

const SITE_PROFILE = {
  name: 'Ayush Roy',
  summary: 'Founder of Yor Zenith and a full-stack focused B.Tech CS & CE student at KIIT building Next.js product surfaces.',
  email: 'ayushroy.dev@gmail.com',
  phone: '+91 8918940799',
  linkedinLabel: 'linkedin.com/in/yorayriniwnl',
  linkedinHref: 'https://linkedin.com/in/yorayriniwnl',
  githubHref: 'https://github.com/yorayriniwnl',
  portfolioHref: 'https://yorayriniwnl.in',
}

export default function SiteFooter() {
  return (
    <footer className="rf-footer">
      <div className="rf-footer-grid">
        <div className="rf-footer-brand" aria-hidden="true">YR.</div>
        <div className="rf-footer-info">
          <p className="rf-footer-tagline">
            {SITE_PROFILE.summary}
          </p>
          <ul className="rf-footer-links">
            <li><a href={SITE_PROFILE.portfolioHref} target="_blank" rel="noopener noreferrer">PORTFOLIO</a></li>
            <li><a href={SITE_PROFILE.githubHref} target="_blank" rel="noopener noreferrer">GITHUB</a></li>
          </ul>
        </div>
        <div className="rf-footer-signal">
          <address className="rf-footer-contact" aria-label={`Contact ${SITE_PROFILE.name}`}>
            <a href={`mailto:${SITE_PROFILE.email}`}>{SITE_PROFILE.email}</a>
            <a href={`tel:${SITE_PROFILE.phone.replace(/\s/g, '')}`}>{SITE_PROFILE.phone}</a>
            <a href={SITE_PROFILE.linkedinHref} target="_blank" rel="noopener noreferrer">
              {SITE_PROFILE.linkedinLabel}
            </a>
          </address>
          <p className="rf-footer-freq">FREQ 52.0 MHz // YOR AYRIN</p>
          <div className="rf-footer-status">
            <i aria-hidden="true" />
            <span>SIGNAL ACTIVE</span>
          </div>
        </div>
      </div>
      <div className="rf-footer-copy">
        &copy; {YEAR} {SITE_PROFILE.name}. ALL TRANSMISSIONS PERSONAL. BUILT IN INDIA.
      </div>
    </footer>
  )
}
