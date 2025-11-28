import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';

// --- Icons (SVG) ---
const PhoneIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
);

const MailIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
);

const FacebookIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
);

const InstagramIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
);

const LineIcon = () => ( // Mockup Icon for LINE using MessageCircle
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
);

function Footer() {
    const { t } = useLanguage();
    // --- Styles ---
    const styles = {
        footer: {
            background: 'linear-gradient(90deg, #78a9f7ff 0%, #74a2daff 50%, #93c5fd 100%)', // ไล่สีฟ้าตามธีม
            color: 'white',
            padding: '20px 0 10px',
            fontFamily: "'Prompt', sans-serif",
            marginTop: 'auto'
        },
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px',
            marginBottom: '40px'
        },
        column: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start'
        },
        title: {
            fontSize: '1.2rem',
            fontWeight: '700',
            marginBottom: '20px',
            position: 'relative'
        },
        text: {
            fontSize: '0.9rem',
            lineHeight: '1.6',
            color: '#e0f2fe', // สีฟ้าอ่อนมากๆ
            margin: 0
        },
        linkList: {
            listStyle: 'none',
            padding: 0,
            margin: 0
        },
        linkItem: {
            marginBottom: '10px'
        },
        link: {
            color: '#e0f2fe',
            textDecoration: 'none',
            fontSize: '0.95rem',
            transition: 'color 0.2s, padding-left 0.2s',
            display: 'inline-block'
        },
        contactItem: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px',
            color: '#e0f2fe',
            fontSize: '0.95rem'
        },
        socialContainer: {
            display: 'flex',
            gap: '15px'
        },
        socialIcon: {
            color: 'white',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            opacity: 0.9
        },
        copyright: {
            textAlign: 'center',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            fontSize: '0.85rem',
            color: '#dbeafe'
        }
    };

    // Helper เพื่อทำ Hover Effect แบบ Inline
    const handleMouseEnter = (e) => {
        e.target.style.color = 'white';
        e.target.style.paddingLeft = '5px';
    };
    const handleMouseLeave = (e) => {
        e.target.style.color = '#e0f2fe';
        e.target.style.paddingLeft = '0';
    };

    return (
        <footer style={styles.footer}>
            <div style={styles.container}>
                
                {/* Column 1: About */}
                <div style={styles.column}>
                    <h3 style={styles.title}>{t('aboutUs')}</h3>
                    <p style={styles.text}>{t('aboutDescription')}</p>
                </div>

                {/* Column 2: Quick links */}
                <div style={styles.column}>
                    <h3 style={styles.title}>{t('quickLinks')}</h3>
                    <ul style={styles.linkList}>
                        <li style={styles.linkItem}>
                            <Link to="/patient/home" style={styles.link} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>{t('home')}</Link>
                        </li>
                        <li style={styles.linkItem}>
                            <Link to="/patient/my-appointments" style={styles.link} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>{t('appointments')}</Link>
                        </li>
                        <li style={styles.linkItem}>
                            <Link to="/patient/clinics" style={styles.link} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>{t('departmentsAndHospitals')}</Link>
                        </li>
                        <li style={styles.linkItem}>
                            <Link to="/patient/history" style={styles.link} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>{t('appointmentHistory')}</Link>
                        </li>
                    </ul>
                </div>

                {/* Column 3: Contact */}
                <div style={styles.column}>
                    <h3 style={styles.title}>{t('contactUs')}</h3>
                    <div style={styles.contactItem}>
                        <MailIcon />
                        <span>healthqueueproject@gmail.com</span>
                    </div>
                </div>

                {/* Column 4: Follow us */}
                <div style={styles.column}>
                    <h3 style={styles.title}>{t('followUs')}</h3>
                    <div style={styles.socialContainer}>
                        <a href="#" style={styles.socialIcon} aria-label="Facebook">
                            <FacebookIcon />
                        </a>
                        <a href="#" style={styles.socialIcon} aria-label="Instagram">
                            <InstagramIcon />
                        </a>
                        <a href="#" style={styles.socialIcon} aria-label="Line">
                            <LineIcon />
                        </a>
                    </div>
                </div>

            </div>

            {/* Copyright Section */}
            <div style={styles.copyright}>
                &copy; {new Date().getFullYear()} H.E.L.P | {t('copyrightNotice')}
            </div>
        </footer>
    );
}

export default Footer;