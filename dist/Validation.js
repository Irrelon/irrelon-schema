"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var customTypes = require("./customTypes");

var _require = require("@irrelon/path"),
    pathGet = _require["get"],
    pathFurthest = _require["furthest"],
    pathJoin = _require["join"];

var validationFailed = function validationFailed(path, value, expectedTypeName) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
    "throwOnFail": false,
    "detectedTypeOverride": ""
  };
  var actualTypeName = options.detectedTypeOverride ? options.detectedTypeOverride : getTypeName(value);

  if (options.throwOnFail) {
    throw new Error("Schema violation, \"".concat(path, "\" has schema type ").concat(expectedTypeName, " and cannot be set to value ").concat(String(JSON.stringify(value)).substr(0, 10), " of type ").concat(actualTypeName));
  }

  return {
    "valid": false,
    "expectedType": expectedTypeName,
    "actualType": actualTypeName,
    "reason": "Expected ".concat(expectedTypeName, " but value ").concat(String(JSON.stringify(value)).substr(0, 10), " is type {").concat(actualTypeName, "}"),
    "originalModel": options.originalModel,
    path: path
  };
};

var validationFailedCustom = function validationFailedCustom(path, value, errorMessage) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
    "throwOnFail": false
  };

  if (options.throwOnFail) {
    throw new Error(errorMessage);
  }

  return {
    "valid": false,
    "reason": errorMessage,
    "originalModel": options.originalModel,
    path: path
  };
};

var validationSucceeded = function validationSucceeded() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return (0, _objectSpread2.default)({
    "valid": true
  }, options);
};

var getTypeName = function getTypeName(value) {
  if (isPrimitive(value) || typeof value === "function" || (0, _typeof2.default)(value) === "object") {
    if (value === String) {
      return "String";
    }

    if (value === Number) {
      return "Number";
    }

    if (value === Boolean) {
      return "Boolean";
    }

    if (value === Array) {
      return "Array";
    }

    if (value === Object) {
      return "Object";
    }

    if (value === Function) {
      return "Function";
    }

    if (value.constructor && value.constructor.name) {
      return value.constructor.name;
    }
  }

  if (value instanceof Object && !(value instanceof Function)) {
    return "Object";
  }

  if (value instanceof Function) {
    return "Function";
  }

  return (0, _typeof2.default)(value);
};

var isPrimitive = function isPrimitive(value) {
  return value === Array || value === String || value === Number || value === Boolean || value === Object || value === Function || value === Date;
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
    var resultArr = [];

    for (var i = 0; i < args.length; i++) {
      var item = args[i];
      var result = item.apply(void 0, arguments);
      resultArr.push(result);

      if (result.shortCircuit) {
        break;
      }
    }

    return resultArr;
  };
};

var composeComplexValidation = function composeComplexValidation() {
  var composedFunc = compose.apply(void 0, arguments);
  return function () {
    var result = composedFunc.apply(void 0, arguments);

    for (var i = 0; i < result.length; i++) {
      if (result[i].valid === false) {
        return result[i];
      }
    }

    return validationSucceeded();
  };
};

var getComposedTypeValidator = function getComposedTypeValidator(valueTypeValidator, typeSchemaOptions, customHandler) {
  var required = typeSchemaOptions.required,
      oneOf = typeSchemaOptions.oneOf;
  var validationFunctions = [];
  validationFunctions.push(typeValidatorRequired);
  validationFunctions.push(valueTypeValidator);

  if (oneOf) {
    validationFunctions.push(typeValidatorOneOf);
  }

  return composeComplexValidation.apply(void 0, validationFunctions);
};

