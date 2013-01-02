module.exports = {
	itunes: {
		country: "" // itunes store to search for current track, for example: LV, US
	},
	twitter: {
		consumer_key: "", // required, get one at dev.twitter.com
		consumer_secret: "", // required, get one at dev.twitter.com
		callback_url: "", // not really required, but leave it at least empty
		oauth_token: "", // required, get one at dev.twitter.com
		oauth_token_secret: "" // required, get one at dev.twitter.com
	},
	radio: {
		stream_url: "", // for example: http://a.radio101.lv/aac-lq
		ignore_regex: null // for example: /Radio\ 101/
	}
}