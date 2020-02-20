# Irrelon Schema
A (fairly) simple module to help validate JSON data
against a schema. Useful for things like unit tests,
checking responses from third-party APIs that are
subject to change etc.

## Install
```bash
npm i @irrelon/schema
```

## Usage
```js
const {Schema} = require("@irrelon/schema");

// Lets set up a schema where the "_id" field
// is a string that is required, and the "name"
// field is just a string. Notice that two different
// ways of describing a field are supported. Either
// directly via a primitive or by providing a field
// definition object that defines "type" and
// potentially other options as well like "required".

// We call the field definition object as shown below
// in the _id field "long-hand" and call a primitive
// like the name field below "short-hand".
const userSchema = new Schema({
	"_id": {
		"type": String,
		"required": true
	},
	"name": String
});

// Now let's ask the schema to validate two different
// JSON objects:
const result1 = userSchema.validate({
	"_id": 1,
	"name": "Foo"
});

console.assert(result1.valid, true); // False, validation failed

// At this point, result1.valid === false because the
// field "_id" was given, but was a number not a string

// Now let's validate another data object:
const result2 = userSchema.validate({
	"_id": "1"
});

console.assert(result2.valid, true); // True, validation passed
```

## Complex Schemas
Nested data, arrays, complex objects, sub-schemas.

### Arrays
You can tell the schema what type of arrays you are
expecting by using the shorthand or field definition
methods.

Arrays that are given an element type will have every
one of their elements checked during validation.

#### Array of Any

```js
const arraySchema = new Schema({
	"_id": String,
	"arr": {
		"type": Array
	}
});
```

This is the same as above but shorthand:

```js
const arraySchema = new Schema({
	"_id": String,
	"arr": Array
});
```

#### Array of Type

```js
const arraySchema = new Schema({
	"_id": String,
	"arr": {
		"type": Array,
		"elementType": String
	}
});
```

This is the same as above but shorthand:

```js
const arraySchema = new Schema({
	"_id": String,
	"arr": [String]
});
```

Shorthand typed array definitions do not check for types
beyond the first element in the definition. This means
that you can define a shorthand typed array like this:

```js
const arraySchema = new Schema({
	"_id": String,
	"arr": [String, Number, Boolean]
});
``` 

BUT the "arr" field will ONLY be validated for strings.
The definition does not allow for multiple types of elements
in a single array in this version of Irrelon Schema.

#### Array of Other Schema

```js
const subSchema = new Schema({
	"name": String
});

const arraySchema = new Schema({
	"_id": String,
	"arr": {
		"type": Array,
		"elementType": subSchema
	}
});
```

This is the same as above but shorthand:

```js
const subSchema = new Schema({
	"name": String
});

const arraySchema = new Schema({
	"_id": String,
	"arr": [subSchema]
});
```

### Sub-Schemas
You can define a field of any schema as needing to conform
with another schema.

```js
const userSchema = new Schema({
	"name": String,
	"age": Number
});

const arraySchema = new Schema({
	"_id": String,
	"user": {
		"type": userSchema
	}
});
```

This is the same as above but shorthand:

```js
const userSchema = new Schema({
	"name": String,
	"age": Number
});

const arraySchema = new Schema({
	"_id": String,
	"user": userSchema
});
```

## Schema API

### Schema(definition, options)

Instantiates a schema instance from the Schema class, with the
passed definition.

#### Example
```js
const myUserSchema = new Schema({
	"name": String,
	"data": new Schema({
		"index": Number, // Allows any number
		"items": [String], // Allows any array of strings
		"codes": [Number], // Allows any array of numbers
		"otherStuff": [] // Allows any array of any values
	})
});
```

The above schema maps to a JSON object (model) that could look
like this:

```js
const modelData = {
	"name": "Jim Jones",
	"data": {
		"index": 1,
		"items": ["Foo", "Bar", "Ram", "You"],
		"codes": [1, 55, 2343],
		"otherStuff": [
			"foo",
			1,
			{"bar": true},
			[343]
		]
	}
};
```

You could then validate the above JSON against the schema via:

```js
const result = myUserSchema.validate(modelData);
```

The `result` will now be an object containing three keys:

* valid (boolean)
* path (string)
* reason (string)

If the validation failed, `path` and `reason` will contain data
that allows you to see what part of the schema failed validation
and why. If the validation was successful, only `valid` will 
contain a value (of true). 

If you only want a boolean valid or not, use `isValid()`. See
below for all schema instance methods.

## Schema Instance API

These methods exist on a schema instance.

### validate(model, options)
Validates model data against the schema and provides useful
data on validation failure about where the failure occurred
and for what reason.

```js
// Defined my schema
const myUserSchema = new Schema({
	"name": String,
	"data": new Schema({
		"index": Number, // Allows any number
		"items": [String], // Allows any array of strings
		"codes": [Number], // Allows any array of numbers
		"otherStuff": [] // Allows any array of any values
	})
});

// Define my model data
const modelData = {
	"name": "Jim Jones",
	"data": {
		"index": 1,
		"items": ["Foo", "Bar", "Ram", "You"],
		"codes": [1, 55, 2343],
		"otherStuff": [
			"foo",
			1,
			{"bar": true},
			[343]
		]
	}
};

// Validate my model against my schema
const resultBoolean = myUserSchema.isValid(modelData);
```

