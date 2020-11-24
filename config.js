const config = {
  witAccessToken: 'IEX5UJ3PHXNVEIMZRQ2EF2O3LSBLWJMC',
  edamamApiID: 'a620ed11',
  edamamApiKey: '393fa98e9736ee9a65fdfd903e7a4501',
  // facebook oauth keys
  facebookClientID: '787804235104106',
  facebookClientKey: '3d203388074188091ad5266a8309f660',
  facebookAppURL: 'https://graph.facebook.com/oauth/access_token?',
  facebookTokenLink: 'https://graph.facebook.com/debug_token?',
  // db connections. need to be migrated to env constants
  hostname: '127.0.0.1',
  mySQLUsername: 'root',
  mySQLPassword: 'ishu',
  // super secret
  jwtSecret: 'sQJEWG7XSKLnKebCtp2rsSYILug8Wzqr',
  // google oauth keys 
  googleClientID: '273599308782-kkt7126gh4l82smi4un5hdspf1qmve7o.apps.googleusercontent.com',
  googleClientSecret: 'EITuoadeFYBeohUcqy5gCtw6'
};

module.exports = config;
