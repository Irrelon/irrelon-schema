"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _require = require("irrelon-path"),
    pathGet = _require["get"],
    pathFurthest = _require["furthest"];
/**
 * Creates a function that calls each function passed as an
 * argument in turn with the same arguments as the calling
 * code provides.
 * @param {Function} args The functions to call in turn.
 * @returns {Function} A function to call that will call each
 * function presented as an argument in turn.
 */


var compose = function compose() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return function () {
    for (var _len2 = arguments.length, endCallArgs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      endCallArgs[_key2] = arguments[_key2];
    }

    return args.map(function (item) {
      return item.apply(void 0, endCallArgs);
    });
  };
};

var composeRequired = function composeRequired(validator, isRequired) {
  if (isRequired) {
    var composedFunc = compose(typeRequired, validator);
    return function () {
      var result = composedFunc.apply(void 0, arguments);

      for (var i = 0; i < result.length; i++) {
        if (result[i].valid === false) {
          return result[i];
        }
      }

      return {
        "valid": true
      };
    };
  }

  return validator;
};

var validationFailed = function validationFailed(path, value, expectedTypeName) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
    "throwOnFail": false,
    "typeDetectedOverride": ""
  };

  if (options.throwOnFail) {
    throw new Error("Schema violation, \"".concat(path, "\" has schema type ").concat(expectedTypeName, " and cannot be set to value ").concat(String(JSON.stringify(value)).substr(0, 10), " of type ").concat(options.typeDetectedOverride ? options.typeDetectedOverride : getType(value)));
  }

  return {
    "valid": false,
    path: path,
    "reason": "Expected ".concat(expectedTypeName, " but value ").concat(String(JSON.stringify(value)).substr(0, 10), " is type {").concat(getType(value), "}"),
    "originalModel": options.originalModel
  };
};

var getType = function getType(value) {
  if (value instanceof Array) {
    return "array";
  }

  return (0, _typeof2.default)(value);
};

var isPrimitive = function isPrimitive(value) {
  return value === Array || value === String || value === Number || value === Boolean || value === Object || value === Function;
};

var getTypePrimitive = function getTypePrimitive(value) {
  if (value instanceof Array || value === Array) {
    return Array;
  }

  if (value instanceof String || value === String) {
    return String;
  }

  if (value instanceof Number || value === Number) {
    return Number;
  }

  if (value instanceof Boolean || value === Boolean) {
    return Boolean;
  }

  if (value instanceof Object && !(value instanceof Function) || value === Object) {
    return Object;
  }

  if (value instanceof Function || value === Function) {
    return Function;
  }

  return (0, _typeof2.default)(value);
};

var getTypeValidator = function getTypeValidator(value, isRequired, customHandler) {
  if (customHandler) {
    var unknownType = customHandler(value);

    if (unknownType) {
      return unknownType;
    }
  }

  if (value instanceof Array || value === Array) {
    return composeRequired(typeArray, isRequired);
  }

  if (value instanceof String || value === String) {
    return composeRequired(typeString, isRequired);
  }

  if (value instanceof Number || value === Number) {
    return composeRequired(typeNumber, isRequired);
  }

  if (value instanceof Boolean || value === Boolean) {
    return composeRequired(typeBoolean, isRequired);
  }

  if (value instanceof Object && !(value instanceof Function) || value === Object) {
    return composeRequired(typeObject, isRequired);
  }

  if (value instanceof Function || value === Function) {
    return composeRequired(typeFunction, isRequired);
  }

  return typeAny;
};

var typeAny = function typeAny() {
  return {
    "valid": true
  };
};

var typeRequired = function typeRequired(value, path) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
    "throwOnFail": true
  };

  if (value === undefined || value === null) {
    if (options.throwOnFail) {
      throw new Error("Schema violation, \"".concat(path, "\" is required and cannot be undefined or null"));
    }

    return {
      "valid": false,
      path: path,
      "reason": "Schema violation, \"".concat(path, "\" is required and cannot be undefined or null")
    };
  }

  return {
    "valid": true
  };
};

