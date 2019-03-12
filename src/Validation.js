const {
	"get": pathGet,
	"furthest": pathFurthest
} = require("irrelon-path");

/**
 * Creates a function that calls each function passed as an
 * argument in turn with the same arguments as the calling
 * code provides.
 * @param {Function} args The functions to call in turn.
 * @returns {Function} A function to call that will call each
 * function presented as an argument in turn.
 */
const compose = (...args) => {
	return (...endCallArgs) => {
		return args.map((item) => {
			return item(...endCallArgs);
		});
	};
};

const composeRequired = (validator, isRequired) => {
	if (isRequired) {
		const composedFunc = compose(typeRequired, validator);
		
		return (...args) => {
			const result = composedFunc(...args);
			
			for (let i = 0; i < result.length; i++) {
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

const validationFailed = (path, value, expectedTypeName, options = {"throwOnFail": false, "typeDetectedOverride": ""}) => {
	if (options.throwOnFail) {
		throw new Error(`Schema violation, "${path}" has schema type ${expectedTypeName} and cannot be set to value ${String(JSON.stringify(value)).substr(0, 10)} of type ${options.typeDetectedOverride ? options.typeDetectedOverride : getType(value)}`);
	}
	
	return {
		"valid": false,
		path,
		"reason": `Expected {string} but value ${String(JSON.stringify(value)).substr(0, 10)} is type {${getType(value)}}`,
		"originalModel": options.originalModel
	};
};

const getType = (value) => {
	if (value instanceof Array) {
		return "array";
	}
	
	return typeof value;
};

const getTypePrimitive = (value) => {
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
	
	if (value instanceof Object || value === Object) {
		return Object;
	}
	
	return typeof value;
};

const getTypeValidator = (value, isRequired, customHandler) => {
	if (customHandler) {
		const unknownType = customHandler(value);
		
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
	
	if (value instanceof Object || value === Object) {
		return composeRequired(typeObject, isRequired);
	}
	
	return typeUnknown;
};

const typeUnknown = () => {
	return {"valid": true};
};

const typeRequired = (value, path, options = {"throwOnFail": true}) => {
	if (value === undefined || value === null) {
		if (options.throwOnFail) {
			throw new Error(`Schema violation, "${path}" is required and cannot be undefined or null`);
		}
		
		return {
			"valid": false,
			path,
			"reason": `Schema violation, "${path}" is required and cannot be undefined or null`
		};
	}
	
	return {"valid": true};
};

const typeString = (value, path, options = {"throwOnFail": true}) => {
	if (value === undefined || value === null) {
		return {"valid": true};
	}
	
	if (typeof value !== "string") {
		return validationFailed(path, value, "string", options);
	}
	
	return {"valid": true};
};

const typeNumber = (value, path, options = {"throwOnFail": true}) => {
	if (value === undefined || value === null) {
		return {"valid": true};
	}
	
	if (typeof value !== "number") {
		return validationFailed(path, value, "number", options);
	}
	
	return {"valid": true};
};

const typeBoolean = (value, path, options = {"throwOnFail": true}) => {
	if (value === undefined || value === null) {
		return {"valid": true};
	}
	
	if (typeof value !== "boolean") {
		return validationFailed(path, value, "boolean", options);
	}
	
	return {"valid": true};
};

const typeArray = (value, path, options = {"throwOnFail": true}) => {
	if (value === undefined || value === null) {
		return {"valid": true};
	}
	
	if (!(value instanceof Array)) {
		return validationFailed(path, value, "array<any>", options);
	}
	
	return {"valid": true};
};

const typeObject = (value, path, options = {"throwOnFail": true}) => {
	if (value === undefined || value === null) {
		return {"valid": true};
	}
	
	if (typeof value !== "object") {
		return validationFailed(path, value, "object", options);
	}
	
	return {"valid": true};
};

const validateData = (path, schema, data, options = {"throwOnFail": true}) => {
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
	const furthestPath = pathFurthest(schema, path, {
		"transformKey": (key) => {
			// Check if the key is a wildcard
			if (key === "$") {
				// The key is a wildcard, return zero since any array with a valid
				// path will have a zero-indexed item
				return "0";
			}
			
			return key;
		}
	});
	
	// Get the value in the schema object at the path
	const fieldValue = pathGet(schema, furthestPath);
	const fieldValidator = getTypeValidator(fieldValue);
	const pathValue = pathGet(data, furthestPath, undefined, {"transformKey": (data) => {return data;}});
	
	// Return the result of running the field validator against the field data
	return fieldValidator(pathValue, path, options);
};

module.exports = {
	getType,
	getTypePrimitive,
	getTypeValidator,
	typeString,
	typeNumber,
	typeBoolean,
	typeArray,
	typeObject,
	typeUnknown,
	validationFailed,
	validateData
};