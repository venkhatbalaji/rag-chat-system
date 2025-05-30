export default {
  google: {
    login: "/api/v1/auth/google",
  },
  user: {
    me: "/api/v1/auth/me",
    logout: "/api/v1/auth/logout",
  },
  session: {
    list: "/api/v1/sessions",
    byId: (id: string) => `/api/v1/sessions/${id}`,
    create: "/api/v1/sessions",
    stream: "/api/v1/sessions/stream",
    delete: (id: string) => `/api/v1/sessions/${id}`,
    update: (id: string) => `/api/v1/sessions/${id}`,
  },
  chat: {
    list: (id: string) => `/api/v1/sessions/${id}/message`,
    create: (id: string) => `/api/v1/sessions/${id}/message`,
  },
};
