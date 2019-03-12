# Irrelon Schema
A (fairly) simple module to help validate JSON data
against a schema. Useful for things like unit tests,
checking responses from third-party APIs that are
subject to change etc.

## Install
```bash
npm i irrelon-schema
```

## Usage
```js
const Schema = require("irrelon-schema");

// Lets set up a schema where the "_id" field
// is a string that is required, and the "name"
// field is just a string. Notice that two different
// ways of describing a field are supported. Either
// directly giving a type or by providing a field
// definition object that defines "type" and
// potentially other options as well like "required". 
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