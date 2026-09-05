import next from 'next';
import { createServer } from 'http';
import type { UrlWithParsedQuery } from 'url';
import { externalLinks } from '../src/constants/links';

const canonicalHost = 'atropeano.com';
const wwwHost = `www.${canonicalHost}`;
const strictTransportSecurity = 'max-age=31536000; includeSubDomains';
const HTTP_STATUS_SERVICE_UNAVAILABLE = 503;
type HeaderValue = string | string[] | undefined;

const getHeaderValue = (
    header: HeaderValue
): string | undefined => Array.isArray(header) ? header[0] : header;

const getRequestHost = (
    header: HeaderValue
): string | undefined =>
    getHeaderValue(header)
        ?.split(',')[0]
        .trim()
        .toLowerCase()
        .replace(/:\d+$/, '');

const getForwardedProto = (
    header: HeaderValue
): string | undefined =>
    getHeaderValue(header)
        ?.split(',')[0]
        .trim()
        .toLowerCase();

const SIGINT_AUTH_URL = new URL('/api/auth/token', externalLinks.sigint).toString();
const SIGINT_FIRES_URL = new URL('/api/fires/latest', externalLinks.sigint).toString();
const FIRE_REFRESH_MS = 30 * 60 * 1000;
const FIRE_FETCH_TIMEOUT_MS = 30_000;
let fireBuffer: Buffer = Buffer.alloc(0);

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

const parseFireBuffer = (payload: unknown): Buffer | null => {
    const data = isRecord(payload) ? payload.data : null;
    if (!Array.isArray(data)) return null;
    const coordinates: number[] = [];
    for (const point of data) {
        if (!isRecord(point)) continue;
        const latitude = point.lat;
        const longitude = point.lon;
        if (typeof latitude !== 'number' || typeof longitude !== 'number') continue;
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;
        if (latitude === 0 && longitude === 0) continue;
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) continue;
        coordinates.push(latitude, longitude);
    }
    if (coordinates.length === 0) return null;
    const points = new Float32Array(coordinates);
    return Buffer.from(points.buffer, points.byteOffset, points.byteLength);
};

const readSessionCookie = (response: Response): string | null => {
    const setCookie = response.headers.get('set-cookie');
    const separator = setCookie?.indexOf(';') ?? -1;
    if (!setCookie || separator <= 0) return null;
    const cookie = setCookie.slice(0, separator);
    const assignment = cookie.indexOf('=');
    return assignment > 0 && assignment < cookie.length - 1 ? cookie : null;
};

const fetchFireBuffer = async (): Promise<Buffer | null> => {
    try {
        const authResponse = await fetch(SIGINT_AUTH_URL, {
            signal: AbortSignal.timeout(FIRE_FETCH_TIMEOUT_MS),
        });
        if (!authResponse.ok) return null;
        const sessionCookie = readSessionCookie(authResponse);
        if (!sessionCookie) return null;
        const response = await fetch(SIGINT_FIRES_URL, {
            headers: { Cookie: sessionCookie },
            signal: AbortSignal.timeout(FIRE_FETCH_TIMEOUT_MS),
        });
        if (!response.ok) return null;
        return parseFireBuffer(await response.json());
    } catch {
        return null;
    }
};

const refreshFires = async (): Promise<void> => {
    const nextBuffer = await fetchFireBuffer();
    if (nextBuffer) {
        fireBuffer = nextBuffer;
        return;
    }
    console.warn('SIGINT fire refresh failed; retaining the previous cache');
};

const startServer = async () => {
    const port = Number.parseInt(process.env.PORT ?? '5500', 10);
    const dev = process.env.NODE_ENV !== 'production';

    const app = next({ dev });
    const handle = app.getRequestHandler();



    app.prepare().then(() => {
        // Warm the fire cache at boot, then keep it fresh on an interval.
        void refreshFires();
        setInterval(() => {
            void refreshFires();
        }, FIRE_REFRESH_MS);

        createServer((req, res) => {
            // WHATWG URL parsing (legacy url.parse is deprecated, DEP0169). The
            // base is only used to satisfy the parser; we read path/query only.
            const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

            // Served straight from the in-memory FIRMS cache (always-on process).
            if (url.pathname === '/api/fires') {
                if (fireBuffer.byteLength === 0) {
                    res.statusCode = HTTP_STATUS_SERVICE_UNAVAILABLE;
                    res.setHeader('Cache-Control', 'no-store');
                    res.end();
                    return;
                }
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