var getTypeValidator = function getTypeValidator(value, typeSchemaOptions, customHandler) {
  if (customHandler) {
    var unknownTypeValidatorFunction = customHandler(value);

    if (unknownTypeValidatorFunction) {
      return getComposedTypeValidator(unknownTypeValidatorFunction, typeSchemaOptions);
    }
  }

  if (value instanceof Array || value === Array) {
    return getComposedTypeValidator(typeValidatorArray, typeSchemaOptions, customHandler);
  }

  if (value instanceof String || value === String) {
    return getComposedTypeValidator(typeValidatorString, typeSchemaOptions, customHandler);
  }

  if (value instanceof Number || value === Number) {
    return getComposedTypeValidator(typeValidatorNumber, typeSchemaOptions, customHandler);
  }

  if (value instanceof Boolean || value === Boolean) {
    return getComposedTypeValidator(typeValidatorBoolean, typeSchemaOptions, customHandler);
  }

  if (value instanceof Date || value === Date) {
    return getComposedTypeValidator(typeValidatorDate, typeSchemaOptions, customHandler);
  }

  var _arr = Object.entries(customTypes);

  for (var _i = 0; _i < _arr.length; _i++) {
    var _arr$_i = (0, _slicedToArray2.default)(_arr[_i], 2),
        customTypeKey = _arr$_i[0],
        customTypeValue = _arr$_i[1];

    if (value === customTypeValue) {
      if (typeof customTypeValue.validate === "function") {
        // There is a custom validator function here, call it and use the return value
        // to make either success or failure messages
        return getComposedTypeValidator(typeValidatorCustom(customTypeValue.validate, customTypeKey), typeSchemaOptions, customHandler);
      } // There is no custom validator function, use the custom type's type field and
      // use a built-in validator for it if any exists


      var primitiveHandler = getTypeValidator(customTypeValue.type, customTypeValue, customHandler); // Check if a primitive handler was found and if so, return that

      if (primitiveHandler) return primitiveHandler;
    }
  }

  if (value instanceof Object && !(value instanceof Function) || value === Object) {
    return getComposedTypeValidator(typeValidatorObject, typeSchemaOptions, customHandler);
  }

  if (value instanceof Function || value === Function) {
    return getComposedTypeValidator(typeValidatorFunction, typeSchemaOptions, customHandler);
  } // No matching handlers were found, use an "Any" type validator (always returns true validation)


  return getComposedTypeValidator(typeValidatorAny, typeSchemaOptions, customHandler);
};

var typeValidatorAny = function typeValidatorAny() {
  return validationSucceeded();
};

var typeValidatorRequired = function typeValidatorRequired(value, path, schema) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
    "throwOnFail": false
  };

  if (!schema.required) {
    // Check if we were given a field value... if we weren't
    // then we can short-circuit any further validation for this
    // field since it is not required
    if (value === undefined || value === null) {
      return validationSucceeded({
        "shortCircuit": true
      });
    } // The value is not empty but we passed required check
    // validation, return succeeded for this test but don't
    // short-circuit further checks that might be required


    return validationSucceeded();
  }

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

  return validationSucceeded();
};

var typeValidatorCustom = function typeValidatorCustom(customValidator, customTypeName) {
  return function (value, path, schema) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
      "throwOnFail": false
    };

    if (value === undefined || value === null) {
      return validationSucceeded();
    }

    var customValidatorReturnValue = customValidator(value, path, options, validationSucceeded, validationFailed);

    if (customValidatorReturnValue === true) {
      return validationSucceeded();
    }

    if (customValidatorReturnValue === false) {
      return validationFailed(path, value, customTypeName, options);
    }
  };
};

var typeValidatorFunction = function typeValidatorFunction(value, path, schema) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
    "throwOnFail": false
  };

  if (value === undefined || value === null) {
    return validationSucceeded();
  }

  if (typeof value !== "function") {
    return validationFailed(path, value, "function", options);
  }

  return validationSucceeded();
};

var typeValidatorString = function typeValidatorString(value, path, schema) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
    "throwOnFail": false
  };

  if (value === undefined || value === null) {
    return validationSucceeded();
  }

  if (typeof value !== "string") {
    return validationFailed(path, value, "string", options);
  }

  return validationSucceeded();
};

var typeValidatorNumber = function typeValidatorNumber(value, path, schema) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
    "throwOnFail": false
  };

  if (value === undefined || value === null) {
    return validationSucceeded();
  }

  if (typeof value !== "number") {
    return validationFailed(path, value, "number", options);
  }

  return validationSucceeded();
};

