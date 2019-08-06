const Emitter = require("irrelon-emitter");

const {
	"join": pathJoin,
	"get": pathGet,
	"set": pathSet,
	"flattenValues": pathFlattenValues,
	"numberToWildcard": pathNumberToWildcard
} = require("irrelon-path");
const {
	getTypePrimitive,
	getTypeValidator,
	typeAny,
	isPrimitive
} = require("./Validation");

class Schema {
	/**
	 * Creates a schema instance.
	 * @param {Object} definition The schema definition.
	 * @param {Object=} options Optional options object.
	 */
	constructor (definition, options = {}) {
		this.definition(definition);
		this._options = options;
		
		if (options.name) {
			this.name(options.name);
		}
		
		if (options.primaryKey) {
			this.primaryKey(options.primaryKey);
		}
		
		if (options.endPoint) {
			this.endPoint(options.endPoint);
		}
	
		if (options.api) {
			this.api(options.api);
		}
		
		if (options.helpers) {
			this.helpers(options.helpers);
		}
	}
	
	/**
	 * Does a console.log() if options.debug is set to true.
	 * @param {String} msg The message to log.
	 * @returns {*} Nothing
	 */
	debugLog (msg) {
		if (this._options.debug) {
			console.log(`applyModels :: ${msg}`);
		}
	}
	
	/**
	 * Get or set helpers defined on this schema instance.
	 * @param {Object} obj An object containing helper functions.
	 * @returns {Schema|Object} Either the schema instance (on set)
	 * or the helper object (on get).
	 */
	helpers (obj) {
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
	helper (id, model, ...args) {
		return this._helpers[id](model, ...args);
	}
	
	/**
	 * Gets / sets the schema name.
	 * @param {String=} val The name to set if provided.
	 * @returns {String|*} If no val is provided, returns current
	 * value, otherwise returns this.
	 */
	name (val) {
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
	primaryKey (val) {
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
	definition (val) {
		if (val === undefined) {
			return this._definition;
		}
		
		this._definition = val;
		
		// Convert definition into normalised version
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
	endPoint (val) {
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
	api (val) {
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
	normalised (val) {
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
	normalise (def, parentPath = "") {
		const finalObj = {};
		
		Object.keys(def).map((key) => {
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
			
			if (typeof def[key] === "object" && !parentPath) {
				// Handle object instance
				if (!def[key].type) {
					// Throw as we require a type for an object definition
					throw new Error(`Schema definition invalid at path "${pathJoin(parentPath, key)}": Cannot create a field without a type. If you are trying to define an object that contains fields and types, use a new Schema instance. If you just want to define the field as an object with any contents, use an Object primitive.`);
				}
				
				// If we have a default value, make sure it validates against the field type
				if (def[key].default !== undefined) {
					// TODO
					// Validate the default
				}
				
				// If we have a transform value, make sure it is a function
				if (def[key].transform !== undefined) {
					if (typeof def[key].transform !== "function") {
						throw new Error(`Schema definition invalid at path "${pathJoin(parentPath, key)}": The "transform" field must be a function.`);
					}
				}
				
				finalObj[key] = def[key];
				return;
			}
			
			// The schema type is a primitive, convert to normalised definition
			finalObj[key] =  {
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
	isValid = (model, options) => {
		return this.validate(model, options).valid;
	};
	
	/**
	 * Validates model data against the schema.
	 * @param {Object|Array} model The model to validate against the
	 * schema.
	 * @param {String=} currentPath Optional, can be passed as
	 * options argument or a string currentPath.
	 * @param {Object=} options The options object.
	 * @returns {{
	 * 	   valid: Boolean,
	 * 	   path: String,
	 * 	   reason: String
	 * }} An object with data about how the validation passed or failed.
	 */
	validate = (model, currentPath, options = {"throwOnFail": false}) => {
		if (typeof currentPath === "object") {
			options = currentPath;
			currentPath = undefined;
		}
		
		const schemaDefinition = this.normalised();
		
		// Now check for any fields in the model that
		// don't exist in the schema
		for (const i in model) {
			if (model.hasOwnProperty(i)) {
				if (schemaDefinition[i] === undefined) {
					// Found a field that should not exist in the
					// model because it is not defined in the schema
					const currentFullPath = pathJoin(currentPath, i);
					
					return {
						"valid": false,
						"path": currentFullPath,
						"reason": `The field "${i}" in the path "${currentFullPath}" is not defined in the schema!`
					};
				}
			}
		}
		
		return this._validate(schemaDefinition, model, options.originalModel || model, currentPath, options);
	};
	
	_validate = (currentSchema, currentModel, originalModel, parentPath = "", options = {"throwOnFail": false}) => {
		if (currentSchema instanceof Schema) {
			// Get the definition for this schema
			return currentSchema.validate(currentModel, parentPath, {
				originalModel,
				"throwOnFail": options.throwOnFail
			});
		}
		
		if (isPrimitive(currentSchema)) {
			const validator = getTypeValidator(currentSchema, false, (type) => {
				if (type instanceof Schema) {
					return type.validate;
				}
				
				if (type === Schema.Any.type) {
					return typeAny;
				}
			});
			
			// Validate the model value against the schema type
			return validator(currentModel, parentPath, {
				originalModel,
				"throwOnFail": options.throwOnFail
			});
		}
		
		const fieldsChecked = [];
		
		for (const i in currentSchema) {
			if (currentSchema.hasOwnProperty(i)) {
				fieldsChecked.push(i);
				const currentFullPath = pathJoin(parentPath, i);
				
				// Get the value from the schema and the model for the
				// current path key
				const schemaFieldValue = pathGet(currentSchema, i);
				let modelFieldValue = pathGet(currentModel, i);
				
				// Apply any defaults if required
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
				
				modelFieldValue = pathGet(currentModel, i);
				
				// Get the validator for this field
				const validator = getTypeValidator(schemaFieldValue.type, schemaFieldValue.required, (type) => {
					if (type instanceof Schema) {
						return type.validate;
					}
					
					if (type === Schema.Any.type) {
						return typeAny;
					}
				});
				
				// Validate the model value against the schema type
				const result = validator(modelFieldValue, currentFullPath, {
					originalModel,
					"throwOnFail": options.throwOnFail
				});
				
				if (!result.valid) {
					return result;
				}
				
				// Now we need to handle recursive behaviour based on types
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
						for (let arrIndex = 0; arrIndex < modelFieldValue.length; arrIndex++) {
							const result = this._validate(schemaFieldValue.elementType, modelFieldValue[arrIndex], originalModel, pathJoin(currentFullPath, arrIndex));
							
							if (!result.valid) {
								return result;
							}
						}
					}
				}
			}
		}
		
		return {
			"valid": true
		};
	};
	
	/**
	 * Converts the schema definition to a flat object with keys
	 * representing each schema path and values representing the
	 * types that the schema specifies.
	 * @returns {Object} The flattened schema definition.
	 */
	flattenValues () {
		const def = this.definition();
		const values = {};
		
		pathFlattenValues(def, values, "", {
			"transformRead": (dataIn) => {
				if (dataIn instanceof Schema) {
					// Return the definition object
					return dataIn.definition();
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
		});
		
		return values;
	}
}

Schema.Any = {
	"type": "Any"
};

// Give Schema's prototype the event emitter methods
// and functionality
Emitter(Schema);

module.exports = Schema;
