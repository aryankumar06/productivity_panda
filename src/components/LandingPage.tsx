import { BackgroundPaths } from "@/components/ui/background-paths";
import { CheckCircle, Zap, TrendingUp, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { RequestFeatureForm } from "./RequestFeatureForm";

function LandingPage() {
    const features = [
        {
            icon: <CheckCircle className="w-8 h-8 text-blue-500" />,
            title: "Task Management",
            description: "Organize your life with our intuitive task tracking system. Never miss a deadline again."
        },
        {
            icon: <Zap className="w-8 h-8 text-amber-500" />,
            title: "Habit Building",
            description: "Build lasting habits with daily tracking and streak monitoring. Small steps lead to big changes."
        },
        {
            icon: <TrendingUp className="w-8 h-8 text-emerald-500" />,
            title: "Analytics & Insights",
            description: "Visualize your productivity trends. Understand your peak performance hours and improve."
        },
        {
            icon: <Shield className="w-8 h-8 text-purple-500" />,
            title: "Privacy Focused",
            description: "Your data is yours. We prioritize security and privacy, so you can focus on what matters."
        }
    ];

    return (
        <div className="bg-neutral-50 dark:bg-neutral-950 min-h-screen relative">
            <div className="absolute top-0 right-0 p-6 z-20">
                <RequestFeatureForm variant="outline" className="bg-white/50 dark:bg-black/50 backdrop-blur-sm border-neutral-200 dark:border-neutral-800 hover:bg-white dark:hover:bg-neutral-900" />
            </div>
            
            <BackgroundPaths 
                title="Productivity Hub" 
                description="Your all-in-one workspace for managing tasks, building habits, and tracking progress. Elevate your productivity today."
            />
            
            <div className="py-24 px-4 container mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-900 dark:text-white">Why Choose Productivity Hub?</h2>
                    <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        Designed to help you focus, organize, and achieve your goals with a suite of powerful tools.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-neutral-200 dark:border-neutral-800"
                        >
                            <div className="mb-4 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl inline-block">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-white">
                                {feature.title}
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>

            <footer className="bg-white dark:bg-neutral-900 py-12 border-t border-neutral-200 dark:border-neutral-800">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                                Productivity Hub
                            </h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                                An EliteX Solutions Product
                            </p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Empowering you to achieve more, every single day.
                            </p>
                        </div>
                        <div className="md:text-right">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                                Developer Details
                            </h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-300 font-medium mb-1">
                                Aryan Kumar
                            </p>
                            <div className="flex flex-wrap justify-start md:justify-end gap-4 text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                                <a href="https://linkedin.com/in/aryankumar" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">LinkedIn</a>
                                <a href="https://twitter.com/aryankumar" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">Twitter</a>
                                <a href="https://instagram.com/aryankumar" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition-colors">Instagram</a>
                                <a href="https://www.producthunt.com/posts/productivity-hub" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">Product Hunt</a>
                            </div>
                            <div className="text-sm text-neutral-500 dark:text-neutral-400 space-y-1">
                                <p>Contact: <a href="tel:9310479532" className="hover:text-neutral-900 dark:hover:text-white transition-colors">9310479532</a></p>
                                <p>Email: <a href="mailto:team@elitexsolutions.xyz" className="hover:text-neutral-900 dark:hover:text-white transition-colors">team@elitexsolutions.xyz</a></p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="border-t border-neutral-200 dark:border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                            © {new Date().getFullYear()} EliteX Solutions. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-sm text-neutral-500">
                            <a href="/terms-of-service" className="hover:text-blue-500 transition-colors">Terms of Service</a>
                            <a href="/privacy-policy" className="hover:text-blue-500 transition-colors">Privacy Policy</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
