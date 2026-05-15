// Stores all active admin SSE connections
const adminClients = new Set();

export const addAdminClient = (res) => {
  adminClients.add(res);
};

export const removeAdminClient = (res) => {
  adminClients.delete(res);
};

export const broadcastToAdmins = (event, data) => {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of adminClients) {
    try {
      client.write(payload);
    } catch {
      adminClients.delete(client);
    }
  }
};
