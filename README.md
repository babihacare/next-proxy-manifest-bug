# next-proxy-manifest-bug

Minimal reproduction for: **Turbopack emits an empty `middleware-manifest.json` for `proxy.ts` on Next 16.2.4 (Windows; both root and `src/` placement)**.

Refile of vercel/next.js#93320 (closed by the auto-bot for missing reproduction).

## How to reproduce the bug

```bash
npm install
npm run build
cat .next/server/middleware-manifest.json
```

Expected: `middleware` map populated with the `/admin/:path*` matcher.

Actual:

```json
{
  "version": 3,
  "middleware": {},
  "sortedMiddleware": [],
  "functions": {}
}
```

The build summary silently omits any "Proxy (Middleware)" line — there's no warning, no error, no log. The file looks like it was simply never seen, even though it sits at the project root and exports the documented `proxy` symbol. At runtime the proxy is skipped: the `x-proxy-ran` header never appears on `/admin` responses.

For comparison, building the same project with the file renamed to root `middleware.ts` (export `middleware`) prints `ƒ Proxy (Middleware)` in the build summary AND populates the manifest correctly. So Next's build is treating `proxy.ts` and `middleware.ts` differently in the Turbopack manifest-writing path.

## How to confirm the workaround works

1. Rename `proxy.ts` to `middleware.ts` at the project root.
2. Rename the export from `proxy` to `middleware`.
3. Rebuild:
   ```bash
   npm run build
   cat .next/server/middleware-manifest.json
   ```
4. Manifest now contains `"middleware": { "/": { ... } }` and the `x-proxy-ran` header appears on `/admin` responses.

## Environment

```
Operating System: Windows 11 Home (win32 x64)
Node: 25.9.0
npm: 11.12.1
next: 16.2.4
react: 19.2.5
react-dom: 19.2.5
typescript: 6.0.2
```

## Also tested

- `src/proxy.ts` placement — same result, manifest is empty.
- Patch upgrade 16.2.3 → 16.2.4 — same result.
- Vercel production builds (Linux Lambda) — also affected; we only ship `middleware.ts` to production for this reason.

## Prior art

- vercel/next.js#85243 (closed, locked) — same symptom on 16.2.x.
- vercel/next.js#85443 (PR cited as fix) — does not resolve the bug for our reproduction.
