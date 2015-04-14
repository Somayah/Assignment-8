var express = require('express'),
    http = require('http'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    autoIncrement = require('mongoose-auto-increment');

//app.use(express.bodyParser());
app.use('/client',  express.static(__dirname + '/client'));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));  

mongoose.connect('mongodb://localhost/urlShortener');
var db = mongoose.connection;
 
db.on('error', function (err) {
console.log('connection error', err);
});
db.once('open', function () {
console.log('connected.');
});
autoIncrement.initialize(db);

var UrlSchema = mongoose.Schema({
	id:Number,
    url:String,
    frequency:Number
});

UrlSchema.plugin(autoIncrement.plugin, {
    model: 'Url',
    field: 'id',
    startAt: 10001,
    incrementBy: 1
});
var Url = mongoose.model("Url",UrlSchema);

// create HTTP server/
http.createServer(app).listen(5000);

app.post("/topUrl",function(req,res){
	  Url.find({}).sort({ frequency: -1 }).limit(10).exec(
		function( err, results){
			if(err != null){
                console.log('ERROR:'+err);
                return;
            }
            //console.log("results:"+results);
            if(results){
            	res.json(JSON.stringify(results));
            }
		}
	);
});
//routes
app.get("/", function (req, res) {
    res.sendFile('client/index.html', {root: __dirname });
});
app.get("/:shortUrl",function(req,res){
	Url.findOne({ 'id': parseInt(req.params.shortUrl,36)}, 
       	function(err,result) {
			if(result){
				result.update({ $inc: { frequency: 1 }},function(err, numAffected){
					if(err != null){
		                console.log('ERROR:'+err);
		                return;
	            	}
				});
				res.redirect('http://'+result.url);
			}
		});
	  
});
app.post("/originalURL", function(req,res){
	console.log("shortUrl::"+req.body.shortUrl);
	console.log("parseInt(req.body.shortUrl,36)::"+parseInt(req.body.shortUrl,36));
	Url.findOne({ 
       'id': parseInt(req.body.shortUrl,36), 
        }, 
        function (err, result) {
            if(err != null){
                console.log('ERROR:'+err);
                return;
            }
            console.log(result);
            if(result){
            	/*var urlPair={};
    			urlPair.url=result.url;
				urlPair.shorten=req.body.shortUrl;
				console.log("urlPair:"+JSON.stringify(urlPair));*/
				res.json(JSON.stringify(result));
    		}
    	}
    );
});
app.post("/urlShortener", function (req, res) {
  	console.log("url:"+req.body.url);
	var MIN_URL_TO_SHORTEN=20;
	if(req.body.url.length <= MIN_URL_TO_SHORTEN){
		res.json(JSON.stringify({}));
		return;
	}
	//before create new user, we must check he is not there
	Url.findOne({ 
       'url': req.body.url, 
        }, 
        function (err, result) {
            if(err != null){
                console.log('ERROR:'+err);
                return;
            }
            console.log(result);
            if(result){
            	console.log("the url allreay exist");
    			/*shortUrl = (result.id).toString(36);//parseInt(sequence).toString(36);
    			urlPair.url=req.body.url;
				urlPair.shorten=shortUrl;
				console.log("shortUrl:"+shortUrl);
				console.log("urlPair:"+JSON.stringify(urlPair));*/
				res.json(JSON.stringify(result));
    		}
            else{
                console.log('new url');
           
                Url.nextCount(function(err, count) {
                	console.log("inside newCount method")
		            console.log("count:"+count);
		            var url = new Url({
		            	id: count,
	                	url:req.body.url,
	                	frequency : 0
                	});
		            console.log("url.id:"+url.id);
            		url.save(function(err) {
	                	if(err !== null){
	                            console.log(err);
	                    }else{
	                        console.log("the url was saved");
	                        /*shortUrl = (url.id).toString(36);//parseInt(sequence).toString(36);
			    			urlPair.url=req.body.url;
							urlPair.shorten=shortUrl;
							urlPair.frequency=0;
							console.log("shortUrl:"+shortUrl);
							console.log("urlPair:"+JSON.stringify(urlPair));*/
							res.json(JSON.stringify(url));
	                    }
				    });
		        });
            }
                
        }
	);
  //(128482).toString(36);
  //parseInt("2r4y", 36);
  
});

console.log("server listening on port 5000");
