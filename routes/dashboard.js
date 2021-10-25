const P = require('bluebird');
const express = require('express');
const router = express.Router();
const Liana = require('forest-express-sequelize');
const { PermissionMiddlewareCreator } = require('forest-express-sequelize');

router.get('/api/statfgs/permonth', (req, res) => {
  var date = new Date();
 date.setDate(date.getDate() - 30);
 var dateString = date.toISOString().split('T')[0];
 const json = new StatSerializer({
         value: 6
       }).perform();
       
 return res.send(json);
});


module.exports = router;
