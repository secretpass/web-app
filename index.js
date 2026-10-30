// Cloudflare Worker File
export default {
  async fetch(request, env, ctx) {
    // Attempt to fetch the static asset from the dist folder
    let response = await env.ASSETS.fetch(request);

    // If the file is not found (404), fall back to index.html for SPA routing
    if (response.status === 404) {
      const url = new URL(request.url);
      url.pathname = "/index.html";
      response = await env.ASSETS.fetch(new Request(url, request));
    }

    return response;
  },
};
