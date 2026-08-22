import { motion } from 'framer-motion';
import real1 from '../assets/images/Realimage1.png';
import real2 from '../assets/images/Realimage2.png';
import '../styles/Spotlight.css';

const Spotlight = () => {
  return (
    <section className="spotlight section-padding">
      <div className="container">
        <div className="spotlight-grid">
          <motion.div 
            className="spotlight-item"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="spotlight-image-box">
              <img src={real1} alt="Pedicure Celebration" />
              <div className="spotlight-badge">Our Space</div>
            </div>
            <div className="spotlight-content">
              <h3>Celebratory Care</h3>
              <p>At Pinks n Bloos, we believe beauty is a celebration. Our vibrant pedicure lounge is designed to lift your spirits while we pamper your feet with the finest salts and oils.</p>
            </div>
          </motion.div>

          <motion.div 
            className="spotlight-item reverse"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="spotlight-content">
              <h3>Artistic Precision</h3>
              <p>Experience the steady hands of Hyderabad's finest stylists. Our stations are sanctuaries of transformation, where every clip and color is a step toward your best self.</p>
            </div>
            <div className="spotlight-image-box">
              <img src={real2} alt="Styling Station" />
              <div className="spotlight-badge">Expertise</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Spotlight;
