const Emitter = require("irrelon-emitter");

class Model {
	constructor (data, schema, options = {}) {
		this._data = data;
		this._schema = schema;
		this._options = options;
		
		// Set enumerable: false on fields that should
		// not be iterated over
		/*[
			'_initSchema',
			'_applySchema',
			'_applySchemaString',
			'_applySchemaNumber',
			'_applySchemaBoolean',
			'_data',
			'_schema',
			'_options'
		].forEach((key) => {
			let val = this[key];
			
			if (typeof val === 'function') {
				val = val.bind(this);
			}
			
			Object.defineProperty(this, key, {
				enumerable: false,
				value: val
			});
		});*/
		
		const definition = schema.normalised();
		
		Object.keys(definition).forEach((key) => {
			Object.defineProperty(this, key, {
				"enumerable": true,
				"configurable": false,
				"get": () => {
					return this._data[key];
				},
				"set": (value) => {
					this._data[key] = value;
				}
			});
		});
	}
	
	
	/**
	 * Gets the model's pure JSON data.
	 * @returns {Object} The model's pure JSON data.
	 */
	toObject () {
		return JSON.parse(JSON.stringify(this._data));
	}
	
	async refresh () {
		const documentId = this[this._schema.primaryKey()];
		
		if (!documentId) {
			throw new Error("Cannot refresh model data because the model does not have a primary key id");
		}
		
		const {err, data} = await this.findById(documentId);
		
		if (err) {
			throw new Error(err);
		}
		
		this.set(data);
	}
	
	applyState () {
		this.emit("change");
	}
	
	set (data) {
		this._data = data;
		this.validate();
	}
	
	findById (id) {
		return this._schema.findById(id);
	}
	
	debugLog (msg) {
		if (this._options.debug) {
			console.log(`Model :: ${msg}`);
		}
	}
	
	clone () {
		const newModel = this._schema.model(this._data);
		
		// Apply existing event listeners to the new model
		newModel._listeners = this._listeners;
		
		return newModel;
	}
	
	validate () {
		const result = this._schema.validate(this);
		this.emit("change");
		
		return result;
	}
	
	helper (id, ...args) {
		return this._schema.helper(id, this, ...args);
	}
}

// Give Model's prototype the event emitter methods
// and functionality
Emitter(Model);

module.exports = Model;