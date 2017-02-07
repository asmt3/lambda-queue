LambdaQueue
===

## What
This package lets you supply a list of JSON payloads to an AWS Lambda function, managing concurrency so that you do not exceed AWS concurrency limits.

## Install
`npm install lambda-queue`

## Example

1. Create an AWS credentials file and save as ```aws.json```. eg.
	
	```
	{ 
	    "accessKeyId": "***", 
	    "secretAccessKey": "***",
	    "region": "***" 
	}
	```
2. Create a set of JSON payloads for your lambda function and save as an array of objects in ```payloads.json```

3. Use the package as follows:

	```
	// Load LambdaQueue class
	var LambdaQueue = require('lambda-queue');

	// Load payloads
	var payloads = require("./payloads.json");

	// Load AWS Config
	var awsConfigPath = __dirname + "/aws.json";

	var queue = new LambdaQueue({
		awsConfigPath: awsConfigPath,
		lambdaFunctionName: 'hello-world',
		payloads: payloads, // Expects Array
		concurrency: 20, 
		onTick: counts => {
			// gets called every time a lambda function returns
			console.log(counts)
		},
		onComplete: results => {
			// gets called once every lambda function has returned
			console.log(results)
		}
	});

	```

## License
Copyright © 2017 Alan Thomson <as.thomson@gmail.com>

This work is free. You can redistribute it and/or modify it under the
terms of the [MIT License](https://opensource.org/licenses/MIT).
See LICENSE for full details.