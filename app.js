var express = require('express');
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var flash = require('express-flash');
var session = require('express-session');
var fs = require('fs');
const http = require('http');
var https = require('https');

var app = express();

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// App Title
global.title = "Blue Inc.";

/*Allow CORS*/
app.use(function(req, res, next) {
	 
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token,Authorization,X-Authorization'); 
	res.setHeader('Access-Control-Allow-Methods', '*');
	res.setHeader('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
	res.setHeader('Access-Control-Max-Age', '1000');
	  
	next();
});

// Serve static files
app.use(express.static(__dirname + '/public'));


//Session Setup
app.use(session({
	secret: 'us-east-1_SpQcyv6cV',
	resave: false,
	saveUninitialized: true,
	cookie: {maxAge: 60000}
}));

//Flash Setup
app.use(flash());

//router
var indexRouter = require('./routes/index');
app.use('/', indexRouter);


// app.use(function(req, res, next){
// 	next(createError(404));
// });

// app.listen(port, function(){
// 	console.log('Web Server Listening on http://127.0.0.1:' + port);
// });

http.createServer(app).listen(80, function(){
	console.log('Web Server Listening on https://127.0.0.1:80');
});

var options = {
  key: fs.readFileSync('./ssl/key.pem', 'utf8'),
  cert: fs.readFileSync('./ssl/server.crt', 'utf8')
};

https.createServer(options, app).listen(443, function(){
	console.log('Web Server Listening on https://127.0.0.1:443');
});
