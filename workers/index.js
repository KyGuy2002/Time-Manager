addEventListener('fetch', (event) => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const response = new Response('Hello, Cloudflare Workers!', {
        headers: { 'content-type': 'text/plain' },
    });
    return response;
}