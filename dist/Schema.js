"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var Emitter = require("irrelon-emitter");

var _require = require("irrelon-path"),
    pathJoin = _require["join"],
    pathGet = _require["get"],
    pathSet = _require["set"],
    pathFlattenValues = _require["flattenValues"],
    pathNumberToWildcard = _require["numberToWildcard"];

var _require2 = require("./Validation"),
    getTypePrimitive = _require2.getTypePrimitive,
    getTypeValidator = _require2.getTypeValidator,
    typeAny = _require2.typeAny,
    isPrimitive = _require2.isPrimitive;

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

          if (type === Schema.Any.type) {
            return typeAny;
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

            if (type === Schema.Any.type) {
              return typeAny;
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

    if (_options.endPoint) {
      this.endPoint(_options.endPoint);
    }

    if (_options.api) {
      this.api(_options.api);
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
     * @param {String=} val The definition to set if provided.
     * @returns {String|*} If no val is provided, returns current
     * value, otherwise returns this.
     */

  }, {
    key: "definition",
    value: function definition(val) {
      if (val === undefined) {
        return this._definition;
      }

      this._definition = val; // Convert definition into normalised version

      this.normalised(this.normalise(val));
      return this;
    }
    /**
     * Gets / sets the schema endpoint. This is used to handle
     * automatically communicating via REST standards for CRUD
     * calls.
     * @param {String=} val The endpoint to set if provided.
     * @returns {String|*} If no val is provided, returns current
     * value, otherwise returns this.
     */

  }, {
    key: "endPoint",
    value: function endPoint(val) {
      if (val === undefined) {
        return this._endPoint;
      }

      this._endPoint = val;
      return this;
    }
    /**
     * Gets / sets the schema api instance. This instance must provide
     * an API interface so .get() .post() .put() .delete() etc must be
     * provided by this instance to allow communications with a REST
     * server which is specified by a call to endPoint().
     * @param {String=} val The definition to set if provided.
     * @returns {String|*} If no val is provided, returns current
     * value, otherwise returns this.
     */

  }, {
    key: "api",
    value: function api(val) {
      if (val === undefined) {
        return this._api;
      }

      this._api = val;
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
     * @param {Object} def The schema definition to normalise.
     * @param {String=} parentPath The path to normalise. Usually
     * left not specified so that the definition object can be fully
     * normalised.
     * @returns {Object} The normalised schema definition.
     */

  }, {
    key: "normalise",
    value: function normalise(def) {
      var parentPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
      var finalObj = {};
      Object.keys(def).map(function (key) {
        if (def[key] instanceof Schema) {
          finalObj[key] = {
            "type": def[key],
            "required": false
          };
          return;
        }

        if (def[key] instanceof Array) {
          // Handle array instance
          finalObj[key] = {
            "type": Array,
            "elementType": def[key][0],
            "required": false
          };
          return;
        }

        if ((0, _typeof2.default)(def[key]) === "object" && !parentPath) {
          // Handle object instance
          if (!def[key].type) {
            // Throw as we require a type for an object definition
            throw new Error("Schema definition invalid at path \"".concat(pathJoin(parentPath, key), "\": Cannot create a field without a type. If you are trying to define an object that contains fields and types, use a new Schema instance. If you just want to define the field as an object with any contents, use an Object primitive."));
          } // If we have a default value, make sure it validates against the field type


          if (def[key].default !== undefined) {} // TODO
          // Validate the default
          // If we have a transform value, make sure it is a function


          if (def[key].transform !== undefined) {
            if (typeof def[key].transform !== "function") {
              throw new Error("Schema definition invalid at path \"".concat(pathJoin(parentPath, key), "\": The \"transform\" field must be a function."));
            }
          }

          finalObj[key] = def[key];
          return;
        } // The schema type is a primitive, convert to normalised definition


        finalObj[key] = {
          "type": def[key],
          "required": false
        };
      });
      return finalObj;
    }
    /**
     * Checks if the passed model is valid or not and returns
     * a boolean true or false.
     * @param {Object|Array} model The model to validate against the
     * schema.
     * @param {Object=} options The options object.
     * @returns {Boolean} True if validation was succcessful, false
     * if validation failed.
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
      var def = this.definition();
      var values = {};
      pathFlattenValues(def, values, "", {
        "transformRead": function transformRead(dataIn) {
          if (dataIn instanceof Schema) {
            // Return the definition object
            return dataIn.definition();
          }

          return dataIn;
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
      return values;
    }
  }]);
  return Schema;
}();

Schema.Any = {
  "type": "Any"
}; // Give Schema's prototype the event emitter methods
// and functionality

Emitter(Schema);
module.exports = Schema;