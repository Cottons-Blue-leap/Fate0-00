// Cloudflare Workers entry point
// Note: This file is for future Cloudflare Workers deployment.
// For Cloudflare, you'd need to replace sql.js with D1 or Turso.
// Currently, use the Node.js server (index.ts) for local/VPS deployment.

export default {
  async fetch(): Promise<Response> {
    return new Response(
      JSON.stringify({
        message: 'Fate 0:00 API — Cloudflare Workers entry point. Configure D1/Turso before deploying.',
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  },
};
