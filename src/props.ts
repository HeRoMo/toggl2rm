/**
 * UserProperty
 */
const userProperties = PropertiesService.getUserProperties();

const Props = {
  get(key: string): string {
    return userProperties.getProperty(key);
  },

  getAll(): object {
    return userProperties.getProperties();
  },

  isValid(): boolean {
    const props = this.getAll();
    return Object.keys(props).every((key: string) => (!!props[key] && props[key].length > 0));
  },

  set(key: string, value: string): void {
    userProperties.setProperty(key, value);
  },

  setProps(props: object): void {
    userProperties.setProperties(props);
  },
};

export default Props;
