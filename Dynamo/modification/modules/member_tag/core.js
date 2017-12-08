dynamo.member_tag = $.extend(true, dynamo.member_tag, {
	version : 1,
	settings : dynamo.server.modules.member_tag.settings,
	__construct : function() {
		dynamo.tip.preloaded.add_msg([
			["member_tag-acp-main-1", {type : 5, message : "The settings were not updated successfully. Please check that you have changed them from their original value."}],
			["member_tag-acp-main-2", {type : 5, message : "The settings were updated successfully."}]
		]);
	},
	acp : {
		main : function(data){
			dynamo.tip.prompt.content(function() {
				dynamo.form.create(".dynamo_content", {
					fields : [
						{
							field : {
								type : 'input',
								spec : 'text',
								name : 'tag'
							},
							content : {
								label : 'Tag Style',
								placeholder : data.info.tag,
								value : data.info.tag,
								desc : "This is the BBCode you need to use to tag a user. Use <strong>%USERNAME%</strong> for the user's name.<br><br>Examples:<strong>[mention=%USERNAME%]</strong> means <strong>[mention=Viral]</strong> will tag <strong>Viral</strong>.<br><br>Other examples:<br><strong>@%USERNAME%</strong><br><strong>[tag=%USERNAME%]</strong>"
							},
							tip : {
								style : {
									width : '350px'
								}
							},
							rules : {
								required : true,
								minlength : 11,
								maxlength : 42,
								fn : function(val) {
									return /^.+%USERNAME%/.test(val) || /%USERNAME%.+$/.test(val)
										? true
										: "You must include <em>%USERNAME%</em> somewhere in the tag style.";
								}
							}
						}
					],
					submit : {
						to_call : function(data){
							dynamo.tip.prompt.load({
								m : "member_tag",
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
			}, dynamo.server.modules.member_tag.name + ' - Admin CP - Main Settings');
		}
	}
});