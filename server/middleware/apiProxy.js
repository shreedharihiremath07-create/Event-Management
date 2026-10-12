const forwardedHeaders = ['accept', 'content-type', 'authorization'];

export const createApiProxy = (target) => {
  const upstream = new URL(target);
  if (upstream.protocol !== 'http:' && upstream.protocol !== 'https:') {
    throw new Error('API_PROXY_TARGET must use HTTP or HTTPS.');
  }
  if (upstream.pathname !== '/' || upstream.search || upstream.hash || upstream.username || upstream.password) {
    throw new Error('API_PROXY_TARGET must be an origin without a path or credentials.');
  }

  return async (req, res) => {
    try {
      const url = new URL(req.originalUrl, upstream.origin);
      if (url.origin !== upstream.origin) {
        return res.status(400).json({ error: 'Invalid API request path.' });
      }
      const headers = {};

      for (const name of forwardedHeaders) {
        const value = req.get(name);
        if (value) headers[name] = value;
      }

      const hasBody = !['GET', 'HEAD'].includes(req.method) && req.body !== undefined;
      const response = await fetch(url, {
        method: req.method,
        headers,
        ...(hasBody ? { body: JSON.stringify(req.body) } : {})
      });
      const body = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get('content-type');

      res.status(response.status);
      if (contentType) res.setHeader('Content-Type', contentType);
      res.send(body);
    } catch (error) {
      console.error(`API proxy failed for ${req.method} ${req.originalUrl}:`, error);
      res.status(502).json({ error: 'The API service is unavailable.' });
    }
  };
};
