"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var Emitter = require("irrelon-emitter");

var _require = require("@irrelon/path"),
    pathJoin = _require["join"],
    pathGet = _require["get"],
    pathSet = _require["set"],
    pathFlattenValues = _require["flattenValues"],
    pathNumberToWildcard = _require["numberToWildcard"];

var _require2 = require("./Validation"),
    getTypePrimitive = _require2.getTypePrimitive,
    getTypeValidator = _require2.getTypeValidator,
    isPrimitive = _require2.isPrimitive;

var customTypes = require("./customTypes");

var _require3 = require("./customTypes"),
    isCustomType = _require3.isCustomType;

var Schema =
/*#__PURE__*/
function () {
  /**
   * Creates a schema instance.
   * @param {Object} definition The schema definition.
   * @param {Object=} options Optional options object.
   */
  function Schema(definition) {
    var _this = this;

    var _options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    (0, _classCallCheck2.default)(this, Schema);
    (0, _defineProperty2.default)(this, "cast", function (model) {
      return model;
    });
    (0, _defineProperty2.default)(this, "add", function (obj) {
      if (!obj) return; // Take the new definition and add it to our existing one

      _this._definition = (0, _objectSpread2.default)({}, _this._definition, obj); // Convert definition into normalised version

      _this.normalised(_this.normalise(_this._definition));

      return _this;
    });
    (0, _defineProperty2.default)(this, "isValid", function (model, options) {
      return _this.validate(model, options).valid;
    });
    (0, _defineProperty2.default)(this, "validate", function (model, currentPath) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
        "throwOnFail": false
      };

      if ((0, _typeof2.default)(currentPath) === "object") {
        options = currentPath;
        currentPath = undefined;
      }

      var schemaDefinition = _this.normalised(); // Now check for any fields in the model that
      // don't exist in the schema


      for (var i in model) {
        if (model.hasOwnProperty(i)) {
          if (schemaDefinition[i] === undefined) {
            // Found a field that should not exist in the
            // model because it is not defined in the schema
            var currentFullPath = pathJoin(currentPath, i);
            return {
              "valid": false,
              "path": currentFullPath,
              "reason": "The field \"".concat(i, "\" in the path \"").concat(currentFullPath, "\" is not defined in the schema!")
            };
          }
        }
      }

      return _this._validate(schemaDefinition, model, options.originalModel || model, currentPath, options);
    });
    (0, _defineProperty2.default)(this, "_validate", function (currentSchema, currentModel, originalModel) {
      var parentPath = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";
      var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {
        "throwOnFail": false
      };

      if (currentSchema instanceof Schema) {
        // Get the definition for this schema
        return currentSchema.validate(currentModel, parentPath, {
          originalModel: originalModel,
          "throwOnFail": options.throwOnFail
        });
      }

      if (isPrimitive(currentSchema)) {
        var validator = getTypeValidator(currentSchema, false, function (type) {
          if (type instanceof Schema) {
            return type.validate;
          }
        }); // Validate the model value against the schema type

        return validator(currentModel, parentPath, {
          originalModel: originalModel,
          "throwOnFail": options.throwOnFail
        });
      }

      var fieldsChecked = [];

      for (var i in currentSchema) {
        if (currentSchema.hasOwnProperty(i)) {
          fieldsChecked.push(i);
          var currentFullPath = pathJoin(parentPath, i); // Get the value from the schema and the model for the
          // current path key

          var schemaFieldValue = pathGet(currentSchema, i);
          var modelFieldValue = pathGet(currentModel, i); // Apply any defaults if required

          if (modelFieldValue === undefined) {
            if (schemaFieldValue.default !== undefined) {
              // Apply default value
              pathSet(currentModel, i, schemaFieldValue.default);
            }
          }

          if (schemaFieldValue.transform) {
            // We have a transform function, execute it and set the response value
            // to the model value at this path
            pathSet(currentModel, i, schemaFieldValue.transform(pathGet(currentModel, i), pathGet(originalModel, parentPath), originalModel));
          }

          modelFieldValue = pathGet(currentModel, i); // Get the validator for this field

          var _validator = getTypeValidator(schemaFieldValue.type, schemaFieldValue.required, function (type) {
            if (type instanceof Schema) {
              return type.validate;
            }
          }); // Validate the model value against the schema type


          var result = _validator(modelFieldValue, currentFullPath, {
            originalModel: originalModel,
            "throwOnFail": options.throwOnFail
          });

          if (!result.valid) {
            return result;
          } // Now we need to handle recursive behaviour based on types


          if (schemaFieldValue.type === Array) {
            if (modelFieldValue === undefined && schemaFieldValue.elementRequired === true) {
              return {
                "valid": false,
                "path": pathJoin(currentFullPath, "0"),
                "reason": "At least on array element is required by schema"
              };
            }

            if (modelFieldValue !== undefined) {
              // The schema value is an array instance so we use the first element
              // of the schema value array as the type to validate all model array
              // elements against
              for (var arrIndex = 0; arrIndex < modelFieldValue.length; arrIndex++) {
                var _result = _this._validate(schemaFieldValue.elementType, modelFieldValue[arrIndex], originalModel, pathJoin(currentFullPath, arrIndex));

                if (!_result.valid) {
                  return _result;
                }
              }
            }
          }
        }
      }

      return {
        "valid": true
      };
    });
    this.definition(definition);
    this._options = _options;

    if (_options.name) {
      this.name(_options.name);
    }

    if (_options.primaryKey) {
      this.primaryKey(_options.primaryKey);
    }

    if (_options.helpers) {
      this.helpers(_options.helpers);
    }
  }
  /**
   * Does a console.log() if options.debug is set to true.
   * @param {String} msg The message to log.
   * @returns {*} Nothing
   */


  (0, _createClass2.default)(Schema, [{
    key: "debugLog",
    value: function debugLog(msg) {
      if (this._options.debug) {
        console.log("applyModels :: ".concat(msg));
      }
    }
    /**
     * Get or set helpers defined on this schema instance.
     * @param {Object} obj An object containing helper functions.
     * @returns {Schema|Object} Either the schema instance (on set)
     * or the helper object (on get).
     */

  }, {
    key: "helpers",
    value: function helpers(obj) {
      if (obj === undefined) {
        return this._helpers;
      }

      this._helpers = obj;
      return this;
    }
    /**
     * Call a helper by its id with the passed model and any
     * other arguments you wish to pass.
     * @param {String} id The id (field name) of the helper function to call.
     * @param {Object|Array} model The model to pass to the first argument of the
     * helper function.
     * @param {*} args Any further args you wish to pass to the helper function.
     * @returns {*} The response from the helper function.
     */

  }, {
    key: "helper",
    value: function helper(id, model) {
      var _this$_helpers;

      for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      return (_this$_helpers = this._helpers)[id].apply(_this$_helpers, [model].concat(args));
    }
    /**
     * Gets / sets the schema name.
     * @param {String=} val The name to set if provided.
     * @returns {String|*} If no val is provided, returns current
     * value, otherwise returns this.
     */

  }, {
    key: "name",
    value: function name(val) {
      if (val === undefined) {
        return this._name;
      }

      this._name = val;
      return this;
    }
    /**
     * Gets / sets the schema primary key.
     * @param {String=} val The primary key to set if provided.
     * @returns {String|*} If no val is provided, returns current
     * value, otherwise returns this.
     */

  }, {
    key: "primaryKey",
    value: function primaryKey(val) {
      if (val === undefined) {
        return this._primaryKey;
      }

      this._primaryKey = val;
      return this;
    }
    /**
     * Gets / sets the schema definition.
     * @param {Object=} val The definition to set if provided.
     * @returns {Object|*} If no val is provided, returns current
     * value, otherwise returns this schema instance.
     */

  }, {
    key: "definition",
    value: function definition(val) {
      if (val === undefined) {
        return this._definition;
      }

      this._definition = val; // Convert definition into normalised version

      this.normalised(this.normalise(this._definition));
      return this;
    }
    /**
     * Gets / sets the normalised schema definition object. Normalised
     * schema definitions are definitions that have been transformed so
     * that all key values conform to the internal schema standard rather
     * than the allowed input standards that are loosely defined and less
     * simple to parse or iterate over.
     * @param {Object=} val The normalised schema to set. If provided the
     * function becomes a setter. If not provided the function becomes a
     * getter.
     * @returns {*} Either the normalised schema or "this".
     */

  }, {
    key: "normalised",
    value: function normalised(val) {
      if (val === undefined) {
        return this._normalised;
      }

      this._normalised = val;
      return this;
    }
    /**
     * Converts multiple ways to declare a schema into a normalised
     * structure so we can rely on the structure being consistent.
     * This converts all schema field definitions to long-hand object
     * based ones so instead of {"name": String} the field would be
     * converted to {"name": {"type": String}}.
     * @param {Object} def The schema definition to normalise.
     * @param {String=} parentPath The path to normalise. Usually
     * left not specified so that the definition object can be fully
     * normalised.
     * @returns {Object} The normalised schema definition.
     */

  }, {
    key: "normalise",
    value: function normalise(def) {
      var _this2 = this;

      var parentPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
      var finalObj = {};

      if (def === undefined || def === null) {
        return def;
      }

      if (def instanceof Schema) {
        // The field type is a schema
        return def;
      }

      if (isPrimitive(def)) {
        return def;
      }

      Object.keys(def).map(function (key) {
        var fieldData = def[key];

        if (fieldData === undefined) {
          throw new Error("Schema definition invalid at path \"".concat(pathJoin(parentPath, key), "\": Cannot create a field that has an undefined shape. This usually occurs if you have passed an undefined value to the field."));
        }

        if (isPrimitive(fieldData)) {
          var defObj = {
            "type": fieldData
          };

          if (fieldData === Array) {
            // Handle array instance
            defObj.elementType = Schema.Any;
          }

          finalObj[key] = defObj;
          return;
        }

        if (fieldData instanceof Schema) {
          // The field type is a schema, return the normalised
          // Schema definition
          finalObj[key] = {
            "type": fieldData
          };
          return;
        }

        if (fieldData instanceof Array) {
          finalObj[key] = {
            "type": Array,
            "elementType": _this2.normalise(fieldData[0])
          };
          return;
        }

        if ((0, _typeof2.default)(fieldData) !== "object") {
          throw new Error("Schema definition invalid at path \"".concat(pathJoin(parentPath, key), "\": Unsupported schema field data."));
        }

        if (!fieldData.type) {
          // Throw as we require a type for an object definition
          throw new Error("Schema definition invalid at path \"".concat(pathJoin(parentPath, key), "\": Cannot create a field without a type. If you are trying to define an object that contains fields and types, use a new Schema instance. If you just want to define the field as an object with any contents, use an Object primitive."));
        } // If we have a transform value, make sure it is a function


        if (fieldData.transform !== undefined && typeof fieldData.transform !== "function") {
          throw new Error("Schema definition invalid at path \"".concat(pathJoin(parentPath, key), "\": The \"transform\" field must be a function."));
        } // If we have a default value, make sure we don't also have required:true


        if (fieldData.default !== undefined && fieldData.required === true) {
          throw new Error("Schema definition invalid at path \"".concat(pathJoin(parentPath, key), "\": Cannot specify both required:true AND a default since default values are only applied when a field is not explicitly specified."));
        } // If we have a default value, make sure it validates against the field type


        if (fieldData.default !== undefined) {
          // Validate the default
          var validator = getTypeValidator(fieldData.type, false, function (type) {
            if (type instanceof Schema) {
              return type.validate;
            }
          });
          var validatorResult = validator(fieldData.default);

          if (!validatorResult.valid) {
            throw new Error("Schema definition invalid at path \"".concat(pathJoin(parentPath, key), "\": Cannot specify a default value of type ").concat(validatorResult.actualType, " when the field type is ").concat(validatorResult.expectedType, "."));
          }
        }

        finalObj[key] = fieldData;
      });
      return finalObj;
    }
    /**
     * NOT YET WRITTEN, DO NOT USE
     * Casts a model to the correct types if possible.
     * @param {Object|Array} model The model to cast against the
     * schema.
     * @returns {Object|Array} The new model, with values cast
     * to the correct types based on the schema definition.
     */

  }, {
    key: "flattenValues",

    /**
     * Converts the schema definition to a flat object with keys
     * representing each schema path and values representing the
     * types that the schema specifies.
     * @returns {Object} The flattened schema definition.
     */
    value: function flattenValues() {
      var parentPath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
      var values = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var visited = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
      var def = this.normalised(); // Add our own schema instance to the visited array
      // so we don't recurse if we find it nested in our
      // own definition (we don't want infinite recursion!).

      visited.push(this);
      Object.entries(def).map(function (_ref) {
        var _ref2 = (0, _slicedToArray2.default)(_ref, 2),
            key = _ref2[0],
            val = _ref2[1];

        flatten(val, compoundKey(parentPath, key), values, visited);
      });
      return values;
    }
  }]);
  return Schema;
}();

