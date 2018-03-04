/**
 * UserProperty
 */
const Props = {

  _userProperties: PropertiesService.getUserProperties(),

  get(key) {
    return this._userProperties.getProperty(key);
  },

  getAll() {
    return this._userProperties.getProperties();
  },

  isValid() {
    const props = this.getAll();
    const isValid = Object.keys(props).every(key =>
      (!!props[key] && props[key].length > 0));
    return isValid;
  },

  set(key, value) {
    this._userProperties.setProperty(key, value);
  },

  setProps(props) {
    this._userProperties.setProperties(props);
  },
};

function setProps(props) {
  Props.setProps(props);
}

global.Props = Props;
global.setProps = setProps;
