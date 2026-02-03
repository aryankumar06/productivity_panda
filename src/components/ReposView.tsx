import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { fetchUserRepos, GitHubRepo } from '../lib/github';
import { 
  GitBranch, 
  Star, 
  AlertCircle, 
  Plus,
  ExternalLink,
  Lock,
  FolderGit2,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Button } from './ui/button';

interface ImportedRepo {
  id: string;
  repo_id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stars_count: number;
  open_issues_count: number;
  imported_at: string;
}

export default function ReposView() {
  const { user, isGitHubUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [importedRepos, setImportedRepos] = useState<ImportedRepo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importingRepoId, setImportingRepoId] = useState<number | null>(null);

  // Fetch imported repos from Supabase
  const fetchImportedRepos = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('github_repos')
      .select('*')
      .eq('user_id', user.id)
      .order('imported_at', { ascending: false });

    if (error) {
      console.error('Error fetching imported repos:', error);
    } else {
      setImportedRepos(data || []);
    }
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchImportedRepos();
      setLoading(false);
    };
    loadData();
  }, [user]);

  // Sync repos from GitHub
  const handleSyncRepos = async () => {
    if (!isGitHubUser) {
      setError('Please sign in with GitHub to sync repositories.');
      return;
    }

    setSyncing(true);
    setError(null);

    try {
      const repos = await fetchUserRepos();
      setGithubRepos(repos);
      setShowImportModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch repositories');
    } finally {
      setSyncing(false);
    }
  };

  // Import a repository
  const handleImportRepo = async (repo: GitHubRepo) => {
    if (!user) return;
    setImportingRepoId(repo.id);

    const { error } = await supabase
      .from('github_repos')
      .upsert({
        user_id: user.id,
        repo_id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        language: repo.language,
        stars_count: repo.stargazers_count,
        open_issues_count: repo.open_issues_count,
      }, { onConflict: 'user_id,repo_id' });

    if (error) {
      console.error('Error importing repo:', error);
    } else {
      await fetchImportedRepos();
    }
    setImportingRepoId(null);
  };

  // Language color mapping
  const getLanguageColor = (language: string | null) => {
    const colors: Record<string, string> = {
      TypeScript: 'bg-blue-500',
      JavaScript: 'bg-yellow-400',
      Python: 'bg-green-500',
      Java: 'bg-orange-500',
      Go: 'bg-cyan-500',
      Rust: 'bg-orange-600',
      Ruby: 'bg-red-500',
      PHP: 'bg-purple-500',
      'C++': 'bg-pink-500',
      C: 'bg-gray-500',
    };
    return colors[language || ''] || 'bg-gray-400';
  };

  if (!isGitHubUser) {
    return (
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-12 border border-gray-200 dark:border-neutral-800 text-center">
          <FolderGit2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold dark:text-white mb-2">GitHub Integration</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Sign in with GitHub to import your repositories and generate tasks from issues.
          </p>
          <Button variant="outline" onClick={() => window.location.href = '/auth'}>
            Sign in with GitHub
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
            <GitBranch className="w-6 h-6" />
            Repositories
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Import GitHub repos and manage tasks from issues
          </p>
        </div>
        <Button onClick={handleSyncRepos} disabled={syncing} className="gap-2">
          {syncing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Import Repository
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}

      {/* Empty State */}
      {!loading && importedRepos.length === 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-12 border border-gray-200 dark:border-neutral-800 text-center">
          <FolderGit2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold dark:text-white mb-2">No repositories imported</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Click "Import Repository" to get started
          </p>
        </div>
      )}

      {/* Imported Repos Grid */}
      {!loading && importedRepos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {importedRepos.map((repo) => {
            const stats = {
              stars: repo.stars_count,
              issues: repo.open_issues_count,
              language: repo.language || 'Unknown',
            };

            return (
              <div
                key={repo.id}
                className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold dark:text-white truncate group-hover:text-blue-500 transition-colors">
                      {repo.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {repo.full_name}
                    </p>
                  </div>
                  <a
                    href={`https://github.com/${repo.full_name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-500 p-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {repo.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {repo.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  {stats.language !== 'Unknown' && (
                    <span className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${getLanguageColor(repo.language)}`}></span>
                      {stats.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {stats.stars}
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {stats.issues} issues
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-xl border border-gray-200 dark:border-neutral-800 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-800">
              <h3 className="text-lg font-bold dark:text-white">Select Repositories to Import</h3>
              <button 
                onClick={() => setShowImportModal(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {githubRepos.map((repo) => {
                const isImported = importedRepos.some((r) => r.repo_id === repo.id);
                const isImporting = importingRepoId === repo.id;

                return (
                  <div
                    key={repo.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {repo.private && <Lock className="w-4 h-4 text-gray-400 shrink-0" />}
                      <div className="min-w-0">
                        <p className="font-medium dark:text-white truncate">{repo.name}</p>
                        <p className="text-xs text-gray-500 truncate">{repo.description || 'No description'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {repo.stargazers_count}
                      </span>
                      {isImported ? (
                        <span className="flex items-center gap-1 text-green-500 text-sm">
                          <CheckCircle2 className="w-4 h-4" />
                          Imported
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleImportRepo(repo)}
                          disabled={isImporting}
                        >
                          {isImporting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Import'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-neutral-800">
              <Button variant="outline" className="w-full" onClick={() => setShowImportModal(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
