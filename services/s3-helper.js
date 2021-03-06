const P = require('bluebird');
const parseDataUri = require('parse-data-uri');
const AWS = require('aws-sdk');

function S3Helper() {
  this.upload = (rawData, filename) => new P((resolve, reject) => {
    const s3Bucket = new AWS.S3({ params: { Bucket: process.env.aws_Bucket_name } });
    const parsed = parseDataUri(rawData);

    const data = {
      Key: filename,
      Body: parsed.data,
      ContentDisposition: 'inline',
      ContentType: parsed.mimeType,
    };

    // Upload the image.
    s3Bucket.upload(data, (err, response) => {
      if (err) {
        return reject(err);
      }
      return resolve(response);
    });
  });
}
