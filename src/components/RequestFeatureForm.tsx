import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageSquarePlus } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';

interface RequestFeatureFormProps {
    className?: string;
    variant?: 'default' | 'ghost' | 'outline';
}

export function RequestFeatureForm({ className, variant = 'default' }: RequestFeatureFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const subject = encodeURIComponent(`Feature Request: ${title}`);
        const body = encodeURIComponent(
            `Feature Title: ${title}\n\nDescription:\n${description}\n\nRequested by: ${user?.email || 'Anonymous'}`
        );
        
        window.open(`mailto:team@elitexsolutions.xyz?subject=${subject}&body=${body}`, '_blank');
        setIsOpen(false);
        setTitle('');
        setDescription('');
    };

    return (
        <>
            <Button 
                onClick={() => setIsOpen(true)} 
                variant={variant}
                className={className}
            >
                <MessageSquarePlus className="w-4 h-4 mr-2" />
                Request Feature
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        />
                        
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 z-10"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                                    Request a Feature
                                </h2>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors text-neutral-500"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        Feature Title
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g., Dark Mode Toggle"
                                        className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe the feature and how it would help you..."
                                        className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        <Send className="w-4 h-4 mr-2" />
                                        Send Request
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
