var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/scraperhw", {
  useMongoClient: true
});

// Routes

// A GET route for scraping the website
app.get("/scrape", function(req, res) {
  // grab the html with request
  axios.get("http://www.nytimes.com/").then(function(response) {
    // load that into cheerio
    var $ = cheerio.load(response.data);
    
    $("article h2").each(function(i, element) {
      // Save an empty result object
      var result = {};

      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      // Create a new Article using result
      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          return res.json(err);
        });
    });

    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  db.Article.find({}).then(function(dbArticle){
    res.json(dbArticle);
  }).catch(function(error){
    res.json(error);
  });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({_id: req.params.id}).populate("notes").then(function(dbArticle){
    res.json(dbArticle);
  }).catch(function(error){
    res.json(error);
  })
});

// Route for saving/updating
app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body).then(function(dbNote){
    return db.Article.findOneAndUpdate({_id: req.params.id}, {note: dbNote._id}, {new: true}).then(
        function(dbArticle){
          res.json(dbArticle);
        }
      ).catch(function(error){
        console.log(error);
        res.json(error);
      });
  })
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
