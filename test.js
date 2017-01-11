//var path = require('path');
var test_obj = require('./website-snapshot.js');

// no data
test_obj.create_website_snapshot([],{}, console.log, console.log, console.log);

// test one website
test_obj.create_website_snapshot([
	{
		domain: 'tw.yahoo.com',
		url: 'https://tw.yahoo.com'
	}
],{
	//output_dir: path.join(__dirname, 'test_output')
	output_dir: 'test_output'
}, console.log, console.log, console.log);

// test multiple website
test_obj.create_website_snapshot([
	{
		domain: 'tw.yahoo.com',
		url: 'https://tw.yahoo.com'
	},
	{
		domain: 'facebook.com',
		url: 'https://facebook.com'
	}
],{
	//output_dir: path.join(__dirname, 'test_output')
	output_dir: 'test_output'
},function(data) {
	console.log(test_obj.get_website_snapshot_result());
});

