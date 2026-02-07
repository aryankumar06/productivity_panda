import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LayoutGrid, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskSection from './TaskSection';
import HabitSection from './HabitSection';
import EventSection from './EventSection';
import { GlowingEffect } from './ui/GlowingEffect'; 
import { ThemeToggle } from './ui/theme-toggle';
import { RequestFeatureForm } from './RequestFeatureForm';
import InboxView from './InboxView';
import EisenhowerMatrix from './EisenhowerMatrix';
import WorkspaceView from './WorkspaceView';
import AnalyticsSection from './AnalyticsSection';
import SettingsView from './SettingsView';
import ReposView from './ReposView';
import DittoDashboard from './DittoDashboard';
import { SlideTabs } from './ui/slide-tabs';
import { CalendarWithPresets } from './ui/calendar-presets';
import { Slider } from './ui/slider';

// import { CustomCursor } from './ui/custom-cursor'; // Component not found

type TabType = 'Your Day' | 'Inbox' | 'Dashboard' | 'Projects' | 'Tasks' | 'Habits' | 'Events' | 'Analytics' | 'Workspaces' | 'Repos' | 'Settings';




export default function Dashboard() {
  const { signOut, isGitHubUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<TabType>('Dashboard');
  
  // Mobile tabs scroll
  const mobileTabsRef = useRef<HTMLDivElement>(null);
  const [tabsScrollPosition, setTabsScrollPosition] = useState(0);

  const handleDateChange = (date: Date | undefined) => {
      if (date) {
          // Adjust for timezone offset to prevent off-by-one errors when converting to string
          const offset = date.getTimezoneOffset();
          const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
          setSelectedDate(adjustedDate.toISOString().split('T')[0]);
      }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <div className="flex flex-col gap-6">
            {/* Top Row: Tasks and Events Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="relative rounded-xl min-h-[500px]">
                <GlowingEffect spread={40} glow={true} proximity={64} inactiveZone={0.01} borderWidth={2} />
                <TaskSection selectedDate={selectedDate} />
              </div>
              <div className="relative rounded-xl min-h-[500px]">
                <GlowingEffect spread={40} glow={true} proximity={64} inactiveZone={0.01} borderWidth={2} />
                <EventSection selectedDate={selectedDate} />
              </div>
            </div>

            {/* Bottom Row: Habit Tracker 100% Width */}
            <div className="relative rounded-xl w-full">
              <GlowingEffect spread={40} glow={true} proximity={64} inactiveZone={0.01} borderWidth={2} />
              <HabitSection selectedDate={selectedDate} />
            </div>
          </div>
        );
      case 'Your Day':
        return (
          <div className="max-w-6xl mx-auto h-full">
            <EisenhowerMatrix />
          </div>
        );
      case 'Inbox':
        return (
           <div className="max-w-4xl mx-auto">
             <InboxView />
           </div>
        );
      case 'Projects':
        return <DittoDashboard />;
      case 'Workspaces':
        return (
            <div className="max-w-6xl mx-auto">
                <WorkspaceView />
            </div>
        );
      case 'Tasks':
        return (
          <div className="max-w-4xl mx-auto relative rounded-xl overflow-hidden group">
            <GlowingEffect spread={60} glow={true} proximity={80} inactiveZone={0.01} borderWidth={3} />
            <TaskSection selectedDate={selectedDate} />
          </div>
        );
      case 'Habits':
        return (
          <div className="max-w-4xl mx-auto relative rounded-xl overflow-hidden group">
            <GlowingEffect spread={60} glow={true} proximity={80} inactiveZone={0.01} borderWidth={3} />
            <HabitSection selectedDate={selectedDate} />
          </div>
        );
      case 'Events':
        return (
          <div className="max-w-4xl mx-auto relative rounded-xl overflow-hidden group">
            <GlowingEffect spread={60} glow={true} proximity={80} inactiveZone={0.01} borderWidth={3} />
            <EventSection selectedDate={selectedDate} />
          </div>
        );
      case 'Analytics':
        return (
           <div className="max-w-6xl mx-auto">
             <AnalyticsSection />
           </div>
        );
      case 'Repos':
        return (
            <div className="max-w-6xl mx-auto">
                <ReposView />
            </div>
        );
      case 'Settings':
        return (
            <div className="max-w-4xl mx-auto">
                <SettingsView />
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 transition-colors duration-300">
      
      <header className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur border-b border-gray-200 dark:border-neutral-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center py-4 gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                  <LayoutGrid className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Productivity Hub</h1>
              </div>
              <div className="md:hidden flex items-center gap-2">
                 <ThemeToggle />
              </div>
            </div>

            <SlideTabs 
                tabs={isGitHubUser 
                  ? ['Your Day', 'Inbox', 'Dashboard', 'Projects', 'Workspaces', 'Repos', 'Analytics', 'Settings']
                  : ['Your Day', 'Inbox', 'Dashboard', 'Projects', 'Workspaces', 'Analytics', 'Settings']
                } 
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
            
            {/* Mobile Navigation with Custom Slider */}
            <div className="md:hidden w-full">
              <div 
                ref={mobileTabsRef}
                className="overflow-x-auto scrollbar-hide scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onScroll={(e) => {
                  // Use requestAnimationFrame for smoother state updates during scroll
                  requestAnimationFrame(() => {
                    const target = e.currentTarget;
                    const scrollPercentage = (target.scrollLeft / (target.scrollWidth - target.clientWidth)) * 100 || 0;
                    setTabsScrollPosition(scrollPercentage);
                  });
                }}
              >
                <SlideTabs 
                  tabs={['Your Day', 'Inbox', 'Dashboard', 'Projects', 'Workspaces', 'Settings']} 
                  activeTab={activeTab} 
                  onChange={(tab) => setActiveTab(tab as TabType)}
                />
              </div>
              <div className="px-2 pt-2 pb-1">
                <Slider
                  value={[tabsScrollPosition]}
                  max={100}
                  step={1}
                  onValueChange={(value) => {
                    if (mobileTabsRef.current) {
                      const scrollWidth = mobileTabsRef.current.scrollWidth - mobileTabsRef.current.clientWidth;
                      mobileTabsRef.current.scrollLeft = (value[0] / 100) * scrollWidth;
                      setTabsScrollPosition(value[0]);
                    }
                  }}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold dark:text-white mb-1">{activeTab}</h2>
            <p className="text-gray-500 dark:text-gray-400">
              {activeTab === 'Your Day' ? 'Focus on what matters most.' : 
               activeTab === 'Dashboard' ? 'Your productivity at a glance.' :
               activeTab === 'Projects' ? 'Hierarchical task planning and execution.' :
               activeTab === 'Inbox' ? 'Stay updated with your team.' :
               activeTab === 'Workspaces' ? 'Manage your projects and teams.' :
               'Manage your productivity.'}
            </p>
          </div>
          
          {(activeTab === 'Dashboard' || activeTab === 'Tasks' || activeTab === 'Habits' || activeTab === 'Events') && (
            <div className="flex items-center gap-3">
               <CalendarWithPresets 
                    date={selectedDate ? new Date(selectedDate) : undefined} 
                    setDate={handleDateChange} 
               />
            </div>
          )}
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
