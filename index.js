const { Command } = require('commander');
const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const program = new Command();
program
  .requiredOption('-h, --host <host>', 'server host')
  .requiredOption('-p, --port <port>', 'server port')
  .requiredOption('-c, --cache <path>', 'cache directory')
  .parse(process.argv);

const options = program.opts();
const { host, port, cache } = options;

const server = http.createServer(async (req, res) => {
  const urlParts = req.url.split('/');
  const code = urlParts[1];

  if (!code || !/^\d{3}$/.test(code)) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Bad Request: URL must be in format /<http_code>');
    return;
  }

  const filePath = path.join(cache, `${code}.jpg`);

  try {
    switch (req.method) {
      case 'GET':
        try {
          const data = await fs.readFile(filePath);
          res.writeHead(200, { 'Content-Type': 'image/jpeg' });
          res.end(data);
        } catch {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        }
        break;

      case 'PUT':
        let body = [];
        req.on('data', chunk => body.push(chunk));
        req.on('end', async () => {
          try {
            const buffer = Buffer.concat(body);
            await fs.writeFile(filePath, buffer);
            res.writeHead(201, { 'Content-Type': 'text/plain' });
            res.end('Created');
          } catch {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
          }
        });
        break;

      case 'DELETE':
        try {
          await fs.unlink(filePath);
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('Deleted');
        } catch {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        }
        break;

      default:
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');
    }
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});
