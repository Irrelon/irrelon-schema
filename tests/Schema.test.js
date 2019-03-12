const {describe, it, expect, assert} = require("mocha-expect");
const Schema = require("../src/Schema");

const actionPlanSchema = require("./lib/actionPlanSchema");

describe ("Schema", () => {
	describe("flattenValues()", () => {
		it("Can flatten a schema definition to an object with key paths and primitive types as values", () => {
			expect(11);
			
			const schema = new Schema({
				"complex": [new Schema({
					"name": String,
					"meta": new Schema({
						"type": String,
						"index": Number
					}),
					"other": new Schema({
						"stuff": Array
					}),
					"arr": [new Schema({
						"foo": Boolean
					})]
				})]
			});
			
			const result = schema.flattenValues();
			
			assert.strictEqual(result["complex"], Array, "complex type is correct");
			assert.strictEqual(result["complex.$"], Schema, "complex.$ type is correct");
			assert.strictEqual(result["complex.$.name"], String, "complex.$.name type is correct");
			assert.strictEqual(result["complex.$.meta"], Schema, "complex.$.meta type is correct");
			assert.strictEqual(result["complex.$.meta.type"], String, "complex.$.meta.type type is correct");
			assert.strictEqual(result["complex.$.meta.index"], Number, "complex.$.meta.type type is correct");
			assert.strictEqual(result["complex.$.other"], Schema, "complex.$.other type is correct");
			assert.strictEqual(result["complex.$.other.stuff"], Array, "complex.$.other.stuff type is correct");
			assert.strictEqual(result["complex.$.arr"], Array, "complex.$.arr type is correct");
			assert.strictEqual(result["complex.$.arr.$"], Schema, "complex.$.arr.$ type is correct");
			assert.strictEqual(result["complex.$.arr.$.foo"], Boolean, "complex.$.arr.$.foo type is correct");
		});
	});
	
	describe("name()", () => {
		it("Has recorded the model name correctly", () => {
			expect(1);
			assert.strictEqual(actionPlanSchema.name(), "ActionPlan", "The value was set correctly");
		});
	});
	
	describe("primaryKey()", () => {
		it("Has recorded the primaryKey name correctly", () => {
			expect(1);
			assert.strictEqual(actionPlanSchema.primaryKey(), "id", "The value was set correctly");
		});
	});
	
	describe("validate()", () => {
		it("Can correctly validate positive shorthand primitive array", () => {
			const schema = new Schema({
				"arr": Array
			});
			
			const result = schema.validate({
				"arr": []
			});
			
			assert.strictEqual(result.valid, true, "The schema validated correctly");
		});
		
		it("Can correctly validate negative shorthand primitive array", () => {
			const schema = new Schema({
				"arr": Array
			});
			
			const result = schema.validate({
				"arr": {}
			});
			
			assert.strictEqual(result.valid, false, "The schema validated correctly");
		});
		
		it("Can correctly validate positive shorthand instance array", () => {
			const schema = new Schema({
				"arr": []
			});
			
			const result = schema.validate({
				"arr": []
			});
			
			assert.strictEqual(result.valid, true, "The schema validated correctly");
		});
		
		it("Can correctly validate negative shorthand instance array", () => {
			const schema = new Schema({
				"arr": []
			});
			
			const result = schema.validate({
				"arr": {}
			});
			
			assert.strictEqual(result.valid, false, "The schema validated correctly");
		});
		
		it("Can correctly validate positive shorthand instance typed array", () => {
			const schema = new Schema({
				"arr": [String]
			});
			
			const result = schema.validate({
				"arr": ["Foo", "Bar"]
			});
			
			assert.strictEqual(result.valid, true, "The schema validated correctly");
		});
		
		it("Can correctly validate negative shorthand instance typed array", () => {
			const schema = new Schema({
				"arr": [String]
			});
			
			const result = schema.validate({
				"arr": ["Foo", "Bar", 1]
			});
			
			assert.strictEqual(result.valid, false, "The schema validated correctly");
		});
		
		it("Can correctly validate positive longhand array", () => {
			const schema = new Schema({
				"arr": {
					"type": Array
				}
			});
			
			const result = schema.validate({
				"arr": ["Foo", "Bar"]
			});
			
			assert.strictEqual(result.valid, true, "The schema validated correctly");
		});
		
		it("Can correctly validate negative longhand array", () => {
			const schema = new Schema({
				"arr": {
					"type": Array
				}
			});
			
			const result = schema.validate({
				"arr": {}
			});
			
			assert.strictEqual(result.valid, false, "The schema validated correctly");
		});
		
		it("Can correctly validate positive longhand typed array", () => {
			const schema = new Schema({
				"arr": {
					"type": Array,
					"elementType": String
				}
			});
			
			const result = schema.validate({
				"arr": ["Foo", "Bar"]
			});
			
			assert.strictEqual(result.valid, true, "The schema validated correctly");
		});
		
		it("Can correctly validate negative longhand typed array", () => {
			const schema = new Schema({
				"arr": {
					"type": Array,
					"elementType": String
				}
			});
			
			const result = schema.validate({
				"arr": ["Foo", "Bar", 1]
			});
			
			assert.strictEqual(result.valid, false, "The schema validated correctly");
		});
		
		it("Can fail when required data does not exist", () => {
			expect(4);
			
			const schema = new Schema({
				"id": {
					"type": String,
					"required": true
				},
				"email": {
					"type": String,
					"required": true
				},
				"name": {
					"type": String,
					"required": true
				},
				"firstName": {
					"type": String,
					"required": true
				},
				"lastName": {
					"type": String,
					"required": true
				}
			});
			
			const model = {
				"id": "1234",
				"name": "Jim Jones",
				"firstName": "Jim",
				"lastName": "Jones"
			};
			
			const validModel = schema.validate(model);
			
			assert.strictEqual(validModel.valid, false, "The model was rejected by the schema");
			assert.strictEqual(validModel.path, "email", "The schema validation data identified the failed path correctly");
			assert.strictEqual(validModel.reason, `Schema violation, "email" is required and cannot be undefined or null`, "The schema validation failure reason is correct");
			assert.strictEqual(model.name, "Jim Jones", "The model defaults were set correctly");
		});
		
		it("Can validate complex schema against path and object", () => {
			expect(2);
			
			const schema = new Schema({
				"complex": [new Schema({
					"name": {
						"type": String,
						"default": "FooooooooDefault"
					},
					"meta": new Schema({
						"type": String,
						"index": Number
					}),
					"other": new Schema({
						"stuff": Array
					}),
					"arr": {
						"type": Array,
						"elementType": new Schema({
							"foo": {
								"type": Boolean,
								"required": true
							}
						}),
						"required": true,
						"elementRequired": true
					}
				})]
			});
			
			const model = {
				"complex": [{
					"arr": []
				}]
			};
			
			const validModel = schema.validate(model);
			
			assert.strictEqual(validModel.valid, true, "The model was validated against the schema successfully");
			assert.strictEqual(model.complex[0].name, "FooooooooDefault", "The model defaults were set correctly");
		});
		
		it("Can transform model data based on schema transform function", () => {
			expect(2);
			
			const schema = new Schema({
				"foo": {
					"type": String,
					"transform": () => {
						return "bar";
					}
				}
			});
			
			const model = {};
			const validModel = schema.validate(model);
			
			assert.strictEqual(validModel.valid, true, "The model was validated against the schema successfully");
			assert.strictEqual(model.foo, "bar", "The data from the transform function was applied correctly");
		});
		
		it("Transform function receives the correct arguments", () => {
			expect(4);
			
			let callData = undefined,
				callImmediateModel = undefined,
				callOverallModel = undefined;
			
			const schema = new Schema({
				"thing": new Schema({
					"foo": {
						"type": String,
						"transform": (data, immediateModel, overallModel) => {
							callData = data;
							callImmediateModel = immediateModel;
							callOverallModel = overallModel;
							
							return "bar";
						}
					}
				})
			});
			
			const model = {
				"thing": {}
			};
			const validModel = schema.validate(model);
			
			assert.strictEqual(validModel.valid, true, "The model was validated against the schema successfully");
			assert.deepEqual(callData, undefined, "Argument \"data\" from the transform function was correct");
			assert.deepEqual(callImmediateModel, {
				"foo": "bar"
			}, "Argument \"immediateModel\" from the transform function was correct");
			assert.deepEqual(callOverallModel.thing, {
				"foo": "bar"
			}, "Argument \"overallModel\" from the transform function was correct");
		});
		
		it("Passes positive string validation", () => {
			expect(2);
			
			const weWant = true;
			const setValue = "Hello";
			const model = {};
			
			model.string = setValue;
			const validModel = actionPlanSchema.validate(model);
			
			assert.strictEqual(model.string, setValue, "The model data was set successfully");
			assert.strictEqual(validModel.valid, weWant, "The model was validated against the schema successfully");
		});
		
		it("Passes negative string validation", () => {
			expect(2);
			
			const weWant = false;
			const setValue = 1;
			const model = {};
			
			model.string = setValue;
			const validModel = actionPlanSchema.validate(model);
			
			assert.strictEqual(model.string, setValue, "The model data was set successfully");
			assert.strictEqual(validModel.valid, weWant, "The model was validated against the schema successfully");
		});
		
		it("Passes positive number validation", () => {
			expect(3);
			
			const weWant = true;
			const setValue = 1;
			const model = {};
			
			model.number = setValue;
			const validModel = actionPlanSchema.validate(model);
			
			assert.strictEqual(model.number, setValue, "The model data was set successfully");
			assert.strictEqual(validModel.reason, undefined, "The model validation reason is undefined");
			assert.strictEqual(validModel.valid, weWant, "The model was validated against the schema successfully");
		});
		
		it("Passes negative number validation", () => {
			expect(2);
			
			const weWant = false;
			const setValue = "1";
			const model = {};
			
			model.number = setValue;
			const validModel = actionPlanSchema.validate(model);
			
			assert.strictEqual(model.number, setValue, "The model data was set successfully");
			assert.strictEqual(validModel.valid, weWant, "The model was validated against the schema successfully");
		});
		
		it("Passes positive boolean validation", () => {
			expect(2);
			
			const weWant = true;
			const setValue = true;
			const model = {};
			
			model.boolean = setValue;
			const validModel = actionPlanSchema.validate(model);
			
			assert.strictEqual(model.boolean, setValue, "The model data was set successfully");
			assert.strictEqual(validModel.valid, weWant, "The model was validated against the schema successfully");
		});
		
		it("Passes negative boolean validation", () => {
			expect(2);
			
			const weWant = false;
			const setValue = "true";
			const model = {};
			
			model.boolean = setValue;
			const validModel = actionPlanSchema.validate(model);
			
			assert.strictEqual(model.boolean, setValue, "The model data was set successfully");
			assert.strictEqual(validModel.valid, weWant, "The model was validated against the schema successfully");
		});
		
		it("Passes positive arrayAny validation", () => {
			expect(2);
			
			const weWant = true;
			const setValue = [];
			const model = {};
			
			model.arrayAny = setValue;
			const validModel = actionPlanSchema.validate(model);
			
			assert.strictEqual(model.arrayAny, setValue, "The model data was set successfully");
			assert.strictEqual(validModel.valid, weWant, "The model was validated against the schema successfully");
		});
		
		it("Passes negative arrayAny validation", () => {
			expect(2);
			
			const weWant = false;
			const setValue = {};
			const model = {};
			
			model.arrayAny = setValue;
			const validModel = actionPlanSchema.validate(model);
			
			assert.strictEqual(model.arrayAny, setValue, "The model data was set successfully");
			assert.strictEqual(validModel.valid, weWant, "The model was validated against the schema successfully");
		});
		
		it("Passes positive arrayString validation", () => {
			expect(2);
			
			const weWant = true;
			const setValue = ["Hello"];
			const model = {};
			
			model.arrayString = setValue;
			const validModel = actionPlanSchema.validate(model);
			
			assert.strictEqual(model.arrayString, setValue, "The model data was set successfully");
			assert.strictEqual(validModel.valid, weWant, "The model was validated against the schema successfully");
		});
		
		it("Passes negative arrayString validation", () => {
			expect(2);
			
			const weWant = false;
			const setValue = [1];
			const model = {};
			
			model.arrayString = setValue;
			const validModel = actionPlanSchema.validate(model);
			
			assert.strictEqual(model.arrayString, setValue, "The model data was set successfully");
			assert.strictEqual(validModel.valid, weWant, "The model was validated against the schema successfully");
		});
		
		it("Passes positive arrayNumber validation", () => {
			expect(2);
			
			const weWant = true;
			const setValue = [1];
			const model = {};
			
			model.arrayNumber = setValue;
			const validModel = actionPlanSchema.validate(model);
			
			assert.strictEqual(model.arrayNumber, setValue, "The model data was set successfully");
			assert.strictEqual(validModel.valid, weWant, "The model was validated against the schema successfully");
		});
		
		it("Passes negative arrayNumber validation", () => {
			expect(2);
			
			const weWant = false;
			const setValue = ["Hello"];
			const model = {};
			
			model.arrayNumber = setValue;
			const validModel = actionPlanSchema.validate(model);
			
			assert.strictEqual(model.arrayNumber, setValue, "The model data was set successfully");
			assert.strictEqual(validModel.valid, weWant, "The model was validated against the schema successfully");
		});
		
		it("Passes positive arrayBoolean validation", () => {
			expect(2);
			
			const weWant = true;
			const setValue = [true];
			const model = {};
			
			model.arrayBoolean = setValue;
			const validModel = actionPlanSchema.validate(model);
			
			assert.strictEqual(model.arrayBoolean, setValue, "The model data was set successfully");
			assert.strictEqual(validModel.valid, weWant, "The model was validated against the schema successfully");
		});
		
		it("Passes negative arrayBoolean validation", () => {
			expect(2);
			
			const weWant = false;
			const setValue = ["Hello"];
			const model = {};
			
			model.arrayBoolean = setValue;
			const validModel = actionPlanSchema.validate(model);
			
			assert.strictEqual(model.arrayBoolean, setValue, "The model data was set successfully");
			assert.strictEqual(validModel.valid, weWant, "The model was validated against the schema successfully");
		});
		
		it("Passes positive arrayArrayAny validation", () => {
			expect(2);
			
			const weWant = true;
			const setValue = [[]];
			const model = {};
			
			model.arrayArrayAny = setValue;
			const validModel = actionPlanSchema.validate(model);
			
			assert.strictEqual(model.arrayArrayAny, setValue, "The model data was set successfully");
			assert.strictEqual(validModel.valid, weWant, "The model was validated against the schema successfully");
		});
		
		it("Passes negative arrayArrayAny validation", () => {
			expect(2);
			
			const weWant = false;
			const setValue = ["Hello"];
			const model = {};
			
			model.arrayArrayAny = setValue;
			const validModel = actionPlanSchema.validate(model);
			
			assert.strictEqual(model.arrayArrayAny, setValue, "The model data was set successfully");
			assert.strictEqual(validModel.valid, weWant, "The model was validated against the schema successfully");
		});
		
		it("Passes positive arrayObjectAny validation", () => {
			expect(2);
			
			const weWant = true;
			const setValue = [{}];
			const model = {};
			
			model.arrayObjectAny = setValue;
			const validModel = actionPlanSchema.validate(model);
			
			assert.strictEqual(model.arrayObjectAny, setValue, "The model data was set successfully");
			assert.strictEqual(validModel.valid, weWant, "The model was validated against the schema successfully");
		});
		
		it("Passes negative arrayObjectAny validation", () => {
			expect(2);
			
			const weWant = false;
			const setValue = ["Hello"];
			const model = {};
			
			model.arrayObjectAny = setValue;
			const validModel = actionPlanSchema.validate(model);
			
			assert.strictEqual(model.arrayObjectAny, setValue, "The model data was set successfully");
			assert.strictEqual(validModel.valid, weWant, "The model was validated against the schema successfully");
		});
		
		it("Passes positive objectAny validation", () => {
			expect(2);
			
			const weWant = true;
			const setValue = {};
			const model = {};
			
			model.objectAny = setValue;
			const validModel = actionPlanSchema.validate(model);
			
			assert.strictEqual(model.objectAny, setValue, "The model data was set successfully");
			assert.strictEqual(validModel.valid, weWant, "The model was validated against the schema successfully");
		});
		
		it("Passes negative objectAny validation", () => {
			expect(2);
			
			const weWant = false;
			const setValue = "tt";
			const model = {};
			
			model.objectAny = setValue;
			const validModel = actionPlanSchema.validate(model);
			
			assert.strictEqual(model.objectAny, setValue, "The model data was set successfully");
			assert.strictEqual(validModel.valid, weWant, "The model was validated against the schema successfully");
		});
	});
});