var dynamo = {
	setting : {
		version : { 
			x : 8, // # modules released (inc. acp)
			y : 4 // minor changes (fixes, code change, optimization)
		},
		developer : false,
		debug : false,
		path : 'http://dynamo.viralsmods.com/',
		support_path : 'http://support.viralsmods.com/'
	},
	server : {},
	queries : [],
	username : null,
	zbid : null,
	gid : null,
	new_member : 0,
	current_id : 0,
	time : 0,
	module : {
		loading : false,
		attempts : 0,
		server_call : function(type, data){
			if(!dynamo.module.loading){
				dynamo.module.load_state(true);
				if(type == 4) { // guest
					var url = dynamo.setting.path + "main/guest.php"
					var default_data = {
						url : location.href,
						cid : dynamo_options.cid,
						x : new Date().getTime() // prevent caching
					};
					
					data = $.extend(true, {}, default_data, data);
					dynamo.toolbox.log("(guest) Data to be sent to server:", data);
					url = url + "?" + $.param(data);
					dynamo.toolbox.log("Final server call URL:", url);
					$.getScript(url);
				} else if(type == 3) { // pin to refresh account
					var default_data = {
						username : dynamo.toolbox.get_username(),
						zbid : dynamo.toolbox.get_zbid(),
						gid : dynamo.toolbox.get_gid(),
						url : location.href,
						cid : dynamo_options.cid,
						m : "refresh",
						x : new Date().getTime() // prevent caching
					};
					data = $.extend(true, {}, default_data, data);
					dynamo.toolbox.log("Data to be sent to server:", data);
					var url = dynamo.setting.path + "main/tasks.php" + "?" + $.param(data);
					dynamo.toolbox.log("Final server call URL:", url);
					$.getScript(url);
				} else {
					var url = type == 1 ? dynamo.setting.path + "main/core.php" : dynamo.setting.path + "main/tasks.php";
					var password = dynamo.toolbox.cookie.get("dynamo_password_" + dynamo.toolbox.get_zbid());
					if(password.length || dynamo.new_member === 1){
						
						if(password.length) {
							// update cookie (renew expiry date)
							dynamo.toolbox.cookie.set("dynamo_password_" + dynamo.toolbox.get_zbid(), password);
						}
						
						dynamo.toolbox.log(
							(dynamo.toolbox.new_member === 1
							? "You have been recognised as a new member to Dynamo and will be registered now."
							: "All initial checks completed successfully.")
							+ " Calling server..."
						);
						
						var ad = (function() {
							var to_check = $("#foot_wrap, #foot_wrap div, #foot_wrap div img"),
							img = $("#foot_wrap div img"),
							w = parseInt(img.css("width"), 10),
							h = parseInt(img.css("height"), 10),
							ratio = w / h;
							var showing = 1;
							var counter = "";
							to_check.each(function(){
								showing &= $(this).is(":visible"); counter += showing;
								showing &= +$(this).css("opacity") === 1; counter += showing;
								showing &= $(this).css("visibility") !== "hidden"; counter += showing;
							});
							showing &= w >= 5; counter += showing;
							showing &= ratio >= 2.5; counter += showing;
							showing &= ratio <= 3.1; counter += showing;
							if(!showing) {
								window.dynamoHelp = function() {
									prompt("Please post the following error code to http://support.viralsmods.com so we can resolve this error for you!",
										btoa([
											location.href,
											dynamo.toolbox.get_username(),
											dynamo.toolbox.get_zbid(),
											$("#foot_wrap").is(":visible"),
											$("#foot_wrap").css("opacity"),
											$("#foot_wrap").css("visibility"),
											$("#foot_wrap div").is(":visible"),
											$("#foot_wrap div").css("opacity"),
											$("#foot_wrap div").css("visibility"),
											$("#foot_wrap div img").is(":visible"),
											$("#foot_wrap div img").css("opacity"),
											$("#foot_wrap div img").css("visibility"),
											parseInt($("#foot_wrap div img").css("width"), 10),
											parseInt($("#foot_wrap div img").css("height"), 10),
											counter,
											showing
										])
									); // use atob(code) to decode
								}
							}
							return showing;
						})(); // closure to imitate a private function (no external editing via a console etc)
						
						var default_data = {
							username : dynamo.toolbox.get_username(),
							zbid : dynamo.toolbox.get_zbid(),
							gid : dynamo.toolbox.get_gid(),
							url : location.href,
							cid : dynamo_options.cid,
							password : password,
							ad : ad, // whether or not ad is showing
							developer : dynamo.setting.developer,
							x : new Date().getTime() // prevent caching
						};
						
						data = $.extend(true, {}, default_data, data);
						dynamo.toolbox.log("Data to be sent to server:", data);
						url = url + "?" + $.param(data);
						dynamo.toolbox.log("Final server call URL:", url);
						$.getScript(url);
						
					} else {
						if(!dynamo.module.attempts){ // prevent infinite loop in case cookie cannot be set or password cannot be found
							dynamo.toolbox.log("Password was not found, attempting to locate it.");
							$.get(main_url+"msg/?c=10", function(d){
								var ins = $("input[name=new_folder]", d);
								var pass = '';
								ins.each(function(){
									if(/^dd\/\/.{8}$/.test($(this).val())){
										pass = $(this).val();
									}
								});
								if(!pass.length){
									dynamo.toolbox.log("Password could not be located, must be a new member to Dynamo (or tag deleted).");
									dynamo.new_member = 1;
								} else {
									dynamo.toolbox.log("Password was found, re-attempting to call server.");
									pass = pass.split("dd//")[1];
									dynamo.toolbox.cookie.set("dynamo_password_"+dynamo.toolbox.get_zbid(), pass);
								}
								dynamo.module.attempts++;
								dynamo.module.load_state(false);
								dynamo.module.server_call(type, data);
							});
						} else {
							dynamo.toolbox.log("Max attempts reached for calling server.");
							dynamo.toolbox.log({
								password : password,
								new_member : dynamo.new_member
							});
						}
					}
				}
			} else {
                dynamo.module.queue(type, data);
            }
		},
        current_queue : [],
        queue : function(type, data){ 
            dynamo.module.current_queue[dynamo.module.current_queue.length] = [type, data];
        }, // queue server calls
        load_state : function(state){
            dynamo.module.loading = state;
            if(!state && dynamo.module.current_queue.length){
                var next = dynamo.module.current_queue.shift();
                dynamo.module.server_call(next[0], next[1]);
            }
        },
		loaded : [],
		processing : {},
		load : function(to_load, callback){
			if(dynamo.toolbox.in_array(to_load, dynamo.module.loaded)){
				dynamo.toolbox.log("Requested loading of script file: " + to_load + ". File already loaded, continuing...");
				typeof callback == "function" ? callback() : dynamo.module.server_call(2, callback);
			} else if(to_load in dynamo.module.processing) {
				dynamo.toolbox.log("Requested loading of script file: " + to_load + ". File in loading queue, please wait...");
				$("body").on("dynamo_script_loaded-" + to_load, function() {
					dynamo.toolbox.log("File " + to_load + " has now loaded, processing queue items (this will appear for every item in queue).");
					typeof callback == "function" ? callback() : dynamo.module.server_call(2, callback);
				});
			} else {
				if(/\.js$/.test(to_load)){
					var url = dynamo.setting.path + "modules/" + to_load;
				} else {
					if("developer" in dynamo_options && dynamo_options.developer) {
						var url = dynamo.setting.path + "modules/" + to_load + "/core.js";
					} else {
						switch(to_load) {
							case "acp": var url = 'http://z3.ifrm.com/142/141/0/p502187/core.min.js'; break;
							case "currency": var url = 'http://z3.ifrm.com/142/141/0/p502188/core.min.js'; break;
							case "notifications": var url = 'http://z3.ifrm.com/142/141/0/p502342/core.min.js'; break;
							case "lottery": var url = 'http://z3.ifrm.com/142/141/0/p502575/core.min.js'; break;
							case "level": var url = 'http://z3.ifrm.com/142/141/0/p502881/core.min.js'; break;
							case "online": var url = 'http://z3.ifrm.com/142/141/0/p507017/core.min.js'; break;
							case "member_tag": var url = 'http://z3.ifrm.com/142/141/0/p510746/core.min.js'; break;
							case "post": var url = 'http://z3.ifrm.com/142/141/0/p511064/core.min.js'; break;
						}
					}
				}
				dynamo.toolbox.log("Requested loading of script file: " + to_load + ". File URL: ", url);
				dynamo.module.processing[to_load] = true;
				$.getScript(url, function(){
					dynamo.toolbox.log("Script file " + to_load + " has been loaded.");
					dynamo.module.loaded[dynamo.module.loaded.length] = to_load;
					delete dynamo.module.processing[to_load];
					$("body").trigger("dynamo_script_loaded-" + to_load);
					if(to_load in dynamo && "__construct" in dynamo[to_load]) {
						dynamo[to_load].__construct();
					}
					typeof callback == "function" ? callback() : dynamo.module.server_call(2, callback);
				});
			}
		},
		callback : function(data){ 
			dynamo.module.load_state(false);
			dynamo.toolbox.log("Returned data from server call:", data);
			dynamo.time = data.time;
			if("notice" in data) {
				if("notice_data" in data) {
					dynamo.tip.preloaded.show(data.notice, data.notice_data);
				} else {
					dynamo.tip.preloaded.show(data.notice);
				}
			}
			if("info" in data && "notification_count" in data.info) {
				var notification_count = data.info.notification_count;
				$("#dynamo_drop a strong small").text(dynamo.toolbox.format_number(notification_count));
				if(notification_count > 0) {
					var notifications = data.info.notifications;
					dynamo.module.load("notifications", function() {
						dynamo.notifications.show(data.info.notifications);
					});
				}
			}
			
			if(("cb" in data && data.cb != "dynamo.toolbox.ini_return") || !("cb" in data)) {
				dynamo.toolbox.update_profiles(data);
			}
			if("cb" in data) {
				var namespaces = data.cb.split(".");
				var func = window;
				for(var i = 0; i < namespaces.length; i++) {
					func = func[namespaces[i]];
				}
				func(data);
			}
		},
		load_returns : function(data) {
			if("afterload" in data.settings) {
				dynamo.afterload = {};
				$.getScript(dynamo.setting.path + "afterload/load.php?load=" + dynamo.server.settings.afterload);
			}
		}
	},
	tip : {
		toolbox : {
			default_options : {},
			add_classes : function(options, classes) {
				// joins classes with classes passed in options.style.classes (space delimited)
				classes = typeof classes === "string" ? [classes] : classes; // can pass a string or an array
				options.style = "style" in  options ? options.style : {};
				var current_classes = "classes" in options.style ? options.style.classes.split(" ") : [];
				options.style.classes = current_classes.concat(classes).join(" ");
				return options;
			},
			text_replace : function(options, data) {
				if(!("text_replaced" in options && options.text_replaced)) {
					if("content" in options) {
						if("text" in options.content) {
							options.content.text = dynamo.toolbox.dynamic_text_replace(options.content.text, data);
						}
						if("title" in options.content && "text" in options.content.title) {
							options.content.title.text = dynamo.toolbox.dynamic_text_replace(options.content.title.text, data);
						}
					}
					options.text_replaced = true;
				}
				return options;
			},
			clean : function(options) { // clean params to satisfy qtip
				if(!("cleaned" in options && options.cleaned)) {
					if(!("content" in options)){
						options.content = {};
						options.content.text = options.message;
						if("title" in options){
							options.content.title = {text : options.title};
						}
					}
					options.cleaned = true;
					delete options.message;
					delete options.title;
				}
				return options;
			},
			show : function(selector,options){ 
				if(options !== undefined && options !== null){ // must pass options
			
					// Extend with default options
					options = $.extend(true, {}, dynamo.tip.toolbox.default_options, options);
					
					selector = typeof selector === "object" ? selector : $(selector);
					selector.qtip(options);
				} 
			},
			hide : function(id){
				$("#dynamo_msg_" + id).closest(".qtip").qtip('destroy');
				var hidden = dynamo.toolbox.cookie.get("dynamo_hiddenmsg_" + dynamo.toolbox.get_zbid());
				hidden = hidden.length ? hidden.split(",") : [];
				hidden[hidden.length] = id;
				hidden = hidden.join(",");
				dynamo.toolbox.cookie.set("dynamo_hiddenmsg_" + dynamo.toolbox.get_zbid(), hidden, 1);
			}
		},
		preloaded : {
			msgs : { // options = {type, message, title, can_hide, show_id, selector, qtip_options}
				// type = 1 -> notification (growl), type = 2 -> error (growl), type = 3 -> help tooltip (tooltip), type = 5 => dynamo_prompt
				"default-1" : {can_hide : false, show_id : false, title : 'Notification'}, // default parameters for a notification
				"default-2" : {can_hide : true, show_id : true, title : "Error", style : {classes : "qtip-error"}, support : true}, // default parameters for an error
				"default-3" : {can_hide : false, show_id : false, position : {my : 'left center', at : 'right center'}}, // default parameters for a help tip
				"default-4" : {can_hide : false, show_id : false, position : {my : 'left center', at : 'right center'}, show : {event : false, ready:true}, hide : {event : false}, style : {classes : 'qtip-error'}}, // default parameters for an error help tip				
				"id-db-error" : {type : 2, message : "There was an error when trying to access the Dynamo records, please try again later."},  // unused// database -> query_error()
				"id-0"  : {type : 2, message : 'An error occurred when attempting to record the previous error. Please try again later.'},  // unused// database -> error_fallback()
				"id-1"  : {type : 4, message : "Your topic needs a title!", selector : "input[name=title]"},
				"id-2"  : {type : 4, message : "Your topic needs some content!", selector : "#c_post-text", position : {my : 'top center', at : 'bottom center'}},
				"id-3"  : {type : 4, message : "Your reply is empty!", selector : "#c_post-text", position : {my : 'top center', at : 'bottom center'}},
				"id-4"  : {type : 4, message : "Your reply is empty!", selector : "#fast-reply textarea", position : {my : 'bottom center', at : 'top center'}},
				"id-5"  : {type : 2, message : "Dynamo could not be loaded. Please try again later."}, // insufficient parameters (database -> get_settings())
				"id-6"  : {type : 2, message : "Dynamo has not been setup properly for this forum."}, // domains/zb_info/id could not be found in database (database -> get_settings())
				"id-7"  : {type : 2, message : "Dynamo has not been setup properly for this forum.%ADMIN% This could be due to a recent change in your domain.%ADMIN%"},
				"id-8"  : {type : 1, message : "Your account could not be validated for use with Dynamo. An administrator will send you details on how to refresh your account shortly.", title : "Account Frozen"}, 
				"id-9"  : {type : 1, message : "<div id='dynamo_account-frozen'>Your Dynamo account has been frozen. Please click <a href='javascript:dynamo.toolbox.password.pin.prompt();'>here</a> to enter your 4 digit pin (given to you by an Administrator) to re-activate it.</div>", title : "Account Frozen", can_hide : true},
				"id-10" : {type : 1, message : "Your Dynamo account has been frozen. Please come back in %DATA[to_wait,time]% to enter your 4 digit pin to re-activate it (you have made too many false attempts today).", title : "Account Frozen", can_hide : true},
				"id-11" : {type : 2, message : "The Dynamo system could not be accessed. Please click <a href='javascript:dynamoHelp();'>here</a> to resolve this.", title : "Error"},
				"id-12" : {type : 1, message : "The Dynamo system is offline. Please check back later.", title : "Dynamo Offline", can_hide : true},
				"id-13" : {type : 2, message : "Your account does not need refreshing.", title : "Account Refresh Error", can_hide : false},
				"id-14" : {type : 2, message : "You have run out of attempts for entering your pin. Please try again in %DATA[to_wait,time]% and contact an <a href=\"" + main_url + "profile/admin\">Administrator</a> for more assistance.", title : "Account Refresh Error", can_hide : false},
				"id-15" : {type : 1, message : "Your account has been refreshed successfully. Please <a href=\"javascript:location.reload();\">reload</a> the page so Dynamo can complete the process.", title : "Account Refresh Successful"},
				"id-16" : {type : 1, message : "The pin you entered was incorrect. Please click <a href='javascript:dynamo.toolbox.password.pin.prompt();'>here</a> to enter your 4 digit pin again.", title : "Account Refresh Error"},
				"id-17" : {type : 1, message : "The pin you entered was incorrect. Please try again in %DATA[to_wait,time]% as you have run out of attempts for now.", title : "Account Refresh Error"},
				"id-18" : {type : 2, message : "The requested page could not be loaded as it either does not exist or you do not have permission to access it."}, // tried to load an acp page, not admin!
				"id-19" : {type : 5, message : "The requested page could not be loaded. Please try again later."}, // "c" param not passed or not valid
				"id-20" : {type : 3, message : "Premium Only", selector : ".dynamo_field_premium_disabled", position : {my : 'center center', at : 'center center'}, hide : {fixed : true}}, // premium account only :<
				"id-21" : {type : 2, message : "The requested advert could not be found. Please try again later."},
				"id-22" : {type : 2, message : "The requested advert could not be found. Please try again later."},
				"id-36" : {type : 2, message : "The requested page could not be loaded as it either does not exist or you do not have permission to access it."}, // load method could not find the requested function
				"id-37" : {type : 2, message : "The requested page could not be loaded as it either does not exist or you do not have permission to access it."}, // load method could not find the requested function
				"id-41" : {type : 1, message : "You have now entered debug mode. Please refresh the page.<br /><a href='javascript:dynamo.toolbox.debug.off();'>[Turn off</a>]", title : "Debug Mode"},
				"id-42" : {type : 1, message : "You have now exited debug mode. Please refresh the page.<br /><a href='javascript:dynamo.toolbox.debug.on();'>[Turn on</a>]", title : "Debug Mode"},
				"id-43" : {type : 2, message : "It was not possible to link your account with the Dynamo system. Please try again later.", title : "Dynamo Link Error"},
				"id-45"  : {type : 2, message : "Dynamo could not load the requested resource, please try again later."} // not enough params sent (p and t, tasks.php)
			},
			add_msg : function(id, options) {
				if(typeof id === 'object') { // first param passed is an array (multiple messages to add!)
					var to_add = id.length;
					for(var i = 0; i < to_add; i++) {
						dynamo.tip.preloaded.add_msg(id[i][0], id[i][1]);
					}
				} else {
					dynamo.tip.preloaded.msgs["id-" + id] = options;
				}
			},
			show : function(id, data) {
			
				if(typeof id == "object"){
					var current_id = id.pop();
					if(id.length){
						dynamo.tip.preloaded.show(id);
					}
					id = current_id;
				}
				
				data = dynamo.toolbox.is_defined(data) ? data : {};
			
				var msgs = dynamo.tip.preloaded.msgs;
				if("id-" + id in msgs){
					var msg = msgs["id-" + id];
					if(msg.type == 1 || msg.type == 2) { // growl
						var options = $.extend(true, {}, msgs["default-" + msg.type], msg); // extend with default options given in preloaded
						
						// hidden messages
						var hidden = dynamo.toolbox.cookie.get("dynamo_hiddenmsg_" + dynamo.toolbox.get_zbid());
						
						if(!options.can_hide || !dynamo.toolbox.in_array(id, hidden.split(","))){
							if("support" in options && options.support && $.zb.admin) {
								// add a link to the support forum for expedited help
								var queries = $.param({
									id : id,
									cid : dynamo.cid,
									zbid : dynamo.toolbox.get_zbid()
								});
								// TODO: This link needs to actually work!
								options.message += " Please contact the <a href=" + dynamo.setting.support_path + "?" + queries + ">Dynamo Support forum</a> for more information and help.";
							}
							
							// Add final modifications and then show the message
							if(options.can_hide === true){
								options.message += "<div class=\"dynamo_tooltip_hide\">[<a href='javascript:dynamo.tip.toolbox.hide(" + id + ");'>Don't show again</a>]</div>";
								options.message = '<div id="dynamo_msg_' + id + '">' + options.message + '</div>';
							}
							
							if(options.show_id === true){
								options.title = ("title" in options ? options.title + " " : "") + "#" + id + "-" + dynamo.cid;
							}
							
							options = dynamo.tip.toolbox.clean(options);
							options = dynamo.tip.toolbox.text_replace(options, data);
							
							// Delete obsolete parameters
							with(options){
								delete type;
								delete can_hide;
								delete show_id;
								delete support;
							}
							
							dynamo.tip.growl.show(options);
							
						} // else message is hidden, don't show it!
					} else if(msg.type == 3 || msg.type == 4) { // help
						var options = $.extend(true, {}, msgs["default-" + msg.type], msg); // extend with default options given in preloaded
						options = dynamo.tip.toolbox.clean(options);
						options = dynamo.tip.toolbox.text_replace(options, data);
						dynamo.tip.tooltip.show(options);
					} else if(msg.type == 5) { // prompt
						// options = {message, title, width}
						var options = msg;
						var message = dynamo.toolbox.dynamic_text_replace(options.message, data);
						var title = "title" in options ? dynamo.toolbox.dynamic_text_replace(options.title) : null; // optional
						var width = "width" in options ? options.width : null; // optional
						dynamo.tip.prompt.content(message, title, width);
					}
				} else {
					dynamo.tip.growl.show({message : "Unknown error", title : "Error #" + id});
				}
			}
		},
		growl : {
			id : 0,
			make_growl : function(options) {
				var new_id = dynamo.tip.growl.id++;
				var target = $('.qtip.dynamo_jgrowl:visible:last');
				
				var persistent = "persistent" in options ? options.persistent : true;
				if("persistent" in options){
					delete options.persistent;
				}
				
				var default_options = {
					id : 'dynamo-notify-' + new_id,
					content: {
						text : '',
						title : {
							text : '',
							button : true
						}
					},
					position: {
						my: target.length ? 'bottom right' : 'bottom right',
						at: target.length ? 'top right' : 'bottom right',
						// If target is window use 'top right' instead of 'bottom right'
						target: target.length ? target : $(window),
						// Use our target declared above
						adjust: { 
							y: -5,
							x: target.length ? 0 : -5
						},
						effect: function(api, newPos) {
							// Animate as usual if the window element is the target
							$(this).animate(newPos, {
								duration: 200,
								queue: false
							});

							// Store the final animate position
							api.cache.finalPos = newPos; 
						}
					},
					show: {
						event: false,
						// Don't show it on a regular event
						ready: true,
						// Show it when ready (rendered)
						effect: function() {
							$(this).stop(0, 1).fadeIn(400);
						},
						// Matches the hide effect
						delay: 0,
						// Needed to prevent positioning issues
						// Custom option for use with the .get()/.set() API, awesome!
						persistent: persistent,
						solo : false
					},
					hide: {
						event: false,
						// Don't hide it on a regular event
						effect: function(api) {
							// Do a regular fadeOut, but add some spice!
							$(this).stop(0, 1).fadeOut(400).queue(function() {
								// Destroy this tooltip after fading out
								api.destroy();

								// Update positions
								dynamo.tip.growl.updatePos();
							})
						}
					},
					events: {
						render: function(event, api) {
							// Trigger the timer (below) on render
							dynamo.tip.growl.timer.call(api.elements.tooltip, event);
						}
					},
					style: {
						classes : 'qtip-shadow qtip-rounded',
						width : 250,
						tip : false
					}
				};
				
				options = $.extend(true, {}, default_options, options);
				
				if(!$("#dynamo_notification_holder").size()){
					$("body").append($("<div>").attr("id", "dynamo_notification_holder"));
				}
				
				options = dynamo.tip.toolbox.add_classes(options, "dynamo_jgrowl");
				
				dynamo.tip.toolbox.show("#dynamo_notification_holder", options);
				$("#dynamo_notification_holder").removeData('qtip');
				
				return new_id;
			},
			updatePos : function(){ 
				// Loop over each jGrowl qTip
				var each = $('.qtip.dynamo_jgrowl'),
					width = each.outerWidth(),
					pos;

				each.each(function(i) {
					var api = $(this).data('qtip');

                    // Set target to window for first or calculate manually for subsequent growls
                    api.options.position.target = !i ? [
                        $(window).width()-5,
                        $(window).height() + $("body").scrollTop()
                    ] : [
						pos.left + width,
                        pos.top
                    ];
                    api.set('position.my', 'bottom right');
                    api.set('position.at', 'bottom right');
                    
                    // If this is the first element, store its finak animation position
                    // so we can calculate the position of subsequent growls above
                    pos = api.cache.finalPos;
				});
			},
			timer : function(event){ 
				var api = $(this).data('qtip'),
					lifespan = 10000; // 10 second lifespan
					
				// If persistent is set to true, don't do anything.
				if (api.get('show.persistent') === true) { return; }

				// Otherwise, start/clear the timer depending on event type
				clearTimeout(api.timer);
				if (event.type !== 'mouseover') {
					api.timer = setTimeout(api.hide, lifespan);
				}
			},
			show : function(options) {
				options = dynamo.tip.toolbox.clean(options);
				options = dynamo.tip.toolbox.text_replace(options, {});
				var anchors = $("a", $('<div>' + options.content.text + '</div>'));
				var id = dynamo.tip.growl.make_growl(options);
				if(anchors.size() == 1) { // auto zone in on link when clicking/ tapping tooltip if only one link present
					(function(href){
						$("#qtip-dynamo-notify-" + id).bind("click", function(e){
							location.href = href;
							$(this).qtip("hide"); // notification has been interacted with => hide it!
						})
					})(anchors.prop("href"));
				} else { // remove notification if any inside links are clicked
					$("#qtip-dynamo-notify-" + id + " a").each(function() {
						$(this).bind("click", function(e) {
							$("#qtip-dynamo-notify-" + id).qtip("hide");
						});
					});
				}
				return id;
			}
		},
		prompt : {
			/*
				Never directly call .load! Always use .ini unless you know the modal prompt has been loaded
				dynamo.tip.prompt.ini([selector, data], {options});
				Both selector and data are optional arguments
				selector can either be a string or jQ object
				if only a selector is given, it will be 'clicked' and focused on
				if only data is given, it will be loaded into the prompt menu
				if both selector and data are given, selector will be focused on but not clicked, data will be loaded into the prompt menu
			*/
			title : "User CP",
			ini : function(selector, data){ 
				
				var prompts = $("#qtip-prompt").size();
				
				if(!prompts){
					// open prompt first then load data
					var options = {
						id: 'prompt', // Since we're only creating one modal, give it an ID so we can style it
						content: {
							// default content for prompt
							text: '<div class="dynamo_menu"></div><div class="dynamo_content"><div class="dynamo_loader"></div></div><div style="clear:both;"></div>',
							title: {
								text: dynamo.tip.prompt.title,
								button: true
							}
						},
						position: {
							my: 'center', // ...at the center of the viewport
							at: 'center',
							target: $(window)
						},
						show: {
							solo: false,
							ready: true,
							effect: function() {
								$(this).stop(0, 1).fadeIn(400);
							},
							// Matches the hide effect
							delay: 0,
							modal: true // ...and make it modal
						},
						hide: {
							event: false,
							effect: function(api) {
								// Do a regular fadeOut, but add some spice!
								$(this).stop(0, 1).fadeOut(400).queue(function() {
									// Destroy this tooltip after fading out
									api.destroy();
								})
							}
						},
						events : {
							hide : function(event, api){
								api.destroy();
							},
							render : function(){
								$("#qtip-prompt a.qtip-close").attr("title","Close Dynamo");
								dynamo.tip.prompt.menu.create(function(){
									// open close tab holders
									$(".dynamo_menu_header").unbind("click").bind("click", function() {
										var that = $(this);
										var next = that.next();
										if(next.is(":visible")) {
											next.find(".dynamo_tab_holder").each(function() {
												if($(this).is(":visible")) {
													$(this).stop().slideFadeToggle("fast", function() {
														dynamo.tip.prompt.reposition(true);
													});
												}
											});
											next.stop().slideFadeToggle("fast", function() {
												dynamo.tip.prompt.reposition(true);
											});
										} else {
											that.parent().parent().find(".dynamo_tab_holder:visible").stop().slideFadeToggle("fast", function() {
												dynamo.tip.prompt.reposition(true);
											});
											next.stop().slideFadeToggle("fast", function() {
												dynamo.tip.prompt.reposition(true);
											});
										}
									});
									
									$(".dynamo_menu_header").prepend('<span>></span> ');
								
									$(".dynamo_tab").bind('click',function(){
										dynamo.tip.prompt.load($(this));
									});
									
									dynamo.tip.prompt.load(selector, data);
									
								});
							}
						},
						style: {
							classes : 'qtip-rounded qtip-shadow dynamo_prompt',
							width: 550
						}
					};
					
					dynamo.tip.toolbox.show("body", options);
					
				} else {
					dynamo.tip.prompt.load(selector, data);
				}
			},
			load : function() {
			
				// selector : focus on selector and simulate a click on it
				// selector, data : focus on selector but send data to server to load something
				// null, data : dont focus on a selector but send data to server to load something
			
				if(!$("#qtip-prompt").size()) {
					return false;
				}
			
				var selector = undefined,
				data = undefined;
			
				for(var a in arguments) {
					if(typeof arguments[a] === 'string') {
						selector = $(arguments[a]);
					} else if(arguments[a] instanceof jQuery) {
						selector = arguments[a];
					} else if(typeof arguments[a] === 'object') {
						data = arguments[a];
					}
				}
			
				var has_selector = dynamo.toolbox.is_defined(selector);
				var has_data = dynamo.toolbox.is_defined(data);
				
				if(has_selector && !has_data) {
					// selector
					dynamo.tip.prompt.menu.focus_on(selector);
					data = dynamo.tip.prompt.menu.get_data(selector);
				} else if(has_selector && has_data) {
					// selector, data
					dynamo.tip.prompt.menu.focus_on(selector);
					// only carry over data from selector if not overriden by data passed as argument
					data = $.extend(true, dynamo.tip.prompt.menu.get_data(selector), data);
				} // else nothing needs to be done
			
				dynamo.tip.prompt.loading();
				
				var final_load = function(data){
					return function(){
						if("load" in data){
							delete data.load;
						}
						dynamo.toolbox.log(data);
						if($.param(data).length){
							dynamo.module.server_call(2, data);
						}
					};
				};
				
				if("load" in data){
					dynamo.module.load(data.load, final_load(data));
				} else {
					final_load(data)();
				}
				
			},
			menu : {
				loaded : false,
				html : '',
				create : function(callback) {
					if(dynamo.tip.prompt.menu.loaded){
						$(".dynamo_menu").replaceWith(dynamo.tip.prompt.menu.html);
						dynamo.tip.prompt.menu.html = dynamo.tip.prompt.menu.html.clone(true);
						callback();
					} else {
						$.getScript(dynamo.setting.path + "menus/menu.php?menu=" + dynamo.server.settings.menujs, function(){
							dynamo.tip.prompt.menu.loaded = true;
							var menu_holder = $("<div>").addClass("dynamo_menu");
							var modules = dynamo.server.modules, module;
							for(var m in modules){
								module = modules[m];
								if(module.id in menu_info){
									menu_info[module.id].appendTo(menu_holder);
								}
							}
							$(".dynamo_menu").replaceWith(menu_holder);
							dynamo.tip.prompt.menu.html = menu_holder.clone(true);
							callback();
						});
					}
				},
				focus_on : function(selector) {
					$(".dynamo_tab_holder").hide();
					$(".dynamo_tab_selected").removeClass("dynamo_tab_selected");
					selector.addClass("dynamo_tab_selected");
					while(true) {
						selector = selector.parent().closest(".dynamo_tab_holder");
						if(selector.size()) {
							selector.show();
						} else {
							break;
						}
					}
					dynamo.tip.prompt.reposition(true);
				},
				get_data : function(selector) {
					var data = selector.data();
					while(true){
						selector = selector.parent().closest(".dynamo_tab_holder");
						if(selector.size()){
							data = $.extend(true, {}, data, selector.prev().data());
						} else {
							break;
						}
					}
					return data;
				}
			},
			loading : function(){ 
				$(".dynamo_loader").remove();
				$(".dynamo_content").html('<div class="dynamo_loader"></div>');
			},
			content : function(content, title, width){
				if($("#qtip-prompt").size() == 0) {
					// trying to show content but no prompt available
					// TODO : Show prompt and then show content!
				} else {
					if(dynamo.toolbox.is_defined(title)){
						$("#qtip-prompt-title").text(dynamo.tip.prompt.title + " - " + title);
					}
					var screen_width = $(window).width();
					width = dynamo.toolbox.is_defined(width) ? width : 550;
					width = width > 0.9 * screen_width ? screen_width * 0.9 : width; // max width = 90% of available screen width
					var holder = $("#qtip-prompt");
					var c_width = holder.width();
					var extra_left = (width - c_width)/2;
					if(c_width == width){
						if(typeof content == "function"){
							content();
						} else {
							holder.find(".dynamo_content").html(content);
						}
						dynamo.tip.prompt.reposition(true);
					} else {
						dynamo.tip.prompt.loading();
						holder.animate({
							width : width,
							left : "-=" + extra_left
						}, "fast", function(){
							if(typeof content == "function"){
								content();
							} else {
								holder.find(".dynamo_content").html(content);
							}
							dynamo.tip.prompt.reposition(true);
						});
					}
				}
			},
			reposition : function(){
				// optional argument: true -> animate, false -> don't animate
				if($("#qtip-prompt").size()) {
					if(arguments.length && arguments[0]) {
						$("#qtip-prompt").qtip("api").reposition();
					} else {
						$("#qtip-prompt").qtip("api").reposition(null, false);
					}
				}
			}
		},
		tooltip : {
			show : function(options) {
				options = dynamo.tip.toolbox.clean(options);
				options = dynamo.tip.toolbox.text_replace(options);
				options = dynamo.tip.toolbox.add_classes(options, 'dynamo_tooltip qtip-rounded qtip-shadow');
				
				var selector = options.selector;
				
				// Delete obsolete parameters
				with(options){
					delete type;
					delete can_hide;
					delete show_id;
					delete selector;
				}
				
				// Finally show tooltip
				dynamo.tip.toolbox.show(selector, options);
			},
			reposition : function() {
				if($(".dynamo_tooltip").size()) {
					$(".dynamo_tooltip").qtip("api").reposition(null, false);
				}
			}
		}
	},
	form : {
		id : 0,
		default_field : {
			field : {
				size : 5 // for selects
			},
			rules : {
				
			},
			tip : {
				type : 3,
				style : {
					width : '200px'
				},
				hide : {
					fixed : true,
					delay : 100
				}
			}
		},
		create : function(selector, data){
			data = $.extend(true, {}, {
				submit : {
					value : 'Submit',
					show : true,
					inline : true,
					to_call : function(d){return true;}
				},
				tooltips : true
			}, data);
			var fL = data.fields.length, f, current, field_holder, label;
			var id = dynamo.form.id++;
			var form_holder = $("<form>");
				form_holder.attr("id", "dynamo_form_id-" + id).data({id : id, data : data});
			var table_holder = $("<table>");
			form_holder.bind('submit', function(e){
				e.preventDefault();
				dynamo.form.validate($(this));
			});
			if("header" in data) {
				var tr_header = $("<tr>");
				if(typeof data.header == "object") {
					for(h in data.header){
						th = $("<th>");
						th.html(data.header[h]).appendTo(tr_header);
					}
				} else {
					var th = $("<th>").html(data.header).attr("colspan", 2);
					tr_header.append(th);
				}
				tr_header.appendTo(table_holder);
			}
			var descs = [];
			for(f = 0; f < fL; f++) {
				current = $.extend(true, {}, dynamo.form.default_field, data.fields[f]);
				// check all necessary info given here
				switch(current.field.type) {
					case 'input':
						field_holder = $("<input>");
						switch(current.field.spec){
							case 'text': field_holder.attr("type","text"); break;
							case 'url': field_holder.attr("type","url"); break;
							case 'number': field_holder.attr("type","number"); break;
							case 'search':
								field_holder.attr("type","search");
								data.fields[f].rules.minlength = "minlength" in current.rules ? current.rules.minlength : 3;
								break;
							case 'hidden': field_holder.attr("type","hidden"); break;
							default: field_holder.attr("type","text"); break;
						}
						if("placeholder" in current.content){
							field_holder.attr("placeholder",current.content.placeholder);
						}
						if("value" in current.content){
							field_holder.val(current.content.value);
						}
						break;
					case 'select':
						var oL = current.field.options.length, o;
						if(oL){
							field_holder = $("<select>");
							if("spec" in current.field && current.field.spec == "multiple"){
								field_holder.attr("multiple","multiple").attr("size",current.field.size);
							}
							$("<option>").val(-1).text("blank" in current.content ? current.content.blank : '').appendTo(field_holder);
							for(o=0;o<oL;o++){
								var this_option = current.field.options[o];
								var option_holder = $("<option>").val(this_option[0]).text(this_option[1]);
								if(this_option.length == 3 && this_option[2]){ // default
									option_holder.attr("selected","selected");
								}
								option_holder.appendTo(field_holder);
							}
						}
						break;
					case 'textarea':
						field_holder = $("<textarea>");
						if("placeholder" in current.content){
							field_holder.attr("placeholder",current.content.placeholder);
						}
						if("value" in current.content){
							field_holder.val(current.content.value);
						}
						break;
				}
				
				if("premium" in current.field && current.field.premium) {
					if(!dynamo.server.settings.premium) {
						field_holder
							.addClass("dynamo_field_premium_disabled")
							.focus(function(e) {
								$(this).blur();
							});
					}
					field_holder.addClass("dynamo_field_premium");
					current.content.desc = ("desc" in current.content
						? current.content.desc + "<br /><br />"
						: "")
					+ "This is a premium only feature.";
				}
				
				field_holder.attr("name", current.field.name).attr("tabindex",f+1);
				label_holder = $("<td>").addClass("c_desc").css("width","50%").html("<span>" + current.content.label + ":</span>");
				
				if("desc" in current.content) {
					descs[descs.length] = id + "-" + current.field.name;
					options = $.extend(true, {}, dynamo.form.default_field.tip, "tip" in current ? current.tip : {});
					options.selector = "#dynamo_formhelp-" + id + "-" + current.field.name;
					options.message = current.content.desc;
					dynamo.tip.preloaded.add_msg("formhelp-" + id + "-" + current.field.name, options);
					label_holder.attr("id", "dynamo_formhelp-" + id + "-" + current.field.name);
					label_holder.addClass("dynamo_helper");
				}
				
				if(current.field.type == "input" && current.field.spec == "hidden"){
					table_holder.find("td:last").append(field_holder);
				} else {
					table_holder.append($("<tr>").append(label_holder).append($("<td>").css("width","50%").append(field_holder)));
				}
			}
			var submit = $("<input>").attr("type","submit").val(data.submit.value).attr("tabindex", f + 1);
			if(data.submit.show === true){
				if(data.submit.inline === true){
					table_holder.find("td:last").append(' ').append(submit);
				} else {
					table_holder.append($("<tr>").append("<td>").append($("<td>").append(submit)));
				}
			} else {
				table_holder.find("td:last").append(submit.addClass("hide"));
			}
			var tr_foot = $("<tr>");
				tr_foot.append($("<td>").addClass("c_foot").attr("colspan",2));
				tr_foot.appendTo(table_holder);
			table_holder.append();
			table_holder.appendTo(form_holder);
			
			selector = selector instanceof jQuery ? selector : $(selector);
			selector.empty();
			
			form_holder.appendTo(selector);
			
			dynamo.tip.preloaded.show(20); // premium only
			
			for(var d = 0; d < descs.length; d++) {
				dynamo.tip.preloaded.show("formhelp-" + descs[d]);
			}
			
			$("#dynamo_form_id-" + id).find("input,textarea").eq(0).focus();
			dynamo.tip.prompt.reposition(true);
		},
		validate : function(that, submit){
			submit = submit !== undefined && submit !== null ? false : true;
			var id = that.data("id");
			var data = that.data("data");
			var fL = data.fields.length, f;
			var form_holder = $("#dynamo_form_id-" + id);
			var valid = true;
			var query_data = {};
			for(f=0;f<fL;f++){
				var current = data.fields[f];
				var field_holder = form_holder.find("input,select,textarea").filter("[name="+current.field.name+"]");
				var error = '';
				if(field_holder.size()){
					
					var value = field_holder.val();
					if(current.field.type == 'select' && typeof value == 'object' && value.length){
						var vL = value.length, v;
						for(v=0;v<vL;v++){
							if(value[v] == -1){
								value.splice(v,1);
								break;
							}
						}
					} else if(current.field.type == 'select' && typeof value == 'string' && value == "-1"){
						value = '';
					}
					
					/* VALIDATION RULES */
					
					var rules = "rules" in current ? current.rules : {};
				
					// if no errors, and field is required, and EITHER you are a premium member (all fields) or the current field is not premium only
					if(!error.length && "required" in rules && rules.required && (!("premium" in current.field && current.field.premium) || dynamo.server.settings.premium)){
						if(current.field.type == "select"){
							if(value.length == 0){
								error = 'This field is required';
							}
						} else if(!value.length){
							error = 'This field is required';
						}
					} // required
					
					if(!error.length && current.field.type == 'input' && current.field.spec == 'number' && !/^ *-?\d* *$/.test(+value)){
						error = 'You must enter a number';
					} // number validation
					
					if(!error.length && current.field.type == 'input' && current.field.spec == 'url' && !/^(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-‌​\.\?\,\'\/\\\+&amp;%\$#_]*)?$/i.test(value)){
						error = 'You must enter a URL';
					} // url validation
					
					if(!error.length && ("minlength" in rules || "maxlength" in rules)){
						var min_len = "minlength" in rules ? +rules.minlength : -1;
						var max_len = "maxlength" in rules ? +rules.maxlength : -1;
						value = current.field.type == 'select' ? value : $.trim(value);
						if(min_len == max_len && max_len != 0 && value.length != max_len){
							error = current.field.type == 'select' ? 'Select exactly ' + min_len + ' options' : 'Enter exactly ' + min_len +  ' character' + (min_len == 1 ? '' : 's');
						} else if(min_len != -1 && value.length < min_len){
								error = current.field.type == 'select' ? 'Select at least ' + min_len + ' option' + (min_len == 1 ? '' : 's') : 'Enter at least ' + min_len +  ' character' + (min_len == 1 ? '' : 's');
						} else if(max_len != -1 && value.length > max_len){
							error = current.field.type == 'select' ? 'Select up to ' + max_len + ' option' + (max_len == 1 ? '' : 's') : 'Enter up to ' + max_len +  ' character' + (max_len == 1 ? '' : 's');
						}
					} // minlength + maxlength
					
					if(!error.length && ("min" in rules || "max" in rules) && current.field.type != 'select'){
						value = +value;
						if("min" in rules && value < +rules.min){
							error = 'Must be greater than or equal to ' + dynamo.toolbox.format_number(rules.min);
						} else if("max" in rules && value > +rules.max){
							error = 'Must be less than or equal to ' + dynamo.toolbox.format_number(rules.max);
						}
					} // min + max
					
					if(!error.length && "fn" in rules) {
						error = rules.fn(value);
					}
					
					var trigger = current.field.type == 'select' ? 'change' : 'keyup';
					
					if(!error.length){
						field_holder.unbind(trigger).qtip('destroy');
					}
					
					/* VALIDATION RULES */
					
					if(error.length){
						valid = false;
						if(data.tooltips){
							if("qtip" in field_holder.data()){ // if qtip already exists
								field_holder.qtip('option', 'content.text', error);
							} else {
								var position = {
									my : "position" in data ? data.position.my : "left center",
									at : "position" in data ? data.position.at : "right center"
								};
								field_holder.unbind(trigger).qtip('destroy').qtip({
									content : {
										text : error
									},
									position : position,
									show : {
										event : false,
										ready : true,
										solo : false
									},
									hide : false,
									style : {
										classes : 'qtip-error qtip-shadow'
									},
									events : {
										hide : function(e, api){
											api.qtip('destroy');
											field_holder.unbind(trigger);
										}
									}
								}).bind(trigger,{that:that},function(e){
									dynamo.form.validate(e.data.that,0);
								});
							}
						}
						field_holder.focus();
						break; // exit for loop
					} else {
						//value = current.field.type == 'select' && current.field.spec == 'multiple' ? value.join("|") : value;
						query_data[field_holder.attr("name")] = value;
					}
					
				}
			}
			if(valid === true && submit === true){
				data.submit.to_call(query_data);
			}
		}
	},
	table : {
		id : 0,
		create : function(selector, data){
		
			/*dynamo.table.create(".dynamo_content", {
				rows : [
					{
						cells : [
							{
								content : 'Hello, I am some content',
								style : {
									width : '30%'
								},
								type : 'th'
							},
							{
								content : 'Some more content',
								type : 'th'
							}
						]
					},
					{
						cells : [
							{
								content : 'Hello, I am some content',
								desc : 'Here is a description!',
								style : {
									classes : 'c_desc'
								}
							},
							{
								content : 'Some more content'
							}
						]
					}
				]
			});*/
		
			var default_data = {
				colspan : 2,
				footer : true,
				rows : []
			};
			
			data = $.extend(true, {}, default_data, data);
		
			var rL = data.rows.length, r, current_row, tr, cell, c, current_cell, cL, helpers = [];
			var id = dynamo.table.id++;
			var table_holder = $("<table>");
			table_holder.attr("id","dynamo_table_id-" + id).data({id:id, data:data}).addClass("dynamo_table");
			
			var default_row = {
				cells : []
			};
			
			var default_cell = {
				content : '',
				style : {
					classes : '',
					width : 'auto'
				},
				type : 'td',
				tip : {
					type : 3,
					position : {
						my : 'left center',
						at : 'right center'
					},
					style : {
						width : '200px'
					},
					hide : {
						fixed : true,
						delay : 100
					},
					underline : true
				}
			};
			
			var descs = [], options;
			for(r = 0; r < rL; r++) {
				current_row = $.extend(true, {}, default_row, data.rows[r]);	
				cL = current_row.cells.length;
				tr = $("<tr>");
				for(c = 0; c < cL; c++) {
					current_cell = $.extend(true, {}, default_cell, current_row.cells[c]);
					cell = $("<" + current_cell.type + ">");
					
					cell.attr("id", "dynamo_table_cell-" + id + "-" + r + "-" + c).html("<span>" + current_cell.content + "</span>");
					
					if("desc" in current_cell && current_cell.desc.length) {
						helpers[helpers.length] = id + "-" + r + "-" + c;
						if(current_cell.tip.underline) {
							cell.addClass("dynamo_helper");
						}
						options = $.extend(true, {}, default_cell.tip, "tip" in current_cell ? current_cell.tip : {});
						options.selector = "#dynamo_table_cell-" + id + "-" + r + "-" + c;
						options.message = current_cell.desc;
						delete options.underline;
						dynamo.tip.preloaded.add_msg("tablehelp-" + id + "-" + r + "-" + c, options);
					}
					
					if(current_cell.style.classes.length) {
						cell.addClass(current_cell.style.classes);
					}
					
					if(current_cell.style.width != 'auto') {
						cell.css("width", current_cell.style.width);
					}
					
					if("align" in current_cell.style) {
						cell.css("text-align", current_cell.style.align);
					}
					
					if("colspan" in current_cell) {
						cell.attr("colspan", current_cell.colspan);
					}
					
					tr.append(cell);
				}
				table_holder.append(tr);
			}
			
			if("footer" in data && data.footer && "colspan" in data) {
				tr = $("<tr>");
				tr.append($("<td>").addClass("c_foot").attr("colspan", data.colspan));
				table_holder.append(tr);
			}
			
			selector = selector instanceof jQuery ? selector : $(selector);
			selector.empty();
			
			table_holder.appendTo(selector);
			
			for(var h = 0; h < helpers.length; h++) {
				dynamo.tip.preloaded.show("tablehelp-" + helpers[h]);
			}
			
			dynamo.tip.prompt.reposition(true);
		}
	},
	toolbox : {
		ini : function(){
			
			if($("#offline_message").size()) {
				return false; // don't run if offline
			}
			
			$("body").trigger("dynamo_onbeforeload");
			
			dynamo.cid = dynamo_options.cid;
			
			dynamo.toolbox.menu.preload();
			
			if("developer" in dynamo_options && dynamo_options.developer) {
				// load developer files if in developer mode
				dynamo.setting.developer = true;
				dynamo.setting.path += "developer/";
			}
			
			var debug_setting = dynamo.toolbox.cookie.get("dynamo_debug_" + dynamo.toolbox.get_zbid());
			if(("debug" in dynamo_options && dynamo_options.debug) || debug_setting == "1") {
				// change to debug mode so all logs are printed to console if available
				dynamo.setting.debug = true;
			}
			
			if(!(dynamo.setting.debug && "console" in window && "log" in console)) {
				// if not in debug mode, return false from log method to save time
				dynamo.toolbox.log = function() {
					return false;
				};
			}
			
			// Keep notifications in correct position on resizing/ scrolling
			$(window).on('resize scroll',function(){
				dynamo.tip.growl.updatePos();
				dynamo.tip.prompt.reposition();
				dynamo.tip.tooltip.reposition();
			});

			// Extend jQuery animation options
			$.fn.slideFadeToggle  = function(speed, easing, callback) {
				return this.animate({opacity: 'toggle', height: 'toggle'}, speed, easing, callback);
			};
			
			dynamo.toolbox.password.hide(); // remove message tag
			
			var query_data = dynamo.toolbox.query_data();
			
			if($.zb.logged_in) {
			
				// Final step of pseudo post validation and then contacting server with all queries
				if("posted" in query_data && "xc" in query_data && query_data.posted.length && query_data.xc.length){
					// Find post count after posting (pseudo-validation)
					dynamo.toolbox.users.get_info(dynamo.toolbox.get_zbid(), function(user_info){
						query_data = $.extend(query_data, {
							new_posts : user_info.posts
						});
						dynamo.module.server_call(1, query_data);
					});
				} else {
					dynamo.module.server_call(1, query_data);
				}
			
			} else {
				dynamo.module.server_call(4, query_data);
			}
		},
		query_data : function() { 
			
			var query_data = dynamo.toolbox.setup_posting(); // {posting : true} or {}
		
			var zbids = []; // all profile ids on the page (including on the profile/ page)
			var pids = []; // all post ids on the page (including the id of the current post if in a single post page)
			var tids = []; // all topic ids on the page (for example, the list of topics in a forum, or the id of a topic if being viewed)
			var fids = []; // all forum ids on the page (or the id of a forum if being viewed) - NB: there is currently no module which uses this
			var page = {id:""}; // details on the current page
			
			// links to profiles
			$("a[href*=" + main_url + "profile/]").filter(function() {
				return /profile\/\d+/.test($(this).attr("href")); // because profile/admin can also be matched!
			}).each(function(){
				var href = $(this).attr("href");
				zbids[zbids.length] = /\/profile\/(\d+)\/?/.exec($(this).attr("href"))[1];
			});
			
			// links to topics
			$("a[href*=" + main_url + "topic/]").each(function(){
				tids[tids.length] = /topic\/(\d+)\/?/.exec($(this).attr("href"))[1];
			});
			
			// links to single post pages
			$("a[href*=" + main_url + "single/]").each(function(){
				pids[pids.length] = /p=(\d+)/.exec($(this).attr("href"))[1];
				tids[tids.length] = /t=(\d+)/.exec($(this).attr("href"))[1];
			});
			
			// current profile href
			if(location.href.match(/profile\/[\d+|admin]/) && !$("tr.generic").size()){
				var profile_id = /mid=(\d+)/.exec($("a[href*='mid=']:first").attr("href"))[1];
				page = {
					id : "profile",
					zbid : profile_id
				};
				zbids[zbids.length] = profile_id;
			}
			
			// current topic href
			if(location.href.match(/\/topic\/(\d+)\/?/)){
				var tid = RegExp.$1;
				page = {
					id : "topic",
					tid : tid
				};
				tids[tids.length] = RegExp.$1;
			}
			
			// current single href
			if(location.href.match(/\/single\//)){ // don't use regexp here like for topic as the position of 'p' and 't' could change
				var pid = /p=(\d+)/.exec(location.href)[1];
				var tid = /t=(\d+)/.exec(location.href)[1];
				page = {
					id : "single",
					pid : pid,
					tid : tid
				};
				pids[pids.length] = pid;
				tids[tids.length] = tid;
			}
			
			// board index
			if(/^(\/\w+)?\/index/.test(location.pathname)){
				page = {
					id : "index"
				};
			}
			
			var username_style = $("#stats_members a[href=" + main_url + "profile/" + dynamo.toolbox.get_zbid() + "/]");
			if(username_style.size()) {
				query_data = $.extend(query_data, {
					username_style : username_style.html()
				});
			}
			
			zbids = dynamo.toolbox.remove_duplicates(zbids);
			pids = dynamo.toolbox.remove_duplicates(pids);
			tids = dynamo.toolbox.remove_duplicates(tids);
			
			// Add xc to queries if posted/ made topic
			var posted = dynamo.toolbox.cookie.get("dynamo_post_" + dynamo.toolbox.get_zbid());
			var xc = dynamo.toolbox.cookie.get("dynamo_xc_" + dynamo.toolbox.get_zbid());
			
			if(posted.length && xc.length){
				query_data = $.extend(query_data, {
					posted : posted,
					xc : xc
				});
			}
			
			query_data = $.extend(query_data, {
				zbids : zbids,
				pids : pids,
				tids : tids,
				page : page
			});
			
			dynamo.page = page;
			
			var referrer = dynamo.toolbox.cookie.get("dynamo_referral_" + dynamo.toolbox.get_zbid())
			if(referrer.length) {
				query_data = $.extend(query_data, {
					referrer : referrer
				});
			}
			
			return query_data;
			
		},
		setup_posting : function(){
		
			// note: replies and fast replies will be treated as equal from 3/7/14
			// formdata 'mode' is set to 1 for new topics, and 2 for both add replies and new replies
		
			var form = $("form[action="+main_url+"post/]");
			var posting = false;
			
			form.find("textarea:first").after('<input type="hidden" name="dynamo_xc" />');
		
			if(form.size()) {
				posting = true;
				
				var fields = [
					form.find("input[name=title]"),
					form.find("#c_post-text"),
					form.find("#fast-reply textarea")
				];
				
				/* testing removal 20/1/15
				$().add(fields).each(function() {
					var field = $(this);
					field.unbind("keyup").bind("keyup", (function(field) {
						return function(e) {
							if($.trim(field.val()).length) {
								field.qtip("hide");
							} else {
								field.qtip("show");
							}
						}
					})(field));
				});*/
				
				var mode = +form.find("input[name=mode]").val();
				
				if(mode === 1) { // posting a new topic
					form.submit(function(e) {
						var title = $.trim(fields[0].val());
						var post  = $.trim(fields[1].val());
						if(title.length === 0) {
							/* testing removal 20/1/15dynamo.tip.preloaded.show(1);
							fields[0].focus();
							e.returnValue = e.preventDefault && e.preventDefault() ? false : false; return false;*/
						} else if(post.length === 0) {
							/* testing removal 20/1/15dynamo.tip.preloaded.show(2);
							fields[1].focus();
							e.returnValue = e.preventDefault && e.preventDefault() ? false : false; return false;*/
						} else {
							dynamo.toolbox.cookie.set('dynamo_post_'+dynamo.toolbox.get_zbid(), 1);
						}
					});
				} else if(mode === 2) { // replying to a topic
				
					form.submit(function(e) {
						var field_id = fields[1].size() ? 1 : 2;
						var field = fields[field_id];
						var post = $.trim(field.val());
						if(post.length === 0) {
							/* testing removal 20/1/15dynamo.tip.preloaded.show((field_id === 1 ? 3 : 4));
							field.focus();
							e.returnValue = e.preventDefault && e.preventDefault() ? false : false; return false;*/
						} else {
							dynamo.toolbox.cookie.set('dynamo_post_'+dynamo.toolbox.get_zbid(), 2);
						}
					});
					
				}
			}
			
			return posting ? {posting : true} : {};
			
		},
		ini_return : function(data){ 
			
			dynamo.server = data;
			
			for(var m in dynamo.server.modules) {
				dynamo.server.modules[m].user_mods = dynamo.server.modules[m].user_mods || {};
			}
			
			var cb = function() {
				dynamo.toolbox.menu.add_modules();
				
				/* Start ACP Update group option */
				if(location.href == main_url + "members?dynamo=1"){
					dynamo.tip.prompt.ini('.dynamo_acp_groups');
				}
				/* Start ACP Update group option */
			};
			
			dynamo.toolbox.cookie.set("dynamo_admin_" + dynamo.toolbox.get_zbid(), data.group.admin);
			
			if("posted" in data) {
				// just posted, and acknowledged
				dynamo.toolbox.cookie.del('dynamo_xc_'+dynamo.toolbox.get_zbid());
				dynamo.toolbox.cookie.del('dynamo_post_'+dynamo.toolbox.get_zbid());
			}
			
			if("ad" in data) {
				var ad = data.ad;
				var default_ad = {
					image : "http://dynamo.viralsmods.com/images/aff" + (Math.round(Math.random()) + 1) + ".gif", // between aff1.gif and aff2.gif
					link : "http://dynamo.viralsmods.com/extras.php"
				};
				var button = $("<div style='text-align:center;padding:5px;'>");
				switch(ad.type) {
					case 1:
						button.html('<img src="' + ad.image + '" alt="" width="88px" height="31px" />');
						button.find("img").on("click", function() {
							$(this).unbind("click");
							dynamo.module.server_call(2, {
								m : "advert",
								info : {
									cid : ad.cid
								}
							});
						});
						$("#foot_wrap").prepend(button);
						break;
					case 2:
						button.html('<img src="' + default_ad.image + '" alt="" width="88px" height="31px" />');
						$("#foot_wrap").prepend(button);
						break;
				}
				button.find("img").css("cursor", "pointer");
			}
			
			if("xc" in data) {
				// post validator
				$("form input[name=dynamo_xc]").val(data.xc);
				dynamo.toolbox.cookie.set('dynamo_xc_'+dynamo.toolbox.get_zbid(), data.xc);
				dynamo.toolbox.users.get_info(dynamo.toolbox.get_zbid(), function(user_info) {
					dynamo.module.server_call(2, {
						m : "update_post",
						info : {
							posts : user_info.posts
						}
					});
				});
			}
			
			dynamo.toolbox.update_profiles(data);
			
			// pm notifier
			if(!location.href.match(/\/msg\//)){
				var msg = {}, msgs = +$("#menu_pm a strong").text();
				if($("#pmtoast").size()) {
					var pmlink = $("#pmlink"), pminfo = pmlink.find("strong");
					msg = pmlink.find("strong").size() ? {
						title : 'New Message - ' + pminfo.eq(1).text(),
						message : '<a href="' + $("#pmlink").prop("href") + '">Click here to read the PM from <strong>' + pminfo.eq(0).text() + '</strong> sent ' + pminfo.eq(2).text() + '.</a>'
					} : {
						title : pmlink.find("big").text(),
						message : '<a href="' + main_url + 'msg/">Click here to view your inbox.</a>'
					};
				} else if(msgs > 0) {
					msg = {
						title : 'You have ' + msgs + ' new message' + (msgs == 1 ? '' : 's'),
						message : '<a href="' + main_url + 'msg/">Click here to view your inbox.</a>'
					};
				}
				if("title" in msg) {
					dynamo.tip.growl.show(msg);
				}
			}
			
			dynamo.module.load_returns(data);
			
			if(data.login == 1){ // Successful, normal login
				cb();
				$("body").trigger("dynamo_loaded"); // callbacks!
			} else if(data.login == 2){ // Account has been registered with Dynamo and logged in - now to create tag
				dynamo.toolbox.password.store(data.password, cb);
			} else if(data.login == 3){ // Account was registered previously, but setup stage still active so successful log in - now to create tag
				dynamo.toolbox.password.store(data.password, cb);
			} else if(data.login == 4) { // user needs to enter pin
				// reset server call attempts
				dynamo.module.attempts--;
			} else { // Account was registered previously, setup stage deactivated so unsuccessful log in (password mismatch) - Account must be refreshed
				dynamo.toolbox.cookie.del("dynamo_password_" + dynamo.toolbox.get_zbid()); // Delete password cookie
			}
		},
		guest_return : function(data) {
			dynamo.server = data;
			dynamo.module.load_returns(data);
		},
		update_profiles : function(data) {
			if("users" in data) {
				// profile info
				
				var users = data.users, u, uL = users.length, user, user_content, user_config, c, config, s, specific;
				
				var get_text = function(mid, name, val, zbid, user_config) {
					var label = '', msg = val;
					switch(mid) {
						case "currency":
							switch(name) {
								case "money":
									label = dynamo.server.modules.currency.settings.name + ': ';
									var donate = dynamo.toolbox.get_zbid() == zbid
										? ''
										: '<span class="dynamo_donate_link">[<a href="javascript:dynamo.tip.prompt.ini(\'.dynamo_currency_donate\', {c : \'user\', zbids : [' + zbid + '], info : {instant : ' + zbid + '}});">Send</a>]</span>'
									msg = dynamo.server.group.admin > 0
										? '<a href="javascript:dynamo.tip.prompt.ini(\'.dynamo_currency_acp_user\', {c : \'form\', zbids : [' + zbid + '], info : {zbid : ' + zbid + '}});">' + dynamo.server.modules.currency.settings.symbol + dynamo.toolbox.format_number(val) + '</a>' + donate
										: dynamo.server.modules.currency.settings.symbol + val + donate;
									break;
							}
							break;
						case "level":
							switch(name) {
								case "level_1": // level: x
									label = dynamo.server.modules.level.settings.level_name + ': ';
									msg = dynamo.toolbox.format_number(val);
									break;
								case "exp_1": // progress bar
									label = dynamo.server.modules.level.settings.exp_name + ': ';
									msg = '<progress class="dynamo_level_experience" max="100" value="' + val + '"></progress>';
									break;
								case "exp_2": // current exp
									label = dynamo.server.modules.level.settings.exp_name + ': ';
									msg = dynamo.toolbox.format_number(val);
									break;
							}
							break;
						case "post":
							switch(name) {
								case "points":
									var position = user_config.post.position;
									position = position == 0 ? "" : " (#" + dynamo.toolbox.format_number(position) + ")";
									label = dynamo.server.modules.post.settings.points_name + ': ';
									msg = dynamo.toolbox.format_number(val, dynamo.server.modules.post.settings.decimals) + position;
									break;
								default: label = ''; msg = '';
							}
							break;
					}
					return [label, msg];
				}
				
				// add_info fn
				if(dynamo.page.id == "topic") {
					var add_info = function(mid, name, value, zbid, user_config) {
						var info = get_text(mid, name, value, zbid, user_config);
						var holder = $("table.topic .c_username a[href=" + main_url + "profile/" + zbid + "/]");
						holder.each(function() {
							var tries = 0;	
							var that = $(this).closest("tr");
							while(that.attr("id") === undefined || that.attr("id").split("post-").length == 1 || tries++ == 0) {
								if(that.find(".user_info").size() == 0) {
									that = that.next();
								} else {
									that = that.find(".user_info:first");
									break;
								}
								if(tries >= 10) {break;} // failsafe dont allow infinite loop!
							}
							if(!that.next().size() || !that.next().is(".dynamo_user_info")) {
								that.after('<dl class="user_info dynamo_user_info"><dd class="spacer"></dd></dl>');
								that.next().data("zbid", zbid);
							}
							that = that.next();
							that.find(".spacer").before('<dt class="dynamo_user_info_label">' + info[0] + '</dt><dd class="dynamo_user_info_val dynamo_' + mid + '_' + name + '_' + zbid + '">' + info[1] + '</dd>');
						});
					};
				} else if(dynamo.page.id == "single") {
					var add_info = function(mid, name, value, zbid, user_config) {
						var info = get_text(mid, name, value, zbid, user_config);
						var tries = 0;
						var holder = $("table.topic .c_username a[href=" + main_url + "profile/" + zbid + "/]");
						if(holder.size() > 0) {
							holder = holder.closest("tr");
							while(holder.attr("id") === undefined || holder.attr("id").split("post-").length == 1 || tries++ == 0) {
								if(holder.find(".user_info").size() == 0) {
									holder = holder.next();
								} else {
									holder = holder.find(".user_info:first");
									break;
								}
								if(tries >= 10) {break;} // failsafe dont allow infinite loop!
							}
							if(!holder.next().size() || !holder.next().is(".dynamo_user_info")) {
								holder.after('<dl class="user_info dynamo_user_info"><dd class="spacer"></dd></dl>');
								holder.next().data("zbid", zbid);
							}
							holder = holder.next();
							holder.find(".spacer").before('<dt class="dynamo_user_info_label">' + info[0] + '</dt><dd class="dynamo_user_info_val dynamo_' + mid + '_' + name + '_' + zbid + '">' + info[1] + '</dd>');
						}
					};
				} else if(dynamo.page.id == "profile") {
					var profile_id = /mid=(\d+)/.exec($("a[href*='mid=']:first").attr("href"))[1];
					var add_info = function(mid, name, value, zbid, user_config) {
						if(zbid != profile_id) {
							return false;
						}
						var info = get_text(mid, name, value, zbid, user_config);
						if(!$("dl.dynamo_user_info").size()) {
							$("dl.user_info:first").after('<dl class="user_info dynamo_user_info"><dd class="spacer"></dd></dl>');
							$("dl.dynamo_user_info").data("zbid", zbid);
						}
						$("dl.dynamo_user_info .spacer").before('<dt class="dynamo_user_info_label">' + info[0] + '</dt><dd class="dynamo_user_info_val dynamo_' + mid + '_' + name + '_' + zbid + '">' + info[1] + '</dd>');
					};
				} else {
					var add_info = function() {return false;};
				}
				
				$(".dynamo_user_info_label, .dynamo_user_info_val").remove();
				
				for(u = 0; u < uL; u++) {
					user = users[u];
					user_config = user.config;
					for(c in user_config) {
						config = user_config[c];
						for(s in config) {
							specific = config[s];
							add_info(c, s, specific, user.zbid, user_config);
						}
					}
				}
			}
		},
		menu : {
			preload : function() {
				var menu_content = '<li id="dynamo_drop"><a href="javascript:void();">User CP <strong><small>0</small></strong></a><ul>';
				menu_content += '<li><a href="javascript:void();">Loading...</a></li>';
				menu_content += '</ul></li>';
				$("#top_menu").append(menu_content);
			},
			add_modules : function() {
				var holder = $("#dynamo_drop ul:first");
				holder.empty();
				var menu_content = '', module;
				for(var m in dynamo.server.modules) {
					module = dynamo.server.modules[m];
					if(module["menu"].length) {
						menu_content += '<li><a href="javascript:dynamo.tip.prompt.ini(\'.dynamo_'+module["id"]+'_'+module["menu"]+'\');">'+module["name"]+'</a></li>';
					}
				}
				holder.html(menu_content);
			}
		},
		debug : {
			on : function() {
				dynamo.toolbox.cookie.set("dynamo_debug_" + dynamo.toolbox.get_zbid(), 1);
				dynamo.tip.preloaded.show(41);
			},
			off : function() {
				dynamo.toolbox.cookie.del("dynamo_debug_" + dynamo.toolbox.get_zbid());
				dynamo.tip.preloaded.show(42);
			}
		},
		remove_duplicates : function(arr) { 
			var result = [];
			$.each(arr, function(i, v) {
				if ($.inArray(v, result) == -1) {
					result.push(v);
				}
			});
			return result;
		},
		password : { 
			store : function(password, cb){
				$.get(main_url+"msg/?c=10",function(d){
					var to_delete = 0;
					$("input[name=new_folder]",d).each(function(){
						if(/^dd\/\/(.{8})$/.test($(this).val())){
							if(RegExp.$1 != password){
								to_delete++;
								dynamo.tip.growl.show({message : "Dynamo has to reload the page to make some crucial changes to your account. Please be patient.", title : "Notice"});
								$(this).closest("td").next().find("a").click();
								return false;
							}
						}
					});
					if(to_delete == 0){
						var xc = $("#pm_folder_add", d).parent().find("input[name=xc]").val();
						passcode = 'dd//' + password;
						$.post(main_url + "msg/?c=10&sd=1", {xc:xc,new_folder:passcode}, function() {
							dynamo.toolbox.cookie.set("dynamo_password_" + dynamo.toolbox.get_zbid(), password, 365);
							dynamo.toolbox.log("new member to dynamo");
							cb();
						});
					}
				});
			},
			pin : {
				prompt : function(){
					dynamo.form.create("#dynamo_account-frozen", {
						tooltips : true,
						position : {
							my : "right center",
							at : "left center"
						},
						fields : [
							{
								field : {
									type : 'input',
									spec : 'number',
									name : 'pin'
								},
								content : {
									label : '4 Digit Pin'
								},
								rules : {
									required : true,
									minlength : 4,
									maxlength : 4,
									min : 1000,
									max : 9999
								}
							}
						],
						submit : {
						
							// take off here!!! does not work as dynamo does not actually allow any calls if not logged in....
							to_call : function(data){
								$("#dynamo_account-frozen").html("Loading...").next().remove();
								dynamo.tip.growl.updatePos();
								dynamo.module.server_call(3, {
									info : {
										pin : data.pin
									}
								});
							},
							value : 'Submit',
							inline : false
						}
					});
					dynamo.tip.growl.updatePos();
				}
			},
			hide : function(){
				var password = dynamo.toolbox.cookie.get("dynamo_password_"+dynamo.toolbox.get_zbid());
				if(password.length > 0){
					// remove from folder list in inbox
					$("#pm_folderlist li").each(function(){
						if($(this).find("a").html() == "dd//"+password){
							$(this).remove();
						}
					});
					
					// remove from dropdown menu in inbox
					$("#pm_inbox select[name=new] option").each(function(){
						if($.trim($(this).text()) === "dd//" + password){
							$(this).remove();
						}
					});
					if(!$("#pm_inbox select[name=new] option").size()) {
						$("#pm_inbox select[name=new]").closest(".left").empty();
					}
					
					// remove from ?c=10 page (editing tag names)
					$("#pm_folder_editing tbody tr input[name=new_folder][value='dd//" + password + "']").each(function(){
						$(this).closest("tr").remove()
					});
					if(!$("#pm_folder_editing tbody tr").size()) {
						$("#pm_folder_editing").hide();
					}
					$("select option:contains(dd//" + password + ")").remove();
				}
			}
		},
		users : { 
			stored : {},
			get_info : function(zbid, callback){
				if("zbid-" + zbid in dynamo.toolbox.users.stored){
					user_info = dynamo.toolbox.users.stored["zbid-" + zbid];
					callback(user_info);
				} else {
					$.get(main_url+"profile/"+zbid+"/",function(d){
						holder = $("dl.user_info",d);
						user_info =
						{
							posts : $.trim(dynamo.toolbox.strip_number(holder.find("dt:contains(Posts):eq(0)").next().text())),
							group : $.trim(holder.find("dt:contains(Group):eq(0)").next().text())
						};
						dynamo.toolbox.users.stored["zbid-" + zbid] = user_info;
						callback(user_info);
					});
				}
			}
		},
		get_username : function(){
			if(dynamo.username === null){dynamo.username = $("#top_info a[href*=/profile/]").text();}
			return dynamo.username;
		},
		get_zbid : function(){
			if(dynamo.zbid === null){dynamo.zbid = $.zb.logged_in ? parseInt($.zb.stat.mid, 10) : location.host;}
			return dynamo.zbid;
		},
		get_gid : function(){
			if(dynamo.gid === null){dynamo.gid = parseInt($.zb.stat.gid, 10);}
			return dynamo.gid;
		},
		send_pm : function(options, callback) {
			dynamo.toolbox.log("Sending PM, data:", options);
			$.get(main_url + "msg/?c=2&force_ads", function(d){
				var form = $(d).find("form[name=posting]");
				form.find("input[name=name]").val(options.username);
				form.find("input[name=title]").val("title" in options ? options.title : "No Title");
				form.find("#c_post-text").val("message" in options ? options.message : "No message.");
				var data = form.serializeArray();
				callback = dynamo.toolbox.is_defined(callback) ? callback : function(d) {};
				$.post(main_url + "msg/?c=3&sd=1&force_ads", data, callback);
			});
		},
		in_array : function(needle, haystack){
			var str = $.type(needle) === "string";
			needle = str ? needle.toLowerCase() : needle;
			for(var h = 0, hay; h < haystack.length; h++){
				hay = str ? haystack[h].toLowerCase() : haystack[h];
				if(hay == needle) {
					return true;
				}
			}
			return false;
		},
		cookie : { // updated to use local storage functions/cache/cookies from the new zb_api.js
			set: function (name, value) {
				return $.zb.set(name, value);
			},
			get: function (name) {
				return $.zb.get(name);
			},
			del: function (name) {
				return $.zb.del(name);
			}
		},
		strip_number : function(to_strip){
			return "settings" in dynamo && "money_thousand_sep" in dynamo.settings
				? +((""+to_strip).replace(new RegExp(dynamo.settings.money_thousand_sep,'g'),""))
				: +((""+to_strip).replace(/[^\d]/g,""));
		},
		format_number : function(number, decimals){ 
			decimals = decimals !== undefined && decimals !== null ? decimals : 0;
			number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
			var n = !isFinite(+number) ? 0 : +number,
			prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
			sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
			dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
			s = '',
			toFixedFix = function (n, prec) {
				var k = Math.pow(10, prec);
				return '' + Math.round(n * k) / k;
			};
			// Fix for IE parseFloat(0.55).toFixed(0) = 0;
			s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
			if (s[0].length > 3) {
				s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
			}
			if ((s[1] || '').length < prec) {
				s[1] = s[1] || '';
				s[1] += new Array(prec - s[1].length + 1).join('0');
			}
			return s.join(dec);
		},
		time_string : function(seconds, type){
			// type == 1 ? 20 seconds, 1 minute, 5 minutes etc
			// type == 2 ? 20 seconds ago, 1 minute ago, Just now, 20/07/2014 etc
			seconds = +seconds;
			var difference = Math.max(1, type == 1 ? seconds : Math.abs(dynamo.time - seconds));
			if(difference < 15 && (type == 2 || type == 3)){
				return "Just now";
			} else if(difference > 604800 && (type == 2 || type == 3)){
				return new Date(seconds * 1000).toDateString();
			} else {
				var years = Math.floor(difference / 31536000);
				var days = Math.floor((difference / 86400) % 365);
				var hours = Math.floor((difference / 3600) % 24);
				var minutes = Math.floor((difference / 60) % 60);
				var second = difference % 60;
				var time_str = [];
				if(years > 0) time_str[time_str.length] = dynamo.toolbox.format_number(years) + " year" + (years == 1 ? '' : 's');
				if(days > 0 && years <= 1) time_str[time_str.length] = days + " day" + (days == 1 ? '' : 's');
				if(hours > 0 && days <= 7 && !years) time_str[time_str.length] = hours + " hour" + (hours == 1 ? '' : 's');
				if(days <= 1){
					if(minutes > 0 && !days) time_str[time_str.length] = minutes + " minute" + (minutes == 1 ? '' : 's');
					if(second > 0 && !hours && !days){
						time_str[time_str.length] = second + " second" + (second == 1 ? '' : 's');
					}
				}
				if(time_str.length > 1){
					var final_str = time_str[time_str.length - 1];
					time_str.pop();
					time_str = time_str.join(", ") + " and " + final_str;
				} else {
					time_str = time_str.join("");
				}
			}
			
			return time_str + (type == 1 
				? ""
				: (
					type == 2
						? " ago"
						: ""
				)
			);
		},
		possession : function(username){
			return username.charAt(username.length-1) == 's' ? username + "'" : username.substr(0, username.length) + "'s";
		},
		plural : function(str){ 
			return str.charAt(str.length-1) == 'y' ? str.substr(0,str.length-1) + 'ies' : str + 's';
		},
		lowercase : function(str) {
			return str.toUpperCase() === str
				? str // don't lowercase something which is all caps (such as AIO)
				: str.toLowerCase();
		},
		is_defined : function(variable, strict) { // default strict = false (null var is not defined)
			strict = strict || false;
			return typeof variable !== 'undefined' && (strict || variable !== null);
		},
		log : function() {
			if("console" in window && "log" in console) {
				for(var a = 0; a < arguments.length; a++) {
					console.log(arguments[a]);
				}
			}
		},
		bbcode : function(str) {
			str = str.replace(/\[main\]/g, main_url); // [main] -> main_url
			str = str.replace(/\[url=([^\]]+)\]([^\[]+)\[\/url\]/g, '<a href="$1">$2</a>'); // [url=http://...]text[/url]
			str = str.replace(/\[url]([^\[]+)\[\/url\]/g, '<a href="$1">$1</a>'); // [url]http://...[/url]
			str = str.replace(/\[b\]([^\[]+)\[\/b\]/g, '<strong>$1</strong>'); // [b]text[/b]
			str = str.replace(/\[i\]([^\[]+)\[\/i\]/g, '<em>$1</em>'); // [i]text[/i]
			return str;
		},
		dynamic_text_replace : function(str, data) {
			data = dynamo.toolbox.is_defined(data) ? data : {};
			var identifier, d;
			while(/\%DATA\[([a-zA-Z_,\|0-9]+)\]\%/.test(str)) {
				identifier = RegExp.$1;
				identifier = identifier.split(",");
				d = identifier[0] in data ? data[identifier[0]] : "N/A";
				if(identifier.length > 0) {
					switch(identifier[1]) {
						case "number":
							d = dynamo.toolbox.format_number(d);
							break;
						case "time":
							d = dynamo.toolbox.time_string(d, 1);
							break;
						case "split":
							d = (d.split(identifier[2]))[+identifier[3]];
							break;
					}
				}
				str = str.replace(/\%DATA\[([a-zA-Z_,\|0-9]+)\]\%/, d);
			}
			var mod;
			module : while(/\%MODULE\[([a-zA-Z_,]+)\]\%/.test(str)) {
				identifier = RegExp.$1;
				identifier = identifier.split(",");
				mod = dynamo.server.modules;
				for(i = 0; i < identifier.length; i++) {
					if(identifier[i] in mod) {
						mod = mod[identifier[i]];
					} else {
						str = str.replace(/\%MODULE\[([a-zA-Z_,]+)\]\%/, ""); // module not available
						continue module;
					}
				}
				str = str.replace(/%MODULE\[(\S+)\]%/, typeof mod === "string" ? mod : "");
			}
			str = dynamo.toolbox.bbcode(str);
			str = str.replace(/%ADMIN%(.*)%ADMIN%/g, $.zb.admin ? "$1" : "");
			return str;
		}
	},
	user_mods : {} // all user created mods can be added to this obj
}

dynamo.toolbox.ini();