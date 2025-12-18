import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navigation from '../components/Navigation';

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navigation />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20" />

                {/* Animated circles */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

                <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
                    <motion.h1
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        className="text-5xl md:text-7xl font-bold mb-6"
                    >
                        Learn Smarter with
                        <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                            AI-Powered Learning
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto"
                    >
                        Personalized learning paths, AI tutoring, and gamified progress tracking.
                        Transform how you learn with LearniX.
                    </motion.p>

                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Link
                            to="/register"
                            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg shadow-purple-500/25"
                        >
                            Start Learning Free
                        </Link>
                        <Link
                            to="/courses"
                            className="px-8 py-4 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all border border-gray-700"
                        >
                            Browse Courses
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold text-center mb-16"
                    >
                        Why Choose{' '}
                        <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            LearniX
                        </span>
                    </motion.h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: '🤖',
                                title: 'AI-Powered Tutoring',
                                description: 'Get instant help from our AI tutor that understands your learning context and adapts to your needs.'
                            },
                            {
                                icon: '🎯',
                                title: 'Personalized Paths',
                                description: 'Recommendations tailored to your interests, progress, and learning style using advanced AI.'
                            },
                            {
                                icon: '🏆',
                                title: 'Gamified Learning',
                                description: 'Earn badges, maintain streaks, and compete on leaderboards to stay motivated.'
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ y: 50, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6 bg-gray-900/50 rounded-2xl border border-gray-800 hover:border-purple-500/50 transition-all"
                            >
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-gray-400">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl p-12 text-center border border-purple-500/20"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to Transform Your Learning?
                    </h2>
                    <p className="text-gray-400 mb-8">
                        Join thousands of learners who are already accelerating their growth with LearniX.
                    </p>
                    <Link
                        to="/register"
                        className="inline-block px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-all"
                    >
                        Get Started Today
                    </Link>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-gray-800">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        LearniX
                    </span>
                    <p className="text-gray-500 text-sm mt-4 md:mt-0">
                        © {new Date().getFullYear()} LearniX. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
