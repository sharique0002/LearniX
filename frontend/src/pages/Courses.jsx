import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { coursesApi } from '../lib/api';

export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [level, setLevel] = useState('');

    useEffect(() => {
        loadCourses();
    }, [search, category, level]);

    const loadCourses = async () => {
        try {
            const { data } = await coursesApi.getAll({ search, category, level });
            setCourses(data.courses || []);
        } catch (error) {
            console.error('Failed to load courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['Development', 'Design', 'Business', 'Marketing', 'Data Science'];
    const levels = ['beginner', 'intermediate', 'advanced'];

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navigation />

            <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-bold mb-4">
                        Explore{' '}
                        <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            Courses
                        </span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Discover courses designed to accelerate your learning with AI-powered personalization
                    </p>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col md:flex-row gap-4 mb-8"
                >
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                    >
                        <option value="">All Levels</option>
                        {levels.map((lvl) => (
                            <option key={lvl} value={lvl}>{lvl.charAt(0).toUpperCase() + lvl.slice(1)}</option>
                        ))}
                    </select>
                </motion.div>

                {/* Course Grid */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
                    </div>
                ) : courses.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course, index) => (
                            <motion.div
                                key={course.id}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                                className="bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all group"
                            >
                                <div className="h-40 bg-gradient-to-br from-blue-600/30 via-purple-600/30 to-pink-600/30 flex items-center justify-center">
                                    <span className="text-5xl">📚</span>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        {course.level && (
                                            <span className={`text-xs px-2 py-1 rounded-full ${course.level === 'beginner' ? 'bg-green-500/20 text-green-400' :
                                                course.level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'
                                                }`}>
                                                {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                                            </span>
                                        )}
                                        {course.category && (
                                            <span className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300">
                                                {course.category}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                                        {course.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                        {course.description || 'No description available'}
                                    </p>
                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                        <span>
                                            {course.instructor_first_name} {course.instructor_last_name}
                                        </span>
                                        <span>{course.duration_hours || 0}h</span>
                                    </div>
                                    <Link
                                        to={`/courses/${course.slug || course.id}`}
                                        className="block w-full py-2 text-center bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                                    >
                                        View Course
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-4xl mb-4">🔍</div>
                        <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                        <p className="text-gray-400">Try adjusting your search or filters</p>
                    </div>
                )}
            </main>
        </div>
    );
}
