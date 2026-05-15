/**
 * Cloudflare Workers AI Skill (optional)
 * Stores account/token locally and calls Workers AI REST API.
 */

const CF_KEY = 'vigil_cloudflare_workers_ai';
const DEFAULT_MODEL = '@cf/meta/llama-3.1-8b-instruct';

export interface CloudflareConfig {
  accountId: string;
  apiToken: string;
  model: string;
}

export interface CloudflareConfigSafe {
  accountId: string;
  model: string;
  hasToken: boolean;
  maskedToken: string;
}

export const CF_FREE_MODELS = [
  '@cf/meta/llama-3.1-8b-instruct',
  '@cf/meta/llama-3.2-3b-instruct',
  '@cf/mistral/mistral-7b-instruct-v0.2',
  '@cf/google/gemma-2b-it-lora',
  '@cf/qwen/qwen1.5-7b-chat-awq',
];

function maskToken(t: string): string {
  if (!t) return '';
  if (t.length <= 10) return '••••••';
  return `${t.slice(0, 6)}••••••${t.slice(-4)}`;
}

export async function cfSetConfig(input: Partial<CloudflareConfig>): Promise<CloudflareConfigSafe> {
  const prev = await cfGetConfigRaw();
  const next: CloudflareConfig = {
    accountId: (input.accountId ?? prev.accountId ?? '').trim(),
    apiToken: (input.apiToken ?? prev.apiToken ?? '').trim(),
    model: (input.model ?? prev.model ?? DEFAULT_MODEL).trim() || DEFAULT_MODEL,
  };
  await new Promise<void>(resolve => chrome.storage.local.set({ [CF_KEY]: next }, () => resolve()));
  return {
    accountId: next.accountId,
    model: next.model,
    hasToken: !!next.apiToken,
    maskedToken: maskToken(next.apiToken),
  };
}

export async function cfGetConfigRaw(): Promise<CloudflareConfig> {
  return new Promise(resolve => {
    chrome.storage.local.get([CF_KEY], data => {
      const d = (data[CF_KEY] as Partial<CloudflareConfig>) || {};
      resolve({
        accountId: (d.accountId || '').trim(),
        apiToken: (d.apiToken || '').trim(),
        model: (d.model || DEFAULT_MODEL).trim() || DEFAULT_MODEL,
      });
    });
  });
}

export async function cfGetConfigSafe(): Promise<CloudflareConfigSafe> {
  const c = await cfGetConfigRaw();
  return {
    accountId: c.accountId,
    model: c.model,
    hasToken: !!c.apiToken,
    maskedToken: maskToken(c.apiToken),
  };
}

function cfEndpoint(accountId: string, model: string): string {
  return `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/ai/run/${encodeURIComponent(model)}`;
}

export async function cfRunMessages(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  overrideModel?: string,
): Promise<{ ok: boolean; output: string; model: string }> {
  const cfg = await cfGetConfigRaw();
  const model = (overrideModel || cfg.model || DEFAULT_MODEL).trim();
  if (!cfg.accountId) return { ok: false, output: 'Missing Cloudflare account ID. Set it in the Cloud panel first.', model };
  if (!cfg.apiToken) return { ok: false, output: 'Missing Cloudflare API token. Set it in the Cloud panel first.', model };

  const resp = await fetch(cfEndpoint(cfg.accountId, model), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.apiToken}`,
    },
    body: JSON.stringify({ messages }),
  });

  const json = await resp.json().catch(() => ({} as Record<string, unknown>));
  if (!resp.ok || (json as { success?: boolean }).success === false) {
    const err = ((json as { errors?: Array<{ message?: string }> }).errors || [])[0]?.message || `HTTP ${resp.status}`;
    return { ok: false, output: `Cloudflare API error: ${err}`, model };
  }

  const result = (json as { result?: { response?: string } }).result;
  return { ok: true, output: result?.response || JSON.stringify(result || json, null, 2), model };
}

export async function cfTestConnection(): Promise<{ ok: boolean; output: string; model: string }> {
  return cfRunMessages([
    { role: 'system', content: 'You are a concise assistant.' },
    { role: 'user', content: 'Reply with exactly: CLOUDFARE_WORKERS_AI_OK' },
  ]);
}

export async function cfSummarizeText(text: string): Promise<{ ok: boolean; output: string; model: string }> {
  const trimmed = (text || '').slice(0, 16000);
  return cfRunMessages([
    { role: 'system', content: 'You summarize clearly and compactly in markdown bullets.' },
    { role: 'user', content: `Summarize the following content:\n\n${trimmed}` },
  ]);
}

export async function cfResearchBrief(topic: string): Promise<{ ok: boolean; output: string; model: string }> {
  const t = (topic || 'general topic').slice(0, 400);
  return cfRunMessages([
    { role: 'system', content: 'You are a research analyst. Return concise markdown with sections: Overview, Key Findings, Open Questions, Next Experiments.' },
    { role: 'user', content: `Create a starter research brief for: ${t}` },
  ]);
}

