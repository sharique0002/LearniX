import { motion, AnimatePresence } from 'framer-motion';

/**
 * Badge Component
 * Display achievement badge with animation on earn
 */
export default function Badge({ badge, isNew = false, size = 'md' }) {
  const { name, description, iconUrl, category, points } = badge;

  const sizes = {
    sm: 'w-12 h-12 text-2xl',
    md: 'w-16 h-16 text-3xl',
    lg: 'w-24 h-24 text-5xl'
  };

  const categoryColors = {
    achievement: 'from-yellow-400 to-orange-500',
    streak: 'from-red-400 to-pink-500',
    skill: 'from-blue-400 to-cyan-500',
    special: 'from-purple-400 to-indigo-500'
  };

  const icons = {
    'First Steps': '🎯',
    'Course Champion': '🏆',
    'Week Warrior': '🔥',
    'Month Master': '🌟',
    'Fast Learner': '⚡',
    'Knowledge Seeker': '🧠',
    'Early Adopter': '🚀'
  };

  return (
    <motion.div
      initial={isNew ? { scale: 0, rotate: -180 } : false}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className="flex flex-col items-center text-center"
    >
      <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${categoryColors[category] || categoryColors.achievement} flex items-center justify-center shadow-lg`}>
        {iconUrl ? (
          <img src={iconUrl} alt={name} className="w-3/4 h-3/4" />
        ) : (
          <span>{icons[name] || '🏅'}</span>
        )}
      </div>
      <AnimatePresence>
        {isNew && (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-1 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full"
          >
            NEW!
          </motion.span>
        )}
      </AnimatePresence>
      <p className="mt-2 font-medium text-gray-800 text-sm">{name}</p>
      <p className="text-xs text-gray-500">+{points} XP</p>
    </motion.div>
  );
}
