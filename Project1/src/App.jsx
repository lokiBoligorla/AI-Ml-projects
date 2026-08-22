import { useEffect } from 'react';
import Lenis from 'lenis';
import Navbar from './components/Navbar';
import Hero from './sections/Hero';
import About from './sections/About';
import Spotlight from './sections/Spotlight';
import Services from './sections/Services';
import Reviews from './sections/Reviews';
import Gallery from './sections/Gallery';
import Contact from './sections/Contact';
import CTA from './sections/CTA';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import './styles/global.css';

function App() {
  useEffect(() => {
    const lenis = new Lenis();

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }, []);

  return (
    <div className="app">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Spotlight />
        <Services />
        <Reviews />
        <Gallery />
        <Contact />
        <CTA />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default App;
