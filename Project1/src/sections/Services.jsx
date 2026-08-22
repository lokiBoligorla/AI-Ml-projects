import { motion } from 'framer-motion';
import { Sparkles, Scissors, Skull, Heart, Star, ShoppingBag } from 'lucide-react';
import bridalImg from '../assets/images/bridal_makeup.jpg';
import facialImg from '../assets/images/facial_care.jpg';
import hairImg from '../assets/images/hair_styling_backup.png';
import skinImg from '../assets/images/skin_ritual.jpg';
import massageImg from '../assets/images/body_massage.jpg';
import glowImg from '../assets/images/glow_treatment.jpg';
import '../styles/Services.css';

const services = [
  {
    title: 'Bridal Alchemy',
    icon: <Sparkles />,
    description: 'Transforming dreams into radiant reality. Our bridal packages are poetic journeys of grace and glow.',
    price: 'Starting from ₹5000',
    img: bridalImg
  },
  {
    title: 'Skin Whispering',
    icon: <Heart />,
    description: 'Rejuvenating rituals that listen to your skin’s needs, leaving it luminous and deeply nourished.',
    price: 'Starting from ₹1200',
    img: skinImg
  },
  {
    title: 'Sculpted Radiance',
    icon: <Scissors />,
    description: 'Masterfully crafted hair designs that speak of your unique identity and modern sophistication.',
    price: 'Starting from ₹500',
    img: hairImg
  },
  {
    title: 'Celestial Glow',
    icon: <Star />,
    description: 'Advanced facials that harness the light of science and the touch of art for instant brilliance.',
    price: 'Starting from ₹1500',
    img: facialImg
  },
  {
    title: 'Velvet Grooming',
    icon: <Skull />,
    description: 'Meticulous care in a sanctuary of hygiene, ensuring every detail of your grooming is perfected.',
    price: 'Starting from ₹300',
    img: massageImg
  },
  {
    title: 'Luxury Ensembles',
    icon: <ShoppingBag />,
    description: 'Curated beauty experiences that offer a complete celestial transformation from head to toe.',
    price: 'Starting from ₹2500',
    img: glowImg
  }
];

const Services = () => {
  return (
    <section className="services section-padding" id="services">
      <div className="container">
        <div className="services-header">
          <motion.span 
            className="section-label"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
          >
            What We Do
          </motion.span>
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            Premium Services
          </motion.h2>
        </div>

        <div className="services-grid">
          {services.map((service, index) => (
            <motion.div 
              key={index}
              className="service-card"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <div className="service-card-bg">
                <img src={service.img} alt="" />
              </div>
              <div className="service-icon">
                {service.icon}
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <div className="service-footer">
                <span className="price">{service.price}</span>
                <a href="#contact" className="book-link">Book Now</a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
