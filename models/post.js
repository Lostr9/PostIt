var mongoose = require('mongoose');

var Post = new mongoose.Schema({
	author: {
		type: mongoose.Schema.Types.ObjectId
	},
	text: {
		type: String,
	},
	postDate: {
		type: Date,
		default: Date.now
	},
	VK: {
		type: Boolean,
		default: false
	},
	FB: {
		type: Boolean,
		default: false
	},
	OK: {
		type: Boolean,
		default: false
	}
});

module.exports = mongoose.model('posts', Post);
