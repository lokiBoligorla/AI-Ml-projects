import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import '../styles/Reviews.css';

const reviews = [
  {
    name: "Sanya Gupta",
    text: "Best service ever had, spacious salon, friendly staff, and very low prices.",
    rating: 5
  },
  {
    name: "Priya Reddy",
    text: "I strongly recommend Pinks n Bloos for bridal services. They made my day really special.",
    rating: 5
  },
  {
    name: "Anjali Singh",
    text: "Very good service, nice ambience, and affordable rates. Highly professional.",
    rating: 5
  },
  {
    name: "Meghana K.",
    text: "Good service and budget-friendly pricing. The staff is very polite and skilled.",
    rating: 4
  }
];

const Reviews = () => {
  return (
    <section className="reviews section-padding" id="reviews">
      <div className="container">
        <div className="reviews-header">
          <span className="section-label">Testimonials</span>
          <h2 className="section-title">Client Love</h2>
        </div>

        <div className="reviews-carousel">
          {reviews.map((review, index) => (
            <motion.div 
              key={index}
              className="review-card glass"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="quote-icon"><Quote size={40} /></div>
              <div className="rating">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="var(--gold)" color="var(--gold)" />
                ))}
              </div>
              <p className="review-text">"{review.text}"</p>
              <h4 className="reviewer-name">- {review.name}</h4>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
