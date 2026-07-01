import { motion } from 'framer-motion';

const ServiceCard = ({ title, description, items, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border-2 border-warm-gold/20 hover:border-warm-gold/50 transition-all duration-300"
    >
      <div className="mb-6">
        <h2 className="text-3xl md:text-4xl font-bold text-dark-espresso mb-3">
          {title}
        </h2>
        <div className="w-20 h-1 bg-warm-gold mx-auto"></div>
      </div>

      <p className="text-lg text-gray-700 mb-6 leading-relaxed">
        {description}
      </p>

      <ul className="space-y-3 text-left">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="text-warm-gold text-xl mt-1">•</span>
            <span className="text-gray-700 flex-1">{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default ServiceCard;
