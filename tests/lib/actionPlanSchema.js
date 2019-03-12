const Schema = require("../../src/Schema");
const {
	get
} = require("irrelon-path");

const actionPlanSchema = new Schema({
	"string": String,
	"number": Number,
	"boolean": Boolean,
	"arrayAny": Array,
	"objectAny": Object,
	"arrayString": [String],
	"arrayNumber": [Number],
	"arrayBoolean": [Boolean],
	"arrayArrayAny": [Array],
	"arrayObjectAny": [Object],
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
	})],
	"transformable": new Schema({
		"lastDone": {
			"type": String,
			"default": "2019-20-10"
		},
		"completed": {
			"type": Boolean,
			"transform": async (data, immediateModel) => {
				return get(immediateModel, "lastDone") === "2019-20-10";
			}
		}
	})
}, {
	"name": "ActionPlan",
	"primaryKey": "id"
});

module.exports = actionPlanSchema;