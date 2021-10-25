const express = require('express');
const { PermissionMiddlewareCreator } = require('forest-express-sequelize');
const { productItem } = require('../models');

const router = express.Router();
const permissionMiddlewareCreator = new PermissionMiddlewareCreator('productItem');
var mysql = require('mysql');
var con = mysql.createConnection({
    host:process.env.host,
    user:process.env.user,
    password:process.env.password,
    database:process.env.database
});

// This file contains the logic of every route in Forest Admin for the collection productItem:
// - Native routes are already generated but can be extended/overriden - Learn how to extend a route here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/extend-a-route
// - Smart action routes will need to be added as you create new Smart Actions - Learn how to create a Smart Action here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/actions/create-and-manage-smart-actions

// Create a Product Item
router.post('/productItem', permissionMiddlewareCreator.create(), (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#create-a-record
    next();
});

// Update a Product Item
router.put('/productItem/:recordId', permissionMiddlewareCreator.update(), (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#update-a-record
    next();
});

// Delete a Product Item
router.delete('/productItem/:recordId', permissionMiddlewareCreator.delete(), (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-record
    next();
});

// Get a list of Product Items
router.get('/productItem', permissionMiddlewareCreator.list(), (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-list-of-records
    next();
});

// Get a number of Product Items
router.get('/productItem/count', permissionMiddlewareCreator.list(), (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-number-of-records
    next();
});

// Get a Product Item
router.get('/productItem/:recordId(?!count)', permissionMiddlewareCreator.details(), (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-record
    next();
});

// Export a list of Product Items
router.get('/productItem.csv', permissionMiddlewareCreator.export(), (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#export-a-list-of-records
    next();
});

// Delete a list of Product Items
router.delete('/productItem', permissionMiddlewareCreator.delete(), (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-list-of-records
    next();
});
router.post('/productItem/actions/updateQuantity', (request, response) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-list-of-records
    const recordIds = request.body.data.attributes.ids;
    const quantity = request.body.data.attributes.values.quantity;
    productItem.findAll({ where: { id: recordIds } }).then(records => {
        records.forEach(record => {
            record.quantity = quantity;
            record.save();
            let productId = record.dataValues.product_entity_id;
            con.query("UPDATE cataloginventory_stock_item SET qty = ? WHERE product_id = ? ", [quantity, productId], function (error, results, fields) {
                if (error) {
                    throw error;
                }
                console.log("Update Quantity",results);
            });
        });
    }).catch(error=> {throw error;})
    .then(() => response.status(200).send({ success: "Successfully updated!" }))
    .catch( error => {
        console.log(error.message);
        response.send({ error: "Something Wrong Please Try again" });
    });
});
//enable porduct
router.post('/productItem/actions/enable', (req, res) => {
    const recordIds = req.body.data.attributes.ids;
    productItem.findAll({ where: { id: recordIds } }).then(records => {
        //productIdKey:
        records.forEach(record => {
            record.isEnabled = 2;
            record.save();
            let productId = record.dataValues.product_entity_id;
            /*con.query("select * from cataloginventory_stock_item where product_id =?", [productId], function (error, results, fields) {
                if (error) {
                    throw error;
                }
                console.log("Disable results",results);
            })*/
           con.query("UPDATE cataloginventory_stock_item SET `is_in_stock` = 1 WHERE product_id = ? ", [productId], function (error, results, fields) {
                if (error) {
                    throw error;
                }
                console.log("Disable results",results);
            });
        });
    }).catch((error)=>{throw error;})
    .then(() => res.send({ success: "Successfully enabled!" })).catch((error)=>{ res.send({ error: "Something Wrong Please Try again" });});
});
//disable product
router.post('/productItem/actions/disable', (req, res) => {
    const recordIds = req.body.data.attributes.ids;
    productItem.findAll({ where: { id: recordIds } }).then(records => {
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
router.post('/productItem/actions/activate', (req, res) => {
    const recordIds = req.body.data.attributes.ids;
    productItem.findAll({ where: { id: recordIds } }).then(records => {
        records.forEach(record => {
            record.isActive = 1;
            record.save();
            let productId = record.dataValues.product_entity_id;
            con.query("UPDATE cataloginventory_stock_item SET `is_in_stock` = 1 WHERE  product_id = ? ", [productId], function (error, results, fields) {
                if (error) {
                    throw error;
                }
                console.log("Active result",results);
            });
        });
    }).catch(error=>{throw error;})
    .then(() => res.send({ success: "Successfully disabled!" })).catch(error=>{
        console.log(error.message);
        res.send({ error: "Something Wrong Please Try again" });
    });
});
//inactive product
router.post('/productItem/actions/inactive', (req, res) => {
    const recordIds = req.body.data.attributes.ids;
    productItem.findAll({ where: { id: recordIds } }).then(records => {
        records.forEach(record => {
            record.isActive = 0;
            record.save();
            let productId = record.dataValues.product_entity_id;
            con.query("UPDATE cataloginventory_stock_item SET `is_in_stock` = 0 WHERE  product_id = ? ",[productId], function (error, results, fields) {
                if (error) {
                    throw error;
                }
                console.log("Inactive result",results)
            });
        });
    }).catch(error=>{throw error})
    .then(() => res.send({ success: "Successfully disabled!" })).catch(error=>{
       console.log(error.message);
       res.send({ error: "Something Wrong Please Try again" });
  });
});


module.exports = router;
