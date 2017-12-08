var post_delete = {
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
post_delete.ini();