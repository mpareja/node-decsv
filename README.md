# decsv - steaming CSV scanner and parser

Give `decsv` a stream of CSV formatted string data and it will emit a stream of records containing the separate values. `decsv` will emit an array of values for each record in the CSV that it encounters.

## Usage Sample

Imagine you would like to pluck out the second column values from a CSV file. Here is how you would use `descv` to help:

		var decsv = require('decsv'),
			fs = require('fs'),
			stream = fs.createReadStream('somefile.csv')
				.pipe(decsv());

		stream.on('data', function (data) {
			console.log(data[1]);
		});
		stream.on('error', console.log);
