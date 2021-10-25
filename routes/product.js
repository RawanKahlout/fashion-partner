const express = require('express');
const { PermissionMiddlewareCreator } = require('forest-express-sequelize');
const { product, productItem } = require('../models');
const parseDataUri = require('parse-data-uri');
const csv = require('csv');
var easyinvoice = require('easyinvoice');
const router = express.Router();
const uuid = require('uuid/v4');
const S3Helper = require('../services/s3-helper');
const P = require('bluebird');
const permissionMiddlewareCreator = new PermissionMiddlewareCreator('product');
var mysql = require('mysql');
require('dotenv').config();

var con = mysql.createConnection({
    host:process.env.host,
    user:process.env.user,
    password:process.env.password,
    database:process.env.database
});


// This file contains the logic of every route in Forest Admin for the collection product:
// - Native routes are already generated but can be extended/overriden - Learn how to extend a route here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/extend-a-route
// - Smart action routes will need to be added as you create new Smart Actions - Learn how to create a Smart Action here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/actions/create-and-manage-smart-actions

// Create a Product
router.post('/product', permissionMiddlewareCreator.create(), (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#create-a-record
    next();
});

// Update a Product
router.put('/product/:recordId', permissionMiddlewareCreator.update(), (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#update-a-record
    next();
});

// Delete a Product
router.delete('/product/:recordId', permissionMiddlewareCreator.delete(), (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-record
    next();
});

// Get a list of Products
router.get('/product', permissionMiddlewareCreator.list(), (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-list-of-records
    next();
});

// Get a number of Products
router.get('/product/count', permissionMiddlewareCreator.list(), (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-number-of-records
    next();
});

// Get a Product
router.get('/product/:recordId(?!count)', permissionMiddlewareCreator.details(), (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-record
    next();
});

// Export a list of Products
router.get('/product.csv', permissionMiddlewareCreator.export(), (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#export-a-list-of-records
    next();
});

// Delete a list of Products
router.delete('/product', permissionMiddlewareCreator.delete(), (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-list-of-records
    next();
});

//import products
router.post('/product/actions/import-data',
    (req, res) => {
        let parsed = parseDataUri(req.body.data.attributes.values['CSV file']);
        let productType = req.body.data.attributes.values['Type'];

        csv.parse(parsed.data, { delimiter: ',' }, function (err, rows) {
            if (err) {
                res.status(400).send({
                    error: `Cannot import data: ${err.message}`
                });
            } else {
                console.log(rows);
                res.send({ success: 'Data successfuly imported!' });
            }
        });
    });

//import quantities
router.post('/product/actions/import-quantities',
    (req, res) => {
        let parsed = parseDataUri(req.body.data.attributes.values['CSV file']);
        let productType = req.body.data.attributes.values['Type'];

        csv.parse(parsed.data, { delimiter: ',' }, function (err, rows) {
            if (err) {
                console.log(err.message)
                res.status(400).send({
                    error: "Cannot import data , kindly review your file"
                });
            } else {
                res.send({ success: 'Data successfuly imported!' });
            }
        });
    });

//enable porduct
router.post('/product/actions/enable', (req, res) => {
    const recordIds = req.body.data.attributes.ids;

    product.findAll({ where: { id: recordIds } }).then(records => {
        records.forEach(record => {
            record.isEnabled = 1;
            record.save();
            let productId = record.dataValues.product_entity_id;
            con.query("UPDATE cataloginventory_stock_item SET `is_in_stock` = 1 WHERE product_id = ? ", [productId], function (error, results, fields) {
                if (error) {
                    throw error;
                }
            });
        });
    }).catch((error)=>{
      throw error;
    }).then(() => res.send({ success: "Successfully enabled!" })).catch((error)=>{
          console.log(error.message);
          res.send({ error: "Something Wrong Please Try again" });
    });
});
//disable product
router.post('/product/actions/disable', (req, res) => {
    const recordIds = req.body.data.attributes.ids;
    product.findAll({ where: { id: recordIds } }).then(records => {
        records.forEach(record => {
            record.isEnabled = 0;
            record.save();
            let productId = record.dataValues.product_entity_id;
            con.query("UPDATE cataloginventory_stock_item SET `is_in_stock` = 0 WHERE  product_id = ? ", [productId], function (error, results, fields) {
                if (error) {
                  console.log(error);
                    throw error;
                }
                console.log(results);
            });

        });
    }).then(() => {
        res.send({ success: "Successfully disabled!" });
    }).catch((error) => {
        res.send({ success: "Sorry , Something Wrong try again." });
    })
});
//activate product
router.post('/product/actions/activate', (req, res) => {
    const recordIds = req.body.data.attributes.ids;
    product.findAll({ where: { id: recordIds } }).then(records => {
        records.forEach(record => {
            record.isActive = 1;
            record.save();
            let productId = record.dataValues.product_entity_id;
            con.query("UPDATE cataloginventory_stock_item SET `is_in_stock` = 1 WHERE  product_id = ? ", [productId], function (error, results, fields) {
                if (error) {
                    throw error;
                }
                console.log(results);
            });
        });
    }).then(() => res.send({ success: "Successfully disabled!" }));
});
//inactive product
router.post('/product/actions/inactive', (req, res) => {
    const recordIds = req.body.data.attributes.ids;
    product.findAll({ where: { id: recordIds } }).then(records => {
        records.forEach(record => {
            record.isActive = 0;
            record.save();
            let productId = record.dataValues.product_entity_id;
            con.query("UPDATE cataloginventory_stock_item SET `is_in_stock` = 0 WHERE  product_id = ? ", [productId], function (error, results, fields) {
                if (error) {
                    throw error;
                }
            });
        });
    }).then(() => res.send({ success: "Successfully disabled!" }));
});

//Add discount
router.post('/actions/add-discount-price', permissionMiddlewareCreator.smartAction(), (request, response, next) => {
    const recordIds = request.body.data.attributes.ids;
    const discountPercentage = request.body.data.attributes.values.discount_percentage;
    product.findAll({ where: { id: recordIds } }).then(records => {
        records.forEach(record => {
            record.price = record.price * ((100 - discountPercentage) / 100);
            record.save();
        });
    }).then(() => response.send({ success: "Successfully updated!" }));
    // next();
});
//Change price
router.post('/actions/change-price', permissionMiddlewareCreator.smartAction(), (request, response, next) => {
    const recordIds = request.body.data.attributes.ids;
    product.findAll({ where: { id: recordIds } }).then(records => {
        records.forEach(record => {
            record.price = request.body.data.attributes.values.price
            record.save();
        });
    }).then(() => response.send({ success: "Successfully updated!" }));
    // next();
});
//Add discount price
router.post('/actions/add-sale-price', permissionMiddlewareCreator.smartAction(), (request, response, next) => {
    const recordIds = request.body.data.attributes.ids;
    product.findAll({ where: { id: recordIds } }).then(records => {
        records.forEach(record => {
            record.salePrice = request.body.data.attributes.values.salePrice;
            record.save();
        });
    }).then(() => response.send({ success: "Successfully updated!" }));
    // next();
});

module.exports = router;