Example success result:

```json
{
	"valid": true
}
```

Example failure result:

```json
{
	"valid": false,
	"reason": "The model passed a value of type String but expected type Number",
	"path": "data.index"
}
```

### isValid (model, options)
Checks if the passed model is valid or not and returns
a boolean true or false.

```js
// Defined my schema
const myUserSchema = new Schema({
	"name": String,
	"data": new Schema({
		"index": Number, // Allows any number
		"items": [String], // Allows any array of strings
		"codes": [Number], // Allows any array of numbers
		"otherStuff": [] // Allows any array of any values
	})
});

// Define my model data
const modelData = {
	"name": "Jim Jones",
	"data": {
		"index": 1,
		"items": ["Foo", "Bar", "Ram", "You"],
		"codes": [1, 55, 2343],
		"otherStuff": [
			"foo",
			1,
			{"bar": true},
			[343]
		]
	}
};

// Validate my model against my schema
const resultBoolean = myUserSchema.isValid(modelData);
```

Result:

```text
true
```

### flattenValues()
Converts the schema definition to a flat object with keys
representing each schema path and values representing the
types that the schema specifies.


## Special Types & OpenAPI 3 Compatibility

The schema is defined by providing keys and types. On top of
the regular JavaScript language primitives such as Number,
String, Boolean etc Irrelon Schema provides some custom types
that are useful when defining schemas designed to allow export
to other specs like OpenAPI 3 but still map to JavaScript types
internally.

> All custom types are accessed via the Schema class definition
as static properties of the class, NOT via the schema instance,
e.g. `Schema.Any`, not `new Schema().Any`

### Any
Accessed via `Schema.Any`

> To explicitly allow any data type to be stored.

```js
new Schema({
	"canBeAnyValue": Schema.Any
});
```

### Integer (int32)
Accessed via `Schema.Integer`

> This type is for outputting correct OpenAPI 3 schema
definitions only and has no different validation from a
standard JavaScript Number primitive. Irrelon Schema version
2.x will validate any valid Number (including floats etc) as
valid for this field type.

```js
new Schema({
	"mustBeIntegerValue": Schema.Integer
});
```

### Long (int64)
Accessed via `Schema.Long`

> This type is for outputting correct OpenAPI 3 schema
definitions only and has no different validation from a
standard JavaScript Number primitive. Irrelon Schema version
2.x will validate any valid Number (including floats etc) as
valid for this field type.

```js
new Schema({
	"mustBeIntegerValue": Schema.Long
});
```

### Float
Accessed via `Schema.Float`

> This type is for outputting correct OpenAPI 3 schema
definitions only and has no different validation from a
standard JavaScript Number primitive. Irrelon Schema version
2.x will validate any valid Number (including integers etc) as
valid for this field type.

```js
new Schema({
	"mustBeFloatingPointValue": Schema.Float
});
```

### Double
Accessed via `Schema.Double`

> This type is for outputting correct OpenAPI 3 schema
definitions only and has no different validation from a
standard JavaScript Number primitive. Irrelon Schema version
2.x will validate any valid Number (including floats etc) as
valid for this field type.

```js
new Schema({
	"mustBeDoubleValue": Schema.Double
});
```

### Byte
Accessed via `Schema.Byte`

> This type is for outputting correct OpenAPI 3 schema
definitions only and has no different validation from a
standard JavaScript String primitive. Irrelon Schema version
2.x will validate any valid String as valid for this field type.

```js
new Schema({
	"mustBeByteValue": Schema.Byte
});
```

### Binary
Accessed via `Schema.Binary`

> This type is for outputting correct OpenAPI 3 schema
definitions only and has no different validation from a
standard JavaScript String primitive. Irrelon Schema version
2.x will validate any valid String as valid for this field type.

```js
new Schema({
	"mustBeBinaryValue": Schema.Binary
});
```

### Date
Accessed via `Schema.Date`

> Schema.Date is the same as using JavaScript's primitive
Date type, however, any date represented as a string value that
does have an explicit time portion will have that time portion
removed when converted to a JSON object.

```js
new Schema({
	"mustBeDateValue": Schema.Date
});
```

### DateTime
Accessed via `Schema.DateTime`

> Schema.DateTime is the same as using JavaScript's primitive
Date type, however, any date represented as a string value that
does not have an explicit time portion will be automatically
augmented with a time portion reading 00:00:00 when converted to
a JSON object.

```js
new Schema({
	"mustBeDateTimeValue": Schema.DateTime
});
```

### Password
Accessed via `Schema.Password`

> This type is for outputting correct OpenAPI 3 schema
definitions only and has no different validation from a
standard JavaScript String primitive. Irrelon Schema version
2.x will validate any valid String as valid for this field type.

```js
new Schema({
	"mustBePasswordValue": Schema.Password
});
```
