const routes = { "/": () => "Hello from Prism", "/health": () => "ok" };

export function route(req, res) {
  const handler = routes[req.url];
  res.writeHead(handler ? 200 : 404, { "content-type": "text/plain" });
  res.end(handler ? handler() : "Not found");
}
