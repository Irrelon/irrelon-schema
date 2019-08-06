const customTypes = require("./customTypes");
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
		const composedFunc = compose(typeValidatorRequired, validator);
		
		return (...args) => {
			const result = composedFunc(...args);
			
			for (let i = 0; i < result.length; i++) {
				if (result[i].valid === false) {
					return result[i];
				}
			}
			
			return validationSucceeded();
		};
	}
	
	return validator;
};

const validationFailed = (path, value, expectedTypeName, options = {"throwOnFail": false, "detectedTypeOverride": ""}) => {
	const actualTypeName = options.detectedTypeOverride ? options.detectedTypeOverride : getType(value);
	
	if (options.throwOnFail) {
		throw new Error(`Schema violation, "${path}" has schema type ${expectedTypeName} and cannot be set to value ${String(JSON.stringify(value)).substr(0, 10)} of type ${actualTypeName}`);
	}
	
	return {
		"valid": false,
		"expectedType": expectedTypeName,
		"actualType": actualTypeName,
		"reason": `Expected ${expectedTypeName} but value ${String(JSON.stringify(value)).substr(0, 10)} is type {${actualTypeName}}`,
		"originalModel": options.originalModel,
		path
	};
};

const validationSucceeded = () => {
	return {"valid": true};
};

const getType = (value) => {
	if (value instanceof Array) {
		return "array";
	}
	
	if (value instanceof Object && !(value instanceof Function)) {
		return "object";
	}
	
	if (value instanceof Function) {
		return "function";
	}
	
	return typeof value;
};

const isPrimitive = (value) => {
	return value === Array || value === String || value === Number || value === Boolean || value === Object || value === Function;
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
	
	if ((value instanceof Object && !(value instanceof Function)) || value === Object) {
		return Object;
	}
	
	if (value instanceof Function || value === Function) {
		return Function;
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
		return composeRequired(typeValidatorArray, isRequired);
	}
	
	if (value instanceof String || value === String) {
		return composeRequired(typeValidatorString, isRequired);
	}
	
	if (value instanceof Number || value === Number) {
		return composeRequired(typeValidatorNumber, isRequired);
	}
	
	if (value instanceof Boolean || value === Boolean) {
		return composeRequired(typeValidatorBoolean, isRequired);
	}
	
	if ((value instanceof Object && !(value instanceof Function)) || value === Object) {
		return composeRequired(typeValidatorObject, isRequired);
	}
	
	if (value instanceof Function || value === Function) {
		return composeRequired(typeValidatorFunction, isRequired);
	}
	
	for (const [customTypeKey, customTypeValue] of Object.entries(customTypes)) {
		if (value === customTypeValue) {
			if (typeof customTypeValue.validator === "function") {
				// There is a custom validator function here, call it and use the return value
				// to make either success or failure messages
				return composeRequired(typeValidatorCustom(customTypeValue.validator, customTypeKey), isRequired);
			}
			
			// There is no custom validator function, use the custom type's type field and
			// use a built-in validator for it if any exists
			const primitiveHandler = getTypeValidator(customTypeValue.type, isRequired, customHandler);
			
			// Check if a primitive handler was found and if so, return that
			if (primitiveHandler) return primitiveHandler;
		}
	}
	
	// No matching handlers were found, use an "Any" type validator (always returns true validation)
	return composeRequired(typeValidatorAny, isRequired);
};

const typeValidatorAny = () => {
	return validationSucceeded();
};

const typeValidatorRequired = (value, path, options = {"throwOnFail": true}) => {
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
	
	return validationSucceeded();
};

const typeValidatorCustom = (customValidator, customTypeName) => {
	return (value, path, options = {"throwOnFail": true}) => {
		if (value === undefined || value === null) {
			return validationSucceeded();
		}
		
		const customValidatorReturnValue = customValidator(value, path, options, validationSucceeded, validationFailed);
		
		if (customValidatorReturnValue === true) {
			return validationSucceeded();
		}
		
		if (customValidatorReturnValue === false) {
			return validationFailed(path, value, customTypeName, options);
		}
	};
};

const typeValidatorFunction = (value, path, options = {"throwOnFail": true}) => {
	if (value === undefined || value === null) {
		return validationSucceeded();
	}
	
	if (typeof value !== "function") {
		return validationFailed(path, value, "function", options);
	}
	
	return validationSucceeded();
};

const typeValidatorString = (value, path, options = {"throwOnFail": true}) => {
	if (value === undefined || value === null) {
		return validationSucceeded();
	}
	
	if (typeof value !== "string") {
		return validationFailed(path, value, "string", options);
	}
	
	return validationSucceeded();
};

const typeValidatorNumber = (value, path, options = {"throwOnFail": true}) => {
	if (value === undefined || value === null) {
		return validationSucceeded();
	}
	
	if (typeof value !== "number") {
		return validationFailed(path, value, "number", options);
	}
	
	return validationSucceeded();
};

const typeValidatorBoolean = (value, path, options = {"throwOnFail": true}) => {
	if (value === undefined || value === null) {
		return validationSucceeded();
	}
	
	if (typeof value !== "boolean") {
		return validationFailed(path, value, "boolean", options);
	}
	
	return validationSucceeded();
};

const typeValidatorArray = (value, path, options = {"throwOnFail": true}) => {
	if (value === undefined || value === null) {
		return validationSucceeded();
	}
	
	if (!(value instanceof Array)) {
		return validationFailed(path, value, "array<any>", options);
	}
	
	return validationSucceeded();
};

const typeValidatorObject = (value, path, options = {"throwOnFail": true}) => {
	if (value === undefined || value === null) {
		return validationSucceeded();
	}
	
	if (typeof value !== "object") {
		return validationFailed(path, value, "object", options);
	}
	
	return validationSucceeded();
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
	typeValidatorFunction,
	typeValidatorString,
	typeValidatorNumber,
	typeValidatorBoolean,
	typeValidatorArray,
	typeValidatorObject,
	typeValidatorAny,
	validationFailed,
	validateData,
	isPrimitive
};
