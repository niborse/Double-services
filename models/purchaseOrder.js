const mongoose = require('mongoose');

const PurchaseOrderSchema = new mongoose.Schema({
    productIds: [String],
    quantities: [Number],
    unitPrices: [Number],
    totalPrices: [Number],
    status: { type: String, default: 'Raised' },
    vendorConfirmed: { type: Boolean, default: false },
    inTransit: { type: Boolean, default: false },
    completed: { type: Boolean, default: false },
    receivedQuantities: [Number],
    locations: [{
        locationId: String,
        productId: String,
        stock: Number
    }]
});

const PurchaseOrder = mongoose.model('PurchaseOrder', PurchaseOrderSchema);

module.exports = PurchaseOrder;
