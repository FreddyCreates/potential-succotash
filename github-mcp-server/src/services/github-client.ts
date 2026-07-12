import axios, { AxiosError, AxiosInstance } from "axios";
import { API_VERSION, CHARACTER_LIMIT, GITHUB_API_URL, GITHUB_GRAPHQL_URL } from "../constants.js";

let restClient: AxiosInstance | null = null;
let graphqlClient: AxiosInstance | null = null;

function getToken(): string {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error(
      "GITHUB_TOKEN environment variable is not set. Set it to a GitHub personal access token before starting this server."
    );
  }
  return token;
}

function getRestClient(): AxiosInstance {
  if (!restClient) {
    restClient = axios.create({
      baseURL: GITHUB_API_URL,
      timeout: 30000,
      headers: {
        Authorization: `Bearer ${getToken()}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": API_VERSION,
      },
    });
  }
  return restClient;
}

function getGraphQLClient(): AxiosInstance {
  if (!graphqlClient) {
    graphqlClient = axios.create({
      baseURL: GITHUB_GRAPHQL_URL,
      timeout: 30000,
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });
  }
  return graphqlClient;
}

export async function githubRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  data?: unknown,
  params?: Record<string, unknown>
): Promise<T> {
  const client = getRestClient();
  const response = await client.request<T>({
    url: endpoint,
    method,
    data,
    params,
  });
  return response.data;
}

export async function githubGraphQL<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const client = getGraphQLClient();
  const response = await client.post("", { query, variables });
  if (response.data.errors && response.data.errors.length > 0) {
    const messages = response.data.errors.map((e: { message: string }) => e.message).join("; ");
    throw new Error(`GitHub GraphQL error: ${messages}`);
  }
  return response.data.data as T;
}

export function handleGitHubError(error: unknown, context?: string): string {
  const prefix = context ? `Error (${context}): ` : "Error: ";
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; errors?: unknown[] }>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      const apiMessage = axiosError.response.data?.message;
      switch (status) {
        case 401:
          return `${prefix}Authentication failed (401). Check that GITHUB_TOKEN is set and valid.`;
        case 403:
          return `${prefix}Permission denied or rate limited (403)${
            apiMessage ? `: ${apiMessage}` : ""
          }. Check the token has the required scopes (repo / contents / pull-requests) for this repository.`;
        case 404:
          return `${prefix}Not found (404). Check the owner/repo/branch/PR number is correct and the token has access to it.`;
        case 409:
          return `${prefix}Conflict (409)${
            apiMessage ? `: ${apiMessage}` : ""
          }. This often means a branch/file SHA is out of date, or a merge conflict exists.`;
        case 422:
          return `${prefix}Validation failed (422)${
            apiMessage ? `: ${apiMessage}` : ""
          }. Check the request parameters (e.g. branch already exists, PR already open for this head/base pair).`;
        default:
          return `${prefix}GitHub API request failed with status ${status}${
            apiMessage ? `: ${apiMessage}` : ""
          }`;
      }
    } else if (axiosError.code === "ECONNABORTED") {
      return `${prefix}Request timed out. Please try again.`;
    }
  }
  return `${prefix}${error instanceof Error ? error.message : String(error)}`;
}

export function truncateText(text: string, limit: number = CHARACTER_LIMIT): {
  text: string;
  truncated: boolean;
} {
  if (text.length <= limit) {
    return { text, truncated: false };
  }
  return {
    text: `${text.slice(0, limit)}\n\n[...truncated, ${text.length - limit} more characters. Narrow your query or use pagination.]`,
    truncated: true,
  };
}
