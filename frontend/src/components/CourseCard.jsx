import { motion } from 'framer-motion';

/**
 * CourseCard Component
 * Displays a course card with thumbnail, title, progress, and enrollment info
 */
export default function CourseCard({ course, onEnroll, isEnrolled }) {
  const { title, description, thumbnail, difficulty, estimatedHours, instructor } = course;

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-6xl">📚</span>
          </div>
        )}
        <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-medium ${difficultyColors[difficulty] || difficultyColors.beginner}`}>
          {difficulty}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <span>⏱️</span> {estimatedHours}h
          </span>
          <span className="flex items-center gap-1">
            <span>👤</span> {instructor || 'LearniX'}
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onEnroll(course)}
          className={`w-full py-2 rounded-lg font-medium transition-colors ${
            isEnrolled
              ? 'bg-green-100 text-green-700 cursor-default'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          disabled={isEnrolled}
        >
          {isEnrolled ? '✓ Enrolled' : 'Enroll Now'}
        </button>
      </div>
    </motion.div>
  );
}
