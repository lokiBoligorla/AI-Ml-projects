import { motion } from 'framer-motion';
import { Phone, MapPin, Clock, MessageSquare, Send } from 'lucide-react';
import '../styles/Contact.css';

const Contact = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for reaching out! We will contact you shortly.');
  };

  return (
    <section className="contact section-padding" id="contact">
      <div className="container">
        <div className="contact-header">
          <span className="section-label">Get in Touch</span>
          <h2 className="section-title">Visit the Sanctuary</h2>
        </div>

        <div className="contact-grid">
          <motion.div 
            className="contact-info"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="info-item">
              <MapPin className="info-icon" />
              <div>
                <h4>Address</h4>
                <p>Beside RTC Colony, Vasavi Sri Nilayam,<br />L.B. Nagar, Hyderabad, Telangana 500074</p>
              </div>
            </div>

            <div className="info-item">
              <Phone className="info-icon" />
              <div>
                <h4>Call Us</h4>
                <p>+91 96661 99629</p>
              </div>
            </div>

            <div className="info-item">
              <Clock className="info-icon" />
              <div>
                <h4>Working Hours</h4>
                <p>Mon - Sun: 10:00 AM - 9:00 PM</p>
              </div>
            </div>

            <div className="map-wrapper">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3808.384661848529!2d78.5475!3d17.3486!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb990000000001%3A0x0!2zMTfCsDIwJzU1LjAiTiA3OMKwMzInNTEuMCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin" 
                width="100%" 
                height="250" 
                style={{ border: 0, borderRadius: '12px' }} 
                allowFullScreen="" 
                loading="lazy"
              ></iframe>
            </div>
          </motion.div>

          <motion.div 
            className="contact-form-container"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <input type="text" placeholder="Full Name" required />
              </div>
              <div className="form-group">
                <input type="email" placeholder="Email Address" required />
              </div>
              <div className="form-group">
                <select required>
                  <option value="" disabled selected>Select Service</option>
                  <option value="bridal">Bridal Alchemy</option>
                  <option value="skin">Skin Whispering</option>
                  <option value="hair">Sculpted Radiance</option>
                  <option value="facial">Celestial Glow</option>
                  <option value="other">Other Inquiry</option>
                </select>
              </div>
              <div className="form-group">
                <textarea placeholder="Your Message" rows="5" required></textarea>
              </div>
              <button type="submit" className="btn-submit">
                Send Message <Send size={18} />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
