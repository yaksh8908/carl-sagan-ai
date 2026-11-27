import { createAppServer } from '../server/server.js';

const server = createAppServer();

export default function handler(req, res) {
  server.emit('request', req, res);
}
