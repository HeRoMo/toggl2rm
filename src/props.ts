/**
 * UserProperty
 */
const userProperties = PropertiesService.getUserProperties();
const Props = {
  get(key) {
    return userProperties.getProperty(key);
  },

  getAll() {
    return userProperties.getProperties();
  },

  isValid() {
    const props = this.getAll();
    const isValid = Object.keys(props).every(key =>
      (!!props[key] && props[key].length > 0));
    return isValid;
  },

  set(key, value) {
    userProperties.setProperty(key, value);
  },

  setProps(props) {
    userProperties.setProperties(props);
  },
};

global.Props = Props;
