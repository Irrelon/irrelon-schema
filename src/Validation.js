const customTypes = require("./customTypes");
const {
	"get": pathGet,
	"furthest": pathFurthest,
	"join": pathJoin
} = require("@irrelon/path");

const validationFailed = (path, value, expectedTypeName, options = {"throwOnFail": false, "detectedTypeOverride": ""}) => {
	const actualTypeName = options.detectedTypeOverride ? options.detectedTypeOverride : getTypeName(value);
	
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

const validationFailedCustom = (path, value, errorMessage, options = {"throwOnFail": false}) => {
	if (options.throwOnFail) {
		throw new Error(errorMessage);
	}
	
	return {
		"valid": false,
		"reason": errorMessage,
		"originalModel": options.originalModel,
		path
	};
};

const validationSucceeded = () => {
	return {"valid": true};
};

const getTypeName = (value) => {
	if (isPrimitive(value) || typeof value === "function" || typeof value === "object") {
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
	
	return typeof value;
};

const isPrimitive = (value) => {
	return value === Array || value === String || value === Number || value === Boolean || value === Object || value === Function || value === Date;
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

const composeComplexValidation = (...validationFunctions) => {
	const composedFunc = compose(...validationFunctions);
	
	return (...args) => {
		const result = composedFunc(...args);
		
		for (let i = 0; i < result.length; i++) {
			if (result[i].valid === false) {
				return result[i];
			}
		}
		
		return validationSucceeded();
	};
};

const getComposedTypeValidator = (valueTypeValidator, typeSchemaOptions, customHandler) => {
	const {
		required,
		oneOf
	} = typeSchemaOptions;
	
	const validationFunctions = [];
	
	if (required) {
		validationFunctions.push(typeValidatorRequired);
	}
	
	validationFunctions.push(valueTypeValidator);
	
	if (oneOf) {
		validationFunctions.push(typeValidatorOneOf);
	}
	
	return composeComplexValidation(...validationFunctions);
};

const getTypeValidator = (value, typeSchemaOptions, customHandler) => {
	if (customHandler) {
		const unknownType = customHandler(value);
		
		if (unknownType) {
			return unknownType;
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
	
	for (const [customTypeKey, customTypeValue] of Object.entries(customTypes)) {
		if (value === customTypeValue) {
			if (typeof customTypeValue.validate === "function") {
				// There is a custom validator function here, call it and use the return value
				// to make either success or failure messages
				return getComposedTypeValidator(typeValidatorCustom(customTypeValue.validate, customTypeKey), typeSchemaOptions, customHandler);
			}
			
			// There is no custom validator function, use the custom type's type field and
			// use a built-in validator for it if any exists
			const primitiveHandler = getTypeValidator(customTypeValue.type, customTypeValue, customHandler);
			
			// Check if a primitive handler was found and if so, return that
			if (primitiveHandler) return primitiveHandler;
		}
	}
	
	if ((value instanceof Object && !(value instanceof Function)) || value === Object) {
		return getComposedTypeValidator(typeValidatorObject, typeSchemaOptions, customHandler);
	}
	
	if (value instanceof Function || value === Function) {
		return getComposedTypeValidator(typeValidatorFunction, typeSchemaOptions, customHandler);
	}
	
	// No matching handlers were found, use an "Any" type validator (always returns true validation)
	return getComposedTypeValidator(typeValidatorAny, typeSchemaOptions, customHandler);
};

const typeValidatorAny = () => {
	return validationSucceeded();
};

const typeValidatorRequired = (value, path, schema, options = {"throwOnFail": false}) => {
	if (!schema.required) {
		return validationSucceeded();
	}
	
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
	return (value, path, schema, options = {"throwOnFail": false}) => {
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

const typeValidatorFunction = (value, path, schema, options = {"throwOnFail": false}) => {
	if (value === undefined || value === null) {
		return validationSucceeded();
	}
	
	if (typeof value !== "function") {
		return validationFailed(path, value, "function", options);
	}
	
	return validationSucceeded();
};

const typeValidatorString = (value, path, schema, options = {"throwOnFail": false}) => {
	if (value === undefined || value === null) {
		return validationSucceeded();
	}
	
	if (typeof value !== "string") {
		return validationFailed(path, value, "string", options);
	}
	
	return validationSucceeded();
};

const typeValidatorNumber = (value, path, schema, options = {"throwOnFail": false}) => {
	if (value === undefined || value === null) {
		return validationSucceeded();
	}
	
	if (typeof value !== "number") {
		return validationFailed(path, value, "number", options);
	}
	
	return validationSucceeded();
};

const typeValidatorBoolean = (value, path, schema, options = {"throwOnFail": false}) => {
	if (value === undefined || value === null) {
		return validationSucceeded();
	}
	
	if (typeof value !== "boolean") {
		return validationFailed(path, value, "boolean", options);
	}
	
	return validationSucceeded();
};

const typeValidatorArray = (value, path, schema, options = {"throwOnFail": false}) => {
	if (value === undefined || value === null) {
		return validationSucceeded();
	}
	
	if (!(value instanceof Array)) {
		return validationFailed(path, value, `array<${getTypeName(schema.elementType.type)}>`, options);
	}
	
	// Early exit if we need elements and there are none
	if (schema.elementType.required && !value.length) {
		return validationFailed(path, value, `array<${getTypeName(schema.elementType.type)}>`, options);
	}
	
	// Check if the array entries match the type required inside the array
	let elementTypeValidator;
	
	if (schema.elementType.validate) {
		elementTypeValidator = schema.elementType.validate;
	} else if (schema.elementType.type && schema.elementType.type.validate) {
		elementTypeValidator = schema.elementType.type.validate;
	} else {
		elementTypeValidator = getTypeValidator(schema.elementType.type, schema.elementType);
	}
	
	let elementTypeValidationResult;
	
	for (let index = 0; index < value.length; index++) {
		elementTypeValidationResult = elementTypeValidator(value[index], pathJoin(path, index), schema.elementType);
		if (elementTypeValidationResult && elementTypeValidationResult.valid === false) {
			return elementTypeValidationResult;
		}
	}
	
	return validationSucceeded();
};

const typeValidatorDate = (value, path, schema, options = {"throwOnFail": false}) => {
	if (value === undefined || value === null) {
		return validationSucceeded();
	}
	
	if (typeof value === "string") {
		// Check if the string is a valid ISO format date
		const tmpDate = Date.parse(value);
		
		if (isNaN(tmpDate)) {
			return validationFailed(path, value, "date", options);
		}
	} else if (!(value instanceof Date)) {
		return validationFailed(path, value, "date", options);
	}
	
	return validationSucceeded();
};

const typeValidatorObject = (value, path, schema, options = {"throwOnFail": false}) => {
	if (value === undefined || value === null) {
		return validationSucceeded();
	}
	
	if (typeof value !== "object") {
		return validationFailed(path, value, "object", options);
	}
	
	return validationSucceeded();
};

const typeValidatorOneOf = (value, path, schema, options = {"throwOnFail": false}) => {
	if (!schema.oneOf) {
		return validationSucceeded();
	}
	
	if (schema.oneOf.indexOf(value) === -1) {
		return validationFailedCustom(path, value, `Schema violation, expected "${path}" to be one of ${String(JSON.stringify(schema.oneOf))} but found ${String(JSON.stringify(value)).substr(0, 10)}`, options);
	}
	
	return validationSucceeded();
};

const validateData = (path, schema, data, options = {"throwOnFail": false}) => {
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
	const fieldValidator = getTypeValidator(fieldValue.type, fieldValue);
	const pathValue = pathGet(data, furthestPath, undefined, {"transformKey": (data) => {return data;}});
	
	// Return the result of running the field validator against the field data
	return fieldValidator(pathValue, path, fieldValue, options);
};

module.exports = {
	getTypeName,
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
