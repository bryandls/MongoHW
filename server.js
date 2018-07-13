//require the npm packages this app will need to run
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var axios = require("axios");
var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
//use express.static to serve the public folder as a static directory
app.use(express.static("public"));
//use ES6 promises in mongoose

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newsArticleScraper";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);
// mongoose.connect("")

var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//get route for scraping the New York Times home page
app.get("/scrape", function (req, res) {
	axios.get("https://www.nytimes.com/").then(function (results) {
		var $ = cheerio.load(results.data);
		$("article").each(function (i, element) {
			var article = {};
			article.title = $(this).children("h2").children("a").text();
			article.link = $(this).children("h2").children("a").attr("href");
			article.summary = $(this).children("p").text();

			if (article.title !== "") {
				db.Article
				.create(article)
				.then(function (dbArticle) {

					res.send("Scrape sucessful!")
				})
				.catch(function (error) {

					res.json(error);
				});
			}
		});
	});
});

app.get("/", function (req, res) {
	db.Article
		.find({})
		.then(function (dbArticle) {
			var articlesObject = {
				articles: dbArticle
			}
			res.render("index", articlesObject);
		})
		.catch(function (error) {
			res.json(error);
		});
});

//start the server on port 3000
app.listen(PORT, function() {
	console.log("App is running on port " + PORT + ".");
});