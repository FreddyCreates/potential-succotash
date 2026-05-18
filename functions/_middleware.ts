/**
 * Nova Gate — Global Middleware
 * Adds coherence headers and logging to all Pages Functions
 */

interface RequestContext {
  request: Request;
  next: () => Promise<Response>;
  env: Record<string, unknown>;
  waitUntil: (promise: Promise<unknown>) => void;
}

const PHI = 1.618033988749895;
const HEARTBEAT_MS = 873;

export async function onRequest(ctx: RequestContext): Promise<Response> {
  const start = Date.now();
  
  // Process the request
  const response = await ctx.next();
  
  // Calculate duration
  const duration = Date.now() - start;
  
  // Add coherence headers to all responses
  const headers = new Headers(response.headers);
  headers.set('X-Nova-Gate', 'active');
  headers.set('X-Phi-Constant', PHI.toString());
  headers.set('X-Heartbeat-MS', HEARTBEAT_MS.toString());
  headers.set('X-Response-Time-MS', duration.toString());
  headers.set('X-Timestamp', new Date().toISOString());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
