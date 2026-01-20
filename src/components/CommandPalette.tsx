import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useAuth } from "../contexts/AuthContext";
import { useStyle } from "../contexts/StyleContext";
import { 
  Calculator, 
  Calendar, 
  CreditCard, 
  Settings, 
  Smile, 
  User,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
  CheckSquare,
  Target,
  Plus,
  Briefcase,
  GraduationCap,
  PenTool
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { signOut, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { setStyle } = useStyle();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!user) return null;

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[640px] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl shadow-2xl p-2 z-[9999]"
      overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
    >
      <div className="flex items-center border-b border-gray-100 dark:border-neutral-800 px-3" cmdk-input-wrapper="">
        <Command.Input 
          placeholder="Type a command or search..." 
          className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-100"
        />
      </div>
      <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden pt-2 px-2">
        <Command.Empty className="py-6 text-center text-sm text-gray-500">No results found.</Command.Empty>

        <Command.Group heading="General" className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
          <Command.Item 
            onSelect={() => runCommand(() => {})}
            className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer aria-selected:bg-blue-50 dark:aria-selected:bg-neutral-800"
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            <span>Go to Dashboard</span>
          </Command.Item>
          <Command.Item 
             onSelect={() => runCommand(() => setTheme(theme === "dark" ? "light" : "dark"))}
             className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer aria-selected:bg-blue-50 dark:aria-selected:bg-neutral-800"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
            <span>Toggle Theme</span>
          </Command.Item>
        </Command.Group>

        <Command.Group heading="Quick Actions" className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
          <Command.Item 
             onSelect={() => runCommand(() => { 
                // In a real app, this would open the specific modal. 
                // For now we rely on the dashboard to be open.
                // We'll dispatch a custom event that Dashboard listens to.
                window.dispatchEvent(new CustomEvent('open-task-modal'));
             })}
             className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer aria-selected:bg-blue-50 dark:aria-selected:bg-neutral-800"
          >
            <CheckSquare className="w-4 h-4 mr-2" />
            <span>Create New Task</span>
          </Command.Item>
           <Command.Item 
             onSelect={() => runCommand(() => { 
                window.dispatchEvent(new CustomEvent('open-habit-modal'));
             })}
             className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer aria-selected:bg-blue-50 dark:aria-selected:bg-neutral-800"
          >
            <Target className="w-4 h-4 mr-2" />
            <span>Start New Habit</span>
          </Command.Item>
          <Command.Item 
             onSelect={() => runCommand(() => { 
                window.dispatchEvent(new CustomEvent('open-event-modal'));
             })}
             className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer aria-selected:bg-blue-50 dark:aria-selected:bg-neutral-800"
          >
            <Calendar className="w-4 h-4 mr-2" />
            <span>Schedule Event</span>
          </Command.Item>
        </Command.Group>


// ... inside render

        <Command.Group heading="Productivity Mode" className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
           <Command.Item 
             onSelect={() => runCommand(() => setStyle("professional"))}
             className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer aria-selected:bg-blue-50 dark:aria-selected:bg-neutral-800"
          >
            <Briefcase className="w-4 h-4 mr-2" />
            <span>Professional Mode (Standard)</span>
          </Command.Item>
           <Command.Item 
             onSelect={() => runCommand(() => setStyle("student"))}
             className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer aria-selected:bg-blue-50 dark:aria-selected:bg-neutral-800"
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            <span>Student Mode (Compact)</span>
          </Command.Item>
           <Command.Item 
             onSelect={() => runCommand(() => setStyle("creator"))}
             className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer aria-selected:bg-blue-50 dark:aria-selected:bg-neutral-800"
          >
            <PenTool className="w-4 h-4 mr-2" />
            <span>Creator Mode (Focus)</span>
          </Command.Item>
        </Command.Group>

        <Command.Group heading="Account" className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
            <Command.Item 
                onSelect={() => runCommand(() => signOut())}
                className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer aria-selected:bg-blue-50 dark:aria-selected:bg-neutral-800"
            >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Sign Out</span>
            </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
