import { motion } from 'framer-motion';
import real3 from '../assets/images/Realimage3.png';
import loungeImg from '../assets/images/salon_lounge.jpg';
import aromaImg from '../assets/images/aroma_bliss.jpg';
import maniImg from '../assets/images/manicure_art.jpg';
import artistImg from '../assets/images/artist_detail.jpg';
import paletteImg from '../assets/images/makeup_palette.jpg';
import '../styles/Gallery.css';

const galleryImages = [
  { 
    src: loungeImg, 
    title: "The Styling Lounge", 
    desc: "A wide-angle view of our professional styling space, where comfort meets cutting-edge fashion." 
  },
  { 
    src: real3, 
    title: "Signature Branding", 
    desc: "The heart of Pinks n Bloos—a symbol of our commitment to excellence and your beauty journey." 
  },
  { 
    src: aromaImg, 
    title: "Aromatic Bliss", 
    desc: "Experience the scent of luxury with our curated selection of premium essential oils and spa products." 
  },
  { 
    src: maniImg, 
    title: "Manicure Magic", 
    desc: "Precision and art on your fingertips, using the highest quality pigments and treatments." 
  },
  { 
    src: artistImg, 
    title: "Artisan Details", 
    desc: "From the perfect arch to the seamless blend, our artisans focus on the details that define you." 
  },
  { 
    src: paletteImg, 
    title: "Color Couture", 
    desc: "A palette of possibilities. We use only the finest professional-grade pigments for your makeup." 
  },
];

const Gallery = () => {
  return (
    <section className="gallery section-padding" id="gallery">
      <div className="container">
        <div className="gallery-header">
          <span className="section-label">Real Stories, Real Beauty</span>
          <h2 className="section-title">The Pinks n Bloos Experience</h2>
          <p className="gallery-intro">Discover the intersection of our real-world excellence and our visionary aesthetic.</p>
        </div>

        <div className="gallery-grid">
          {galleryImages.map((image, index) => (
            <motion.div 
              key={index}
              className="gallery-item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="gallery-img-wrapper">
                <img src={image.src} alt={image.title} />
                <div className="gallery-hover">
                  <h3>{image.title}</h3>
                  <p className="gallery-item-desc">{image.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
