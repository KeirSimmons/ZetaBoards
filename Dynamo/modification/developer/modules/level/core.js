dynamo.level = {
	version : 2,
	settings : dynamo.server.modules.level.settings,
	__construct : function() {
		dynamo.tip.preloaded.add_msg([
			["level-acp-main-1", {type : 5, message : "The settings were not updated successfully. Please check that you have changed them from their original value."}],
			["level-acp-main-2", {type : 5, message : "The settings were updated successfully."}],
			["level-acp-progression-1", {type : 5, message : "The settings were not updated successfully. Please check that you have changed them from their original value."}],
			["level-acp-progression-2", {type : 5, message : "The settings were updated successfully. You may want to consider resetting user data so everyone restarts at " + dynamo.toolbox.lowercase(dynamo.level.settings.level_name) + " 1 with 0 " + dynamo.toolbox.lowercase(dynamo.level.settings.exp_name) + "."}],
			["level-acp-post-1", {type : 5, message : "The settings were not updated successfully. Please check that you have changed them from their original value."}],
			["level-acp-user-1", {type : 5, message : "There are no users with a similar username to '%DATA[username]%'."}],
			["level-acp-user-2", {type : 5, message : "The user's " + dynamo.toolbox.lowercase(dynamo.level.settings.exp_name) + " was not updated successfully."}],
			["level-acp-user-3", {type : 5, message : "The user's " + dynamo.toolbox.lowercase(dynamo.level.settings.exp_name) + " was updated successfully."}],
			["level-acp-post-2", {type : 5, message : "The settings were updated successfully."}],
			["level-acp-reset-1", {type : 5, message : "All user's " + dynamo.toolbox.lowercase(dynamo.level.settings.level_name) + " and " + dynamo.toolbox.lowercase(dynamo.level.settings.exp_name) + " have been reset."}]
		]);
	},
	stats : function(data) {
		var info = data.info;
		var exp_needed = info.level >= info.max_level ? 'You have reached the maximum ' + dynamo.toolbox.lowercase(dynamo.level.settings.level_name) + '.' : dynamo.toolbox.format_number(info.exp_needed);
		dynamo.table.create(".dynamo_content", {
			rows : [
				{
					cells : [
						{
							content : dynamo.level.settings.level_name + ":",
							desc : "The maximum " + dynamo.toolbox.lowercase(dynamo.level.settings.level_name) + " is " + dynamo.toolbox.format_number(info.max_level) + ".",
							style : {
								width : '50%',
								classes : 'c_desc'
							}
						}, {
							content : dynamo.toolbox.format_number(info.level)
						}
					]
				},
				{
					cells : [
						{
							content : dynamo.level.settings.exp_name + ":",
							style : {
								classes : 'c_desc'
							}
						},
						{
							content : dynamo.toolbox.format_number(info.exp)
						}
					]
				},
				{
					cells : [
						{
							content : dynamo.level.settings.exp_name + " needed to level up:",
							style : {
								classes : 'c_desc'
							}
						}, {
							content : exp_needed
						}
					]
				}
			]
		});
	},
	acp : {
		main : function(data) {
			dynamo.tip.prompt.content(function() {
				var profile = data.info.profile_type;
				dynamo.form.create(".dynamo_content", {
					fields : [
						{
							field : {
								type : 'input',
								spec : 'text',
								name : 'level'
							},
							content : {
								label : 'Level Name',
								value : data.info.level_name
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
								spec : 'text',
								name : 'experience'
							},
							content : {
								label : 'Experience Name',
								value : data.info.exp_name
							},
							rules : {
								required : true,
								minlength : 1,
								maxlength : 32
							}
						},
						{
							field : {
								type : 'select',
								name : 'profile',
								options : [
									[1, "Hide", profile == 1],
									[2, "Level + Exp Bar", profile == 2],
									[3, "Level + Exp", profile == 3],
									[4, "Level only", profile == 4],
									[5, "Exp only", profile == 5]
								]
							},
							content : {
								label : 'Profile Display',
								desc : 'Select how you want the level and experience to be displayed in the profile (and mini profile next to posts).'
							},
							rules : {
								required : true
							}
						}
					],
					submit : {
						to_call : function(data){
							dynamo.tip.prompt.load({
								m : "level",
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
			}, dynamo.server.modules.level.name + ' - Admin CP - Main Settings');
		},
		progression : function(data) {
			dynamo.tip.prompt.content(function() {
				var type = data.info.type;
				dynamo.form.create(".dynamo_content", {
					fields : [
						{
							field : {
								type : 'select',
								name : 'type',
								options : [
									[1, "Linear", type == 1],
									[2, "Quadratic", type == 2],
									[3, "Cubic", type == 3]
								]
							},
							content : {
								label : 'Experience Type',
								desc : 'Linear: The amount of exp required to level up remains the same when levelling up.<br><br>Quadratic: The amount of exp required to level up increases quadratically based on your current level (the higher your level, the harder it is to level up).<br><br>Cubic: Similar to quadratic, but even harder to level up as your level increases. This is commonly used in RPG games.'
							},
							rules : {
								required : true
							},
							tip : {
								position : {
									my : 'top center',
									at : 'bottom center'
								},
								style : {
									width : '400px'
								}
							}
						},
						{
							field : {
								type : 'input',
								spec : 'number',
								name : 'max_level'
							},
							content : {
								label : 'Maximum Level',
								value : data.info.max_level
							},
							rules : {
								required : true,
								min : 1
							}
						},
						{
							field : {
								type : 'input',
								spec : 'number',
								name : 'max_exp'
							},
							content : {
								label : 'Maximum Exp',
								desc : 'Experience required to reach the maximum level.',
								value : data.info.max_exp
							},
							rules : {
								required : true,
								min : 0
							}
						}
					],
					submit : {
						to_call : function(data){
							dynamo.tip.prompt.load({
								m : "level",
								p1 : "acp",
								p2 : "progression",
								c : "edit",
								info : data
							});
						},
						value : 'Update Settings',
						inline : false
					}
				});
				$(".dynamo_content table tr:first").before('<tr><th colspan="2" style="text-align:center;">Please note that changing anything here will recalculate all user\'s levels.</th></tr>');
			}, dynamo.server.modules.level.name + ' - Admin CP - Progression Settings');
		},
		user : {
			search : function(data){
				dynamo.tip.prompt.content(function(){
					dynamo.form.create(".dynamo_content",{
						fields : [
							{
								field : {
									type : 'input',
									spec : 'search',
									name : 'user'
								},
								content : {
									label : 'Search',
									desc : 'Search for a user to edit.'
								},
								rules : {
									required : true,
									minlength : 3,
									maxlength : 32
								}
							}
						],
						submit : {
							to_call : function(data){
								dynamo.tip.prompt.load({
									m : "level",
									p1 : "acp",
									p2 : "user",
									c : "select",
									info : {
										user : data.user
									}
								});
							},
							value : 'Find'
						}
					});
				}, dynamo.server.modules.level.name + ' - Admin CP - Edit User');
			},
			choose : function(data) {

				var page = data.info.page;
				var total_pages = data.info.total_pages;
			
				dynamo.tip.prompt.content(function() {
					
					var cur_page = page + '/' + total_pages;
					var prev_page = $("<button>").attr("type", "submit").css("width", "80px").html("<").css("opacity", 0.5).addClass("dynamo_prev_page");
					var next_page = $("<button>").attr("type", "submit").css("width", "80px").html(">").css("opacity", 0.5).addClass("dynamo_next_page");
					$(".dynamo_content").empty().append('<div></div><br /><div style="text-align:center;" class="dynamo_pages_holder"></div>');
				
					var rows = [],
						u,
						users = data.info.users,
						uL = users.length,
						user;
						
					rows[rows.length] = {
						cells : [
							{
								content : 'Username',
								style : {
									width : '50%'
								},
								type : 'th'
							},
							{
								content : 'Edit',
								type : 'th'
							}
						]
					};
					
					for(u = 0; u < uL; u++) {
						user = users[u];
						rows[rows.length] = {
							cells : [
								{content : '<a href="' + main_url + 'profile/' + user.zbid + '">' + user.username + '</a>'},
								{content : '<a href="javascript:dynamo.level.acp.user.request_form(' + user.zbid + ');">Edit</a>'}
							]
						};
					}
					
					dynamo.table.create(".dynamo_content div:first", {
						rows : rows
					});
					
					$(".dynamo_pages_holder").append(prev_page).append(' ').append(next_page);
					
					if(page > 1){
						$(".dynamo_prev_page").bind("click", function() {
							dynamo.tip.prompt.load({
								m : "level",
								p1 : "acp",
								p2 : "user",
								c : "select",
								info : {
									page : page - 1,
									user : data.info.user
								}
							});
						}).css("opacity", 1);
					}
					
					if(page < total_pages){
						$(".dynamo_next_page").bind("click", function() {
							dynamo.tip.prompt.load({
								m : "level",
								p1 : "acp",
								p2 : "user",
								c : "select",
								info : {
									page : page + 1,
									user : data.info.user
								}
							});
						}).css("opacity", 1);
					}
					
				}, dynamo.server.modules.level.name + ' - Admin CP - Edit User - Page ' + page + '/' + total_pages);
			},
			request_form : function(zbid) {
				dynamo.tip.prompt.load({
					m : "level",
					p1 : "acp",
					p2 : "user",
					c : "form",
					zbids : [zbid], // preload server side data
					info : {
						zbid : zbid
					}
				});
			},
			form : function(data) {
				dynamo.tip.prompt.content(function() {
					
					dynamo.form.create(".dynamo_content", {
						fields : [
							{
								field : {
									type : 'input',
									spec : 'number',
									name : 'exp'
								},
								content : {
									label : 'Current ' + dynamo.server.modules.level.settings.exp_name,
									value : data.info.exp
								},
								rules : {
									required : true,
									fn : function(val) {
										return val == data.info.exp ? "You have not changed this value" : "";
									},
									min : 0
								}
							},
							{
								field : {
									type : 'input',
									spec : 'hidden',
									name : 'zbid'
								},
								content : {
									value : data.info.zbid
								}
							}
						],
						submit : {
							to_call : function(data){
								dynamo.tip.prompt.load({
									m : "level",
									p1 : "acp",
									p2 : "user",
									c : "edit",
									zbids : [data.zbid], // preload data server side
									info : data
								});
							},
							value : 'Update User',
							inline : false
						}
					});
					
				}, dynamo.server.modules.level.name + ' - Admin CP - Edit User - ' + data.info.username);
			}
		},
		reset : {
			confirm : function(data) {
				dynamo.tip.prompt.content(function() {
					dynamo.table.create(".dynamo_content", {
						rows : [
							{
								cells : [
									{
										colspan : 2,
										content : "Are you sure that you want to reset the data for this module? If you do so, all user's " + dynamo.toolbox.lowercase(dynamo.server.modules.level.settings.level_name) + " &amp; " + dynamo.toolbox.lowercase(dynamo.server.modules.level.settings.exp_name) + " will be reset and you cannot revert back.",
										type : 'th'
									}
								]
							},
							{
								cells : [
									{
										content : '<a href="javascript:dynamo.level.acp.reset.yes();">Yes</a>',
										style : {
											width : '50%',
											align : 'center'
										}
									},
									{
										content : '<a href="javascript:dynamo.level.acp.reset.no();">No</a>',
										style : {
											align : 'center'
										}
									}
								]
							}
						]
					});
				}, dynamo.server.modules.level.name + ' - Admin CP - Reset User Data');
			},
			yes : function() {
				dynamo.tip.prompt.load({
					m : "level",
					p1 : "acp",
					p2 : "reset",
					c : "confirmed"
				});
			},
			no : function() {
				dynamo.tip.prompt.content("You have successfully cancelled this action.",
				dynamo.server.modules.level.name + ' - Admin CP - Reset User Data - Cancelled');
			}
		},
		post : {
			groups : function(data) {
				dynamo.tip.prompt.content(function() {
					var groups = data.info.groups, edit, group_len = groups.length, g;
					
					var rows = [
						{
							cells : [{
								colspan : 3,
								content : 'Please select a group to edit their ' + dynamo.toolbox.lowercase(dynamo.level.settings.exp_name) + '-per-post settings',
								style : {
									align : 'center'
								}
							}]
						},
						{
							cells : [
								{
									content : 'Group Name',
									type : 'th'
								},
								{
									content : '# of Members in Group',
									type : 'th'
								},
								{
									content : 'Edit Settings',
									type : 'th'
								}
							]
						}
					];
					
					for(g = 0; g < group_len; g++){
						rows[rows.length] = {
							cells : [
								{content : groups[g].name},
								{content : dynamo.toolbox.format_number(groups[g].users)},
								{content : '<a href="javascript:dynamo.level.acp.post.request_form(' + groups[g].id + ');">Edit</a>'}
							]
						};
					}
					
					dynamo.table.create(".dynamo_content", {
						colspan : 3,
						rows : rows
					});
					
				}, dynamo.server.modules.level.name + " - ACP - " + dynamo.level.settings.exp_name + " per Post");
			},
			request_form : function(gid) {
				dynamo.tip.prompt.load({
					m : "level",
					p1 : "acp",
					p2 : "post",
					c : "form",
					info : {
						gid : gid
					}
				});
			},
			form : function(data) {
				var gid = data.info.group.id;
				dynamo.tip.prompt.content(function() {
					var reply_msg = 'Replies (posts) to topics will earn a random amount of ' + dynamo.toolbox.lowercase(dynamo.level.settings.exp_name) + ' between the minimimum and maximum value that you set here.<br /><br />To fix the amount, set the minimum and maximum to the same value.';
					var topic_msg = 'New topics will earn a random amount of ' + dynamo.toolbox.lowercase(dynamo.level.settings.exp_name) + ' between the minimimum and maximum value that you set here.<br /><br />To fix the amount, set the minimum and maximum to the same value.';
					dynamo.form.create(".dynamo_content", {
						fields : [
							{
								field : {
									type : 'input',
									spec : 'number',
									name : 'reply_min'
								},
								content : {
									label : 'Minimum per reply',
									desc : reply_msg,
									value : data.info.reply.min
								},
								rules : {
									required : true,
									min : 0
								}
							},
							{
								field : {
									type : 'input',
									spec : 'number',
									name : 'reply_max'
								},
								content : {
									label : 'Maximum per reply',
									desc : reply_msg,
									value : data.info.reply.max
								},
								rules : {
									required : true,
									min : 0
								}
							},
							{
								field : {
									type : 'input',
									spec : 'number',
									name : 'topic_min'
								},
								content : {
									label : 'Minimum per topic',
									desc : topic_msg,
									value : data.info.topic.min
								},
								rules : {
									required : true,
									min : 0
								}
							},
							{
								field : {
									type : 'input',
									spec : 'number',
									name : 'topic_max'
								},
								content : {
									label : 'Maximum per topic',
									desc : topic_msg,
									value : data.info.topic.max
								},
								rules : {
									required : true,
									min : 0
								}
							}
						],
						submit : {
							to_call : function(data){
								dynamo.tip.prompt.load({
									m : "level",
									p1 : "acp",
									p2 : "post",
									c : "edit",
									info : $.extend(true, data, {gid : gid})
								});
							},
							value : 'Update Settings',
							inline : false
						}
					});
				}, dynamo.server.modules.level.name + ' - Admin CP - ' + dynamo.level.settings.exp_name + ' per Post - ' + data.info.group.name);
			}
		}
	}
};