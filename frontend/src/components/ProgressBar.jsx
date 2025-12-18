import { motion } from 'framer-motion';

/**
 * ProgressBar Component
 * Animated progress bar showing course/lesson completion
 */
export default function ProgressBar({ progress = 0, showLabel = true, size = 'md' }) {
  const heights = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1 text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-blue-600">{Math.round(clampedProgress)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heights[size]}`}>
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
