import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Calendar, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskSection from './TaskSection';
import HabitSection from './HabitSection';
import EventSection from './EventSection';
import { GlowingEffect } from './ui/GlowingEffect';
import { ThemeToggle } from './ui/theme-toggle';
import { RequestFeatureForm } from './RequestFeatureForm';
import { SlideTabs } from './ui/slide-tabs';
import { CustomCursor } from './ui/custom-cursor';

type TabType = 'Overview' | 'Tasks' | 'Habits' | 'Events';

export default function Dashboard() {
  const { signOut, user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<TabType>('Overview');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="relative rounded-xl">
                <GlowingEffect spread={40} glow={true} proximity={64} inactiveZone={0.01} borderWidth={2} />
                <TaskSection selectedDate={selectedDate} />
              </div>
              <div className="relative rounded-xl">
                <GlowingEffect spread={40} glow={true} proximity={64} inactiveZone={0.01} borderWidth={2} />
                <EventSection selectedDate={selectedDate} />
              </div>
            </div>
            <div className="relative rounded-xl h-fit">
              <GlowingEffect spread={40} glow={true} proximity={64} inactiveZone={0.01} borderWidth={2} />
              <HabitSection selectedDate={selectedDate} />
            </div>
          </div>
        );
      case 'Tasks':
        return (
          <div className="max-w-4xl mx-auto relative rounded-xl">
            <GlowingEffect spread={40} glow={true} proximity={64} inactiveZone={0.01} borderWidth={2} />
            <TaskSection selectedDate={selectedDate} />
          </div>
        );
      case 'Habits':
        return (
          <div className="max-w-4xl mx-auto relative rounded-xl">
            <GlowingEffect spread={40} glow={true} proximity={64} inactiveZone={0.01} borderWidth={2} />
            <HabitSection selectedDate={selectedDate} />
          </div>
        );
      case 'Events':
        return (
          <div className="max-w-4xl mx-auto relative rounded-xl">
            <GlowingEffect spread={40} glow={true} proximity={64} inactiveZone={0.01} borderWidth={2} />
            <EventSection selectedDate={selectedDate} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 transition-colors duration-300">
      <CustomCursor />
      
      <header className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur border-b border-gray-200 dark:border-neutral-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center py-4 gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                  <CheckSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Productivity Hub</h1>
                  <p className="text-xs text-gray-400 dark:text-gray-500">An EliteX Solutions Product</p>
                </div>
              </div>
              <div className="md:hidden flex items-center gap-2">
                 <ThemeToggle />
              </div>
            </div>

            <SlideTabs 
                tabs={['Overview', 'Tasks', 'Habits', 'Events']} 
                activeTab={activeTab} 
                onChange={(tab) => setActiveTab(tab as TabType)}
                className="hidden md:flex"
            />

            <div className="flex items-center gap-2 w-full md:w-auto justify-end hidden md:flex">
              <RequestFeatureForm variant="outline" className="hidden lg:flex" />
              <ThemeToggle />
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
            
            {/* Mobile Navigation */}
            <div className="md:hidden w-full overflow-x-auto pb-2">
                 <SlideTabs 
                    tabs={['Overview', 'Tasks', 'Habits', 'Events']} 
                    activeTab={activeTab} 
                    onChange={(tab) => setActiveTab(tab as TabType)}
                />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{formatDate(selectedDate)}</h2>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-blue-400"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

