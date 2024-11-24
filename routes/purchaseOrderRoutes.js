const express = require('express');
const router = express.Router();
const PurchaseOrder = require('../models/purchaseOrder');

// Create a new purchase order
router.post('/purchase-order', async (req, res) => {
    const { productIds, quantities, unitPrices, totalPrices, locationIds, stocks } = req.body;

    const purchaseOrder = new PurchaseOrder({
        productIds,
        quantities,
        unitPrices,
        totalPrices,
        locations: productIds.map((id, index) => ({
            locationId: locationIds[index] || null,
            productId: id,
            stock: stocks[index] || 0
        }))
    });

    try {
        await purchaseOrder.save();
        res.status(201).send('Purchase Order created');
    } catch (err) {
        res.status(400).send('Error creating Purchase Order');
    }
});

// Update the status of a purchase order
router.put('/purchase-order/:id/status', async (req, res) => {
    const { status, receivedQuantities } = req.body;
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);

    if (!purchaseOrder) {
        return res.status(404).send('Purchase Order not found');
    }

    purchaseOrder.status = status;

    if (status === 'Completed') {
        purchaseOrder.completed = true;
        purchaseOrder.receivedQuantities = receivedQuantities;

        // Update the stock levels at the locations
        purchaseOrder.productIds.forEach((id, index) => {
            const location = purchaseOrder.locations.find(loc => loc.productId === id);
            if (location) {
                location.stock += receivedQuantities[index];
            }
        });
    } else if (status === 'Confirmed') {
        purchaseOrder.vendorConfirmed = true;
    } else if (status === 'In Transit') {
        purchaseOrder.inTransit = true;
    }

    await purchaseOrder.save();
    res.status(200).send('Purchase Order status updated');
});

// Get the details of a specific purchase order
router.get('/purchase-order/:id', async (req, res) => {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);

    if (!purchaseOrder) {
        return res.status(404).send('Purchase Order not found');
    }

    res.json(purchaseOrder);
});

// Get all purchase orders
router.get('/purchase-orders', async (req, res) => {
    const purchaseOrders = await PurchaseOrder.find();
    res.json(purchaseOrders);
});

module.exports = router;
