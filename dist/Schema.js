"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

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

var FieldType = function FieldType(fieldType) {
  var _this = this;

  var _parentPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

  var _key = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";

  (0, _classCallCheck2.default)(this, FieldType);
  (0, _defineProperty2.default)(this, "attributeVal", function (val, defaultVal) {
    return val !== undefined ? val : defaultVal;
  });
  (0, _defineProperty2.default)(this, "assignTypeAttributes", function (obj, parentPath, key) {
    var finalType = {
      // Define values or defaults
      "type": _this.attributeVal(obj.type, Schema.Any),
      "required": _this.attributeVal(obj.required, false),
      "default": _this.attributeVal(obj.default, undefined),
      "transform": _this.attributeVal(obj.transform, undefined),
      "elementType": _this.attributeVal(obj.elementType, undefined)
    };
    finalType.validator = _this.attributeVal(obj.validator, getTypeValidator(finalType.type, false, function (type) {
      if (type instanceof Schema) {
        return type.validate;
      }
    }));

    if (!finalType.type) {
      // Throw as we require a type for an object definition
      throw new Error("Schema definition invalid at path \"".concat(pathJoin(parentPath, key), "\": Cannot create a field without a type. If you are trying to define an object that contains fields and types, use a new Schema instance. If you just want to define the field as an object with any contents, use an Object primitive."));
    } // If we have a transform value, make sure it is a function


    if (finalType.transform !== undefined && typeof finalType.transform !== "function") {
      throw new Error("Schema definition invalid at path \"".concat(pathJoin(parentPath, key), "\": The \"transform\" field must be a function."));
    } // If we have a default value, make sure we don't also have required:true


    if (finalType.default !== undefined && finalType.required === true) {
      throw new Error("Schema definition invalid at path \"".concat(pathJoin(parentPath, key), "\": Cannot specify both required:true AND a default since default values are only applied when a field is not explicitly specified."));
    } // If we have a default value, make sure it validates against the field type


    if (finalType.default !== undefined) {
      // Validate the default
      var validator = getTypeValidator(finalType.type, false, function (type) {
        if (type instanceof Schema) {
          return type.validate;
        }
      });
      var validatorResult = validator(finalType.default);

      if (!validatorResult.valid) {
        throw new Error("Schema definition invalid at path \"".concat(pathJoin(parentPath, key), "\": Cannot specify a default value of type ").concat(validatorResult.actualType, " when the field type is ").concat(validatorResult.expectedType, "."));
      }
    } // Finally, assign the new attributes to the "this" object


    Object.entries(finalType).map(function (_ref) {
      var _ref2 = (0, _slicedToArray2.default)(_ref, 2),
          entryKey = _ref2[0],
          entryVal = _ref2[1];

      _this[entryKey] = entryVal;
    });
  });

  if (fieldType === undefined) {
    throw new Error("Schema definition invalid at path \"".concat(pathJoin(_parentPath, _key), "\": Cannot create a field that has an undefined shape. This usually occurs if you have passed an undefined value to the field."));
  } // Handle fieldType of type "Schema"


  if (fieldType instanceof Schema) {
    this.assignTypeAttributes({
      "type": fieldType
    }, _parentPath, _key);
    return this;
  } // Handle fieldType which is a primitive


  if (isPrimitive(fieldType)) {
    var defObj = {
      "type": fieldType
    };

    if (fieldType instanceof Array) {
      // Handle array instance
      defObj.elementType = fieldType[0];
    }

    this.assignTypeAttributes(defObj, _parentPath, _key);
    return this;
  } // At this point we should have a long-hand field definition
  // object. If we don't, throw an error!


  if ((0, _typeof2.default)(fieldType) !== "object") {
    throw new Error("Schema definition invalid, expected a long-hand field definition object but couldn't understand the format.");
  } // Handle fieldType that is a long-hand definition


  this.assignTypeAttributes(fieldType, _parentPath, _key);
  return this;
};

var Schema =
/*#__PURE__*/
function () {
  /**
   * Creates a schema instance.
   * @param {Object} definition The schema definition.
   * @param {Object=} options Optional options object.
   */
  function Schema(definition) {
    var _this2 = this;

    var _options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    (0, _classCallCheck2.default)(this, Schema);
    (0, _defineProperty2.default)(this, "cast", function (model) {
      return model;
    });
    (0, _defineProperty2.default)(this, "add", function (obj) {
      if (!obj) return; // Take the new definition and add it to our existing one

      _this2._definition = (0, _objectSpread2.default)({}, _this2._definition, obj); // Convert definition into normalised version

      _this2.normalised(_this2.normalise(_this2._definition));

      return _this2;
    });
    (0, _defineProperty2.default)(this, "isValid", function (model, options) {
      return _this2.validate(model, options).valid;
    });
    (0, _defineProperty2.default)(this, "validate", function (model, currentPath) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
        "throwOnFail": false
      };

      if ((0, _typeof2.default)(currentPath) === "object") {
        options = currentPath;
        currentPath = undefined;
      }

      var schemaDefinition = _this2.normalised(); // Now check for any fields in the model that
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

      return _this2._validate(schemaDefinition, model, options.originalModel || model, currentPath, options);
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
                var _result = _this2._validate(schemaFieldValue.elementType, modelFieldValue[arrIndex], originalModel, pathJoin(currentFullPath, arrIndex));

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

      for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key2 = 2; _key2 < _len; _key2++) {
        args[_key2 - 2] = arguments[_key2];
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
      var _this3 = this;

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
            "elementType": _this3.normalise(fieldData[0])
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
      var def = this.normalised();
      var values = {};
      Object.entries(def).map(function (_ref3) {
        var _ref4 = (0, _slicedToArray2.default)(_ref3, 2),
            key = _ref4[0],
            val = _ref4[1];

        values[key] = pathFlattenValues(val, values, key, {
          "transformRead": function transformRead(dataIn) {
            if (dataIn instanceof Schema) {
              // Return the definition object
              return dataIn;
            }

            return dataIn.type;
          },
          "transformKey": pathNumberToWildcard,
          "transformWrite": function transformWrite(dataOut) {
            var primitive = getTypePrimitive(dataOut);

            if (dataOut.constructor && dataOut.constructor.name === "Schema") {
              return Schema;
            }

            return primitive;
          }
        });
      });
      /*pathFlattenValues(def, values, "", {
      	"transformRead": (dataIn) => {
      		if (dataIn instanceof Schema) {
      			// Return the definition object
      			return dataIn;
      		}
      		
      		return dataIn;
      	},
      	"transformKey": pathNumberToWildcard,
      	"transformWrite": (dataOut) => {
      		const primitive = getTypePrimitive(dataOut);
      		
      		if (dataOut.constructor && dataOut.constructor.name === "Schema") {
      			return Schema;
      		}
      		
      		return primitive;
      	}
      });*/

      return values;
    }
  }]);
  return Schema;
}();

Object.entries(customTypes).map(function (_ref5) {
  var _ref6 = (0, _slicedToArray2.default)(_ref5, 2),
      key = _ref6[0],
      value = _ref6[1];

  Schema[key] = value;
}); // Give Schema's prototype the event emitter methods
// and functionality

Emitter(Schema);
module.exports = Schema;