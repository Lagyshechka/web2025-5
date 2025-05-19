const { Command } = require('commander');
const http = require('http');
const fs = require('fs');
const path = require('path');

const program = new Command();

program
  .requiredOption('-h, --host <host>', 'Server host address')
  .requiredOption('-p, --port <port>', 'Server port', parseInt)
  .requiredOption('-c, --cache <path>', 'Path to cache directory');

program.parse(process.argv);
const options = program.opts();

if (!fs.existsSync(options.cache)) {
  fs.mkdirSync(options.cache, { recursive: true });
  console.log(`Директорію для кешу створено: ${options.cache}`);
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Сервер працює!\n');
});

server.listen(options.port, options.host, () => {
  console.log(`Сервер запущено на http://${options.host}:${options.port}`);
});
