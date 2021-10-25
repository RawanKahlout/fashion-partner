const express = require('express');
const { PermissionMiddlewareCreator } = require('forest-express-sequelize');
const { productFile,user} = require('../models');
const fileType = require('file-type');
const parseDataUri = require('parse-data-uri');
var AWS = require('aws-sdk');
const router = express.Router();
const permissionMiddlewareCreator = new PermissionMiddlewareCreator('productFile');

// This file contains the logic of every route in Forest Admin for the collection productFile:
// - Native routes are already generated but can be extended/overriden - Learn how to extend a route here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/extend-a-route
// - Smart action routes will need to be added as you create new Smart Actions - Learn how to create a Smart Action here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/actions/create-and-manage-smart-actions

// Create a Product File
router.post('/productFile', permissionMiddlewareCreator.create(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#create-a-record
  next();
});

// Update a Product File
router.put('/productFile/:recordId', permissionMiddlewareCreator.update(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#update-a-record
  next();
});

// Delete a Product File
router.delete('/productFile/:recordId', permissionMiddlewareCreator.delete(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-record
  next();
});

// Get a list of Product Files
router.get('/productFile', permissionMiddlewareCreator.list(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-list-of-records

  next();
});

// Get a number of Product Files
router.get('/productFile/count', permissionMiddlewareCreator.list(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-number-of-records
  next();
});

// Get a Product File
router.get('/productFile/:recordId(?!count)', permissionMiddlewareCreator.details(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-record
  next();
});

// Export a list of Product Files
router.get('/productFile.csv', permissionMiddlewareCreator.export(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#export-a-list-of-records
  next();
});

// Delete a list of Product Files
router.delete('/productFile', permissionMiddlewareCreator.delete(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-list-of-records
  next();
});

function getCSVfromBase64(rawFile) {
  const rawFileCleaned = rawFile.replace('data:application/octet-stream;base64', '');
  const buff = new Buffer(rawFileCleaned, 'base64');
  return buff.toString('utf8');
}

function getCurrentDateTimeString(){
    return (new Date).toLocaleString().replace(/\//g, "-").replace(/,/g, "").replace(/:/g, ".")
};

router.post('/actions/Upload-products-file', permissionMiddlewareCreator.smartAction(), (request, response) => {
  const  {file}  = request.body.data.attributes.values;
  const fileName = file.match(/name=(.*)\./)[1];
  const prefixMime = file.match(/\/(.*?);/)[1];
  const extension = file.match(/\.(.*?);/)[1];
  if ((prefixMime !== 'csv') && (extension !== 'csv')) {
    return response.status(400).send({ error: 'Please upload only csv file' });
  }
  new productFile({
    content: file,
    userId: request.user.id,
    name: fileName,
    createdAt: Date.now(),
    userEmail: request.user.email,
      }).save().then((result) => {
          response.status(200).send({ success: 'Successfuly uploaded' });
      }).catch((e) => {
        console.log('Cannot upload file:',e.message);
        response.status(400).send({error: `Sorry cannot upload the file, Try again`})});
});

router.post('/actions/Upload-images-file', permissionMiddlewareCreator.smartAction(), (req, res) => {
  const attrs = req.body.data.attributes.values;
  const imageFile = attrs['File'];
  const parsed = parseDataUri(imageFile);
  if (!(parsed.mimeType.includes("zip"))){
  return res.status(400).send({error:"Sorry cannot upload the file, Kindly upload zip file"});
}
  let fileName = `${getCurrentDateTimeString()}.zip`;
  const data = {
   Key: fileName,
   Body: parsed.data,
   ContentDisposition: 'inline',
   ContentType: parsed.mimeType,
  };
  const s3Bucket = new AWS.S3({ params: { Bucket: process.env.aws_Bucket_name } });
  s3Bucket.upload(data, (err, response) => {
    if (err) {
      console.log("Error",err.message);
      return reject(err);
    }
    else{
      new productFile({
        content: imageFile,
        userId: req.body.userId,
        name: fileName,
        createdAt: Date.now(),
        userEmail: req.user.email,
        category: "product_images",
        reference: `/imageZips/${fileName}`
          }).save().then((result) => {
              return res.status(200).send({ success: 'Files are successfully uploaded' });
          }).catch((e) => {
            console.log('Cannot upload file:',e.message);
            return res.status(400).send({error:`Sorry cannot upload the file, Try again`})});
        }
  });

});

router.post('/actions/Download-products-file', permissionMiddlewareCreator.smartAction(), (request, response, next) => {
  const recordId = request.body.data.attributes.ids[0]
  return productFile.findByPk(recordId)
    .then((record) => {
      if (record.category == "product_images")
      return response.status(400).send({error: 'Sorry You can download products sheet only'});
      const fileName = record.content.match(/name=(.*)\;/)?record.content.match(/name=(.*)\;/)[1] : `file-${recordId}-download.csv`
      const parsed = parseDataUri(record.content);
      response.setHeader('Content-Type',parsed.mimeType);
      response.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      response.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
      return response.send(parsed.data);
    })
    .catch((e) => {
     console.log(e.message);
    response.status(400).send({error: `Cannot download file: ${e.message}`})})
});

router.post('/productFile/actions/Update-status', permissionMiddlewareCreator.smartAction(),(request, response, next) => {
  const recordIds = request.body.data.attributes.ids;
  const status = request.body.data.attributes.values.status;
  let DBstatus = status.toLowerCase().replace(" ","_");
  console.log(DBstatus,"DataBaseStatus");
  return productFile.update({
    status: DBstatus,
    updatedAt: Date.now()
  }, { where: { id: recordIds } })
    .then(() => response.send({ success: 'Successfully updated!' }))
    .catch((error) => {
      console.log("update status issue",error.message);
      response.status(400).send({ error: error.message })});
});

module.exports = router;
