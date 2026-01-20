import { useStyle } from '../contexts/StyleContext';
import { ThemeToggle } from './ui/theme-toggle';
import { 
    Layout, 
    Palette, 
    Laptop, 
    GraduationCap, 
    PenTool, 
    Keyboard,
    Command,
    Moon,
    Monitor,
    User,
    Copy
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsView() {
    const { style, setStyle } = useStyle();
    const { user } = useAuth();

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-2xl font-bold dark:text-white mb-2">Settings</h2>
                <p className="text-gray-500 dark:text-gray-400">Manage your productivity preferences and application appearance.</p>
            </div>

            <div className="grid gap-6">
                {/* User Identity Section */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-gray-200 dark:border-neutral-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold dark:text-white">Account Identity</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Share this ID to be invited to workspaces.</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-neutral-800/50 rounded-xl border border-gray-100 dark:border-neutral-800">
                        <div className="flex-1 font-mono text-sm text-gray-600 dark:text-gray-300 break-all">
                            {user?.id || 'Not signed in'}
                        </div>
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(user?.id || '');
                                alert('User ID copied to clipboard!');
                            }}
                            className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                            title="Copy ID"
                        >
                            <Copy className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Productivity Mode Section */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-gray-200 dark:border-neutral-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                            <Layout className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold dark:text-white">Productivity Style</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Choose the mode that best fits your workflow.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => setStyle('student')}
                            className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                                style === 'student' 
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                    : 'border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700'
                            }`}
                        >
                            <GraduationCap className={`w-8 h-8 mb-3 ${style === 'student' ? 'text-blue-600' : 'text-gray-400'}`} />
                            <h4 className={`font-medium ${style === 'student' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>Student</h4>
                            <p className="text-xs text-gray-500 mt-1">Focused on deadlines, assignments, and study blocks.</p>
                        </button>

                        <button
                            onClick={() => setStyle('professional')}
                            className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                                style === 'professional' 
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                                    : 'border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700'
                            }`}
                        >
                            <Laptop className={`w-8 h-8 mb-3 ${style === 'professional' ? 'text-indigo-600' : 'text-gray-400'}`} />
                            <h4 className={`font-medium ${style === 'professional' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>Professional</h4>
                            <p className="text-xs text-gray-500 mt-1">Optimized for meetings, projects, and collaboration.</p>
                        </button>

                        <button
                            onClick={() => setStyle('creator')}
                            className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                                style === 'creator' 
                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                                    : 'border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700'
                            }`}
                        >
                            <PenTool className={`w-8 h-8 mb-3 ${style === 'creator' ? 'text-purple-600' : 'text-gray-400'}`} />
                            <h4 className={`font-medium ${style === 'creator' ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}>Creator</h4>
                            <p className="text-xs text-gray-500 mt-1">Flexible scheduling for flow states and ideas.</p>
                        </button>
                    </div>
                </div>

                {/* Appearance Section */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-gray-200 dark:border-neutral-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                            <Palette className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold dark:text-white">Appearance</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Customize the look and feel.</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-neutral-800">
                        <div className="flex items-center gap-3">
                            <Moon className="w-5 h-5 text-gray-500" />
                            <span className="font-medium dark:text-gray-200">Theme Preference</span>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>

                {/* Shortcuts Reference */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-gray-200 dark:border-neutral-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600 dark:text-orange-400">
                            <Keyboard className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold dark:text-white">Keyboard Shortcuts</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Power user commands.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-neutral-800/50">
                             <span className="text-sm text-gray-600 dark:text-gray-300">Command Palette</span>
                             <kbd className="px-2 py-1 text-xs font-mono bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-md shadow-sm text-gray-500">
                                 Ctrl + K
                             </kbd>
                         </div>
                         <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-neutral-800/50">
                             <span className="text-sm text-gray-600 dark:text-gray-300">Quick Add Task</span>
                             <kbd className="px-2 py-1 text-xs font-mono bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-md shadow-sm text-gray-500">
                                 Ctrl + T
                             </kbd>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