var typeFunction = function typeFunction(value, path) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
    "throwOnFail": true
  };

  if (value === undefined || value === null) {
    return {
      "valid": true
    };
  }

  if (typeof value !== "function") {
    return validationFailed(path, value, "function", options);
  }

  return {
    "valid": true
  };
};

var typeString = function typeString(value, path) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
    "throwOnFail": true
  };

  if (value === undefined || value === null) {
    return {
      "valid": true
    };
  }

  if (typeof value !== "string") {
    return validationFailed(path, value, "string", options);
  }

  return {
    "valid": true
  };
};

var typeNumber = function typeNumber(value, path) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
    "throwOnFail": true
  };

  if (value === undefined || value === null) {
    return {
      "valid": true
    };
  }

  if (typeof value !== "number") {
    return validationFailed(path, value, "number", options);
  }

  return {
    "valid": true
  };
};

var typeBoolean = function typeBoolean(value, path) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
    "throwOnFail": true
  };

  if (value === undefined || value === null) {
    return {
      "valid": true
    };
  }

  if (typeof value !== "boolean") {
    return validationFailed(path, value, "boolean", options);
  }

  return {
    "valid": true
  };
};

var typeArray = function typeArray(value, path) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
    "throwOnFail": true
  };

  if (value === undefined || value === null) {
    return {
      "valid": true
    };
  }

  if (!(value instanceof Array)) {
    return validationFailed(path, value, "array<any>", options);
  }

  return {
    "valid": true
  };
};

var typeObject = function typeObject(value, path) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
    "throwOnFail": true
  };

  if (value === undefined || value === null) {
    return {
      "valid": true
    };
  }

  if ((0, _typeof2.default)(value) !== "object") {
    return validationFailed(path, value, "object", options);
  }

  return {
    "valid": true
  };
};

var validateData = function validateData(path, schema, data) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
    "throwOnFail": true
  };
  // Get furthest away schema path string available for the given path
  // (we can only validate data up to the last type that has been
  // defined in the schema object)
  //
  // E.g. if we have a schema like: new Schema({
  // 	  foo: new Schema({
  //		  bar: Object
  // 	  })
  // })
  //
  // Then we are asked to validate against the schema and our data looks like this:
  // {
  // 	  foo: {
  //		  bar: {
  //			  thing: "Hello"
  //		  }
  // 	  }
  // }
  //
  // We can only validate foo and foo.bar
  // We cannot validate foo.bar.thing since it is not defined in
  // the schema. The call below will find the furthest defined schema
  // path given the "path" argument so for a path of "foo.bar.thing"
  // we will be given the furthest path of "foo.bar"
  var furthestPath = pathFurthest(schema, path, {
    "transformKey": function transformKey(key) {
      // Check if the key is a wildcard
      if (key === "$") {
        // The key is a wildcard, return zero since any array with a valid
        // path will have a zero-indexed item
        return "0";
      }

      return key;
    }
  }); // Get the value in the schema object at the path

  var fieldValue = pathGet(schema, furthestPath);
  var fieldValidator = getTypeValidator(fieldValue);
  var pathValue = pathGet(data, furthestPath, undefined, {
    "transformKey": function transformKey(data) {
      return data;
    }
  }); // Return the result of running the field validator against the field data

  return fieldValidator(pathValue, path, options);
};

module.exports = {
  getType: getType,
  getTypePrimitive: getTypePrimitive,
  getTypeValidator: getTypeValidator,
  typeFunction: typeFunction,
  typeString: typeString,
  typeNumber: typeNumber,
  typeBoolean: typeBoolean,
  typeArray: typeArray,
  typeObject: typeObject,
  typeAny: typeAny,
  validationFailed: validationFailed,
  validateData: validateData,
  isPrimitive: isPrimitive
};