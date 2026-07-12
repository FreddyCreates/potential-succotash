export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string };
  private: boolean;
  html_url: string;
  description: string | null;
  default_branch: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  archived: boolean;
  pushed_at: string;
  updated_at: string;
}

export interface GitHubFileContent {
  type: "file" | "dir" | "symlink" | "submodule";
  name: string;
  path: string;
  sha: string;
  size: number;
  content?: string;
  encoding?: string;
  html_url: string;
}

export interface GitHubBranch {
  name: string;
  commit: { sha: string; url: string };
  protected: boolean;
}

export interface GitHubCommit {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: { name: string; email: string; date: string } | null;
  };
  author: { login: string } | null;
}

export interface GitHubPullRequest {
  id: number;
  node_id: string;
  number: number;
  state: "open" | "closed";
  draft: boolean;
  title: string;
  body: string | null;
  html_url: string;
  user: { login: string } | null;
  head: { ref: string; sha: string };
  base: { ref: string; sha: string };
  merged: boolean;
  mergeable: boolean | null;
  mergeable_state: string;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubPullRequestFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export interface GitHubIssueComment {
  id: number;
  html_url: string;
  user: { login: string } | null;
  body: string;
  created_at: string;
}
