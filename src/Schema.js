const Emitter = require("@irrelon/emitter");

const {
	"join": pathJoin,
	"get": pathGet,
	"set": pathSet,
	"flattenValues": pathFlattenValues,
	"numberToWildcard": pathNumberToWildcard
} = require("@irrelon/path");

const {
	getTypePrimitive,
	getTypeValidator,
	isPrimitive
} = require("./Validation");

const customTypes = require("./customTypes");
const {isCustomType} = require("./customTypes");

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
	 * @param {Object=} val The definition to set if provided.
	 * @returns {Object|*} If no val is provided, returns current
	 * value, otherwise returns this schema instance.
	 */
	definition (val) {
		if (val === undefined) {
			return this._definition;
		}
		
		this._definition = val;
		
		// Convert definition into normalised version
		this.normalised(normalise(this));
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
	 * NOT YET WRITTEN, DO NOT USE
	 * Casts a model to the correct types if possible.
	 * @param {Object|Array} model The model to cast against the
	 * schema.
	 * @returns {Object|Array} The new model, with values cast
	 * to the correct types based on the schema definition.
	 */
	cast = (model) => {
		return model;
	};
	
	add = (obj) => {
		if (!obj) return;
		
		// Take the new definition and add it to our existing one
		this._definition = {...this._definition, ...obj};
		
		// Convert definition into normalised version
		this.normalised(normalise(this));
		return this;
	};
	
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
				
				// Get updated model field value
				modelFieldValue = pathGet(currentModel, i);
				
				// Get the validator for this field
				const validator = getTypeValidator(schemaFieldValue.type, schemaFieldValue.required, (type) => {
					if (type instanceof Schema) {
						return type.validate;
					}
				});
				
				// Validate the model value against the schema type
				const result = validator(modelFieldValue, currentFullPath, schemaFieldValue, {
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
	flattenValues (parentPath = "", values = {}, visited = []) {
		const def = this.normalised();
		
		// Add our own schema instance to the visited array
		// so we don't recurse if we find it nested in our
		// own definition (we don't want infinite recursion!).
		visited.push(this);
		
		Object.entries(def).map(([key, val]) => {
			flatten(val, compoundKey(parentPath, key), values, visited);
		});
		
		return values;
	}
}

Object.entries(customTypes).map(([key, value]) => {
	Schema[key] = value;
});

const compoundKey = (...keys) => {
	return keys.reduce((finalKey, key) => {
		if (finalKey) {
			finalKey += `.${key}`;
			return finalKey;
		}
		
		return key;
	}, "");
};

const isSchemaPrimitive = (val) => {
	return val === Schema;
};

const isSchemaInstance = (val) => {
	if (!val) return false;
	if (!val.constructor) return false;
	if (val.constructor.name !== "Schema") return false;
	
	return true;
};

const isObjectDefinition = (val) => {
	if (typeof val !== "object") return false;
	if (!val.type) return false;
	
	return true;
};

const validateObjectDefinition = (fieldData, key) => {
	// If we have a transform value, make sure it is a function
	if (fieldData.transform !== undefined && typeof fieldData.transform !== "function") {
		throw new Error(`Schema definition invalid at path "${key}": The "transform" field must be a function.`);
	}
	
	// If we have a default value, make sure we don't also have required:true
	if (fieldData.default !== undefined && fieldData.required === true) {
		throw new Error(`Schema definition invalid at path "${key}": Cannot specify both required:true AND a default since default values are only applied when a field is not explicitly specified.`);
	}
	
	// If we have a default value, make sure it validates against the field type
	if (fieldData.default !== undefined) {
		// Validate the default
		const validator = getTypeValidator(fieldData.type, false, (type) => {
			if (type instanceof Schema) {
				return type.validate;
			}
		});
		
		const validatorResult = validator(fieldData.default);
		
		if (!validatorResult.valid) {
			throw new Error(`Schema definition invalid at path "${key}": Cannot specify a default value of type ${validatorResult.actualType} when the field type is ${validatorResult.expectedType}.`);
		}
	}
};

const flatten = (def, parentPath = "", values = {}, visited = []) => {
	// Check if the def is a non-flatten type (a custom type)
	if (isCustomType(def)) {
		values[parentPath] = def;
		return values;
	}
	
	if (isPrimitive(def)) {
		values[parentPath] = def;
		return values;
	}
	
	if (isSchemaInstance(def)) {
		values[parentPath] = def;
		return values;
	}
	
	if (!isObjectDefinition(def)) {
		// We need to throw an error as we don't know what to do now!
		throw new Error("Unable to flatten object whose signature we don't understand!");
	}
	
	// At this point we know the def is an object definition
	const {type, elementType} = def;
	
	// Check for array instance
	if (type === Array) {
		values[parentPath] = Array;
		
		const valueKey = compoundKey(parentPath, "$");
		
		if (elementType) {
			// Recurse into the array data
			flatten(normaliseField(elementType, valueKey, visited), valueKey, values, visited);
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
		values[parentPath] = type;
		
		// Check if we have already added this schema type to the flattened object
		if (visited.indexOf(type) > -1) {
			return values;
		}
		
		visited.push(type);
		
		type.flattenValues(parentPath, values, visited);
		return values;
	}
	
	return values;
};

const normalise = (def) => {
	const values = {};
	const visited = [];
	const schemaDefinition = def.definition();
	
	Object.entries(schemaDefinition).map(([key, val]) => {
		values[key] = normaliseField(val, key, visited);
	});
	
	return values;
};

const normaliseField = (field, key, visited = []) => {
	if (isCustomType(field)) {
		return {
			"type": field,
			"required": false
		};
	}
	
	if (isPrimitive(field)) {
		if (field === Array) {
			return {
				"type": field,
				"required": false,
				"elementType": Schema.Any
			};
		}
		
		return {
			"type": field,
			"required": false
		};
	}
	
	if (isSchemaPrimitive(field)) {
		return {
			"type": field,
			"required": false
		};
	}
	
	if (isSchemaInstance(field)) {
		// Check if we have already added this schema type to the flattened object
		if (visited.indexOf(field) > -1) {
			return undefined;
		}
		
		visited.push(field);
		
		return {
			"type": field,
			"required": false
		};
	}
	
	if (field instanceof Array) {
		const elementType = field[0] ? normaliseField(field[0], compoundKey(key, "$")) : Schema.Any;
		
		return {
			"type": Array,
			elementType,
			"required": false
		};
	}
	
	if (isObjectDefinition(field)) {
		// Check object definition is valid
		validateObjectDefinition(field, key);
		
		if (field.type === Array) {
			if (field.elementType) {
				// Normalise the element type
				field.elementType = normaliseField(field.elementType, compoundKey(key, "$"));
			} else {
				// Set default array elementType of Schema.Any
				field.elementType = Schema.Any;
			}
		}
		
		// Make sure the field has default settings
		return {
			"required": false,
			...field
		};
	}
	
	// We don't know how to handle this field information!
	throw new Error(`Unable to determine what to do with the field data at "${key}". We don't recognise the format! ${JSON.stringify(field)}`);
};

// Give Schema's prototype the event emitter methods
// and functionality
Emitter(Schema);

module.exports = {
	Schema,
	flatten,
	normalise
};
