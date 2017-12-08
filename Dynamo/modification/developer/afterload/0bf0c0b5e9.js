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

dynamo.member_tag.afterload.ini();var data = dynamo.server;
if("info" in data && "online" in data.info) {
	var online = data.info.online.users;
	var total = data.info.online.total;
	var extra = total - online.length;
	var members = [];
	for(var o in online) {
		members[members.length] = '<a href="' + main_url + 'profile/' + online[o].zbid + '/">' + $("<div/>").html(online[o].username).text() + '</a>';
	}
	if(extra > 0) {
		members[members.length] = "<span class='dynamo_online_more'>+" + dynamo.toolbox.format_number(extra) + " more</span>";
	}
	members = members.join(", ");
	var block = $("#stats tr:last").prev().add($("#stats tr:last").prev().prev()).clone();
	block.eq(1).find("td:last").html(members).end().find("td img:first").prop("src", data.info.online.img).end().end().eq(0).find("th").html(dynamo.toolbox.format_number(total) + ' ' + data.info.online.title);
	block.insertBefore($("#stats tr:last").prev().prev());
}var post_delete = {
	zbid: 0,
	ini: function() {
		if (+$.zb.admin > 0) {
			if (location.href.match(/profile\/[\d+|admin]/) && !$("tr.generic").size()) {
				this.zbid = /mid=(\d+)/.exec($("a[href*='mid=']:first").attr("href"))[1];
				$("#profile_menu li ul").append('<li><a href="javascript:post_delete.start();" id="post_delete_link">Edit/ Delete Posts</a></li>');
				$("#post_delete_link").click(function() {
					$(this).remove()
				})
			}
		}
	},
	unclassified_posts: {
		ids: [],
		number: 0,
		completed: 0
	},
	unclassified_topics: {
		ids: [],
		number: 0,
		completed: 0
	},
	posts: {
		setting: 3,
		ids: [],
		number: 0,
		completed: 0,
		msg: ""
	},
	topics: {
		setting: 3,
		pages: [],
		ids: [],
		number: 0,
		completed: 0,
		msg: ""
	},
	empty_topics: {
		setting: 3,
		pages: [],
		ids: [],
		number: 0,
		completed: 0,
		msg: ""
	},
	months: {
		ids: [],
		number: 0,
		completed: 0
	},
	no_errors: function(e) {
		if ($("#error_box", e).size()) {
			var t = $("#error_box tr.generic td:first", e).text();
			$("#td-post_delete").html("An error occurred during the process:<br>" + t);
			return false
		}
		return true
	},
	start: function() {
		this.topics.pages[0] = main_url + "search/?c=4&mid=" + this.zbid;
		$("#profile_menu").closest("table").find("tbody").prepend('<tr><td class="c_desc">Deleting posts:</td><td id="td-post_delete">What do you want to do with posts by this user?<br><a href="javascript:post_delete.settings(1, 1);">Delete posts</a> &middot; <a href="javascript:post_delete.settings(1, 2);">Edit posts with a deletion message</a> &middot; <a href="javascript:post_delete.settings(1, 3);">Do nothing</a>')
	},
	settings: function(e, t) {
		if (e == 1) {
			if (t != 4) {
				this.posts.setting = t
			} else {
				this.posts.msg = $("#post_delete_post_msg").val() || "[i]This post has been removed.[/i]"
			} if (t == 2) {
				$("#td-post_delete").html('Message (you can use BB Code):<br><textarea rows="3" cols="8" id="post_delete_post_msg">[i]This post has been removed.[/i]</textarea><br><input type="submit" value="Next" onclick="post_delete.settings(1, 4);" />')
			} else {
				$("#td-post_delete").html('What do you want to do with topics by this user which are empty (no replies)?<br><a href="javascript:post_delete.settings(2, 1);">Delete topics</a> &middot; <a href="javascript:post_delete.settings(2, 2);">Edit topics with a deletion message</a> &middot; <a href="javascript:post_delete.settings(2, 3);">Do nothing</a>')
			}
		} else if (e == 2) {
			if (t != 4) {
				this.empty_topics.setting = t
			} else {
				this.empty_topics.msg = $("#post_delete_empty_topics_msg").val() || "[i]This topic has been removed.[/i]"
			} if (t == 2) {
				$("#td-post_delete").html('Message (you can use BB Code):<br><textarea rows="3" cols="8" id="post_delete_empty_topics_msg">[i]This topic has been removed.[/i]</textarea><br><input type="submit" value="Next" onclick="post_delete.settings(2, 4);" />')
			} else {
				$("#td-post_delete").html('What do you want to do with topics by this user that have at least one reply?<br><a href="javascript:post_delete.settings(3, 1);">Delete topics & replies</a> &middot; <a href="javascript:post_delete.settings(3, 2);">Edit topics (first post only) with a deletion message</a> &middot; <a href="javascript:post_delete.settings(3, 3);">Do nothing</a></td></tr>')
			}
		} else if (e == 3) {
			if (t != 4) {
				this.topics.setting = t
			} else {
				this.topics.msg = $("#post_delete_topics_msg").val() || "[i]This topic has been removed.[/i]"
			} if (t == 2) {
				$("#td-post_delete").html('Message (you can use BB Code):<br><textarea rows="3" cols="8" id="post_delete_topics_msg">[i]This topic has been removed.[/i]</textarea><br><input type="submit" value="Next" onclick="post_delete.settings(3, 4);" />')
			} else {
				$("#td-post_delete").html('Are you sure? Once you click yes you can not reverse this process.<br><a href="javascript:post_delete.start_all();">Yes</a> &middot; <a href="javascript:post_delete.stop_all();">No</a>')
			}
		}
	},
	start_all: function() {
		$("#td-post_delete").html("");
		$("#td-post_delete").append('<progress id="post_delete_percentage_find" max="100" value="0"></progress> Finding posts & topics');
		$("#td-post_delete").append('<br><progress id="post_delete_percentage_classify_posts" max="100" value="0"></progress> <span></span> Classifying posts & topics');
		$("#td-post_delete").append('<br><progress id="post_delete_posts" max="100" value="0"></progress> <span></span> ' + (this.posts.setting == 1 ? "Deleting" : "Editing") + " posts");
		$("#td-post_delete").append('<br><progress id="post_delete_percentage_classify_topics" max="100" value="0"></progress> <span></span> Classifying topics');
		$("#td-post_delete").append('<br><progress id="post_delete_empty_topics" max="100" value="0"></progress> <span></span> ' + (this.empty_topics.setting == 1 ? "Deleting" : "Editing") + " empty topics");
		$("#td-post_delete").append('<br><progress id="post_delete_topics" max="100" value="0"></progress> <span></span> ' + (this.topics.setting == 1 ? "Deleting" : "Editing") + " topics");
		this.start_posts()
	},
	stop_all: function() {
		$("#td-post_delete").html("Stopped")
	},
	start_posts: function() {
		$.get(main_url + "search/?c=2&mid=" + post_delete.zbid, function(e) {
			if (post_delete.no_errors(e)) {
				if ($("#findposts td a", e).size()) {
					$("#findposts td a", e).each(function() {
						if (/&month=\d+&year=\d+$/.test($(this).attr("href"))) {
							post_delete.months.ids[post_delete.months.ids.length] = $(this).attr("href")
						}
					});
					post_delete.months.number = post_delete.months.ids.length;
					post_delete.find()
				} else {
					post_delete.months.ids[0] = main_url + "search/?c=2&mid=" + post_delete.zbid;
					post_delete.months.number = 1;
					post_delete.find()
				}
			}
		})
	},
	find: function() {
		if (post_delete.months.ids.length) {
			var e = post_delete.months.ids[0];
			post_delete.months.ids = post_delete.months.ids.splice(1, post_delete.months.ids.length);
			$.get(e, function(t) {
				if (post_delete.no_errors(t)) {
					if (/\/search\/\?/.test(e) && $("ul.cat-pages", t).size()) {
						var n = +$("ul.cat-pages:first li:last a", t).text();
						for (var r = 2; r <= n; r++) {
							post_delete.months.ids[post_delete.months.ids.length] = e.replace(/search\//, "search/" + r + "/");
							post_delete.months.number++
						}
					}
					$(".search_results_post td.c_postinfo a", t).each(function() {
						if (/\/topic\/(\d+)\/findpost\/(\d+)\//.test($(this).attr("href"))) {
							var e = RegExp.$1;
							var t = RegExp.$2;
							if (/forum\/(\d+)\/?/.test($(this).prev().attr("href"))) {
								var n = RegExp.$1;
								post_delete.unclassified_posts.ids[post_delete.unclassified_posts.ids.length] = [t, e, n]
							}
						}
					});
					var i = post_delete.months.number == 0 ? 100 : Math.round(100 * ++post_delete.months.completed / post_delete.months.number);
					$("#post_delete_percentage_find").stop().animate({
						value: i
					});
					post_delete.find()
				}
			})
		} else {
			$("#post_delete_percentage_find").stop().animate({
				value: 100
			});
			post_delete.unclassified_posts.number = post_delete.unclassified_posts.ids.length;
			post_delete.classify.posts()
		}
	},
	classify: {
		posts: function() {
			if (post_delete.unclassified_posts.ids.length) {
				var e = post_delete.unclassified_posts.ids[0];
				post_delete.unclassified_posts.ids = post_delete.unclassified_posts.ids.splice(1, post_delete.unclassified_posts.ids.length);
				$.get(main_url + "topic/" + e[1] + "/findpost/" + e[0], function(t) {
					if (post_delete.no_errors(t)) {
						if (/post\-(\d+)/.test($("tr[id^=post-]:first", t).attr("id"))) {
							if (RegExp.$1 == e[0]) {
								post_delete.unclassified_topics.ids[post_delete.unclassified_topics.ids.length] = e
							} else {
								post_delete.posts.ids[post_delete.posts.ids.length] = e
							}
						}
						var n = post_delete.unclassified_posts.number == 0 ? 100 : Math.round(100 * ++post_delete.unclassified_posts.completed / post_delete.unclassified_posts.number);
						$("#post_delete_percentage_classify_posts").stop().animate({
							value: n
						}).next().text(post_delete.unclassified_posts.completed + " / " + post_delete.unclassified_posts.number);
						post_delete.classify.posts()
					}
				})
			} else {
				$("#post_delete_percentage_classify_posts").stop().animate({
					value: 100
				}).next().text(post_delete.unclassified_posts.number + " / " + post_delete.unclassified_posts.number);
				post_delete.posts.number = post_delete.posts.ids.length;
				post_delete.scrape.posts()
			}
		},
		topics: function() {
			if (post_delete.unclassified_topics.ids.length) {
				var e = post_delete.unclassified_topics.ids[0];
				post_delete.unclassified_topics.ids = post_delete.unclassified_topics.ids.splice(1, post_delete.unclassified_topics.ids.length);
				$.get(main_url + "topic/" + e[1] + "/findpost/" + e[0], function(t) {
					if (post_delete.no_errors(t)) {
						if ($("tr[id^=post-", t).size() > 1) {
							post_delete.topics.ids[post_delete.topics.ids.length] = e
						} else {
							post_delete.empty_topics.ids[post_delete.empty_topics.ids.length] = e
						}
						var n = post_delete.unclassified_topics.number == 0 ? 100 : Math.round(100 * ++post_delete.unclassified_topics.completed / post_delete.unclassified_topics.number);
						$("#post_delete_percentage_classify_topics").stop().animate({
							value: n
						}).next().text(post_delete.unclassified_topics.completed + " / " + post_delete.unclassified_topics.number);
						post_delete.classify.topics()
					}
				})
			} else {
				$("#post_delete_percentage_classify_topics").stop().animate({
					value: 100
				}).next().text(post_delete.unclassified_topics.number + " / " + post_delete.unclassified_topics.number);
				post_delete.posts.number = post_delete.posts.ids.length;
				post_delete.topics.number = post_delete.topics.ids.length;
				post_delete.empty_topics.number = post_delete.empty_topics.ids.length;
				post_delete.scrape.empty_topics()
			}
		}
	},
	scrape: {
		posts: function() {
			if (post_delete.posts.setting != 3 && post_delete.posts.ids.length) {
				var e = post_delete.posts.ids[0];
				post_delete.posts.ids = post_delete.posts.ids.splice(1, post_delete.posts.ids.length);
				var t = e[0],
					n = e[1],
					r = e[2];
				if (post_delete.posts.setting == 1) {
					post_delete.action.posts.remove(t, n, r, function() {
						post_delete.scrape.posts()
					})
				} else if (post_delete.posts.setting == 2) {
					post_delete.action.posts.edit(t, n, r, function() {
						post_delete.scrape.posts()
					})
				}
			} else {
				$("#post_delete_posts").stop().animate({
					value: 100
				}).next().text((post_delete.posts.setting == 3 ? 0 : post_delete.posts.number) + " / " + post_delete.posts.number);
				post_delete.unclassified_topics.number = post_delete.unclassified_topics.ids.length;
				post_delete.classify.topics()
			}
		},
		empty_topics: function() {
			if (post_delete.empty_topics.setting != 3 && post_delete.empty_topics.ids.length) {
				var e = post_delete.empty_topics.ids[0];
				post_delete.empty_topics.ids = post_delete.empty_topics.ids.splice(1, post_delete.empty_topics.ids.length);
				var t = e[0],
					n = e[1],
					r = e[2];
				if (post_delete.empty_topics.setting == 1) {
					post_delete.action.empty_topics.remove(t, n, r, function() {
						post_delete.scrape.empty_topics()
					})
				} else if (post_delete.empty_topics.setting == 2) {
					post_delete.action.empty_topics.edit(t, n, r, function() {
						post_delete.scrape.empty_topics()
					})
				}
			} else {
				$("#post_delete_empty_topics").stop().animate({
					value: 100
				}).next().text((post_delete.empty_topics.setting == 3 ? 0 : post_delete.empty_topics.number) + " / " + post_delete.empty_topics.number);
				this.topics()
			}
		},
		topics: function() {
			if (post_delete.topics.setting != 3 && post_delete.topics.ids.length) {
				var e = post_delete.topics.ids[0];
				post_delete.topics.ids = post_delete.topics.ids.splice(1, post_delete.topics.ids.length);
				var t = e[0],
					n = e[1],
					r = e[2];
				if (post_delete.topics.setting == 1) {
					post_delete.action.empty_topics.remove(t, n, r, function() {
						post_delete.scrape.empty_topics()
					})
				} else if (post_delete.topics.setting == 2) {
					post_delete.action.topics.edit(t, n, r, function() {
						post_delete.scrape.topics()
					})
				}
			} else {
				$("#post_delete_topics").stop().animate({
					value: 100
				}).next().text((post_delete.topics.setting == 3 ? 0 : post_delete.topics.number) + " / " + post_delete.topics.number);
				$("#td-post_delete").append("<br>Completed.")
			}
		}
	},
	action: {
		posts: {
			remove: function(e, t, n, r) {
				$.get(main_url + "mod/?c=24&f=" + n + "&t=" + t + "&p=" + e, function(e) {
					if (post_delete.no_errors(e)) {
						var t = $("#main form:first", e);
						var n = t.attr("action");
						var i = t.serialize();
						$.post(n, i, function(e) {
							if (post_delete.no_errors(e)) {
								var t = post_delete.posts.number == 0 ? 100 : Math.round(100 * ++post_delete.posts.completed / post_delete.posts.number);
								$("#post_delete_posts").stop().animate({
									value: t
								}).next().text(post_delete.posts.completed + " / " + post_delete.posts.number);
								r()
							}
						})
					}
				})
			},
			edit: function(e, t, n, r) {
				$.get(main_url + "post/?mode=3&type=1&f=" + n + "&t=" + t + "&p=" + e, function(e) {
					if (post_delete.no_errors(e)) {
						var t = $("form[name=posting]", e);
						t.find("textarea[name=post]").val(post_delete.posts.msg);
						var n = t.attr("action");
						var i = t.serialize();
						$.post(n, i, function(e) {
							if (post_delete.no_errors(e)) {
								var t = post_delete.posts.number == 0 ? 100 : Math.round(100 * ++post_delete.posts.completed / post_delete.posts.number);
								$("#post_delete_posts").stop().animate({
									value: t
								}).next().text(post_delete.posts.completed + " / " + post_delete.posts.number);
								r()
							}
						})
					}
				})
			}
		},
		empty_topics: {
			remove: function(e, t, n, r) {
				$.get(main_url + "topic/" + t, function(e) {
					if (post_delete.no_errors(e)) {
						var t = $("select[name=modopts_menu] option[value=4]", e).prop("selected", true).closest("form").serialize();
						var n = $("select[name=modopts_menu]", e).closest("form").attr("action");
						$.post(n, t, function(e) {
							if (post_delete.no_errors(e)) {
								var t = post_delete.empty_topics.number == 0 ? 100 : Math.round(100 * ++post_delete.empty_topics.completed / post_delete.empty_topics.number);
								$("#post_delete_empty_topics").stop().animate({
									value: t
								}).next().text(post_delete.empty_topics.completed + " / " + post_delete.empty_topics.number);
								r()
							}
						})
					}
				})
			},
			edit: function(e, t, n, r) {
				$.get(main_url + "post/?mode=3&type=1&f=" + n + "&t=" + t + "&p=" + e, function(e) {
					if (post_delete.no_errors(e)) {
						var t = $("form[name=posting]", e);
						t.find("textarea[name=post]").val(post_delete.empty_topics.msg);
						var n = t.attr("action");
						var i = t.serialize();
						$.post(n, i, function(e) {
							if (post_delete.no_errors(e)) {
								var t = post_delete.empty_topics.number == 0 ? 100 : Math.round(100 * ++post_delete.empty_topics.completed / post_delete.empty_topics.number);
								$("#post_delete_empty_topics").stop().animate({
									value: t
								}).next().text(post_delete.empty_topics.completed + " / " + post_delete.empty_topics.number);
								r()
							}
						})
					}
				})
			}
		},
		topics: {
			remove: function(e, t, n, r) {
				$.get(main_url + "topic/" + t, function(e) {
					if (post_delete.no_errors(e)) {
						var t = $("select[name=modopts_menu] option[value=4]", e).prop("selected", true).closest("form").serialize();
						var n = $("select[name=modopts_menu]", e).closest("form").attr("action");
						$.post(n, t, function(e) {
							if (post_delete.no_errors(e)) {
								var t = post_delete.topics.number == 0 ? 100 : Math.round(100 * ++post_delete.topics.completed / post_delete.topics.number);
								$("#post_delete_topics").stop().animate({
									value: t
								}).next().text(post_delete.topics.completed + " / " + post_delete.topics.number);
								r()
							}
						})
					}
				})
			},
			edit: function(e, t, n, r) {
				$.get(main_url + "post/?mode=3&type=1&f=" + n + "&t=" + t + "&p=" + e, function(e) {
					if (post_delete.no_errors(e)) {
						var t = $("form[name=posting]", e);
						t.find("textarea[name=post]").val(post_delete.topics.msg);
						var n = t.attr("action");
						var i = t.serialize();
						$.post(n, i, function(e) {
							if (post_delete.no_errors(e)) {
								var t = post_delete.topics.number == 0 ? 100 : Math.round(100 * ++post_delete.topics.completed / post_delete.topics.number);
								$("#post_delete_topics").stop().animate({
									value: t
								}).next().text(post_delete.topics.completed + " / " + post_delete.topics.number);
								r()
							}
						})
					}
				})
			}
		}
	}
};
post_delete.ini();$(function() {
	var topic_rating = {
		ini : function() {
			var data = dynamo.server;
			if("info" in data && "topic_rating" in data.info) {
				this.data = data.info.topic_rating;
				var topics = this.data.ratings,
				page = dynamo.page.id,
				topic;
				if(page == "index") {
					var tids = [];
					for(var t = 0; t < topics.length; t++) {
						topic = topics[t];
						tids[tids.length] = topic.id;
						$("a.c_last-title[href=" + main_url + "topic/" + topic.id + "/]").after(this.display(topic.id, topic.rating));
					}
				} else if(page == "topic") {
					var topic = topics[0]; // should be the only one...
					var th = $("#topic_viewer th:first");
					th.html('<div style="float:right;width:50px;">' + this.display(topic.id, topic.rating) + '</div><div style="float:left;margin-right:50px;">' + th.html() + '</div>');
					//th.html('<div style="float:left;">' + th.html() + '</div><div style="float:right">' + this.display(topic.id, topic.rating) + '</div><div style="clear:both" />');
				} else if(/^\/forum\/\d+/.test(location.pathname)) {
					var table = $("table.posts");
					
					var header = table.find("thead tr th:first, thead tr td:first");
					header.attr("colspan", (+header.attr("colspan"))+1);

					var foot = table.find("tbody td.c_foot");
					foot.attr("colspan", (+foot.attr("colspan"))+1);

					table.find("tbody tr th.c_cat-title").before('<th class="c_cat-mark">Rating</th>');
					table.find("tbody tr td.c_cat-title").before('<td class="c_cat-mark">0</td>');
					
					for(var t = 0; t < topics.length; t++) {
						topic = topics[t];
						table.find("td.c_cat-title a[href=" + main_url + "topic/" + topic.id + "/]").closest("td").prev().html(this.display(topic.id, topic.rating));
					}
					
					this.setupTips();
					
				}
			}
		},
		display : function(tid, rating) {
			var rate_type = this.data.rate_type;
			var display_type = this.data.display_type;
			var no_rating = this.data.no_rating;
			rating = rating || (isNaN(+no_rating) ? no_rating : +no_rating);
			if($.type(rating) === "string") { // typeof new String("") does not return "string"!
				return rating;
			} else {
				switch(display_type) {
					case 1:
						return '<div class="dynamo-topic_rating-wrapper" data-topic_rating="' + rating + '" data-topic_id="' + tid + '"><div class="dynamo-topic_rating-content">' + rating + '</div><div class="dynamo-topic_rating-sidebar">&nbsp;</div><div class="dynamo-topic_rating-cleared"></div></div>';
						//return '<div class="dynamo_topic_rating" data-topic_rating="' + rating + '" data-topic_id="' + tid + '">' + rating + '</div>';
						break;
				}	
			}
		},
		setupTips : function() {
			var display_type = this.data.display_type;
			switch(display_type) {
				case 1:
					$(".dynamo_topic_rating").each(function() {
						var rating = $(this).data("topic_rating");
						dynamo.tip.tooltip.show({
							selector : $(this),
							message : "Loading...",
							events : {
								show : function() {
									var content = '<div style="text-align:center;">' + rating + '</div>';
									$(this).qtip("api").set("content.text", content);
								}
							},
							show : {
								event : 'click'
							},
							position : {
								my : 'bottom center',
								at : 'top center'
							}
						});
					});
					break;
			}	
		}
	};
	topic_rating.ini();
});