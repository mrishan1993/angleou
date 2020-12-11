// wit helper functions
var helperFunc = {
  //get first entity
  firstEntityResolvedValue: (entities, entity) => {
    const val =
      entities &&
      entities[entity] &&
      Array.isArray(entities[entity]) &&
      entities[entity].length > 0 &&
      entities[entity][0].resolved &&
      entities[entity][0].resolved.values &&
      Array.isArray(entities[entity][0].resolved.values) &&
      entities[entity][0].resolved.values.length > 0 &&
      entities[entity][0].resolved.values[0];

    if (!val) {
      return null;
    } else {
      return val;
    }
  },
  // get first trait
  firstTraitValue: (traits, trait) => {
    const val =
      traits &&
      traits[trait] &&
      Array.isArray(traits[trait]) &&
      traits[trait].length > 0 &&
      traits[trait][0].value;

    if (!val) {
      return null;
    } else {
      return val;
    }
  },
  // --- wit helpers end here --- //
  // js helper function
  generateRandom: ceiling => {
    return Math.floor(Math.random() * ceiling);
  },
  validateEmail: email => {
    const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegexp.test(email)
  },
  checkRequiredKeysExists: (keys, object) => {
    for (i in keys ) {
      if (!object.hasOwnProperty(i)) {
        return {
          exists: false,
          key: i
        }
      }
    }
    return {
      exists: true,
      key: undefined
    }
  }
};

module.exports = helperFunc;
