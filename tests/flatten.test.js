const assert = require("assert");
const {flatten, Schema} = require("../dist/Schema");

describe("flatten()", () => {
	it("Will return the correct value for a primitive String", () => {
		const testFieldDefinition = {
			"type": String
		};
		
		const result = flatten(testFieldDefinition, "testField");
		
		assert.strictEqual(result["testField"], String, "The field value is correct");
	});
	
	it("Will return the correct value for a primitive Number", () => {
		const testFieldDefinition = {
			"type": Number
		};
		
		const result = flatten(testFieldDefinition, "testField");
		
		assert.strictEqual(result["testField"], Number, "The field value is correct");
	});
	
	it("Will return the correct value for a primitive Object", () => {
		const testFieldDefinition = {
			"type": Object
		};
		
		const result = flatten(testFieldDefinition, "testField");
		
		assert.strictEqual(result["testField"], Object, "The field value is correct");
	});
	
	it("Will return the correct value for a primitive Function", () => {
		const testFieldDefinition = {
			"type": Function
		};
		
		const result = flatten(testFieldDefinition, "testField");
		
		assert.strictEqual(result["testField"], Function, "The field value is correct");
	});
	
	it("Will return the correct value for a primitive Array", () => {
		const testFieldDefinition = {
			"type": Array
		};
		
		const result = flatten(testFieldDefinition, "testField");
		
		assert.strictEqual(result["testField"], Array, "The field value is correct");
	});
	
	it("Will return the correct value for a primitive Schema", () => {
		const testFieldDefinition = {
			"type": Schema
		};
		
		const result = flatten(testFieldDefinition, "testField");
		
		assert.strictEqual(result["testField"], Schema, "The field value is correct");
	});
	
	it("Will return the correct value for a Schema instance", () => {
		const MySchema = new Schema({
			"name": String,
			"age": Number
		});
		
		const testFieldDefinition = {
			"type": MySchema
		};
		
		const result = flatten(testFieldDefinition, "testField");
		
		assert.strictEqual(result["testField"], MySchema, "The field value is correct");
	});
	
	it("Will return the correct value for an array-nested primitive String", () => {
		const testFieldDefinition = {
			"type": Array,
			"elementType": String
		};
		
		const result = flatten(testFieldDefinition, "testField");
		
		assert.strictEqual(result["testField"], Array, "The field value is correct");
		assert.strictEqual(result["testField.$"], String, "The field value is correct");
	});
	
	it("Will return the correct value for an array-nested primitive Number", () => {
		const testFieldDefinition = {
			"type": Array,
			"elementType": Number
		};
		
		const result = flatten(testFieldDefinition, "testField");
		
		assert.strictEqual(result["testField"], Array, "The field value is correct");
		assert.strictEqual(result["testField.$"], Number, "The field value is correct");
	});
	
	it("Will return the correct value for an array-nested primitive Object", () => {
		const testFieldDefinition = {
			"type": Array,
			"elementType": Object
		};
		
		const result = flatten(testFieldDefinition, "testField");
		
		assert.strictEqual(result["testField"], Array, "The field value is correct");
		assert.strictEqual(result["testField.$"], Object, "The field value is correct");
	});
	
	it("Will return the correct value for an array-nested primitive Function", () => {
		const testFieldDefinition = {
			"type": Array,
			"elementType": Function
		};
		
		const result = flatten(testFieldDefinition, "testField");
		
		assert.strictEqual(result["testField"], Array, "The field value is correct");
		assert.strictEqual(result["testField.$"], Function, "The field value is correct");
	});
	
	it("Will return the correct value for an array-nested primitive Array", () => {
		const testFieldDefinition = {
			"type": Array,
			"elementType": Array
		};
		
		const result = flatten(testFieldDefinition, "testField");
		
		assert.strictEqual(result["testField"], Array, "The field value is correct");
		assert.strictEqual(result["testField.$"], Array, "The field value is correct");
	});
	
	it("Will return the correct value for an array-nested primitive Schema", () => {
		const testFieldDefinition = {
			"type": Array,
			"elementType": Schema
		};
		
		const result = flatten(testFieldDefinition, "testField");
		
		assert.strictEqual(result["testField"], Array, "The field value is correct");
		assert.strictEqual(result["testField.$"], Schema, "The field value is correct");
	});
	
	it("Will return the correct value for an array-nested Schema instance", () => {
		const MySchema = new Schema({
			"name": String,
			"age": Number,
			"stats": {
				"type": Array,
				"elementType": Number
			}
		});
		
		const testFieldDefinition = {
			"type": Array,
			"elementType": MySchema
		};
		
		const result = flatten(testFieldDefinition, "testField");
		
		assert.strictEqual(result["testField"], Array, "The field value is correct");
		assert.strictEqual(result["testField.$"], MySchema, "The field value is correct");
		assert.strictEqual(result["testField.$.name"], String, "The field value is correct");
		assert.strictEqual(result["testField.$.age"], Number, "The field value is correct");
		assert.strictEqual(result["testField.$.stats"], Array, "The field value is correct");
		assert.strictEqual(result["testField.$.stats.$"], Number, "The field value is correct");
	});
});
