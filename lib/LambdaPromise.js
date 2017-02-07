'use strict';
var deferred = require('deferred');
var AWS = require('aws-sdk');

class LambdaPromise {

	constructor(awsConfigPath) {

		// Load config for AWS
		AWS.config.loadFromPath(awsConfigPath);
		this.lambda = new AWS.Lambda()
	}

	invoke(functionName, payload) {
		// set up parameters
		var params = {
			FunctionName: functionName, /* required */
			InvocationType: 'RequestResponse', // RequestResponse or 'Event'
			Payload: JSON.stringify(payload),
			LogType: 'Tail'
		}

		// set up deferred promise
		var def = deferred()

		this.lambda.invoke(params, function(err, data) {
			if (err) {
				// an error occurred
				console.error(err, err.stack);
				def.reject(err)
			} else {
				// successful response, return response Payload
				def.resolve(data.Payload);
			}
			
		})

		return def.promise
	}


}


module.exports = LambdaPromise