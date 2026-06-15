import next from 'next';
import { createServer } from 'http';
import type { UrlWithParsedQuery } from 'url';

const canonicalHost = 'atropeano.com';
const wwwHost = `www.${canonicalHost}`;
const strictTransportSecurity = 'max-age=31536000; includeSubDomains';

const getHeaderValue = (
    header: string | string[] | undefined
): string | undefined => Array.isArray(header) ? header[0] : header;

const getRequestHost = (
    header: string | string[] | undefined
): string | undefined =>
    getHeaderValue(header)
        ?.split(',')[0]
        .trim()
        .toLowerCase()
        .replace(/:\d+$/, '');

const getForwardedProto = (
    header: string | string[] | undefined
): string | undefined =>
    getHeaderValue(header)
        ?.split(',')[0]
        .trim()
        .toLowerCase();

// ── Global fire cache (NASA FIRMS VIIRS NOAA-20, last 24h) ──────────
// This is an always-on process, so the fires are fetched + parsed on an
// interval and held in memory as a packed Float32 [lat, lon] buffer. /api/fires
// serves it with zero per-request work. FIRMS has no CORS, so it must be server
// side; the globe worker reads the buffer straight into a typed array.
// NASA FIRMS VIIRS NOAA-20, global, last 24h - keyless bulk file (~44k rows,
// the fuller dataset; the keyed NRT API returns fewer). lat col 0, lon col 1.
const FIRMS_URL =
    'https://firms.modaps.eosdis.nasa.gov/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_Global_24h.csv';
const FIRMS_REFRESH_MS = 30 * 60 * 1000;
let fireBuffer: Buffer = Buffer.alloc(0);

const refreshFires = async (): Promise<void> => {
    try {
        const res = await fetch(FIRMS_URL);
        if (!res.ok) return;
        const csv = await res.text();
        const lines = csv.split('\n');
        const coords: number[] = [];
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');
            if (cols.length < 2) continue;
            const lat = Number.parseFloat(cols[0]);
            const lon = Number.parseFloat(cols[1]);
            if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
            if (lat === 0 && lon === 0) continue;
            if (lat < -90 || lat > 90 || lon < -180 || lon > 180) continue;
            coords.push(lat, lon);
        }
        const f32 = new Float32Array(coords);
        fireBuffer = Buffer.from(f32.buffer, 0, f32.byteLength);
    } catch (error) {
        console.error('FIRMS refresh failed', error);
    }
};

const startServer = async () => {
    const port = parseInt(process.env.PORT ?? '3000', 10);
    const dev = process.env.NODE_ENV !== 'production';

    const app = next({ dev });
    const handle = app.getRequestHandler();



    app.prepare().then(() => {
        // Warm the fire cache at boot, then keep it fresh on an interval.
        void refreshFires();
        setInterval(() => {
            void refreshFires();
        }, FIRMS_REFRESH_MS);

        createServer((req, res) => {
            // WHATWG URL parsing (legacy url.parse is deprecated, DEP0169). The
            // base is only used to satisfy the parser; we read path/query only.
            const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

            // Served straight from the in-memory FIRMS cache (always-on process).
            if (url.pathname === '/api/fires') {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/octet-stream');
                res.setHeader('Cache-Control', 'public, max-age=300');
                res.end(fireBuffer);
                return;
            }

            const requestHost = getRequestHost(
                req.headers['x-forwarded-host'] ?? req.headers.host
            );
            const forwardedProto = getForwardedProto(req.headers['x-forwarded-proto']);
            const shouldRedirectHost = requestHost === wwwHost;
            const shouldRedirectProto =
                requestHost === canonicalHost && forwardedProto === 'http';

            if (!dev && (shouldRedirectHost || shouldRedirectProto)) {
                const location = new URL(req.url ?? '/', `https://${canonicalHost}`);

                res.statusCode = 308;
                res.setHeader('Location', location.toString());
                res.setHeader('Vary', 'Host, X-Forwarded-Proto');

                if (forwardedProto !== 'http') {
                    res.setHeader('Strict-Transport-Security', strictTransportSecurity);
                }

                res.end();
                return;
            }

            const parsedUrl = {
                pathname: url.pathname,
                search: url.search,
                path: url.pathname + url.search,
                href: url.pathname + url.search,
                query: Object.fromEntries(url.searchParams),
            } as unknown as UrlWithParsedQuery;
            handle(req, res, parsedUrl);
        }).listen(port)

        console.log(
            `> Server listening at http://localhost:${port} as ${dev ? 'development' : process.env.NODE_ENV
            }`
        )
    });
};


if (require.main === module) {
    (async () => {
        try {
            await startServer();
        } catch (error) {
            console.error(error);
            process.exit(1);
        }
    })()
}
