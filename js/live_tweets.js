var liveTweets = {};

// Last id fetched
liveTweets.last = null;

// Fetch new feeds and display them
liveTweets.update = function () {
	var query = "q=" + Drupal.settings.live_tweets.keywords || "Drupal";
	var ntweets = Drupal.settings.live_tweets.ntweets || 5;
	if (liveTweets.last) query += "&since_id=" + liveTweets.last;
	$.ajax({
		  url: "http://search.twitter.com/search.json",
		  cache: false,
		  dataType: "jsonp",
		  data: "rpp=" + ntweets + "&show_user=true&" + query,
		  success: function(json){
			if (!liveTweets.last) { 
				$('#block-live_tweets-0 .content').empty();
				$('#block-live_tweets-0').show();
			}
			var i;
			// Append tweets
			for (i = 0; i < json.results.length; i += 1) {
				if (liveTweets.last) {
					var tweets = $('#block-live_tweets-0 .content .tweet');
					if (tweets.length + 1 > ntweets) $(tweets.eq(tweets.length - 1)).remove();
					$('#block-live_tweets-0 .content').prepend('<div class="tweet">' + liveTweets.parse(json.results[i].text) + '</div>');
				} else $('#block-live_tweets-0 .content').append('<div class="tweet">' + liveTweets.parse(json.results[i].text) + '</div>');
			}
			// Store last tweet id
			if (json.results.length > 0) liveTweets.last = json.results[0].id;
		  }
		});
};

// Parse tweet feeds to create links
liveTweets.parse = function (text) {
		// Convert urls to links
		text = text.replace(/((http|https):\/\/[^ ]*)/g, '<a href="$1" target="_blank">$1</a> ');
		// @User links
		text = text.replace(/@([^ :.]*)/g, '<a href="http://twitter.com/$1" target="_blank">@$1</a>');
		// #Search links
		text = text.replace(/#([^ :.]*)/g, '<a href="http://search.twitter.com/search?q=%23$1" target="_blank">#$1</a>');
		return text
};

Drupal.behaviors.liveTweets = function(){ 
	if ($('#block-live_tweets-0').length) {
	liveTweets.update();
	setInterval( 'liveTweets.update()', Drupal.settings.live_tweets.refresh );
	}
};