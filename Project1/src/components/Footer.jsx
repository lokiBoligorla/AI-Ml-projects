import { Instagram, Facebook, Twitter } from 'lucide-react';
import logo from '../assets/images/Realimage3.png';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="brand-logo footer-logo-margin">
              <span className="logo-text main">PINKS</span>
              <span className="logo-text ampersand">n</span>
              <span className="logo-text secondary">BLOOS</span>
            </div>
            <p>Your premium beauty destination in L.B. Nagar, Hyderabad. Excellence in every touch.</p>
            <div className="social-links">
              <a href="#"><Instagram size={20} /></a>
              <a href="#"><Facebook size={20} /></a>
              <a href="#"><Twitter size={20} /></a>
            </div>
          </div>

          <div className="footer-links">
            <h4>PAGES</h4>
            <a href="#home">Home</a>
            <a href="#about">About Us</a>
            <a href="#services">Services</a>
            <a href="#gallery">Gallery</a>
          </div>

          <div className="footer-links">
            <h4>CONTACT</h4>
            <p>096661 99629</p>
            <p>L.B. Nagar, Hyderabad</p>
            <p>Open Daily until 8 PM</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 Pinks n Bloos. All Rights Reserved. | <span className="dev">Designed with Precision</span></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
