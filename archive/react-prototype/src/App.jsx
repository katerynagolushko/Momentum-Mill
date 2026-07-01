import { motion } from 'framer-motion';
import Logo from './components/Logo';
import ServiceCard from './components/ServiceCard';

function App() {
  const fundraisingItems = [
    "Scheduled activities and strategic timeline planning",
    "Founder personal brand building and visibility",
    "Structured fundraising sprints with clear milestones",
    "Campaign-style approach to investor engagement"
  ];

  const partnershipsItems = [
    "Stage-appropriate partnership identification",
    "User traction and growth optimization strategies",
    "Partner value proposition development",
    "Strategic alignment for maximum impact"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-50">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Logo />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl md:text-2xl text-gray-700 mt-12 max-w-3xl mx-auto leading-relaxed"
          >
            Helping founders gain momentum through strategic fundraising,
            partnerships, and recognition in the startup ecosystem.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-12"
          >
            <a
              href="#services"
              className="inline-block bg-dark-espresso text-warm-gold px-8 py-4 rounded-full text-lg font-semibold hover:bg-warm-gold hover:text-dark-espresso transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Explore Our Sprints
            </a>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-dark-espresso mb-4">
              Our Sprint Tracks
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Two focused methodologies designed to accelerate your startup's growth
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <ServiceCard
              title="Fundraising Sprint"
              description="We treat fundraising like a marketing campaign with scheduled activities, founder personal brand building, and structured sprints."
              items={fundraisingItems}
              delay={0.2}
            />

            <ServiceCard
              title="Partnerships Sprint"
              description="Identifying the most valuable partnerships for your stage, maximizing user traction, and creating compelling value propositions."
              items={partnershipsItems}
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-dark-espresso/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-dark-espresso mb-8">
              About Kateryna
            </h2>

            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border-2 border-warm-gold/20">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Kateryna Golushko brings deep expertise in helping founders navigate
                the complex landscape of fundraising and strategic partnerships.
              </p>

              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                With a unique methodology that treats fundraising as a marketing campaign
                and partnerships as strategic growth levers, she has helped numerous
                startups gain the momentum they need to succeed.
              </p>

              <p className="text-lg text-gray-700 leading-relaxed">
                Her approach combines tactical execution with strategic thinking,
                ensuring founders don't just raise capital or form partnerships,
                but do so in a way that maximizes their startup's trajectory.
              </p>

              <div className="mt-8">
                <a
                  href="https://katerynagolushko.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-warm-gold hover:text-dark-espresso font-semibold transition-colors duration-300"
                >
                  Learn more →
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-dark-espresso text-warm-gold">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">Momentum Mill</h3>
            <p className="text-warm-gold/80">
              Building momentum for ambitious founders
            </p>
          </div>

          <p className="text-warm-gold/60 text-sm">
            © {new Date().getFullYear()} Momentum Mill. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
