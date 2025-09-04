import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { createServer } from 'http';
import { createViteDevServer } from './vite-server.js';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ 
  server,
  path: '/ws'
});

const PORT = process.env.PORT || 5173;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// API endpoint for file updates (AST patching)
app.post('/api/update', async (req, res) => {
  try {
    const { filePath, content, code, language } = req.body;
    
    // Handle new AST-based file updates
    if (filePath && content) {
      const fullPath = path.join(process.cwd(), 'src', filePath);
      
      // Write file to disk
      await fs.writeFile(fullPath, content, 'utf8');
      console.log(`📝 File updated via AST: ${filePath}`);
      
      // Broadcast file update to WebSocket clients
      const message = {
        type: 'file-update',
        data: { filePath, content },
        timestamp: new Date().toISOString()
      };
      
      wss.clients.forEach(client => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(JSON.stringify(message));
        }
      });
      
      res.json({ success: true, message: `File ${filePath} updated successfully` });
      return;
    }
    
    // Handle legacy code updates (backward compatibility)
    if (code && language) {
      const message = {
        type: 'code-update',
        data: { code, language },
        timestamp: new Date().toISOString()
      };
      
      wss.clients.forEach(client => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(JSON.stringify(message));
        }
      });
      
      res.json({ success: true, message: 'Code updated successfully' });
      return;
    }
    
    res.status(400).json({ 
      success: false, 
      message: 'Missing required parameters: either (filePath, content) or (code, language)' 
    });
    
  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update file', 
      error: error.message 
    });
  }
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New WebSocket connection established');
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'Connected to Vina.dev Preview Runner',
    timestamp: new Date().toISOString()
  }));
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received WebSocket message:', data);
      
      // Echo back for now
      ws.send(JSON.stringify({
        type: 'echo',
        data: data,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Initialize Vite dev server
async function startServer() {
  try {
    const vite = await createViteDevServer();
    
    // Use Vite's connect instance as middleware
    app.use(vite.middlewares);
    
    server.listen(PORT, () => {
      console.log(`🚀 Preview Runner started on http://localhost:${PORT}`);
      console.log(`📡 WebSocket server running on ws://localhost:${PORT}/ws`);
      console.log(`💚 Health check available at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});