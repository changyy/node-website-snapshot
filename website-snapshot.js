(function(exports) {
	var path = require('path');
	var fs = require('fs');

	// https://github.com/brenden/node-webshot
	var webshot = require('webshot');
	var webshot_option_user_agent = 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.20 (KHTML, like Gecko) Mobile/7B298g';
	var webshot_option_width = 320;
	var webshot_option_height = 320;
	var webshot_option_timeout = 20000;
	var webshot_option_render_deplay = 3000;
	var webshot_option_cookie = [];
	var webshot_option_headers = [];

	var output_dir = 'images';

	var running_task = 0;
	var total_task = [];
	var concurrent_limit = 10;

	var report_callback = null;
	var done_callback = null;
	var error_callback = null;

	exports.create_website_snapshot = create_website_snapshot;
	exports.get_website_snapshot_result = get_website_snapshot_result;

	function get_website_snapshot_result(option) {
		var result = []
		var image_out = 'object';
		if (option && option.hasOwnProperty('format')) {
			switch(option['format']) {
				case 'object':
				case 'binary':
				case 'path':
					image_out = option['format'];
					break;
			}
		}
		fs.readdirSync(output_dir).filter(function(file){
			if (fs.statSync(path.join(output_dir, file)).isFile() && file.lastIndexOf('.png') == (file.length - 4)) {
				var domain = file.substring(0, file.length - 4);
				var image_data;
				switch(image_out) {
					case 'object':
						image_data = fs.readFileSync(path.join(output_dir, file));
						break;
					case 'binary':
						image_data = fs.readFileSync(path.join(output_dir, file), {encoding: 'binary'});
						break;
					case 'path':
						image_data = path.join(output_dir, file);
						break;
				}
				result.push([domain, image_data, Math.round(new Date().getTime()/1000)]);
			}
		});
		return result;
	}

	function create_website_snapshot(input, option, done_cb, error_cb, report_cb) {
		// option init
		if (option) {
			if (option.hasOwnProperty('output_dir'))
				output_dir = option['output_dir'];

			if (option.hasOwnProperty('width'))
				webshot_option_width = option['width'];

			if (option.hasOwnProperty('height'))
				webshot_option_height = option['height'];

			if (option.hasOwnProperty('timeout'))
				webshot_option_timeout = option['timeout'];
		
			if (option.hasOwnProperty('render_deplay'))
				webshot_option_render_deplay = option['render_deplay'];

			if (option.hasOwnProperty('user_agent'))
				webshot_option_user_agent = option['user_agent'];

			if (option.hasOwnProperty('cookie'))
				webshot_option_cookie = option['cookie'];

			if (option.hasOwnProperty('process_number'))
				concurrent_limit = option['process_number'];
		}

		done_callback = done_cb;
		error_callback = error_cb;
		report_callback = report_cb;

		// task init
		if (input instanceof Array) {
			for (var i=0, cnt=input.length ; i<cnt ; ++i) {
				if (input[i].hasOwnProperty('domain') && input[i].hasOwnProperty('url'))
					total_task.push(input[i]);
			}
			if (total_task.length > 0) {
				build();
			} else if (input.length == 0)
				error_cb && error_cb('no data');
			else
				error_cb && error_cb('data format error: element need "domain" and "url" properties');
			return;
		}
		error_cb && error_cb('data format error: input is not array type');
	}

	function build() {
		while(total_task.length > 0 && running_task < concurrent_limit) {
			var item = total_task.shift();
			var url = item.url;
			var domain = item.domain;

			if (report_callback)
				report_callback('handle: '+domain+' via '+url);

			webshot(url, path.join(output_dir, domain+'.png'), {
				screenSize: {
					width: webshot_option_width,
					height: webshot_option_height
				},	
				shotSize: {
					width: webshot_option_width,
					height: webshot_option_height
				},
				timeout: webshot_option_timeout,
				renderDelay: webshot_option_render_deplay,
				userAgent: webshot_option_user_agent,
				cookies: webshot_option_cookie,
				customHeaders: webshot_option_headers
			}, function(err) {
				if (err) {
					if (report_callback) {
						report_callback('error:');
						report_callback(err);
					}
					if (error_callback)
						error_callback(err);
				}
				running_task--;
				if (running_task == 0) {
					if (report_callback)
						report_callback('done');
					if (done_callback)
						done_callback();
				} else if (total_task.length > 0)
					build();
			});
			running_task++;
		}
	}
})(typeof exports !== "undefined" ? exports : this);
