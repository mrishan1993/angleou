const auth = {
  name: 'auth',
  version: '1.0.0',
  register: async function(server, options) {
    server.ext('onPreAuth', (request, reply) => {
      // your functionality
      console.log('in the middleware');
      return reply.continue;
    });
    server.decorate('toolkit', 'auth', server);
  },
};

module.exports = auth;
