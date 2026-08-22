import { motion } from 'framer-motion';
import '../styles/CTA.css';

const CTA = () => {
  return (
    <section className="cta section-padding">
      <div className="container">
        <motion.div 
          className="cta-card glass-gold"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Ready for Your <br /><span>Transformation?</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Book your session today and experience the best beauty services in L.B. Nagar.
          </motion.p>
          <motion.a 
            href="#contact"
            className="btn-gold-large"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ textDecoration: 'none', display: 'inline-block' }}
          >
            Schedule Appointment
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
