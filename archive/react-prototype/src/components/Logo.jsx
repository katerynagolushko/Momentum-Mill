import { motion } from 'framer-motion';

const Logo = () => {
  return (
    <div className="flex items-center justify-center gap-6">
      <div className="flex flex-col items-end">
        <h1 className="text-5xl md:text-6xl font-bold text-dark-espresso mb-0 leading-none">
          Momentum
        </h1>
        <h1 className="text-5xl md:text-6xl font-bold text-warm-gold leading-none">
          Mill
        </h1>
      </div>

      {/* Animated Mill Wheel */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
        className="relative w-20 h-20 md:w-24 md:h-24"
      >
        {/* Wheel outer circle */}
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Outer circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#D69946"
            strokeWidth="3"
          />

          {/* Center hub */}
          <circle
            cx="50"
            cy="50"
            r="12"
            fill="#2B221D"
          />

          {/* Spokes */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line
              key={angle}
              x1="50"
              y1="50"
              x2={50 + 33 * Math.cos((angle * Math.PI) / 180)}
              y2={50 + 33 * Math.sin((angle * Math.PI) / 180)}
              stroke="#D69946"
              strokeWidth="2"
            />
          ))}

          {/* Paddles/blades on the outer edge */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const x = 50 + 38 * Math.cos((angle * Math.PI) / 180);
            const y = 50 + 38 * Math.sin((angle * Math.PI) / 180);
            return (
              <rect
                key={`blade-${angle}`}
                x={x - 2}
                y={y - 6}
                width="4"
                height="12"
                fill="#2B221D"
                transform={`rotate(${angle} ${x} ${y})`}
              />
            );
          })}
        </svg>
      </motion.div>
    </div>
  );
};

export default Logo;
