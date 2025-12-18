import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { useAuthStore } from '../stores/authStore';
import { enrollmentApi, gamificationApi, recommendationsApi } from '../lib/api';

export default function Dashboard() {
    const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();
    const navigate = useNavigate();

    const [enrollments, setEnrollments] = useState([]);
    const [stats, setStats] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isLoading, isAuthenticated, navigate]);

    useEffect(() => {
        if (isAuthenticated && user) {
            loadDashboardData();
        }
    }, [isAuthenticated, user]);

    const loadDashboardData = async () => {
        try {
            const [enrollmentsRes, statsRes] = await Promise.all([
                enrollmentApi.getAll(),
                gamificationApi.getStats()
            ]);

            setEnrollments(enrollmentsRes.data.enrollments || []);
            setStats(statsRes.data.stats);

            // Load recommendations
            if (user?.id) {
                try {
                    const recsRes = await recommendationsApi.getCourses(user.id);
                    setRecommendations(recsRes.data || []);
                } catch (e) {
                    // AI service might not be available
                }
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (isLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navigation />

            <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
                {/* Welcome Section */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold mb-2">
                        Welcome back, {user?.firstName || 'Learner'}! 👋
                    </h1>
                    <p className="text-gray-400">Continue your learning journey</p>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                >
                    <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-xl p-6 border border-orange-500/20">
                        <div className="text-3xl mb-2">🔥</div>
                        <div className="text-2xl font-bold">{stats?.currentStreak || 0}</div>
                        <div className="text-gray-400 text-sm">Day Streak</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-6 border border-purple-500/20">
                        <div className="text-3xl mb-2">⚡</div>
                        <div className="text-2xl font-bold">{stats?.totalXp || 0}</div>
                        <div className="text-gray-400 text-sm">Total XP</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-6 border border-blue-500/20">
                        <div className="text-3xl mb-2">📚</div>
                        <div className="text-2xl font-bold">{enrollments.length}</div>
                        <div className="text-gray-400 text-sm">Courses</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-6 border border-green-500/20">
                        <div className="text-3xl mb-2">🏆</div>
                        <div className="text-2xl font-bold">{stats?.badgeCount || 0}</div>
                        <div className="text-gray-400 text-sm">Badges</div>
                    </div>
                </motion.div>

                {/* Continue Learning */}
                <motion.section
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-12"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">Continue Learning</h2>
                        <Link to="/my-learning" className="text-purple-400 hover:text-purple-300 text-sm">
                            View all →
                        </Link>
                    </div>

                    {enrollments.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {enrollments.slice(0, 3).map((enrollment, index) => (
                                <motion.div
                                    key={enrollment.course_id}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    className="bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all group"
                                >
                                    <div className="h-32 bg-gradient-to-br from-blue-600/30 to-purple-600/30 flex items-center justify-center">
                                        <span className="text-4xl">📖</span>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                                            {enrollment.title}
                                        </h3>
                                        <div className="mb-3">
                                            <div className="flex justify-between text-sm text-gray-400 mb-1">
                                                <span>Progress</span>
                                                <span>{enrollment.progress_percent}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                                                    style={{ width: `${enrollment.progress_percent}%` }}
                                                />
                                            </div>
                                        </div>
                                        <Link
                                            to={`/courses/${enrollment.course_id}/learn`}
                                            className="block w-full py-2 text-center bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-400 text-sm transition-colors"
                                        >
                                            Continue
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-900/30 rounded-xl p-12 text-center border border-gray-800">
                            <div className="text-4xl mb-4">🎯</div>
                            <h3 className="text-lg font-semibold mb-2">Start Your Journey</h3>
                            <p className="text-gray-400 mb-4">You haven&apos;t enrolled in any courses yet.</p>
                            <Link
                                to="/courses"
                                className="inline-block px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                            >
                                Browse Courses
                            </Link>
                        </div>
                    )}
                </motion.section>

                {/* Recommended for You */}
                {recommendations.length > 0 && (
                    <motion.section
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h2 className="text-xl font-semibold mb-6">Recommended for You</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {recommendations.slice(0, 4).map((rec) => (
                                <div
                                    key={rec.courseId}
                                    className="bg-gray-900/50 rounded-xl p-4 border border-gray-800 hover:border-blue-500/50 transition-all"
                                >
                                    <div className="text-sm text-blue-400 mb-2">{rec.reason}</div>
                                    <Link
                                        to={`/courses/${rec.courseId}`}
                                        className="text-sm text-purple-400 hover:text-purple-300"
                                    >
                                        View Course →
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                )}
            </main>
        </div>
    );
}
