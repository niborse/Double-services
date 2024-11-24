const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes');

const app = express();
const port = process.env.PORT || 3007;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://nvborse1812:Iloveworkinginthecontrolroom@cluster1.tqaxbvl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1', { useNewUrlParser: true, useUnifiedTopology: true });

app.use('/api', purchaseOrderRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
