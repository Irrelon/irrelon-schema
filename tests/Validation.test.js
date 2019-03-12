const {describe, it, expect, assert} = require("mocha-expect");
const {
	validateData
} = require("../src/Validation");

describe("Validation", () => {
	describe("validateData()", () => {
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
				"name": String
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
				"name": Number
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
				"name": Object
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
				"name": Array
			}, {
				"name": []
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
				"name": Array
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
				"name": Boolean
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