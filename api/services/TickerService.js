function storeTicker(){
	
	var request = require("request");
	var sqlLast;

	var url = "https://cex.io/api/ticker/GHS/BTC";

	request({
	    url: url,
	    json: true
	}, function (error, response, body) {

	        //console.log(body); //Print the json response

	    if (!error && response.statusCode === 200) {
	        /* 	╔══════════════════════════════════════════════╗  *\
	        |*	║   Probably should make a new variable for    ║  *|
	        |*	║   body.timestamp and use momemt to convert   ║  *|
	        |*	║   it into a google chart friendly datetime   ║  *|
	        |*	║   format. Then use that new variable to 	   ║  *|
	        |*	║   insert into database tables & collections  ║  *|
	        \*  ╚══════════════════════════════════════════════╝  */
	        
	        var timestamp = require('moment').unix(body.timestamp);
	        
	        /* 	╔══════════════════════════════════════════════╗  *\
	        |*	║   Retrieving the last entry in the ticker    ║  *|
	        |*	║   chart table. We want to do this before     ║  *|
	        |*	║   inserting the new data from the cex.io     ║  *|
	        |*	║   api so that it's easier to retrieve the	   ║  *|
	        |*	║   data. This data will be used to compare    ║  *|
	        |*	║	the old and new json last values.		   ║  *|
	        \*  ╚══════════════════════════════════════════════╝  */

	        Ticker.find({}).sort({createdAt: -1}).limit(1).exec(function (error, ticker, next){
				if(error) console.log(err);
				GLOBAL.sqlLast = ticker[0].last;
				//console.log(GLOBAL.sqlLast);
				//console.log(ticker);
			});

	        /* 	╔══════════════════════════════════════════════╗  *\
			|*	║  Populate the Ticker Table so we can later   ║  *|
			|*	║  present and graph it out.	 	           ║  *|
	        \*  ╚══════════════════════════════════════════════╝  */
	        
	        Ticker.create({ 
	        	timestamp	:  timestamp, // Need to convert this to datetime format for google charts
	        	bid 		:  body.bid, 
	        	ask 		:  body.ask, 
	        	low 		:  body.low, 
	        	high 		:  body.high, 
	        	last 		:  body.last,      // Important information
	        	volume 		:  body.volume
	        }).exec(function (error, ticker) {
	        	if(error) console.log("Error inserting Ticker Data: ", error);
	        });

	        ratio = (body.last - GLOBAL.sqlLast) / GLOBAL.sqlLast * 100;
	        
	        GLOBAL.sqlLast = null;

	        if(ratio !== 0){
	        
	        	RatioChange.findOne().where({last: body.last}).exec(function (error, ratiochange){
	        		if(error) console.log(err);

	        		/* 	╔════════════════════════════════════════╗  *\
					|*	║  If we find the new last value in the  ║	*|
					|*	║  RatioChange Table, we will exit and	 ║  *|
					|*	║  not populate the table with repeated	 ║  *|
					|*	║  information. This way the chart has 	 ║  *|
					|*	║  relevent information to chart out.    ║  *|
	        		\*  ╚════════════════════════════════════════╝  */

	        		if(ratiochange) return false;

	        		// console.log(  'last: '       +  body.last       );
	        		// console.log(  'ratio: '      +  ratio           );
	        		// console.log(  'timestamp: '  +  body.timestamp  );

	        		/* 	╔════════════════════════════════════════╗  *\
					|*	║  Populate the RatioChange Table so we  ║	*|
					|*	║  can later present and graph it out	 ║  *|
	        		\*  ╚════════════════════════════════════════╝  */

			        RatioChange.create({
			        	last: body.last,
			        	ratio: ratio,
			        	timestamp: timestamp // Need to convert this to datetime format for google charts 
			        }).exec(function (error, ratiochange){
			        	if(error) console.log("Error inserting Data: ", error);
			        });
	        	});
	        }
	    }
	});		
}
 
module.exports.store = function(){	
	setInterval(storeTicker, 5000);
};