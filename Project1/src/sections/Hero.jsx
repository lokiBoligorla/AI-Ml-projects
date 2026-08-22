import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import heroImg from '../assets/images/hero.png';
import '../styles/Hero.css';

const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const scale = useTransform(scrollY, [0, 500], [1, 1.1]);

  return (
    <section className="hero" id="home">
      <motion.div 
        className="hero-bg"
        style={{ y: y1, scale }}
      >
        <img src={heroImg} alt="Luxury Beauty Salon" />
        <div className="hero-overlay"></div>
      </motion.div>

      <div className="container hero-content">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="hero-text"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2 }}
          >
            Experience <br /><span className="text-accent underline-gold">Beauty</span> Like <br />Never Before
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="hero-subtext"
          >
            Professional beauty services with a 4.9 rating and 50+ happy clients. 
            Located in the heart of L.B. Nagar, Hyderabad.
          </motion.p>

          <motion.div 
            className="hero-btns"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <a href="#contact" className="btn-primary-large">Book Appointment</a>
            <a href="#services" className="btn-secondary">
              Explore Services <ChevronRight size={20} />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
