const customTypes = {
	"Any": {
		"type": "Any",
		"validator": (value, path, options, validationSucceeded) => validationSucceeded()
	},

	"Integer": {
		"type": Number,
		"format": "int32"
	},
	
	"Long": {
		"type": Number,
		"format": "int64"
	},
	
	"Float": {
		"type": Number,
		"format": "float"
	},
	
	"Double": {
		"type": Number,
		"format": "double"
	},
	
	"Byte": {
		"type": String,
		"format": "byte"
	},
	
	"Binary": {
		"type": String,
		"format": "binary"
	},
	
	"Date": {
		"type": Date,
		"format": "date"
	},
	
	"DateTime": {
		"type": Date,
		"format": "dateTime"
	},
	
	"Password": {
		"type": String,
		"format": "password"
	}
};

module.exports = customTypes;
