"use strict"

var SHEET_ID = "14OWbiIvtKrQ6HyKMLEtyDp36uJCUW5YaLGkzrBsWjhg"


/**
 * UserProperty
 */
var Props = {

  _userProperties: PropertiesService.getUserProperties(),

  get: function (key){
    return this._userProperties.getProperty(key)
  },

  getAll: function (){
    return this._userProperties.getProperties()
  },

  set: function(key, value){
    this._userProperties.setProperty(key, value);
  },

  setProps: function(props){
    this._userProperties.setProperties(props);
  }
}

function setProps(props){
  Props.setProps(props)
}

global.Props = Props;
global.setProps = setProps;
