dynamo.currency = {
	version : 11,
	settings : dynamo.server.modules.currency.settings,
	__construct : function() {
		dynamo.tip.preloaded.add_msg([
			["currency-history-2", {type : 2, message : "The message could not be found. Please try again later."}],
			["currency-history-3", {type : 5, message : "There was a problem accessing this user\'s transaction history.", title : "Transaction History"}],
			["currency-history-4", {type : 5, message : "There is no transaction history available for this user.", title : "Transaction History"}],
			["currency-interest-1", {type : 5, message : "Your account type does not allow you to collect interest."}], // group can't collect interest
			["currency-interest-2", {type : 5, message : "You need to wait %DATA[to_wait,time]% before collecting interest again."}],
			["currency-interest-3", {type : 5, message : "You just collected " + dynamo.currency.settings.symbol + "%DATA[amount,number]% of interest."}],
			["currency-donate-2", {type : 5, message : "New members need to wait %DATA[initial,time]% before being able to donate to other members. Please come back in %DATA[to_wait,time]%.", title : dynamo.server.modules.currency.name + ' - Donate'}],
			["currency-donate-3", {type : 5, message : "You have already reached the daily limit of %DATA[max,number]%  donations today. Please come back in %DATA[to_wait,time]%.", title : dynamo.server.modules.currency.name + ' - Donate'}],
			["currency-donate-4", {type : 5, message : "You do not have any " + dynamo.toolbox.lowercase(dynamo.currency.settings.name) + " available.", title : dynamo.server.modules.currency.name + ' - Donate'}],
			["currency-donate-5", {type : 5, message : "You have already donated " + dynamo.currency.settings.symbol + "%DATA[already,number]% out of a maximum of " + dynamo.currency.settings.symbol + "%DATA[per_day,number]% per day. You can donate up to " + dynamo.currency.settings.symbol + "%DATA[max,number]% more today or wait another %DATA[to_wait,time]%.", title : dynamo.server.modules.currency.name + ' - Donate'}],
			["currency-donate-6", {type : 5, message : "There are no users with a similar username to <em>%DATA[username]%</em>.", title : dynamo.server.modules.currency.name + ' - Donate'}],
			["currency-donate-7", {type : 5, message : "You can only donate a maximum of " + dynamo.currency.settings.symbol + "%DATA[money,number]% as this is all that is available.", title : dynamo.server.modules.currency.name + ' - Donate'}],
			["currency-donate-8", {type : 3, message : "You only have " + dynamo.currency.settings.symbol + "%DATA[money,number]% available.", selector : "#donate_invalid", position : {my : "left center", at : "right center"}}],
			["currency-donate-9", {type : 3, message : "You are only permitted to donate " + dynamo.currency.settings.symbol + "%DATA[max_amount,number]% per day.", selector : "#donate_invalid", position : {my : "left center", at : "right center"}}],
			["currency-donate-10", {type : 3, message : "You can only donate " + dynamo.currency.settings.symbol + "%DATA[max_amount,number]% per day. Within the last 24 hours you have donated " + dynamo.currency.settings.symbol + "%DATA[donated,number]%.", selector : "#donate_invalid", position : {my : "left center", at : "right center"}}],
			["currency-donate-11", {type : 5, message : "The " + dynamo.toolbox.lowercase(dynamo.currency.settings.name) + " was donated successfully.", title : dynamo.server.modules.currency.name + ' - Donate'}],
			["currency-donate-12", {type : 5, message : "Your group does not have permission to donate to other members.", title : dynamo.server.modules.currency.name + ' - Donate'}],
			["currency-acp-main-1", {type : 5, message : "The settings were not updated successfully. Please check that you have changed them from their original value."}],
			["currency-acp-main-2", {type : 5, message : "The settings were updated successfully."}],
			["currency-acp-interest-1", {type : 5, message : "The settings were not updated successfully. Please check that you have changed them from their original value."}],
			["currency-acp-interest-2", {type : 5, message : "The settings were updated successfully."}],
			["currency-acp-donate-1", {type : 5, message : "The settings were not updated successfully. Please check that you have changed them from their original value."}],
			["currency-acp-donate-2", {type : 5, message : "The settings were updated successfully."}],
			["currency-acp-user-1", {type : 5, message : "There are no users with a similar username to '%DATA[username]%'."}],
			["currency-acp-user-2", {type : 5, message : "The user's " + dynamo.toolbox.lowercase(dynamo.currency.settings.name) + " was not updated successfully."}],
			["currency-acp-user-3", {type : 5, message : "The user's " + dynamo.toolbox.lowercase(dynamo.currency.settings.name) + " was updated successfully."}],
			["currency-acp-post-1", {type : 5, message : "The settings were not updated successfully. Please check that you have changed them from their original value."}],
			["currency-acp-post-2", {type : 5, message : "The settings were updated successfully."}]
		]);
	},
	balance : function(data){
		dynamo.tip.prompt.content(function() {
			dynamo.table.create(".dynamo_content", {
				rows : [
					{
						cells : [
							{
								content : dynamo.currency.settings.name + ' available',
								style : {
									width : '50%',
									classes : 'c_desc'
								}
							},
							{content : dynamo.currency.settings.symbol + dynamo.toolbox.format_number(data.info.money)}
						]
					}
				]
			});
		}, dynamo.server.modules.currency.name + ' - Balance');
	},
	history : {
		info : {
			"currency-interest": {
				desc : 'Interest collected',
				money : '<span class="dynamo_currency_plus">+%MODULE[currency,settings,symbol]%%DATA[amount,number]%</span>'
			},
			"currency-donate_to" : {
				desc : 'Donation to <a href="' + main_url + 'profile/%DATA[data_zbid]%/">%DATA[username]%</a> [<a href="javascript:dynamo.currency.history.message.ini(%DATA[id]%, \'Donation Message\');" id="dynamo_currency_hm-%DATA[id]%">Message</a>]',
				money : '<span class="dynamo_currency_minus">-%MODULE[currency,settings,symbol]%%DATA[amount,number]%</span>'
			},
			"currency-donate_from" : {
				desc : 'Donation from <a href="' + main_url + 'profile/%DATA[data_zbid]%/">%DATA[username]%</a> [<a href="javascript:dynamo.currency.history.message.ini(%DATA[id]%, \'Donation Message\');" id="dynamo_currency_hm-%DATA[id]%">Message</a>]',
				money :'<span class="dynamo_currency_plus">+%MODULE[currency,settings,symbol]%%DATA[amount,number]%</span>'
			},
			"currency-user_money_edit_minus" : {
				desc : 'An admin decreased your balance by %MODULE[currency,settings,symbol]%%DATA[amount,number]%. [<a href="javascript:dynamo.currency.history.message.ini(%DATA[id]%, \'Reason\');" id="dynamo_currency_hm-%DATA[id]%">Reason</a>]',
				money :'<span class="dynamo_currency_minus">-%MODULE[currency,settings,symbol]%%DATA[amount,number]%</span>'
			},
			"currency-user_money_edit_plus" : {
				desc : 'An admin increased your balance by %MODULE[currency,settings,symbol]%%DATA[amount,number]%. [<a href="javascript:dynamo.currency.history.message.ini(%DATA[id]%, \'Reason\');" id="dynamo_currency_hm-%DATA[id]%">Reason</a>]',
				money :'<span class="dynamo_currency_plus">+%MODULE[currency,settings,symbol]%%DATA[amount,number]%</span>'
			},
			"lottery-ticket_bought" : {
				desc : 'Purchased a %MODULE[lottery,settings,name]% ticket.',
				money :'<span class="dynamo_currency_minus">-%MODULE[currency,settings,symbol]%%DATA[amount,number]%</span>'
			},
			"lottery-winnings" : {
				desc : 'Won %MODULE[currency,settings,symbol]%%DATA[amount,number]% in the %MODULE[lottery,settings,name]%.',
				money :'<span class="dynamo_currency_plus">-%MODULE[currency,settings,symbol]%%DATA[amount,number]%</span>'
			}
		},
		get_info : function(data) {
			if(data.type in dynamo.currency.history.info) {
				var holder = dynamo.currency.history.info[data.type];
				return {
					desc : dynamo.toolbox.dynamic_text_replace(holder.desc, data),
					money : dynamo.toolbox.dynamic_text_replace(holder.money, data)
				};
			} else {
				return {
					desc : '<em>Invalid transaction</em>',
					money : '<em>N/A</em>'
				};
			}
		},
		show : function(data){
			var info = data.info;
			var histori = info.history;
			var history_len = histori.length;
			
			var page = info.page;
			var total_pages = info.total_pages;
			var cur_page = page + '/' + total_pages;
			var rspan = history_len;
			var prev_page = $("<button>").attr("type", "submit").css("width", "80px").html("<").css("opacity", 0.5).addClass("dynamo_prev_page");
			var next_page = $("<button>").attr("type", "submit").css("width", "80px").html(">").css("opacity", 0.5).addClass("dynamo_next_page");
			
			var money, h, transaction;
			
			var rows = [
				{
					cells : [
						{
							content : 'When',
							style : {
								width : '30%'
							},
							type : 'th'
						},
						{
							content : 'Description',
							style : {
								width : '50%'
							},
							type : 'th'
						},
						{
							content : dynamo.currency.settings.name,
							type : 'th'
						}
					]
				}
			];
			
			for(h = 0; h < history_len; h++){
				transaction = dynamo.currency.history.get_info(histori[h]);
				rows[rows.length] = {
					cells : [
						{content : dynamo.toolbox.time_string(histori[h].time, 2)},
						{content : transaction.desc},
						{content : transaction.money}
					]
				};
			}

			var username = info.user_zbid == dynamo.toolbox.get_zbid() ? "My" : dynamo.toolbox.possession(info.users_name);
			dynamo.tip.prompt.content(function(){
				$(".dynamo_content").empty().append('<div></div><br /><div style="text-align:center;" class="dynamo_pages_holder"></div>');
				
				dynamo.table.create(".dynamo_content div:first", {
					colspan : 3,
					rows : rows
				});
				
				$(".dynamo_pages_holder").append(prev_page).append(' ').append(next_page);
				$(".dynamo_content em").css("opacity",0.5);
				
				if(page > 1){
					$(".dynamo_prev_page").bind("click", {page : (+page) -1, zbid : info.user_zbid}, function(e) {
						dynamo.tip.prompt.load({
							m : "currency",
							p1 : "history",
							c : "show",
							info : {
								page : e.data.page,
								user_zbid : e.data.zbid
							}
						});
					}).css("opacity", 1);
				}
				
				if(page < total_pages){
					$(".dynamo_next_page").bind("click", {page : (+page) + 1, zbid : info.user_zbid}, function(e) {
						dynamo.tip.prompt.load({
							m : "currency",
							p1 : "history",
							c : "show",
							info : {
								page : e.data.page,
								user_zbid : e.data.zbid
							}
						});
					}).css("opacity", 1);
				}
				
			}, dynamo.server.modules.currency.name + ' - ' + username + ' Transaction History - Page ' + cur_page, 700);
		},
		message : {
			ini : function(id, title){
				title = title || "Message";
				if(!dynamo.toolbox.is_defined($("a#dynamo_currency_hm-"+id).data("tip_added"))){
					dynamo.tip.tooltip.show({
						selector : "a#dynamo_currency_hm-" + id,
						show : {
							event : 'click',
							button : true
						},
						content : {
							text : '<div id="dynamo_currency_qtip-load-hm-' + id + '" class="dynamo_loader"></div>',
							title : {
								text : title,
								button : true
							}
						},
						hide : {
							fixed : true,
							delay : 1000
						},
						position : {
							my : 'top center',
							at : 'bottom center',
							adjust : {
								y : 2
							}
						},
						events : {
							render : function(event, api){
								dynamo.module.server_call(2, {
									m : "currency",
									p1 : "history",
									c : "message",
									info : {
										id : id
									}
								});
							}
						}
					});
					$("a#dynamo_currency_hm-" + id).data("tip_added", true);
				}
				$("a#dynamo_currency_hm-" + id).click();
			},
			show : function(data){
				var msg = data.info.message || "<em>No message was left.</em>";
				var id = data.info.id;
				$("#dynamo_currency_qtip-load-hm-" + id).slideFadeToggle("fast", function(){
					$(this).removeClass("dynamo_loader").html(msg).slideFadeToggle("fast");
				});
			}
		}
	},
	donate : {
		form_1 : function(data){
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
								label : 'Donate to'
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
								m : "currency",
								p1 : "donate",
								c : "user",
								info : {
									user : data.user
								}
							});
						},
						value : 'Find'
					}
				});
			}, dynamo.server.modules.currency.name + ' - Donate');
		},
		form_2 : function(data){
			var info = data.info;
			var matches = info.matches, option_array = [];
			if("instant" in data){
				option_array = [[matches[0],matches[1],1]];
			} else {
				var mL = matches.length + 1;
				option_array = [];
				for(var m = 1; m < mL; m++){
					option_array[option_array.length] = [matches[m - 1]["zbid"], matches[m - 1]["username"]];
				}
			}
			dynamo.tip.prompt.content(function(){
				dynamo.form.create(".dynamo_content", {
					fields : [
						{
							field : {
								type : 'select',
								spec : 'single',
								name : 'user',
								options : option_array
							},
							content : {
								label : 'Donate to',
								blank : '-Select User'
							},
							rules : {
								required : true
							}
						},
						{
							field : {
								type : 'textarea',
								name : 'message'
							},
							content : {
								label : 'Message'
							},
							rules : {
								maxlength : 150
							}
						},
						{
							field : {
								type : 'input',
								spec : 'number',
								name : 'amount'
							},
							content : {
								label : 'Amount',
								desc : 'Maximum: ' + dynamo.currency.settings.symbol + dynamo.toolbox.format_number(data.info.left) + ' [<a href="javascript:void(0);" style="cursor:help;" id="donate_invalid">?</a>]',
								placeholder : dynamo.currency.settings.symbol
							},
							rules : {
								required : true,
								min : 1,
								max : data.info.left
							}
						}
					],
					submit : {
						to_call : function(data){
							dynamo.tip.prompt.load({
								m : "currency",
								p1 : "donate",
								c : "finish",
								zbids : [data.user],
								info : data
							});
						},
						value : 'Donate',
						inline : false
					}
				});
			}, dynamo.server.modules.currency.name + ' - Donate');
			var select = $(".dynamo_content select[name=user]");
			if(select.find("option").size() == 2){
				select.val(select.find("option:last").val());
			}
			if(info.money == info.left) { // restricted based on how much money is in my money
				dynamo.tip.preloaded.show("currency-donate-8", {
					money : info.money
				});
			} else if(info.left == info.max_amount) { // restricted based on max amount per day (money > max_amount and no donations sent today)
				dynamo.tip.preloaded.show("currency-donate-9", {
					max_amount : info.max_amount
				});
			} else { // restricted based on how much already sent today
				dynamo.tip.preloaded.show("currency-donate-10", {
					max_amount : info.max_amount,
					donated : info.donated
				});
			}
		}
	},
	acp : {
		main : function(data) {
			dynamo.tip.prompt.content(function() {
				dynamo.form.create(".dynamo_content", {
					fields : [
						{
							field : {
								type : 'input',
								spec : 'text',
								name : 'name'
							},
							content : {
								label : 'Currency Name',
								placeholder : data.info.name,
								value : data.info.name
							},
							rules : {
								required : true,
								minlength : 3,
								maxlength : 32
							}
						},
						{
							field : {
								type : 'input',
								spec : 'text',
								name : 'symbol'
							},
							content : {
								label : 'Currency Symbol',
								placeholder : data.info.symbol,
								value : data.info.symbol
							},
							rules : {
								required : false,
								maxlength : 10
							}
						},
						{
							field : {
								type : 'input',
								spec : 'number',
								name : 'history_perpage'
							},
							content : {
								label : 'Transaction History Per Page',
								desc : 'Number of rows to show per page on the Transaction History tab.',
								placeholder : data.info.history_perpage,
								value : data.info.history_perpage
							},
							rules : {
								required : true,
								min : 1,
								max : 10
							}
						},
						{
							field : {
								type : 'select',
								name : 'profile',
								options : [
									[1, "Yes", data.info.profile == 1],
									[0, "No", data.info.profile == 0]
								]
							},
							content : {
								label : 'Show ' + dynamo.currency.settings.name + ' in profile?'
							},
							rules : {
								required : true
							}
						}
					],
					submit : {
						to_call : function(data){
							dynamo.tip.prompt.load({
								m : "currency",
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
			}, dynamo.server.modules.currency.name + ' - Admin CP - Main Settings');
		},
		interest : {
			groups : function(data) {
				dynamo.tip.prompt.content(function() {
					var groups = data.info.groups, edit, group_len = groups.length, g;
					
					var rows = [
						{
							cells : [{
								colspan : 3,
								content : 'Please select a group to edit their interest collection settings',
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
								{content : '<a href="javascript:dynamo.currency.acp.interest.request_form(' + groups[g].id + ');">Edit</a>'}
							]
						};
					}
					
					dynamo.table.create(".dynamo_content", {
						colspan : 3,
						rows : rows
					});
					
				}, dynamo.server.modules.currency.name + " - ACP - Interest Settings");
			},
			request_form : function(gid) {
				dynamo.tip.prompt.load({
					m : "currency",
					p1 : "acp",
					p2 : "interest",
					c : "form",
					info : {
						gid : gid
					}
				});
			},
			form : function(data) {
				var gid = data.info.group.id;
				dynamo.tip.prompt.content(function() {
					dynamo.form.create(".dynamo_content", {
						fields : [
							{
								field : {
									type : 'input',
									spec : 'number',
									name : 'rate'
								},
								content : {
									label : 'Rate (%)',
									desc : 'Set to 0 to stop this group from being able to collect interest.',
									placeholder : data.info.rate,
									value : data.info.rate
								},
								rules : {
									required : true,
									min : 0,
									max : 100
								}
							},
							{
								field : {
									type : 'input',
									spec : 'number',
									name : 'every'
								},
								content : {
									label : 'Cooling Period',
									desc : 'Input the number of seconds the user must wait before they can collect interest again.<br /><br />86400 seconds = 1 day',
									placeholder : data.info.every,
									value : data.info.every
								},
								rules : {
									required : true,
									min : 0, // hello inflation
									max : 31557600 // seconds in a year
								}
							},
							{
								field : {
									type : 'input',
									spec : 'number',
									name : 'cap',
									premium : true
								},
								content : {
									label : 'Cap',
									desc : 'This is the maximum a user can earn in one go when collecting interest, regardless of what the interest rate is.<br /><br />Input 0 to remove the cap.',
									placeholder : data.info.cap,
									value : data.info.cap
								},
								rules : {
									required : true,
									min : 0 // no cap
								}
							}
						],
						submit : {
							to_call : function(data){
								dynamo.tip.prompt.load({
									m : "currency",
									p1 : "acp",
									p2 : "interest",
									c : "edit",
									info : $.extend(true, data, {gid : gid})
								});
							},
							value : 'Update Settings',
							inline : false
						}
					});
				}, dynamo.server.modules.currency.name + ' - Admin CP - Interest Settings - ' + data.info.group.name);
			}
		},
		donate : {
			groups : function(data) {
				dynamo.tip.prompt.content(function() {
					var groups = data.info.groups, edit, group_len = groups.length, g;
					
					var rows = [
						{
							cells : [{
								colspan : 3,
								content : 'Please select a group to edit their donation settings',
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
								{content : '<a href="javascript:dynamo.currency.acp.donate.request_form(' + groups[g].id + ');">Edit</a>'}
							]
						};
					}
					
					dynamo.table.create(".dynamo_content", {
						colspan : 3,
						rows : rows
					});
					
				}, dynamo.server.modules.currency.name + " - ACP - Donation Settings");
			},
			request_form : function(gid) {
				dynamo.tip.prompt.load({
					m : "currency",
					p1 : "acp",
					p2 : "donate",
					c : "form",
					info : {
						gid : gid
					}
				});
			},
			form : function(data) {
				var gid = data.info.group.id;
				dynamo.tip.prompt.content(function() {
					dynamo.form.create(".dynamo_content", {
						fields : [
							{
								field : {
									type : 'select',
									name : 'can',
									options : [
										[1, "Yes", data.info.can == 1],
										[0, "No", data.info.can == 0]
									]
								},
								content : {
									label : 'Can donate',
									desc : 'Set to \'yes\' to allow these users to send donations.'
								},
								rules : {
									required : true
								}
							},
							{
								field : {
									type : 'input',
									spec : 'number',
									name : 'times'
								},
								content : {
									label : 'Donations per day',
									desc : 'Set the maximum number of donations each user can make per day. Input 0 to allow unlimited donations per day.',
									placeholder : data.info.times,
									value : data.info.times
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
									name : 'amount'
								},
								content : {
									label : 'Amount per day',
									desc : 'Set the maximum amount that each user can donate per day.<br /><br />Input 0 to remove this restriction.',
									placeholder : data.info.amount,
									value : data.info.amount
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
									name : 'registered',
									premium : true
								},
								content : {
									label : 'Minimum days registered',
									desc : 'Set the amount of days that the user must wait after registering before being able to donate. This feature can be used to restrict newly registered members from donating.',
									placeholder : data.info.registered,
									value : data.info.registered
								},
								rules : {
									required : true,
									min : 0,
									max : 365
								}
							}
						],
						submit : {
							to_call : function(data){
								dynamo.tip.prompt.load({
									m : "currency",
									p1 : "acp",
									p2 : "donate",
									c : "edit",
									info : $.extend(true, data, {gid : gid})
								});
							},
							value : 'Update Settings',
							inline : false
						}
					});
				}, dynamo.server.modules.currency.name + ' - Admin CP - Donation Settings - ' + data.info.group.name);
			}
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
									m : "currency",
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
				}, dynamo.server.modules.currency.name + ' - Admin CP - Edit User');
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
							},
							{
								content : 'Transaction History',
								type : 'th'
							}
						]
					};
					
					for(u = 0; u < uL; u++) {
						user = users[u];
						rows[rows.length] = {
							cells : [
								{content : '<a href="' + main_url + 'profile/' + user.zbid + '">' + user.username + '</a>'},
								{content : '<a href="javascript:dynamo.currency.acp.user.request_form(' + user.zbid + ');">Edit</a>'},
								{
									content : dynamo.server.settings.premium ? '<a href="javascript:dynamo.tip.prompt.ini(\'.dynamo_currency_transactionhistory\', {zbids:[' + user.zbid + '],info:{user_zbid:' + user.zbid + '}});">View</a>' : 'View',
									desc : dynamo.server.settings.premium ? "" : "This is a premium only feature."
								}
							]
						};
					}
					
					dynamo.table.create(".dynamo_content div:first", {
						colspan : 3,
						rows : rows
					});
					
					$(".dynamo_pages_holder").append(prev_page).append(' ').append(next_page);
					
					if(page > 1){
						$(".dynamo_prev_page").bind("click", function() {
							dynamo.tip.prompt.load({
								m : "currency",
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
								m : "currency",
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
					
				}, dynamo.server.modules.currency.name + ' - Admin CP - Edit User - Page ' + page + '/' + total_pages);
			},
			request_form : function(zbid) {
				dynamo.tip.prompt.load({
					m : "currency",
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
									name : 'money'
								},
								content : {
									label : dynamo.currency.settings.name + ' available',
									value : data.info.money,
									placeholder : dynamo.currency.settings.symbol
								},
								rules : {
									required : true,
									fn : function(val) {
										return val == data.info.money ? "You have not changed this value" : "";
									},
									min : 0
								}
							},
							{
								field : {
									type : 'textarea',
									name : 'reason',
									premium : true
								},
								content : {
									label : 'Reason for edit',
									desc : "You must leave a reason for editing this user's " + dynamo.toolbox.lowercase(dynamo.currency.settings.name) + ".<br><br>This message will be visible to anyone who views this user's transaction history."
								},
								rules : {
									maxlength : 150
								},
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
									m : "currency",
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
					
				}, dynamo.server.modules.currency.name + ' - Admin CP - Edit User - ' + data.info.username);
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
								content : 'Please select a group to edit their ' + dynamo.currency.settings.name + '-per-post settings',
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
								{content : '<a href="javascript:dynamo.currency.acp.post.request_form(' + groups[g].id + ');">Edit</a>'}
							]
						};
					}
					
					dynamo.table.create(".dynamo_content", {
						colspan : 3,
						rows : rows
					});
					
				}, dynamo.server.modules.currency.name + " - ACP - " + dynamo.currency.settings.name + " per Post");
			},
			request_form : function(gid) {
				dynamo.tip.prompt.load({
					m : "currency",
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
					var reply_msg = 'Replies to topics (posts) will earn a random amount of ' + dynamo.currency.settings.name + ' between the minimimum and maximum value that you set here.<br /><br />To fix the amount, set the minimum and maximum to the same value.';
					var topic_msg = 'New topics will earn a random amount of ' + dynamo.currency.settings.name + ' between the minimimum and maximum value that you set here.<br /><br />To fix the amount, set the minimum and maximum to the same value.';
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
									value : data.info.reply.min,
									placeholder : dynamo.currency.settings.symbol
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
									value : data.info.reply.max,
									placeholder : dynamo.currency.settings.symbol
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
									value : data.info.topic.min,
									placeholder : dynamo.currency.settings.symbol
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
									value : data.info.topic.max,
									placeholder : dynamo.currency.settings.symbol
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
									m : "currency",
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
				}, dynamo.server.modules.currency.name + ' - Admin CP - ' + dynamo.currency.settings.name + ' per Post - ' + data.info.group.name);
			}
		}
	}
};