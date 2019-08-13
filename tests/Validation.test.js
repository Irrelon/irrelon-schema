const {describe, it, expect, assert} = require("mocha-expect");
const {
	validateData,
	getTypeName
} = require("../src/Validation");
const {
	Schema
} = require("../dist/Schema");

describe("Validation", () => {
	describe("getType()", () => {
		it("Returns the correct type name for a String", () => {
			const result = getTypeName(String);
			assert.strictEqual(result, "String", "Type name is correct");
		});
		
		it("Returns the correct type name for a Number", () => {
			const result = getTypeName(Number);
			assert.strictEqual(result, "Number", "Type name is correct");
		});
		
		it("Returns the correct type name for a Boolean", () => {
			const result = getTypeName(Boolean);
			assert.strictEqual(result, "Boolean", "Type name is correct");
		});
		
		it("Returns the correct type name for a Array", () => {
			const result = getTypeName(Array);
			assert.strictEqual(result, "Array", "Type name is correct");
		});
		
		it("Returns the correct type name for a Object", () => {
			const result = getTypeName(Object);
			assert.strictEqual(result, "Object", "Type name is correct");
		});
		
		it("Returns the correct type name for a Function", () => {
			const result = getTypeName(Function);
			assert.strictEqual(result, "Function", "Type name is correct");
		});
		
		it("Returns the correct type name for a Schema", () => {
			const result = getTypeName(new Schema({"name": String}));
			assert.strictEqual(result, "Schema", "Type name is correct");
		});
	});
	
	describe("validateData()", () => {
		it("Passes positive function validation", () => {
			expect(3);
			
			const result = validateData("func", {
				"func": Function
			}, {
				"func": () => {}
			}, {
				"throwOnFail": false
			});
			
			assert.strictEqual(typeof result, "object", "The result data is an object");
			assert.strictEqual(typeof result.valid, "boolean", "The result.valid data is a boolean");
			assert.strictEqual(result.valid, true, "The validation result was correct");
		});
		
		it("Passes negative function validation", () => {
			expect(3);
			
			const result = validateData("func", {
				"func": {
					"type": Function,
					"required": false
				}
			}, {
				"func": {}
			}, {
				"throwOnFail": false
			});
			
			assert.strictEqual(typeof result, "object", "The result data is an object");
			assert.strictEqual(typeof result.valid, "boolean", "The result.valid data is a boolean");
			assert.strictEqual(result.valid, false, "The validation result was correct");
		});
		
		it("Passes positive string validation", () => {
			expect(3);
			
			const result = validateData("name", {
				"name": String
			}, {
				"name": "hello"
			}, {
				"throwOnFail": false
			});
			
			assert.strictEqual(typeof result, "object", "The result data is an object");
			assert.strictEqual(typeof result.valid, "boolean", "The result.valid data is a boolean");
			assert.strictEqual(result.valid, true, "The validation result was correct");
		});
		
		it("Passes negative string validation", () => {
			expect(3);
			
			const result = validateData("name", {
				"name": {
					"type":String,
					"required": false
				}
			}, {
				"name": 1
			}, {
				"throwOnFail": false
			});
			
			assert.strictEqual(typeof result, "object", "The result data is an object");
			assert.strictEqual(typeof result.valid, "boolean", "The result.valid data is a boolean");
			assert.strictEqual(result.valid, false, "The validation result was correct");
		});
		
		it("Passes positive number validation", () => {
			expect(3);
			
			const result = validateData("name", {
				"name": Number
			}, {
				"name": 1
			}, {
				"throwOnFail": false
			});
			
			assert.strictEqual(typeof result, "object", "The result data is an object");
			assert.strictEqual(typeof result.valid, "boolean", "The result.valid data is a boolean");
			assert.strictEqual(result.valid, true, "The validation result was correct");
		});
		
		it("Passes negative number validation", () => {
			expect(3);
			
			const result = validateData("name", {
				"name": {
					"type": Number,
					"required": false
				}
			}, {
				"name": "hello"
			}, {
				"throwOnFail": false
			});
			
			assert.strictEqual(typeof result, "object", "The result data is an object");
			assert.strictEqual(typeof result.valid, "boolean", "The result.valid data is a boolean");
			assert.strictEqual(result.valid, false, "The validation result was correct");
		});
		
		it("Passes positive object validation", () => {
			expect(3);
			
			const result = validateData("name", {
				"name": Object
			}, {
				"name": {}
			}, {
				"throwOnFail": false
			});
			
			assert.strictEqual(typeof result, "object", "The result data is an object");
			assert.strictEqual(typeof result.valid, "boolean", "The result.valid data is a boolean");
			assert.strictEqual(result.valid, true, "The validation result was correct");
		});
		
		it("Passes negative object validation", () => {
			expect(3);
			
			const result = validateData("name", {
				"name": {
					"type": Object,
					"required": false
				}
			}, {
				"name": "hello"
			}, {
				"throwOnFail": false
			});
			
			assert.strictEqual(typeof result, "object", "The result data is an object");
			assert.strictEqual(typeof result.valid, "boolean", "The result.valid data is a boolean");
			assert.strictEqual(result.valid, false, "The validation result was correct");
		});
		
		it("Passes positive array validation", () => {
			expect(3);
			
			const result = validateData("name", {
				"name": {
					"type": Array,
					"elementType": Schema.Any,
					"required": false
				}
			}, {
				"name": []
			}, {
				"throwOnFail": false
			});
			
			assert.strictEqual(typeof result, "object", "The result data is an object");
			assert.strictEqual(typeof result.valid, "boolean", "The result.valid data is a boolean");
			assert.strictEqual(result.valid, true, "The validation result was correct");
		});
		
		it("Passes positive array-in-array validation", () => {
			expect(3);
			
			const result = validateData("name", {
				"name": {
					"type": Array,
					"elementType": {
						"type": Array,
						"elementType": Schema.Any,
						"required": false
					},
					"required": false
				}
			}, {
				"name": [[]]
			}, {
				"throwOnFail": false
			});
			
			assert.strictEqual(typeof result, "object", "The result data is an object");
			assert.strictEqual(typeof result.valid, "boolean", "The result.valid data is a boolean");
			assert.strictEqual(result.valid, true, "The validation result was correct");
		});
		
		it("Passes negative array validation", () => {
			expect(3);
			
			const result = validateData("name", {
				"name": {
					"type": Array,
					"elementType": Schema.Any,
					"required": false
				}
			}, {
				"name": {}
			}, {
				"throwOnFail": false
			});
			
			assert.strictEqual(typeof result, "object", "The result data is an object");
			assert.strictEqual(typeof result.valid, "boolean", "The result.valid data is a boolean");
			assert.strictEqual(result.valid, false, "The validation result was correct");
		});
		
		it("Passes positive boolean validation", () => {
			expect(3);
			
			const result = validateData("name", {
				"name": Boolean
			}, {
				"name": true
			}, {
				"throwOnFail": false
			});
			
			assert.strictEqual(typeof result, "object", "The result data is an object");
			assert.strictEqual(typeof result.valid, "boolean", "The result.valid data is a boolean");
			assert.strictEqual(result.valid, true, "The validation result was correct");
		});
		
		it("Passes negative boolean validation", () => {
			expect(3);
			
			const result = validateData("name", {
				"name": {
					"type": Boolean,
					"required": false
				}
			}, {
				"name": "true"
			}, {
				"throwOnFail": false
			});
			
			assert.strictEqual(typeof result, "object", "The result data is an object");
			assert.strictEqual(typeof result.valid, "boolean", "The result.valid data is a boolean");
			assert.strictEqual(result.valid, false, "The validation result was correct");
		});
	});
});
