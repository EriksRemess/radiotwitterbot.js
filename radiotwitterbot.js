var icecaststack = require('icecast-stack')
	, icecastclient = require('icecast-stack/client')
	, request = require('request')
	, oauth = require('oauth')
	, getShortUrl = require('itunes-shorturl')
	, config = require('./config');

var twitter = new oauth.OAuth(
	"https://api.twitter.com/oauth/request_token",
	"https://api.twitter.com/oauth/access_token",
	config.twitter.consumer_key,
	config.twitter.consumer_secret,
	"1.0A",
	config.twitter.calback_url,
	"HMAC-SHA1"
);

var tweet = function(status){
	status = status.replace(/(^|[-\u2014\s(\["])'/g, "$1\u2018")
					.replace(/'/g, "\u2019")
					.replace(/(^|[-\u2014/\[(\u2018\s])"/g, "$1\u201c")
					.replace(/"/g, "\u201d")
					.replace(/--/g, "\u2014")
					.replace(/\(/, "\u0028")
					.replace(/\)/, "\u0029");
	twitter.post("https://api.twitter.com/1.1/statuses/update.json",
		config.twitter.oauth_token,
		config.twitter.oauth_token_secret,
		{ "status": status },
		function(error, data){
			if(!error){
				console.log("%s - %s", new Date(), JSON.parse(data).text);
			} else {
				var error_data = JSON.parse(error.data);
				console.log("%s - ERROR posting '%s' - %d - %d %s", new Date(), status, error.statusCode, error_data.errors[0].code, error_data.errors[0].message);
			}
		}
	);
}

var stream = icecastclient.createClient(config.radio.stream_url);
stream.on('metadata', function(metadata){
	var title = icecaststack.parseMetadata(metadata).StreamTitle.capitalize();
	if(!(new RegExp(config.radio.ignore_regex)).test(title)){
		getitunesdata(title, function(error, itunesdata){
			if(!error){
				getShortUrl(itunesdata.trackId, config.itunes.country, function(error, shortUrl){
					if(!error){
						tweet(itunesdata.artistName + " - " + itunesdata.trackCensoredName + " " + shortUrl); // itun.es shorturl found, including that
					} else {
						tweet(itunesdata.artistName +  " - " + itunesdata.trackCensoredName); // itun.es shorturl not found
					}
				})
			} else {
				tweet(title); // itunes data not found, using stream data
			}
		})
	}
});

function getitunesdata(song, callback){
	request("http://itunes.apple.com/search?country="+config.itunes.country+"&media=N&entity=song&term="+encodeURIComponent(song), function(error, response, body){
		var data = JSON.parse(body);
		if(data.resultCount > 0){
			for(var i in data.results){
				if((data.results[i].artistName + " - " + data.results[i].trackCensoredName).toLowerCase() === song.toLowerCase()){
					return callback(null, data.results[i]);
				}
			}
		}
		return callback("not found");
	});
}

String.prototype.capitalize = function(){
	str = this;
	var doneStr = '';
	var len = str.length;
	var wordIdx = 0;
	var char;
	for (var i = 0;i < len;i++) {
		char = str.substring(i,i + 1);
		if (' -/#$&.()'.indexOf(char) > -1) {
			wordIdx = -1;
		}
		if (wordIdx == 0) {
			char = char.toUpperCase();
		} else if (wordIdx > 0) {
			char = char.toLowerCase();
		}
		doneStr += char;
		wordIdx++;
	}
	return doneStr;
}