const {describe, it, beforeEach, expect, assert} = require("mocha-expect");
const Model = require("../src/Model");
const actionPlanSchema = require("./lib/actionPlanSchema");

let model;

beforeEach(() => {
	model = new Model({}, actionPlanSchema);
});

describe("Model", () => {
	it("Will assign and recall a value that passes schema validation", () => {
		expect(1);
		
		const setValue = "Hello";
		
		model.string = setValue;
		assert.strictEqual(model.string, setValue, "The value was set correctly");
	});
});