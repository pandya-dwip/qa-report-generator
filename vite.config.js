import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function saveFilesPlugin() {
  return {
    name: 'save-files-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method === 'POST' && req.url === '/api/save-file') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const { fileName, csvContent } = JSON.parse(body);
              if (!fileName || !csvContent) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Missing fileName or csvContent' }));
                return;
              }

              const filesDir = path.resolve(__dirname, 'Files');
              if (!fs.existsSync(filesDir)) {
                fs.mkdirSync(filesDir);
              }

              const baseName = fileName.replace(/\.[^/.]+$/, '');
              const safeFileName = `${path.basename(baseName)}.csv`;
              const filePath = path.join(filesDir, safeFileName);

              fs.writeFileSync(filePath, csvContent, 'utf-8');

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, path: filePath }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        } else {
          next();
        }
      });
    }
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), saveFilesPlugin()],
})
