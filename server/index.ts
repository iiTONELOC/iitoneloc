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

const startServer = async () => {
    const port = parseInt(process.env.PORT ?? '3000', 10);
    const dev = process.env.NODE_ENV !== 'production';

    const app = next({ dev });
    const handle = app.getRequestHandler();



    app.prepare().then(() => {
        createServer((req, res) => {
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

            // WHATWG URL parsing (legacy url.parse is deprecated, DEP0169). The
            // base is only used to satisfy the parser; we read path/query only.
            const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
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
