const express = require('express');
const crypto = require('crypto');

const app = express();
const secretKey = '';

function calculateSignature(req, secretKey) {
  const hmac = crypto.createHmac('sha1', secretKey);
  hmac.update(req.method);
  hmac.update(req.path);
  hmac.update(JSON.stringify(req.headers));
  return hmac.digest('hex');
}

app.post('/:bucket/:owner/:datasetId/:file', (req, res) => {
  console.log("request")
  console.log("req.headers", req.headers);
  console.log("req.params", req.params);
  const signature = calculateSignature(req, secretKey);
  console.log('signature', signature);
  res.send({ value, signature });
});

app.listen(3001, () => {
  console.log('Mock S3 endpoint listening on port 3001');
});