Object.entries(customTypes).map(function (_ref3) {
  var _ref4 = (0, _slicedToArray2.default)(_ref3, 2),
      key = _ref4[0],
      value = _ref4[1];

  Schema[key] = value;
});

var compoundKey = function compoundKey() {
  for (var _len2 = arguments.length, keys = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    keys[_key2] = arguments[_key2];
  }

  return keys.reduce(function (finalKey, key) {
    if (finalKey) {
      finalKey += ".".concat(key);
      return finalKey;
    }

    return key;
  }, "");
};

var isSchemaPrimitive = function isSchemaPrimitive(val) {
  return val === Schema;
};

var isSchemaInstance = function isSchemaInstance(val) {
  if (!val) return false;
  if (!val.constructor) return false;
  if (val.constructor.name !== "Schema") return false;
  return true;
};

var flatten = function flatten(def) {
  var parentPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
  var values = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var visited = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

  // Check if the def is a non-flatten type (a custom type)
  if (isCustomType(def)) {
    values[parentPath] = def;
    return values;
  }

  if (isPrimitive(def)) {
    values[parentPath] = def;
    return values;
  }

  var type = def.type,
      elementType = def.elementType; // Check for array instance

  if (type === Array) {
    values[parentPath] = Array;
    var valueKey = compoundKey(parentPath, "$");

    if (elementType) {
      // Recurse into the array data
      flatten({
        "type": elementType
      }, valueKey, values, visited);
    } else {
      // Assign a Schema.Any to the element type
      values[valueKey] = Schema.Any;
    }

    return values;
  }

  if (isCustomType(type)) {
    values[parentPath] = type;
    return values;
  }

  if (isPrimitive(type)) {
    values[parentPath] = type;
    return values;
  }

  if (isSchemaPrimitive(type)) {
    values[parentPath] = type;
    return values;
  }

  if (isSchemaInstance(type)) {
    values[parentPath] = type; // Check if we have already added this schema type to the flattened object

    if (visited.indexOf(type) > -1) {
      return values;
    }

    visited.push(type);
    type.flattenValues(parentPath, values, visited);
    return values;
  }

  return values;
}; // Give Schema's prototype the event emitter methods
// and functionality


Emitter(Schema);
module.exports = {
  Schema: Schema,
  flatten: flatten
};