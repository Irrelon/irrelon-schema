const find = () => {
	const retVal = {};
	
	retVal.toJSON = () => {
		return [{
			"_id": 1
		}, {
			"_id": 2
		}];
	};
	
	return {
		"then": () => {
			return Promise.resolve(retVal);
		},
		"exec": () => {
			return Promise.resolve(retVal);
		}
	};
};

const findOne = (query) => {
	const retVal = {};
	
	retVal.toJSON = () => {
		return {
			"_id": query._id
		};
	};
	
	return Promise.resolve(retVal);
};

const update = () => {
	const retVal = {
		"success": true,
		"updated": 1
	};
	
	return {
		"then": () => {
			return Promise.resolve(retVal);
		},
		"exec": () => {
			return Promise.resolve(retVal);
		}
	};
};

const remove = () => {
	const retVal = {
		"success": true,
		"updated": 1
	};
	
	return {
		"then": () => {
			return Promise.resolve(retVal);
		},
		"exec": () => {
			return Promise.resolve(retVal);
		}
	};
};

module.exports = () => {
	return {
		find,
		findOne,
		update,
		remove
	};
};