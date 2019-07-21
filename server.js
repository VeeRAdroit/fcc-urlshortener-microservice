'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var dns = require('dns');
var url = require('url');
var shortid = require("shortid");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/
mongoose.connect(process.env.MONGOLAB_URI, { useNewUrlParser: true });
const urlSchema = new Schema({
  original: { type: String, required: true },
  short: { type: String, required: true }
});
const Url = mongoose.model('Url', urlSchema)
app.use(cors());


/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({ greeting: 'hello API' });
});


app.post('/api/shorturl/new', (req, res) => {
  const originalUrl = req.body.url;
  console.log(' URl is ', originalUrl);
  dns.resolve(originalUrl, (err) => {
    if (err) {
      console.log(' Error is ', err);
      res.json({ error: 'invalid URL' })
    } else {
      const shortUrl = shortid.generate();
      const urlObj = { original: url, short: shortUrl };
      Url.save(urlObj, (err) => {
        if (err) {
          res.send(500).json({ error: 'Unable to save url' });
        } else {
          res.send({ original_url: original, short_url: short });
        }
      })
    }
  })

})

app.get('/api/shorturl/:url', (req, res) => {
  const shortUrl = req.params.url;
  Url.findOne({ short: shortUrl }, (err, data) => {
    if (err) {
      res.json({ error: 'Original Url not found for ' + shortUrl })
    } else {
      res.redirect(data.original);
    }
  })
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});