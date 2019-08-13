const assert = require("assert");
const {normalise, Schema} = require("../dist/Schema");

describe("normalise()", () => {
	describe("primitive", () => {
		describe("short-hand definitions", () => {
			it("Will return the correct value for a primitive String", () => {
				const MySchema = new Schema({
					"name": String
				});
				
				const result = normalise(MySchema);
				
				assert.strictEqual(typeof result, "object", "Correct type");
				assert.deepEqual(result.name, {
					"type": String,
					"required": false
				}, "Correct type");
			});
			
			it("Will return the correct value for a primitive Number", () => {
				const MySchema = new Schema({
					"name": Number
				});
				
				const result = normalise(MySchema);
				
				assert.strictEqual(typeof result, "object", "Correct type");
				assert.deepEqual(result.name, {
					"type": Number,
					"required": false
				}, "Correct type");
			});
			
			it("Will return the correct value for a primitive Object", () => {
				const MySchema = new Schema({
					"name": Object
				});
				
				const result = normalise(MySchema);
				
				assert.strictEqual(typeof result, "object", "Correct type");
				assert.deepEqual(result.name, {
					"type": Object,
					"required": false
				}, "Correct type");
			});
			
			it("Will return the correct value for a primitive Function", () => {
				const MySchema = new Schema({
					"name": Function
				});
				
				const result = normalise(MySchema);
				
				assert.strictEqual(typeof result, "object", "Correct type");
				assert.deepEqual(result.name, {
					"type": Function,
					"required": false
				}, "Correct type");
			});
			
			it("Will return the correct value for a primitive Array", () => {
				const MySchema = new Schema({
					"name": Array
				});
				
				const result = MySchema.normalised();
				
				assert.strictEqual(typeof result, "object", "Correct type");
				assert.deepEqual(result.name, {
					"type": Array,
					"required": false,
					"elementType": Schema.Any
				}, "Correct type");
			});
			
			it("Will return the correct value for a primitive Schema", () => {
				const MySchema = new Schema({
					"name": Schema
				});
				
				const result = normalise(MySchema);
				
				assert.strictEqual(typeof result, "object", "Correct type");
				assert.deepEqual(result.name, {
					"type": Schema,
					"required": false
				}, "Correct type");
			});
		});
		
		describe("long-hand definitions", () => {
			it("Will return the correct value for a primitive String", () => {
				const MySchema = new Schema({
					"name": {
						"type": String,
						"required": true
					}
				});
				
				const result = MySchema.normalised();
				
				assert.strictEqual(typeof result, "object", "Correct type");
				assert.deepEqual(result.name, {
					"type": String,
					"required": true
				}, "Correct type");
			});
			
			it("Will return the correct value for a primitive Number", () => {
				const MySchema = new Schema({
					"name": {
						"type": Number,
						"required": true
					}
				});
				
				const result = normalise(MySchema);
				
				assert.strictEqual(typeof result, "object", "Correct type");
				assert.deepEqual(result.name, {
					"type": Number,
					"required": true
				}, "Correct type");
			});
			
			it("Will return the correct value for a primitive Object", () => {
				const MySchema = new Schema({
					"name": {
						"type": Object,
						"required": true
					}
				});
				
				const result = normalise(MySchema);
				
				assert.strictEqual(typeof result, "object", "Correct type");
				assert.deepEqual(result.name, {
					"type": Object,
					"required": true
				}, "Correct type");
			});
			
			it("Will return the correct value for a primitive Function", () => {
				const MySchema = new Schema({
					"name": {
						"type": Function,
						"required": true
					}
				});
				
				const result = normalise(MySchema);
				
				assert.strictEqual(typeof result, "object", "Correct type");
				assert.deepEqual(result.name, {
					"type": Function,
					"required": true
				}, "Correct type");
			});
			
			it("Will return the correct value for a primitive Schema", () => {
				const MySchema = new Schema({
					"name": {
						"type": Schema,
						"required": true
					}
				});
				
				const result = normalise(MySchema);
				
				assert.strictEqual(typeof result, "object", "Correct type");
				assert.deepEqual(result.name, {
					"type": Schema,
					"required": true
				}, "Correct type");
			});
		});
	});
	
	describe("array-nested primitive", () => {
		describe("short-hand definitions", () => {
			it("Will return the correct value for a primitive String", () => {
				const MySchema = new Schema({
					"name": [String]
				});
				
				const result = normalise(MySchema);
				
				assert.strictEqual(typeof result, "object", "Correct type");
				assert.deepEqual(result.name, {
					"type": Array,
					"elementType": {
						"type": String,
						"required": false
					},
					"required": false
				}, "Correct type");
			});
			
			it("Will return the correct value for a primitive Number", () => {
				const MySchema = new Schema({
					"name": [Number]
				});
				
				const result = normalise(MySchema);
				
				assert.strictEqual(typeof result, "object", "Correct type");
				assert.deepEqual(result.name, {
					"type": Array,
					"elementType": {
						"type": Number,
						"required": false
					},
					"required": false
				}, "Correct type");
			});
			
			it("Will return the correct value for a primitive Object", () => {
				const MySchema = new Schema({
					"name": [Object]
				});
				
				const result = normalise(MySchema);
				
				assert.strictEqual(typeof result, "object", "Correct type");
				assert.deepEqual(result.name, {
					"type": Array,
					"elementType": {
						"type": Object,
						"required": false
					},
					"required": false
				}, "Correct type");
			});
			
			it("Will return the correct value for a primitive Function", () => {
				const MySchema = new Schema({
					"name": [Function]
				});
				
				const result = normalise(MySchema);
				
				assert.strictEqual(typeof result, "object", "Correct type");
				assert.deepEqual(result.name, {
					"type": Array,
					"elementType": {
						"type": Function,
						"required": false
					},
					"required": false
				}, "Correct type");
			});
			
			it("Will return the correct value for a primitive Array", () => {
				const MySchema = new Schema({
					"name": [Array]
				});
				
				const result = normalise(MySchema);
				
				assert.strictEqual(typeof result, "object", "Correct type");
				assert.deepEqual(result.name, {
					"type": Array,
					"elementType": {
						"type": Array,
						"required": false,
						"elementType": Schema.Any
					},
					"required": false
				}, "Correct type");
			});
			
			it("Will return the correct value for a primitive Schema", () => {
				const MySchema = new Schema({
					"name": [Schema]
				});
				
				const result = normalise(MySchema);
				
				assert.strictEqual(typeof result, "object", "Correct type");
				assert.deepEqual(result.name, {
					"type": Array,
					"elementType": {
						"type": Schema,
						"required": false
					},
					"required": false
				}, "Correct type");
			});
		});
		
		describe("long-hand definitions", () => {
			it("Will return the correct value for a primitive String", () => {
				const MySchema = new Schema({
					"name": [{
						"type": String
					}]
				});
				
				const result = normalise(MySchema);
				
				assert.strictEqual(typeof result, "object", "Correct type");
				assert.deepEqual(result.name, {
					"type": Array,
					"elementType": {
						"type": String,
						"required": false
					},
					"required": false
				}, "Correct type");
			});
			
			it("Will return the correct value for a primitive Number", () => {
				const MySchema = new Schema({
					"name": [Number]
				});
				
				const result = normalise(MySchema);
				
				assert.strictEqual(typeof result, "object", "Correct type");
				assert.deepEqual(result.name, {
					"type": Array,
					"elementType": {
						"type": Number,
						"required": false
					},
					"required": false
				}, "Correct type");
			});
			
			it("Will return the correct value for a primitive Object", () => {
				const MySchema = new Schema({
					"name": [Object]
				});
				
				const result = normalise(MySchema);
				
				assert.strictEqual(typeof result, "object", "Correct type");
				assert.deepEqual(result.name, {
					"type": Array,
					"elementType": {
						"type": Object,
						"required": false
					},
					"required": false
				}, "Correct type");
			});
			
			it("Will return the correct value for a primitive Function", () => {
				const MySchema = new Schema({
					"name": [Function]
				});
				
				const result = normalise(MySchema);
				
				assert.strictEqual(typeof result, "object", "Correct type");
				assert.deepEqual(result.name, {
					"type": Array,
					"elementType": {
						"type": Function,
						"required": false
					},
					"required": false
				}, "Correct type");
			});
			
			it("Will return the correct value for a primitive Array", () => {
				const MySchema = new Schema({
					"name": [Array]
				});
				
				const result = normalise(MySchema);
				
				assert.strictEqual(typeof result, "object", "Correct type");
				assert.deepEqual(result.name, {
					"type": Array,
					"elementType": {
						"type": Array,
						"required": false,
						"elementType": Schema.Any
					},
					"required": false
				}, "Correct type");
			});
			
			it("Will return the correct value for a primitive Schema", () => {
				const MySchema = new Schema({
					"name": [Schema]
				});
				
				const result = normalise(MySchema);
				
				assert.strictEqual(typeof result, "object", "Correct type");
				assert.deepEqual(result.name, {
					"type": Array,
					"elementType": {
						"type": Schema,
						"required": false
					},
					"required": false
				}, "Correct type");
			});
		});
	});
	
	describe("array-nested schema instances", () => {
		describe("short-hand definitions", () => {
			it("Will return the correct value for a Schema instance", () => {
				const MySchema = new Schema({
					"name": [new Schema({
						"address": String
					})]
				});
				
				const result = MySchema.normalised();
				
				assert.strictEqual(typeof result, "object", "Correct type");
				assert.strictEqual(typeof result.name, "object", "Correct type");
				assert.strictEqual(result.name.type, Array, "Correct type");
				assert.strictEqual(result.name.required, false, "Correct type");
				assert.strictEqual(typeof result.name.elementType, "object", "Correct type");
				assert.strictEqual(result.name.elementType.type instanceof Schema, true, "Correct type");
				
				const subSchemaDefinition = result.name.elementType.type.normalised();
				
				assert.strictEqual(typeof subSchemaDefinition.address, "object", "Correct type");
				assert.strictEqual(subSchemaDefinition.address.type, String, "Correct type");
				assert.strictEqual(subSchemaDefinition.address.required, false, "Correct type");
			});
			
			it("Will return the correct value for a short-hand array-nested Schema instance", () => {
				const SubSchema = new Schema({
					"arr": String
				});
				
				const MySchema = new Schema({
					"name": Schema,
					"subSchema": [SubSchema]
				});
				
				const result = MySchema.normalised();
				
				assert.strictEqual(typeof result, "object", "Correct type");
				assert.deepEqual(result.name, {
					"type": Schema,
					"required": false
				}, "Correct type");
				assert.deepEqual(result.subSchema, {
					"type": Array,
					"elementType": {
						"type": SubSchema,
						"required": false
					},
					"required": false
				}, "Correct type");
			});
		});
		
		describe("long-hand definitions", () => {
			it("Will return the correct value for a primitive Schema", () => {
				const SubSchema = new Schema({
					"foo": String
				});
				
				const MySchema = new Schema({
					"name": [{
						"type": SubSchema,
						"required": false
					}]
				});
				
				const result = MySchema.normalised();
				
				assert.strictEqual(typeof result, "object", "Correct type");
				assert.deepEqual(result.name, {
					"type": Array,
					"elementType": {
						"type": SubSchema,
						"required": false
					},
					"required": false
				}, "Correct type");
			});
			
			it("Will return the correct value for a Schema instance", () => {
				const MySchema = new Schema({
					"name": [new Schema({
						"address": {
							"type": String,
							"required": true
						}
					})]
				});
				
				const result = MySchema.normalised();
				
				assert.strictEqual(typeof result, "object", "Correct type");
				assert.strictEqual(typeof result.name, "object", "Correct type");
				assert.strictEqual(result.name.type, Array, "Correct type");
				assert.strictEqual(result.name.required, false, "Correct type");
				assert.strictEqual(typeof result.name.elementType, "object", "Correct type");
				assert.strictEqual(result.name.elementType.type instanceof Schema, true, "Correct type");
				
				const subSchemaDefinition = result.name.elementType.type.normalised();
				
				assert.strictEqual(typeof subSchemaDefinition.address, "object", "Correct type");
				assert.strictEqual(subSchemaDefinition.address.type, String, "Correct type");
				assert.strictEqual(subSchemaDefinition.address.required, true, "Correct type");
			});
			
			it("Will return the correct value for a long-hand array-nested Schema instance", () => {
				const SubSchema = new Schema({
					"arr": String
				});
				
				const MySchema = new Schema({
					"name": Schema,
					"subSchema": {
						"type": Array,
						"elementType": SubSchema
					}
				});
				
				const result = normalise(MySchema);
				
				assert.strictEqual(typeof result, "object", "Correct type");
				assert.deepEqual(result.name, {
					"type": Schema,
					"required": false
				}, "Correct type");
				assert.deepEqual(result.subSchema, {
					"type": Array,
					"elementType": {
						"type": SubSchema,
						"required": false
					},
					"required": false
				}, "Correct type");
			});
		});
	});
	
	describe("complex", () => {
		it("Will return the correct value for a Schema instance", () => {
			const SubSchema = new Schema({
				"arr": String
			});
			
			const MySchema = new Schema({
				"name": Schema,
				"subSchema": SubSchema
			});
			
			const result = normalise(MySchema);
			
			assert.strictEqual(typeof result, "object", "Correct type");
			assert.deepEqual(result.name, {
				"type": Schema,
				"required": false
			}, "Correct type");
			assert.deepEqual(result.subSchema, {
				"type": SubSchema,
				"required": false
			}, "Correct type");
		});
	});
});
