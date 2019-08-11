"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var customTypes = {
  "Any": {
    "type": "Any",
    "validator": function validator(value, path, options, validationSucceeded) {
      return validationSucceeded();
    }
  },
  "Integer": {
    "type": Number,
    "format": "int32"
  },
  "Long": {
    "type": Number,
    "format": "int64"
  },
  "Float": {
    "type": Number,
    "format": "float"
  },
  "Double": {
    "type": Number,
    "format": "double"
  },
  "Byte": {
    "type": String,
    "format": "byte"
  },
  "Binary": {
    "type": String,
    "format": "binary"
  },
  "Date": {
    "type": Date,
    "format": "date"
  },
  "DateTime": {
    "type": Date,
    "format": "dateTime"
  },
  "Password": {
    "type": String,
    "format": "password"
  }
};

var isCustomType = function isCustomType(val) {
  return Object.values(customTypes).some(function (customType) {
    return val === customType;
  });
};

module.exports = (0, _objectSpread2.default)({}, customTypes, {
  isCustomType: isCustomType
});