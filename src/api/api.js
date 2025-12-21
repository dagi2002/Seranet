const API_URL = "http://localhost:3001";

export const api = {
  list: async (collection) => {
    const res = await fetch(`${API_URL}/${collection}`);
    return res.json();
  },

  get: async (collection, id) => {
    const res = await fetch(`${API_URL}/${collection}/${id}`);
    return res.json();
  },

  create: async (collection, data) => {
    const res = await fetch(`${API_URL}/${collection}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  update: async (collection, id, data) => {
    const res = await fetch(`${API_URL}/${collection}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  remove: async (collection, id) => {
    return fetch(`${API_URL}/${collection}/${id}`, { method: "DELETE" });
  },
};
