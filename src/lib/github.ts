import { supabase } from './supabase';

// Types for GitHub API responses
export interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    language: string | null;
    stargazers_count: number;
    open_issues_count: number;
    html_url: string;
    private: boolean;
    updated_at: string;
}

export interface GitHubIssue {
    id: number;
    number: number;
    title: string;
    body: string | null;
    state: 'open' | 'closed';
    labels: { name: string; color: string }[];
    assignee: { login: string } | null;
    created_at: string;
    html_url: string;
}

export interface GitHubCommitActivity {
    total: number;
    week: number;
    days: number[];
}

// Get GitHub access token from Supabase session
async function getGitHubToken(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    return data.session?.provider_token || null;
}

// Fetch user's GitHub repositories
export async function fetchUserRepos(): Promise<GitHubRepo[]> {
    const token = await getGitHubToken();
    if (!token) {
        throw new Error('GitHub token not available. Please sign in with GitHub.');
    }

    const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch repos: ${response.statusText}`);
    }

    return response.json();
}

// Fetch issues for a specific repository
export async function fetchRepoIssues(owner: string, repo: string): Promise<GitHubIssue[]> {
    const token = await getGitHubToken();
    if (!token) {
        throw new Error('GitHub token not available. Please sign in with GitHub.');
    }

    const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=50`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch issues: ${response.statusText}`);
    }

    return response.json();
}

// Fetch commit activity for performance metrics
export async function fetchRepoCommitActivity(
    owner: string,
    repo: string
): Promise<GitHubCommitActivity[]> {
    const token = await getGitHubToken();
    if (!token) {
        throw new Error('GitHub token not available. Please sign in with GitHub.');
    }

    const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/stats/commit_activity`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        }
    );

    if (!response.ok) {
        // GitHub returns 202 while computing stats
        if (response.status === 202) {
            return [];
        }
        throw new Error(`Failed to fetch commit activity: ${response.statusText}`);
    }

    return response.json();
}

// Convert GitHub issues to tasks
export function convertIssuesToTasks(issues: GitHubIssue[]) {
    return issues.map((issue) => ({
        title: issue.title,
        description: issue.body || '',
        source_type: 'issue' as const,
        source_id: String(issue.number),
        status: issue.state === 'open' ? 'todo' : 'done',
        priority: issue.labels.some((l) => l.name.toLowerCase().includes('urgent'))
            ? 'urgent'
            : issue.labels.some((l) => l.name.toLowerCase().includes('high'))
                ? 'high'
                : 'medium',
        labels: issue.labels.map((l) => l.name),
    }));
}

// Get repository statistics summary
export function getRepoStats(repo: GitHubRepo) {
    return {
        stars: repo.stargazers_count,
        issues: repo.open_issues_count,
        language: repo.language || 'Unknown',
        isPrivate: repo.private,
        lastUpdated: new Date(repo.updated_at).toLocaleDateString(),
    };
}
