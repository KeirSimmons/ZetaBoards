dynamo.online = {
	version : 3,
	settings : dynamo.server.modules.online.settings,
	__construct : function() {
		dynamo.tip.preloaded.add_msg([
			["online-acp-main-1", {type : 5, message : "The settings were not updated successfully. Please check that you have changed them from their original value."}],
			["online-acp-main-2", {type : 5, message : "The settings were updated successfully."}]
		]);
	},
	acp : {
		main : function(data) {
			dynamo.tip.prompt.content(function() {
				var max_period = data.info.max_period;
				dynamo.form.create(".dynamo_content", {
					fields : [
						{
							field : {
								type : 'input',
								spec : 'text',
								name : 'title'
							},
							content : {
								label : 'Title',
								placeholder : data.info.title,
								value : data.info.title
							},
							rules : {
								required : true,
								minlength : 1,
								maxlength : 32
							}
						},
						{
							field : {
								type : 'input',
								spec : 'number',
								name : 'period'
							},
							content : {
								label : 'Activity Period',
								placeholder : data.info.period,
								value : data.info.period,
								desc : 'How many seconds you want to be treated as active. All users who have visited in the last <em>x</em> seconds will be shown to have been online recently.<br><br><strong>86400</strong> seconds = 1 day.<br><br>Maximum value: ' + max_period + '.'
							},
							rules : {
								required : true,
								min : 1,
								max : max_period
							}
						},
						{
							field : {
								type : 'input',
								spec : 'url',
								name : 'img'
							},
							content : {
								label : 'Image',
								placeholder : data.info.img,
								value : data.info.img,
								desc : 'Image to use in the board statistics box. The default value matches the default ZetaBoards theme.'
							},
							rules : {
								required : true,
								minlength : 16,
								maxlength : 100
							}
						}
					],
					submit : {
						to_call : function(data){
							dynamo.tip.prompt.load({
								m : "online",
								p1 : "acp",
								p2 : "main",
								c : "edit",
								info : data
							});
						},
						value : 'Update Settings',
						inline : false
					}
				});
			}, dynamo.server.modules.online.name + ' - Admin CP - Main Settings');
		}
	}
};