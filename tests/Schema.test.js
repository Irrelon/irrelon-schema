const {describe, it, expect, assert} = require("mocha-expect");
const {Schema, simplify} = require("../dist/Schema");

const actionPlanSchema = require("./lib/actionPlanSchema");

describe ("Schema", () => {
	it("Will throw an error if both required:true and a default value are specified", () => {
		expect(1);
		
		try {
			const schema = new Schema({
				"data": {
					"type": String,
					"required": true,
					"default": false
				}
			});
			assert.ok(false, "The call did not throw an error!");
		} catch (e) {
			assert.ok(true, "The call threw an error");
		}
	});
	
	it("Will throw an error if a default value does not pass type validation for the specified field", () => {
		expect(1);
		
		try {
			const schema = new Schema({
				"data": {
					"type": String,
					"default": 3245 // This is a number not a string so should throw an error!
				}
			});
			assert.ok(false, "The call did not throw an error!");
		} catch (e) {
			assert.ok(true, "The call threw an error");
		}
	});
	
	describe("normalise()", () => {
		it("Will normalise an array-nested required primitive String", () => {
			const UserSchema = new Schema({
				"name": String,
				"age": Number
			});
			
			const MySchema = new Schema({
				"arr": [{
					"type": UserSchema,
					"required": true
				}]
			});
			
			const normalisedDefinition = MySchema.normalised();
			
			assert.strictEqual(typeof normalisedDefinition, "object", "Correct type");
			assert.deepEqual(normalisedDefinition.arr, {
				"type": Array,
				"required": false,
				"elementType": {
					"type": UserSchema,
					"required": true
				}
			}, "Correct type");
		});
		
		it("Will normalise schemas with nested schemas and recursive schemas", () => {
			const UserSchema = new Schema({
				"name": String,
				"age": Number
			});
			
			const SectionSchema = new Schema({
				"type": {
					"type": String,
					"required": true
				},
				"data": Schema.Any,
				"arr": [String],
				"anotherSchemaInAnArray": [UserSchema],
				"aBareObjectTypeInAnArray": [new Schema({
					"name": String
				})]
			});
			
			SectionSchema.add({"sections": [SectionSchema]}, "");
			
			const normalisedDefinition = SectionSchema.normalised();
			
			assert.strictEqual(typeof normalisedDefinition, "object", "Correct type");
			assert.deepEqual(normalisedDefinition.type, {
				"type": String,
				"required": true
			}, "Correct type");
			assert.deepEqual(normalisedDefinition.data, {
				"type": Schema.Any,
				"required": false
			}, "Correct type");
			assert.deepEqual(normalisedDefinition.arr, {
				"type": Array,
				"elementType": {
					"type": String,
					"required": false
				},
				"required": false
			}, "Correct type");
			assert.deepEqual(normalisedDefinition.anotherSchemaInAnArray, {
				"type": Array,
				"elementType": {
					"type": UserSchema,
					"required": false
				},
				"required": false
			}, "Correct type");
			assert.deepEqual(normalisedDefinition.sections, {
				"type": Array,
				"elementType": {
					"type": SectionSchema,
					"required": false
				},
				"required": false
			}, "Correct type");
			
			const subSchema = normalisedDefinition.aBareObjectTypeInAnArray.elementType.type;
			const subSchemaDefinition = normalisedDefinition.aBareObjectTypeInAnArray.elementType.type.normalised();
			
			assert.deepEqual(normalisedDefinition.aBareObjectTypeInAnArray, {
				"type": Array,
				"elementType": {
					"type": subSchema,
					"required": false
				},
				"required": false
			}, "Correct type");
			
			assert.deepEqual(subSchemaDefinition, {
				"name": {
					"type": String,
					"required": false
				}
			}, "Correct type");
			
		});
	});
	
	describe("add()", () => {
		it("Can add a new recursive part to the schema and flattening the schema will produce non-recursive results", () => {
			const SectionSchema = new Schema({
				"type": {
					"type": String,
					"required": true
				},
				"data": Schema.Any,
				"arr": [String]
			});
			
			SectionSchema.add({"sections": [SectionSchema]}, "");
			
			const result = SectionSchema.flattenValues();
			
			assert.strictEqual(result["type"], String, "Field type is correct");
			assert.strictEqual(result["data"], Schema.Any, "Field type is correct");
			assert.strictEqual(result["arr"], Array, "Field type is correct");
			assert.strictEqual(result["arr.$"], String, "Field type is correct");
			assert.strictEqual(result["sections"], Array, "Field type is correct");
			assert.strictEqual(result["sections.$"], SectionSchema, "Field type is correct");
			assert.strictEqual(result["sections.$.type"], undefined, "Field type is correct");
		});
	});
	
	describe("flattenValues()", () => {
		it("Can flatten a schema definition to an object with key paths and primitive types as values", () => {
			expect(12);
			
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
					})],
					"func": Function
				})]
			});
			
			const result = schema.flattenValues();
			
			assert.strictEqual(result["complex"], Array, "complex type is correct");
			assert.strictEqual(result["complex.$"] instanceof Schema, true, "complex.$ type is correct");
			assert.strictEqual(result["complex.$.func"], Function, "complex.$.func type is correct");
			assert.strictEqual(result["complex.$.name"], String, "complex.$.name type is correct");
			assert.strictEqual(result["complex.$.meta"] instanceof Schema, true, "complex.$.meta type is correct");
			assert.strictEqual(result["complex.$.meta.type"], String, "complex.$.meta.type type is correct");
			assert.strictEqual(result["complex.$.meta.index"], Number, "complex.$.meta.type type is correct");
			assert.strictEqual(result["complex.$.other"] instanceof Schema, true, "complex.$.other type is correct");
			assert.strictEqual(result["complex.$.other.stuff"], Array, "complex.$.other.stuff type is correct");
			assert.strictEqual(result["complex.$.arr"], Array, "complex.$.arr type is correct");
			assert.strictEqual(result["complex.$.arr.$"] instanceof Schema, true, "complex.$.arr.$ type is correct");
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
		it("Doesn't try to validate fields if they are not required and have sub-schema that is", () => {
			expect(12);
			
			const schema = new Schema({
				"metaData": {
					"type": new Schema({
						"test": {
							"type": Boolean,
							"required": true
						}
					}),
					"required": false
				}
			});
			
			const result = schema.validate({
				"metaData": undefined
			});
			
			const result2 = schema.validate({
			
			});
			
			const result3 = schema.validate({
				"metaData": "foo"
			});
			
			const result4 = schema.validate({
				"metaData": {
					"test": false
				}
			});
			
			assert.strictEqual(typeof result, "object", "The result data is an object");
			assert.strictEqual(typeof result.valid, "boolean", "The result.valid data is a boolean");
			assert.strictEqual(result.valid, true, "The validation result was correct");
			
			assert.strictEqual(typeof result2, "object", "The result data is an object");
			assert.strictEqual(typeof result2.valid, "boolean", "The result.valid data is a boolean");
			assert.strictEqual(result2.valid, true, "The validation result was correct");
			
			assert.strictEqual(typeof result3, "object", "The result data is an object");
			assert.strictEqual(typeof result3.valid, "boolean", "The result.valid data is a boolean");
			assert.strictEqual(result3.valid, false, "The validation result was correct");
			
			assert.strictEqual(typeof result4, "object", "The result data is an object");
			assert.strictEqual(typeof result4.valid, "boolean", "The result.valid data is a boolean");
			assert.strictEqual(result4.valid, true, "The validation result was correct");
		});
		
		it("Can correctly validate positive oneOf clause in schema", () => {
			const schema = new Schema({
				"name": {
					"type": String,
					"oneOf": ["this", "that"],
					"required": true
				}
			});
			
			const result = schema.validate({
				"name": "this"
			});
			
			assert.strictEqual(result.valid, true, "The schema validated correctly");
		});
		
		it("Can correctly validate negative oneOf clause in schema", () => {
			const schema = new Schema({
				"name": {
					"type": String,
					"oneOf": ["this", "that"],
					"required": true
				}
			});
			
			const result = schema.validate({
				"name": "none"
			});
			
			assert.strictEqual(result.valid, false, "The schema validated correctly");
			assert.strictEqual(result.reason, `Schema violation, expected "name" to be one of ["this","that"] but found "none"`, "The schema validated correctly");
		});
		
		it("Can correctly validate positive shorthand primitive function", () => {
			const schema = new Schema({
				"func": Function
			});
			
			const result = schema.validate({
				"func": () => {}
			});
			
			assert.strictEqual(result.valid, true, "The schema validated correctly");
		});
		
		it("Can correctly validate negative shorthand primitive function", () => {
			const schema = new Schema({
				"arr": Function
			});
			
			const result = schema.validate({
				"arr": {}
			});
			
			assert.strictEqual(result.valid, false, "The schema validated correctly");
		});
		
		it("Can correctly validate positive shorthand instance function", () => {
			const schema = new Schema({
				"arr": Function
			});
			
			const result = schema.validate({
				"arr": () => {}
			});
			
			assert.strictEqual(result.valid, true, "The schema validated correctly");
		});
		
		it("Can correctly validate negative shorthand instance function", () => {
			const schema = new Schema({
				"arr": Function
			});
			
			const result = schema.validate({
				"arr": {}
			});
			
			assert.strictEqual(result.valid, false, "The schema validated correctly");
		});
		
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
		
		/*it("Transform function receives the correct arguments", () => {
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
		});*/
		
		it("Passes positive *Any (custom type)* validation", () => {
			expect(8);
			
			const model = {};
			let validModel;
			
			model.any = 1;
			validModel = actionPlanSchema.validate(model);
			
			assert.strictEqual(model.any, 1, "The model data was set successfully");
			assert.strictEqual(validModel.valid, true, "The model was validated against the schema successfully");
			
			model.any = "1";
			validModel = actionPlanSchema.validate(model);
			
			assert.strictEqual(model.any, "1", "The model data was set successfully");
			assert.strictEqual(validModel.valid, true, "The model was validated against the schema successfully");
			
			model.any = true;
			validModel = actionPlanSchema.validate(model);
			
			assert.strictEqual(model.any, true, "The model data was set successfully");
			assert.strictEqual(validModel.valid, true, "The model was validated against the schema successfully");
			
			model.any = null;
			validModel = actionPlanSchema.validate(model);
			
			assert.strictEqual(model.any, null, "The model data was set successfully");
			assert.strictEqual(validModel.valid, true, "The model was validated against the schema successfully");
		});
		
		it("Passes positive *Integer (custom type)* validation", () => {
			expect(8);
			
			const model = {};
			let validModel;
			
			model.integer = 1;
			validModel = actionPlanSchema.validate(model);
			
			assert.strictEqual(model.integer, 1, "The model data was set successfully");
			assert.strictEqual(validModel.valid, true, "The model was validated against the schema successfully");
			
			model.integer = "1";
			validModel = actionPlanSchema.validate(model);
			
			assert.strictEqual(model.integer, "1", "The model data was set successfully");
			assert.strictEqual(validModel.valid, false, "The model was validated against the schema successfully");
			
			model.integer = true;
			validModel = actionPlanSchema.validate(model);
			
			assert.strictEqual(model.integer, true, "The model data was set successfully");
			assert.strictEqual(validModel.valid, false, "The model was validated against the schema successfully");
			
			model.integer = null;
			validModel = actionPlanSchema.validate(model);
			
			assert.strictEqual(model.integer, null, "The model data was set successfully");
			assert.strictEqual(validModel.valid, true, "The model was validated against the schema successfully");
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
		
		it("Fails validation when a string is passed to a field that has been defined as an object or schema", () => {
			expect(2);
			
			const schema = new Schema({
				"status": new Schema({
					"from": {
						"type": String
					}
				})
			});
			
			const model = {
				"status": "hello"
			};
			
			const validModel = schema.validate(model);
			
			assert.strictEqual(validModel.valid, false, "The model was validated against the schema successfully");
			assert.strictEqual(validModel.reason, `Schema violation, "status" expects an object that conforms to the schema {"from":"String"} and cannot be set to value "hello" of type string`);
		});
		
		it("Provides a simplified single level schema definition from a normalised schema", () => {
			const schema = new Schema({
				"name": {
					"type": String,
					"required": false
				},
				"age": {
					"type": Number,
					"required": true
				},
				"meta": {
					"type": new Schema({
						"profileImage": String
					}),
					"required": false
				}
			});
			
			const result = schema.simplify();
			
			assert.strictEqual(result.name, "String", "Type name correct");
			assert.strictEqual(result.age, "Number", "Type name correct");
			assert.strictEqual(result.meta, "Schema", "Type name correct");
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
		
		it("Fails when a field presented in the model data does not exist in the schema definition", () => {
			const schema = new Schema({
				"arr": Array
			});
			
			const result = schema.validate({
				"arr": [],
				"foo": "bar"
			});
			
			assert.strictEqual(result.valid, false, "The schema validated correctly");
			assert.strictEqual(result.path, "foo", "The schema failure path was correct");
		});
		
		it("Fails when a field presented in the model data does not exist in the schema definition", () => {
			const schema = new Schema({
				"arr": Array,
				"foo": new Schema({
					"moo": Boolean
				})
			});
			
			const result = schema.validate({
				"arr": [],
				"foo": {
					"moo": false,
					"bar": true
				}
			});
			
			assert.strictEqual(result.valid, false, "The schema validated correctly");
			assert.strictEqual(result.path, "foo.bar", "The schema failure path was correct");
		});
		
		it("Can validate complex schema against path and object with required sub-schema", () => {
			expect(2);
			
			const schema = new Schema({
				"complex": [{
					"type": new Schema({
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
					})
				}]
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
	});
});
