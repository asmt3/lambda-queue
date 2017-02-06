'use strict';

// external libraries
var queue = require('queue')

// internal libraries
var LambdaPromise = require('./LambdaPromise');


// EXAMPLE USAGE:
// var lq = new LambdaQueue({
//  awsConfigPath: awsConfigPath,
// 	lambdaFunctionName: 'hello-world',
// 	payloads: input, // Array
// 	concurrency: 5, 
// 	onTick: counts => {
// 		console.log(counts)
// 	},
// 	onComplete: results => {
// 		console.log(results)
// 	}
// });

class LambdaQueue {
    constructor(options) {

    	// load options
    	this.loadOptions(options)

        // intialise results
        this.results = {
        	successful: [],
        	unsuccessful: []
        }

        // create queue
        this.q = queue({
        	concurrency: this.options.concurrency,
        	autostart: true
        });

        // create lambda maker
        this.lambdaPromiseMaker = new LambdaPromise(this.options.awsConfigPath);

        // On complete, callback with results
        var parent = this
        this.q.on('end', function(){
        	console.log('Queue Empty');

        	parent.options.onComplete({
        		results: parent.results,
        		counts: parent.getCounts()
        	});
        })

        // load jobs
        for (var i = 0; i < this.options.payloads.length; i++) {
        	var payload = this.options.payloads[i];

        	this.q.push(callback => {

        		// returns a promise
				this.lambdaPromiseMaker
					.invoke(this.options.lambdaFunctionName, payload)
					.then(result => {
						this.results.successful.push(result)
						this.invokeTickFunction()
						callback()
					}, error => {
						console.log("ERROR: "  + error);
						this.results.unsuccessful.push(error)
						this.invokeTickFunction()
						callback()
					})
				
        		
        	})
        }

        // tick
        this.invokeTickFunction();


    }

    loadOptions(options) {
    	// load options
    	var defaultOptions = {
    		'awsConfigPath': undefined,
    		'lambdaFunctionName': undefined,
    		'payloads': [],
    		'concurrency': Infinity,
    		'onTick': undefined,
    		'onComplete': undefined,
    	};

        this.options = Object.assign(defaultOptions, options);

        // validate options
        if (this.options.awsConfigPath == undefined) {
        	console.error('Undefined AWS Config')
        	return;
        }
        if (this.options.payloads.length == 0) {
        	console.error('Empty Batch Input Payload')
        	return;
        }
        if (this.options.lambdaFunctionName == undefined) {
        	console.error('Undefined AWS Lambda Function Name')
        	return;
        }
        if (this.options.onComplete == undefined) {
        	console.error('Undefined Success Function')
        	return;
        }
    }

    invokeTickFunction() {
    	var counts = this.getCounts();
    	this.options.onTick(counts)
    }

    getCounts() {
    	var counts = {
    		successful: this.results.successful.length,
    		unsuccessful: this.results.unsuccessful.length,
    		pending: (this.options.payloads.length - this.results.successful.length  - this.results.unsuccessful.length),
    		total: this.options.payloads.length
    	}
    	return counts;
    }
}

module.exports = LambdaQueue