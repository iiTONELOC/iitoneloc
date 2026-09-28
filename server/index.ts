import next from 'next';
import { createServer, type IncomingMessage, type ServerResponse } from 'http';
import { externalLinks } from '../src/constants/links';

const canonicalHost = 'atropeano.com';
const wwwHost = `www.${canonicalHost}`;
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
const FIRE_STARTUP_RETRY_MS = 60_000;
const MAX_LISTEN_PORT = 65535;
const INVALID_PORT_MESSAGE = `PORT must be set to an integer from 1 to ${MAX_LISTEN_PORT}`;
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
    if (nextBuffer) fireBuffer = nextBuffer;
    else console.warn('SIGINT fire refresh failed; retaining the previous cache');
    const delay = fireBuffer.byteLength ? FIRE_REFRESH_MS : FIRE_STARTUP_RETRY_MS;
    setTimeout(() => { void refreshFires(); }, delay).unref();
};

const serveFires = (res: ServerResponse): void => {
    if (fireBuffer.byteLength === 0) {
        res.statusCode = HTTP_STATUS_SERVICE_UNAVAILABLE;
        res.setHeader('Cache-Control', 'no-store');
    } else {
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Cache-Control', 'public, max-age=300');
    }
    res.end(fireBuffer);
};

const redirectCanonical = (req: IncomingMessage, res: ServerResponse): boolean => {
    const requestHost = getRequestHost(req.headers['x-forwarded-host'] ?? req.headers.host);
    const forwardedProto = getForwardedProto(req.headers['x-forwarded-proto']);
    if (requestHost !== wwwHost && !(requestHost === canonicalHost && forwardedProto === 'http')) return false;
    const location = new URL(`https://${canonicalHost}${req.url?.startsWith('/') ? req.url : '/'}`);
    res.statusCode = 308;
    res.setHeader('Location', location.toString());
    res.setHeader('Vary', 'Host, X-Forwarded-Proto');
    res.end();
    return true;
};

const startServer = async (): Promise<void> => {
    const rawPort = process.env.PORT ?? '';
    const port = Number(rawPort);
    if (!/^\d+$/.test(rawPort) || port < 1 || port > MAX_LISTEN_PORT) {
        throw new RangeError(INVALID_PORT_MESSAGE);
    }
    const dev = process.env.NODE_ENV !== 'production';
    const app = next({ dev });
    await app.prepare();
    const handle = app.getRequestHandler();
    const server = createServer((req, res) => {
        const url = new URL(req.url ?? '/', 'http://localhost');
        if (url.pathname === '/api/fires') { serveFires(res); return; }
        if (!dev && redirectCanonical(req, res)) return;
        void handle(req, res);
    });
    await new Promise<void>((resolve, reject) => {
        server.once('error', reject);
        server.listen(port, '0.0.0.0', resolve);
    });
    void refreshFires();
    console.log(`> Server listening on port ${port}`);
};

if (require.main === module) {
    startServer().catch((error: unknown) => {
        console.error(error);
        process.exit(1);
    });
}