var typeValidatorBoolean = function typeValidatorBoolean(value, path, schema) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
    "throwOnFail": false
  };

  if (value === undefined || value === null) {
    return validationSucceeded();
  }

  if (typeof value !== "boolean") {
    return validationFailed(path, value, "boolean", options);
  }

  return validationSucceeded();
};

var typeValidatorArray = function typeValidatorArray(value, path, schema) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
    "throwOnFail": false
  };

  if (value === undefined || value === null) {
    return validationSucceeded();
  }

  if (!(value instanceof Array)) {
    return validationFailed(path, value, "array<".concat(getTypeName(schema.elementType.type), ">"), options);
  } // Early exit if we need elements and there are none


  if (schema.elementType.required && !value.length) {
    return validationFailed(path, value, "array<".concat(getTypeName(schema.elementType.type), ">"), options);
  } // Check if the array entries match the type required inside the array


  var elementTypeValidator;

  if (schema.elementType.validate) {
    elementTypeValidator = schema.elementType.validate;
  } else if (schema.elementType.type && schema.elementType.type.validate) {
    elementTypeValidator = schema.elementType.type.validate;
  } else {
    elementTypeValidator = getTypeValidator(schema.elementType.type, schema.elementType);
  }

  var elementTypeValidationResult;

  for (var index = 0; index < value.length; index++) {
    elementTypeValidationResult = elementTypeValidator(value[index], pathJoin(path, index), schema.elementType);

    if (elementTypeValidationResult && elementTypeValidationResult.valid === false) {
      return elementTypeValidationResult;
    }
  }

  return validationSucceeded();
};

var typeValidatorDate = function typeValidatorDate(value, path, schema) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
    "throwOnFail": false
  };

  if (value === undefined || value === null) {
    return validationSucceeded();
  }

  if (typeof value === "string") {
    // Check if the string is a valid ISO format date
    var tmpDate = Date.parse(value);

    if (isNaN(tmpDate)) {
      return validationFailed(path, value, "date", options);
    }
  } else if (!(value instanceof Date)) {
    return validationFailed(path, value, "date", options);
  }

  return validationSucceeded();
};

var typeValidatorObject = function typeValidatorObject(value, path, schema) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
    "throwOnFail": false
  };

  if (value === undefined || value === null) {
    return validationSucceeded();
  }

  if ((0, _typeof2.default)(value) !== "object") {
    return validationFailed(path, value, "object", options);
  }

  return validationSucceeded();
};

var typeValidatorOneOf = function typeValidatorOneOf(value, path, schema) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
    "throwOnFail": false
  };

  if (!schema.oneOf) {
    return validationSucceeded();
  }

  if (schema.oneOf.indexOf(value) === -1) {
    return validationFailedCustom(path, value, "Schema violation, expected \"".concat(path, "\" to be one of ").concat(String(JSON.stringify(schema.oneOf)), " but found ").concat(String(JSON.stringify(value)).substr(0, 10)), options);
  }

  return validationSucceeded();
};

var validateData = function validateData(path, schema, data) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
    "throwOnFail": false
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
  var fieldValidator = getTypeValidator(fieldValue.type, fieldValue);
  var pathValue = pathGet(data, furthestPath, undefined, {
    "transformKey": function transformKey(data) {
      return data;
    }
  }); // Return the result of running the field validator against the field data

  return fieldValidator(pathValue, path, fieldValue, options);
};

module.exports = {
  getTypeName: getTypeName,
  getTypePrimitive: getTypePrimitive,
  getTypeValidator: getTypeValidator,
  typeValidatorFunction: typeValidatorFunction,
  typeValidatorString: typeValidatorString,
  typeValidatorNumber: typeValidatorNumber,
  typeValidatorBoolean: typeValidatorBoolean,
  typeValidatorArray: typeValidatorArray,
  typeValidatorObject: typeValidatorObject,
  typeValidatorAny: typeValidatorAny,
  validationFailed: validationFailed,
  validateData: validateData,
  isPrimitive: isPrimitive
};