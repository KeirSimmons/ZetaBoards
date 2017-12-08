dynamo.notifications = {
	version : 9,
	settings : dynamo.server.modules.notifications.settings,
	__construct : function() {console.log("loaded");
		dynamo.tip.preloaded.add_msg([
			["notifications-log-1", {type : 5, message : "You do not have any new notifications.", title : dynamo.server.modules.notifications.name + " - Unread"}],
			["notifications-log-2", {type : 5, message : "You do not have any old notifications.", title : dynamo.server.modules.notifications.name + " - History"}],
			["notifications-log-3", {type : 5, message : "The notification could not be marked as read.", title : dynamo.server.modules.notifications.name}],
			["notifications-log-4", {type : 5, message : "The notification has been marked as read.", title : dynamo.server.modules.notifications.name}],
			["notifications-log-5", {type : 5, message : "The notifications could not be marked as read.", title : dynamo.server.modules.notifications.name}],
			["notifications-log-6", {type : 5, message : "The notifications have all been marked as read.", title : dynamo.server.modules.notifications.name}],
			["notifications-log-7", {type : 5, message : "Your settings were not updated successfully. Please try again later.", title : dynamo.server.modules.notifications.name + " - Settings"}],
			["notifications-log-8", {type : 5, message : "Your settings were updated successfully.", title : dynamo.server.modules.notifications.name + " - Settings"}]
		]);
	},
	shown : [], // this will be filled with ids of notifications that have been shown so they are not reshown
	info : {
		"custom" : "%DATA[data]%",
		"core-announcement": "<strong>Official Announcement: </strong><br>%DATA[data]%",
		"core-name_change": "Your request for a name change to <strong>%DATA[data]%</strong> has been approved.",
		"currency-donation": "<a href='" + main_url + "profile/%DATA[data_zbid]%/'>%DATA[username]%</a> has sent you a donation of %MODULE[currency,settings,symbol]%%DATA[data]%.<div class='dynamo_tooltip_hide'>[<a href='javascript:dynamo.tip.prompt.ini(\".dynamo_currency_transactionhistory\");'>Transaction History</a>]</div>",
		"currency-user_money_edit_plus": "An admin has increased your balance by %MODULE[currency,settings,symbol]%%DATA[data,number]%.<div class='dynamo_tooltip_hide'>[<a href='javascript:dynamo.tip.prompt.ini(\".dynamo_currency_transactionhistory\");'>Transaction History</a>]</div>",
		"currency-user_money_edit_minus": "An admin has decreased your balance by %MODULE[currency,settings,symbol]%%DATA[data,number]%.<div class='dynamo_tooltip_hide'>[<a href='javascript:dynamo.tip.prompt.ini(\".dynamo_currency_transactionhistory\");'>Transaction History</a>]</div>",
		"lottery-result": "You won %MODULE[currency,settings,symbol]%%DATA[data]% in the %MODULE[lottery,settings,name]%.<div class='dynamo_tooltip_hide'>[<a href='javascript:dynamo.tip.prompt.ini(\".dynamo_lottery_previous\");'>%MODULE[lottery,settings,name]% History</a>]</div>",
		"level-levelled_up": "Congratulations! You are now %MODULE[level,settings,level_name]% %DATA[data,number]%.",
		"level-user_exp_edit_plus": "An admin has increased your %MODULE[level,settings,exp_name]% by %DATA[data,number]%.",
		"level-user_exp_edit_minus": "An admin has decreased your %MODULE[level,settings,exp_name]% by %DATA[data,number]%.",
		"member_tag-tag": "<a href='" + main_url + "profile/%DATA[data_zbid]%'>%DATA[data,split,||,0]%</a> has tagged you in <a href='" + main_url + "topic/%DATA[data,split,||,1]%/findpost/%DATA[data,split,||,2]%'>this post</a>.",
		"post-position_increase": "Congratulations! You are now %DATA[data]% in the post competition.",
		"post-position_decrease": "You've been overtaken! You are now %DATA[data]% in the post competition.",
		"post-position_entered": "You have now entered the post competition and are currently in %DATA[data]% place."
	},
	get_info : function(data) {
		if(data.type in dynamo.notifications.info) {
			var holder = dynamo.notifications.info[data.type];
			holder = [
				dynamo.toolbox.dynamic_text_replace(
					dynamo.toolbox.time_string(data.time, 2),
					data
				),
				dynamo.toolbox.dynamic_text_replace(holder, data)
			];
			return holder;
		} else {
			return ["Notification", "<em>N/A</em>"];
		}
	},
	show : function(notifications) {
		var n;
		var tip = function(n) {
			var notification = dynamo.notifications.get_info(notifications[n]);
			var id = notifications[n].id;
			if(!dynamo.toolbox.in_array(id, dynamo.notifications.shown)) {
				dynamo.notifications.shown[dynamo.notifications.shown.length] = id;
				dynamo.tip.growl.show({
					message : notification[1],
					title : notification[0],
					events : {
						hide : function(event, api) {
							dynamo.module.server_call(2, {
								m : "notifications",
								p1 : "read",
								info : {
									id : notifications[n].id
								}
							});
						}
					}
				});
			}
		};
		for(n in notifications) {
			tip(n);
		}
	},
	logs : {
		show : function(data) {
			var info = data.info;
			var logs = info.logs;
			var log_len = logs.length;
			
			var page = info.page;
			var total_pages = info.total_pages;
			var cur_page = page + '/' + total_pages;
			var prev_page = $("<button>").attr("type", "submit").css("width", "80px").html("<").css("opacity", 0.5).addClass("dynamo_prev_page");
			var next_page = $("<button>").attr("type", "submit").css("width", "80px").html(">").css("opacity", 0.5).addClass("dynamo_next_page");
			
			var cells = [
				{
					content : 'When',
					style : {
						width : '30%'
					},
					type : 'th'
				},
				{
					content : 'Message',
					type : 'th'
				}
			];
			
			if(info.read == 0) {
				cells[1].style = {
					width : '50%'
				};
				cells[2] = {
					content : 'Mark as Read',
					type : 'th'
				};
			} 
			
			var rows = [];
			
			if(info.read == 0) {
				rows[rows.length] = {
					cells : [
						{
							colspan : 3,
							style : {
								align : 'center'
							},
							content : '[<a href="javascript:dynamo.notifications.logs.mark_all();">Mark all as read</a>]'
						}
					]
				};
			}
			
			rows[rows.length] = {
				cells : cells
			};
			
			var l, log;
			
			for(l = 0; l < log_len; l++){
				if("name" in logs[l]){
					logs[l].name = logs[l].name == ""
						? ("user_info" in info && "zbid-" + logs[l].data_zbid in info.user_info ? info.user_info["zbid-" + logs[l].data_zbid] : "Unknown")
						: logs[l].name;
				}
				log = dynamo.notifications.get_info(logs[l]);
				
				cells = [
					{content : dynamo.toolbox.time_string(logs[l].time, 2)},
					{content : log[1]}
				];
				
				if(info.read == 0) {
					cells[2] = {content : '[<a href="javascript:dynamo.notifications.logs.read('+logs[l].id+');">read</a>]'};
				}
				
				rows[rows.length] = {
					cells : cells
				};
			}

			dynamo.tip.prompt.content(function(){
				$(".dynamo_content").empty().append('<div></div><br /><div style="text-align:center;" class="dynamo_pages_holder"></div>');
				
				dynamo.table.create(".dynamo_content div:first", {
					colspan : info.read == 0 ? 3 : 2,
					rows : rows
				});
				
				$(".dynamo_pages_holder").append(prev_page).append(' ').append(next_page);
				$(".dynamo_content em").css("opacity",0.5);
				
				if(page > 1){
					$(".dynamo_prev_page").bind("click", function(e) {
						dynamo.tip.prompt.load({
							m : "notifications",
							p1 : "log",
							c : info.read == 0
								? "new"
								: "old",
							info : {
								page : page - 1
							}
						});
					}).css("opacity", 1);
				}
				
				if(page < total_pages){
					$(".dynamo_next_page").bind("click", function(e) {
						dynamo.tip.prompt.load({
							m : "notifications",
							p1 : "log",
							c : info.read == 0
								? "new"
								: "old",
							info : {
								page : page + 1
							}
						});
					}).css("opacity", 1);
				}
				
			}, dynamo.server.modules.notifications.name + ' - ' + (
				(info.read == 0
					? 'Unread'
					: 'History')
				+ 
				" - Page " + page + " / " + total_pages
			), 700);
		},
		read : function(id) {
			// marks notification as read
			dynamo.tip.prompt.load({
				m : "notifications",
				p1 : "log",
				c : "read",
				info : {
					id : id
				}
			});
		},
		mark_all : function() {
			dynamo.tip.prompt.load({
				m : "notifications",
				p1 : "log",
				c : "mark_all"
			});
		}
	},
	settings : {
		form : function(data) {
			dynamo.tip.prompt.content(function() {
				dynamo.form.create(".dynamo_content", {
					fields : [
						{
							field : {
								type : 'input',
								spec : 'number',
								name : 'perpage'
							},
							content : {
								label : 'Notifications per page',
								desc : 'Number of new notifications to show as a popup on each page (when available).<br><br>Set this to zero to not receive popups (you can still check your notifications via the User CP).',
								value : data.info.perpage
							},
							rules : {
								required : true,
								min : 0,
								max : data.info.max
							}
						}
					],
					submit : {
						to_call : function(data){
							dynamo.tip.prompt.load({
								m : "notifications",
								p1 : "settings",
								c : "edit",
								info : data
							});
						},
						value : 'Edit',
						inline : true
					}
				});
			}, dynamo.server.modules.notifications.name + ' - Settings');
		}
	}
};