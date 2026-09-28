// Run inside the built image: node --test /verification/server.mts.
import { strict as assert } from 'node:assert';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { test } from 'node:test';

// Replace only the remote feed boundary. The real startup and timer run unchanged.
if (process.env.FIRE_FIXTURE === 'recover') {
    let attempts = 0;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
        const url = String(input);
        if (!url.startsWith('https://sigint.atropeano.com/')) return originalFetch(input, init);
        if (url.endsWith('/api/auth/token')) {
            attempts += 1;
            console.log(`fixture-auth:${attempts}`);
            return attempts === 1 ? new Response(null, { status: 503 })
                : new Response(null, { headers: { 'Set-Cookie': 'session=fixture; HttpOnly' } });
        }
        return Response.json({ data: [{ lat: 10, lon: 20 }] });
    };
} else {
    const launch = (port: string | undefined, cwd = '/app'): ChildProcessWithoutNullStreams => {
        const env = { ...process.env, FIRE_FIXTURE: 'recover' };
        delete env.PORT;
        if (port !== undefined) env.PORT = port;
        return spawn(process.execPath, ['--import', import.meta.filename, '/app/dist/server/index.js'], { cwd, env });
    };

    const freePort = async (): Promise<string> => {
        const probe = createServer();
        probe.listen(0, '127.0.0.1');
        await once(probe, 'listening');
        const { port } = probe.address() as AddressInfo;
        probe.close();
        return String(port);
    };

    const closeCode = async (child: ChildProcessWithoutNullStreams): Promise<unknown> => {
        const [code] = await once(child, 'close', { signal: AbortSignal.timeout(15_000) });
        return code;
    };

    const outputLine = (child: ChildProcessWithoutNullStreams, expected: string): Promise<void> =>
        new Promise((resolve, reject) => {
            let output = '';
            const deadline = setTimeout(() => reject(new Error(`Missing output: ${expected}`)), 70_000);
            const read = (chunk: Buffer): void => {
                output += chunk.toString();
                if (!output.includes(expected)) return;
                clearTimeout(deadline);
                child.stdout.off('data', read);
                resolve();
            };
            child.stdout.on('data', read);
        });

    test('missing or invalid PORT fails before listening', async () => {
        for (const port of [undefined, '', '0', '65536', 'junk', '1.5', '-1']) {
            assert.equal(await closeCode(launch(port)), 1, String(port));
        }
    });

    test('missing production build fails preparation', async () => {
        assert.equal(await closeCode(launch(await freePort(), '/tmp')), 1);
    });

    test('occupied listener fails startup', async () => {
        const occupied = createServer();
        occupied.listen(0, '0.0.0.0');
        await once(occupied, 'listening');
        const { port } = occupied.address() as AddressInfo;
        try { assert.equal(await closeCode(launch(String(port))), 1); }
        finally { occupied.close(); }
    });

    test('site is ready without feed; real 60-second retry recovers', async (context) => {
        const port = await freePort();
        const base = `http://127.0.0.1:${port}`;
        const child = launch(port);
        context.after(() => { child.kill(); });
        const first = outputLine(child, 'fixture-auth:1');
        await outputLine(child, 'Server listening');
        await first;
        const started = performance.now();
        assert.equal((await fetch(`${base}/`)).status, 200);
        assert.equal((await fetch(`${base}/workers/globeWorker.js`)).status, 200);
        const empty = await fetch(`${base}/api/fires`);
        assert.equal(empty.status, 503);
        assert.equal(empty.headers.get('cache-control'), 'no-store');
        const redirect = await fetch(`${base}//example.invalid/path?x=1`, {
            headers: { 'x-forwarded-host': 'www.atropeano.com', 'x-forwarded-proto': 'https' }, redirect: 'manual',
        });
        assert.equal(redirect.status, 308);
        assert.equal(redirect.headers.get('location'), 'https://atropeano.com//example.invalid/path?x=1');
        await outputLine(child, 'fixture-auth:2');
        assert.ok(performance.now() - started >= 59_000, 'retry must wait the approved interval');
        const recovered = await fetch(`${base}/api/fires`);
        assert.equal(recovered.status, 200);
        assert.deepEqual([...new Float32Array(await recovered.arrayBuffer())], [10, 20]);
        assert.equal(recovered.headers.get('cache-control'), 'public, max-age=300');
    });
}
