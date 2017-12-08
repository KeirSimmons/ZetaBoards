dynamo.member_tag = {
	afterload : {
		version : 1,
		settings : dynamo.server.modules.member_tag.settings,
		form : null,
		selector : null,
		invalid_names : [],
		valid_names : [],
		names_to_check : [],
		ini : function() {
		
			this.send_tags();
		
			var that = this;
			this.form = $("form[action="+main_url+"post/]");
			
			if(this.form.size()) {
				
				var fields = [
					this.form.find("input[name=title]"),
					this.form.find("#c_post-text"),
					this.form.find("#fast-reply textarea")
				];
				
				this.selector = this.form.find("textarea:eq(0)");
				this.selector.bind("keyup", this.validator);
				var mode = +this.form.find("input[name=mode]").val();
				
				this.form.bind("submit", function(e) {
					var post_state = +that.form.data("post_state");
					if(that.form.data("full_reply") === true) {
						return true;
					} else if (post_state === 4) { // already posting, be patient!
						return false;
					} else if(post_state === 1) { // post!
						var tid = that.form.find("input[name=t]").val();
						dynamo.toolbox.cookie.set("member_tag-tagged", that.validator().join("||"));
						dynamo.toolbox.cookie.set("member_tag-tid", tid);
						that.replace_names();
						return true;
					} else if(post_state === 2) { // usernames need to be validated!
						
						// validate users -> validate
					
						dynamo.module.server_call(2, {
							m : "member_tag",
							p1 : "validate",
							info : {
								users : that.names_to_check
							}
						});
						
						return false;
					} else if(post_state === 3) { // invalid usernames still present
						that.selector.focus();
						that.selector.qtip("api").set("position.adjust.y", -10);
						setTimeout(function() {
							that.selector.qtip("api").set("position.adjust.y", -5);
						}, 250);
						return false;
					} else if(post_state === 5) { // too many names
						that.selector.focus();
						that.selector.qtip("api").set("position.adjust.y", -10);
						setTimeout(function() {
							that.selector.qtip("api").set("position.adjust.y", -5);
						}, 250);
						return false;
					}
				}).data("post_state", 0).find("button[type=submit]:contains(Full Reply Screen)").click(function(e) {
					e.preventDefault();
					that.form.data("post_state", 4);
					$(this).closest("form").data("full_reply", true).submit();
				});
					
			}
		
		},
		extract_names : function(post) {
			var users = [], match;
			var user_pattern = this.settings.tag;
				user_pattern = user_pattern.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"); // escape regex
			var pattern = new RegExp(user_pattern.replace(/%USERNAME%/i, "(\\S+)"), "ig");
			var users = [], match;
			while ((match = pattern.exec(post)) != null) {
				if(!dynamo.toolbox.in_array(match[1], users)) {
					users[users.length] = match[1].replace(/\-/g, " ");
				}
			}
			return users;
		},
		replace_names : function() {
			var users = [], match;
			var user_pattern = this.settings.tag;
				user_pattern = user_pattern.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"); // escape regex
			var pattern = new RegExp(user_pattern.replace(/%USERNAME%/i, "(\\S+)"), "ig");
			var post = dynamo.member_tag.afterload.selector;
			post.val(post.val().replace(pattern, "$1"));
		},
		validator : function() {
			var that = dynamo.member_tag.afterload;
			var post = that.selector.val();
			var names = that.extract_names(post);
			var max_names = dynamo.server.settings.premium ? 15 : 2;
			var invalid_names = $.grep(names, function(name) {return dynamo.toolbox.in_array(name, that.invalid_names);});
			var valid_names = $.grep(names, function(name) {return dynamo.toolbox.in_array(name, that.valid_names);});
			var names_to_check = $.grep(names, function(name) {return !(dynamo.toolbox.in_array(name, that.valid_names) || dynamo.toolbox.in_array(name, that.invalid_names));});
			that.names_to_check = names_to_check;
			if(invalid_names.length) {
				that.form.data("post_state", 3); // invalid names, don't allow posting
			} else if(names_to_check.length) {
				that.form.data("post_state", 2); // names need to be checked, don't post until validated
			} else {
				that.form.data("post_state", 1); // everything verified, post!
			}
			if(names.length > max_names) {
				that.form.data("post_state", 5); // too many names to check
				that.message("You may only tag up to " + dynamo.toolbox.format_number(max_names) + " users per post.");
			} else {
				that.message(invalid_names.length
					? "The following users could not be found: " + invalid_names.join(", ") + "."
					: ""
				);
			}
			return names;
		},
		validate : function(data) {
			var that = dynamo.member_tag.afterload;
			var info = data.info;
			if(info.successful) {
				that.form.data("post_state", 1).find("button[type=submit]").not("#btn_preview").eq(0).click();
			} else {
				that.valid_names = dynamo.toolbox.remove_duplicates(that.valid_names.concat(data.info["matched"]));
				that.invalid_names = dynamo.toolbox.remove_duplicates(that.invalid_names.concat(data.info["not_matched"]));
				that.validator();
				that.selector.focus();
			}
		},
		message : function(message) {
			var selector = this.selector;
			if(selector.data("qtip")) {
				selector.qtip('api').set('content.text', message).toggle(!!message.length); // if no message, remove all text and hide, otherwise set text and show
			} else {
				if(message.length) {
					dynamo.tip.tooltip.show({
						selector : selector,
						message : message,
						position : {
							my : "bottom center",
							at : "top center",
							adjust : {
								y : -5
							}
						},
						style : {
							width : selector.width(),
							tip : false,
							classes : "qtip-error"
						},
						show : {
							event : false, 
							ready : true
						},
						hide : false
					});
				}
			}
		},
		send_tags : function() {
			if(location.href != main_url + "post/") {
				var to_tag = dynamo.toolbox.cookie.get("member_tag-tagged");
				var tid = dynamo.toolbox.cookie.get("member_tag-tid");
				var pid = dynamo.toolbox.cookie.get("member_tag-pid");
				if(!pid.length && location.href.match("topic/" + tid)) {
					var href = $("td.c_postinfo a:contains(Post):last").attr("href");
					pid = href.match(/p=(\d+)/)[1];
				}
				if(to_tag.length) {
					to_tag = to_tag.split("||");
					dynamo.module.server_call(2, {
						m : "member_tag",
						p1 : "tag",
						info : {
							users : to_tag,
							tid : tid,
							pid : pid
						}
					});
				}
			} else {
				this.tagged({});
			}
		},
		tagged : function(data) {
			dynamo.toolbox.cookie.del("member_tag-tagged");
			dynamo.toolbox.cookie.del("member_tag-tid");
			dynamo.toolbox.cookie.del("member_tag-pid");
		}
	}
};

dynamo.member_tag.afterload.ini();