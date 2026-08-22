import { motion } from 'framer-motion';
import real4 from '../assets/images/Realimage4.png';
import '../styles/About.css';

const About = () => {
  return (
    <section className="about section-padding" id="about">
      <div className="container about-grid">
        <motion.div 
          className="about-image"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <div className="image-wrapper">
            <img src={real4} alt="Pinks n Bloos Interior" />
            <div className="image-overlay gradient-gold"></div>
          </div>
        </motion.div>

        <motion.div 
          className="about-content"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <span className="section-label">A Legacy of Grace</span>
          <h2 className="section-title">Where Beauty Meets Comfort</h2>
          <p className="about-text">
            Nestled in the vibrant heart of <strong>L.B. Nagar, Hyderabad</strong>, Pinks n Bloos is more than just a salon—it is a sanctuary. Our spacious, sun-drenched interiors are designed to be your escape from the everyday.
          </p>
          <p className="about-text">
            From the celebratory cheer of our pedicure lounge to the focused precision of our styling stations, every corner of our RTC Colony home is crafted for your delight. We blend <strong>luxury aesthetics</strong> with <strong>budget-friendly heart</strong>.
          </p>
          
          <div className="stats">
            <div className="stat-item">
              <h3>4.9/5</h3>
              <p>Rating</p>
            </div>
            <div className="stat-item">
              <h3>50+</h3>
              <p>Happy Clients</p>
            </div>
            <div className="stat-item">
              <h3>10+</h3>
              <p>Expert Stylists</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
