import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
  return (
    <motion.a
      href="https://wa.me/919666199629"
      className="whatsapp-float"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      target="_blank"
      rel="noopener noreferrer"
    >
      <MessageCircle size={30} />
      <span className="tooltip">Chat with us</span>
    </motion.a>
  );
};

export default WhatsAppButton;
