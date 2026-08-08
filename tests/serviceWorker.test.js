import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const projectRoot = path.resolve(import.meta.dirname, "..");

function requestPath(request) {
  const value = typeof request === "string" ? request : request.url;
  return new URL(value, "https://fuelconvertertool.test").pathname;
}

test("service worker precaches the built interface and its hashed assets", async () => {
  const serviceWorkerSource = await readFile(
    path.join(projectRoot, "public/sw.js"),
    "utf8"
  );
  const handlers = {};
  const cachedResponses = new Map();
  let online = true;

  const cache = {
    async match(request) {
      return cachedResponses.get(requestPath(request));
    },
    async put(request, response) {
      cachedResponses.set(requestPath(request), response);
    },
    async addAll(requests) {
      await Promise.all(
        requests.map(async (request) => {
          const response = await fetchBuiltFile(request);
          assert.equal(response.ok, true, `Expected ${request} to exist in dist`);
          await this.put(request, response);
        })
      );
    },
  };

  async function fetchBuiltFile(request) {
    if (!online) throw new Error("Offline");

    const pathname = requestPath(request);
    const filePath = pathname === "/"
      ? path.join(projectRoot, "dist/index.html")
      : path.join(projectRoot, "dist", pathname);

    try {
      return new Response(await readFile(filePath), { status: 200 });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  }

  const context = {
    URL,
    fetch: fetchBuiltFile,
    caches: {
      open: async () => cache,
      keys: async () => ["fuel-converter-app-v1"],
      delete: async () => true,
      match: async (request) => cachedResponses.get(requestPath(request)),
    },
    self: {
      location: { origin: "https://fuelconvertertool.test" },
      clients: { claim: async () => {} },
      skipWaiting: async () => {},
      addEventListener(type, handler) {
        handlers[type] = handler;
      },
    },
  };

  vm.runInNewContext(serviceWorkerSource, context);

  let installation;
  handlers.install({ waitUntil: (promise) => { installation = promise; } });
  await installation;

  const builtHtml = await readFile(path.join(projectRoot, "dist/index.html"), "utf8");
  const builtAssets = [...builtHtml.matchAll(/(?:src|href)="(\/assets\/[^"?]+)/g)]
    .map((match) => match[1]);

  assert.ok(cachedResponses.has("/"));
  assert.ok(cachedResponses.has("/index.html"));
  assert.ok(cachedResponses.has("/site.webmanifest"));
  assert.ok(cachedResponses.has("/icon-512.png"));
  assert.ok(builtAssets.length >= 2);
  for (const asset of builtAssets) assert.ok(cachedResponses.has(asset));

  online = false;
  let offlineNavigation;
  handlers.fetch({
    request: {
      method: "GET",
      mode: "navigate",
      url: "https://fuelconvertertool.test/",
    },
    respondWith: (promise) => { offlineNavigation = promise; },
  });

  const offlineResponse = await offlineNavigation;
  assert.equal(offlineResponse.ok, true);
  assert.match(await offlineResponse.text(), /Fuel Converter Tool/);
});

test("production bundle registers the service worker and manifest is app-scoped", async () => {
  const builtHtml = await readFile(path.join(projectRoot, "dist/index.html"), "utf8");
  const scriptPath = builtHtml.match(/src="(\/assets\/[^"]+\.js)"/)?.[1];
  assert.ok(scriptPath);

  const script = await readFile(path.join(projectRoot, "dist", scriptPath), "utf8");
  assert.match(script, /serviceWorker/);
  assert.match(script, /\/sw\.js/);

  const manifest = JSON.parse(
    await readFile(path.join(projectRoot, "dist/site.webmanifest"), "utf8")
  );
  assert.equal(manifest.id, "/");
  assert.equal(manifest.scope, "/");
  assert.ok(manifest.icons.some((icon) => icon.purpose === "maskable"));
});
