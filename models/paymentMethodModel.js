const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	subPayment: [{
		type: mongoose.Types.ObjectId,
		ref: 'subPaymentMethod',
	}], slug: {
		type: String,
		required: true
	},
	isGiftCard: {
		type: Boolean,
		default: false
	},
	icon: {
		type: String,
	},
});

const paymentMethod = mongoose.model('paymentMethod', paymentMethodSchema);
module.exports = paymentMethod;

