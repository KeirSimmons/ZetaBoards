/*
Open-source, free to use. Find more modifications at https://github.com/KeirSimmons/ZetaBoards
Modification: Top 'x' Statistics & Feeds
*/

/* EDITABLE SETTINGS BELOW */

var topxstats = {
	"title"			: 'Top 5 Statistics',
	"amount"		: 5, // how many rows of data to show (some modules cap at 5 or 10)
	"h2"			: true, // set to true if your theme uses a 3 piece h2
	"show"			: "yes", // set to yes to expand statistics by default, or "no" to collapse by default
	"position"		: "top", // position of box. "top" or "bottom"
	"expand"		: 'http://z5.ifrm.com/30052/123/0/f5062658/plus.png',
	"collapse"		: 'http://z5.ifrm.com/30052/123/0/f5062657/categoryminus.png',
	"options"		: '<small><em>Settings</em></small>',
	"loading"		: "<small><em>Loading...</em></small>",
	"mini-loading"	: '<img src="http://z5.ifrm.com/30052/123/0/f5109883/loading.gif" alt="..." />',
	"refresh"		: "<small><em>Refresh</em></small>",
	"placeholder" 	: '-',
	"modules"		: {
		"overall-posters" : {
			// top overall posters
			"state" : "on",
			"title" : "Overall Top Posters",
			"data" : {
				"username" : {
					"title" : "Username",
					"state" : "on"
				},
				"group" : {
					"title" : "Group",
					"state" : "off"
				},
				"lastactivity" : {
					"title" : "Last Activity",
					"state" : "off"
				},
				"joindate" : {
					"title" : "Join Date",
					"state" : "off"
				},
				"posts" : {
					"title" : "Posts",
					"state" : "on"
				}
			}
		},
		"todays-posters" : {
			// top posters today
			"state" : "on",
			"title" : "Today's Top Posters",
			"data" : {
				"username" : {
					"title" : "Username",
					"state" : "on"
				},
				"joindate" : {
					"title" : "Join Date",
					"state" : "off"
				},
				"posts" : {
					"title" : "Posts Today",
					"state" : "on"
				},
				"percentage" : {
					"title" : "Percentage of Today's Posts",
					"state" : "off"
				}
			}
		},
		"newest-members" : {
			// newest members
			"state" : "on",
			"title" : "Newest Members",
			"data" : {
				"username" : {
					"title" : "Username",
					"state" : "on"
				},
				"group" : {
					"title" : "Group",
					"state" : "off"
				},
				"lastactivity" : {
					"title" : "Last Activity",
					"state" : "on"
				},
				"joindate" : {
					"title" : "Join Date",
					"state" : "off"
				},
				"posts" : {
					"title" : "Posts",
					"state" : "off"
				}
			}
		},
		"recently-active" : {
			// recently active members
			"state" : "off",
			"title" : "Recently Active",
			"data" : {
				"username" : {
					"title" : "Username",
					"state" : "off"
				},
				"group" : {
					"title" : "Group",
					"state" : "off"
				},
				"lastactivity" : {
					"title" : "Last Activity",
					"state" : "off"
				},
				"joindate" : {
					"title" : "Join Date",
					"state" : "off"
				},
				"posts" : {
					"title" : "Posts",
					"state" : "off"
				}
			}
		},
		"newest-replies" : {
			// newest replies
			"state" : "on",
			"title" : "Newest Replies",
			"data" : {
				"topic" : {
					"title" : "Topic Title",
					"state" : "on"
				},
				"username" : {
					"title" : "Username",
					"state" : "on"
				},
				"replies" : {
					"title" : "# Replies",
					"state" : "off"
				}
			}
		},
		"active-topics" : {
			// active topics
			"state" : "off",
			"title" : "Active Topics",
			"data" : {
				"title" : {
					"title" : "Topic Title",
					"state" : "off"
				},
				"starter" : {
					"title" : "Topic Starter",
					"state" : "off"
				},
				"forum" : {
					"title" : "Forum",
					"state" : "off"
				},
				"replies" : {
					"title" : "Replies",
					"state" : "off"
				},
				"views" : {
					"title" : "Views",
					"state" : "off"
				},
				"info" : {
					"title" : "Topic Info",
					"state" : "off"
				}
			}
		}
	}
};

/* DON'T EDIT BELOW THIS LINE */

$.extend(true, topxstats, {
	ini : function() {
		// destroys table -> creates table -> populates table
		this.amount = Math.max(1, Math.min(10, this.amount)); // amount must be between 1 and 10
		this.table.destroy();
		this.table.create();
		if(this.tools.get("show", this.show) == "yes") this.load();
	},
	modules : {
		"overall-posters" : {
			"id" : "overall-posters",
			"url" : main_url + "members/?search_type=start&name=&group=0&sort=postcount&order=d",
			"cb" : function(d) {
				var	trs = $("#member_list_full tbody tr", d).not(":first, :last").not(":first"),
					tds,
					amount = [topxstats.amount, trs.size()],
					data = [];
				for(var d = 0; d < amount[0]; d++) {
					if(d < amount[1]) {
						tds = trs.eq(d).find("td");
						data[data.length] = topxstats.tools.filterData(this.id, [
							["username", tds.eq(0).html()],
							["group", tds.eq(1).html()],
							["lastactivity", tds.eq(2).html()],
							["joindate", tds.eq(3).html()],
							["posts", tds.eq(4).html()]
						]);
					} else {
						data[data.length] = topxstats.tools.generatePlaceholder(this.colspan);
					}
				}
				return data;
			}
		},
		"newest-members" : {
			"id" : "newest-members",
			"url" : main_url + "members/?search_type=start&name=&group=0&sort=join_unix&order=d",
			"cb" : function(d) {
				var	trs = $("#member_list_full tbody tr", d).not(":first, :last").not(":first"),
					tds,
					amount = [topxstats.amount, trs.size()],
					data = [];
				for(var d = 0; d < amount[0]; d++) {
					if(d < amount[1]) {
						tds = trs.eq(d).find("td");
						data[data.length] = topxstats.tools.filterData(this.id, [
							["username", tds.eq(0).html()],
							["group", tds.eq(1).html()],
							["lastactivity", tds.eq(2).html()],
							["joindate", tds.eq(3).html()],
							["posts", tds.eq(4).html()]
						]);
					} else {
						data[data.length] = topxstats.tools.generatePlaceholder(this.colspan);
					}
				}
				return data;
			}
		},
		"recently-active" : {
			"id" : "recently-active",
			"url" : main_url + "members/?search_type=start&name=&group=0&sort=recent_activity&order=d",
			"cb" : function(d) {
				var	trs = $("#member_list_full tbody tr", d).not(":first, :last").not(":first"),
					tds,
					amount = [topxstats.amount, trs.size()],
					data = [];
				for(var d = 0; d < amount[0]; d++) {
					if(d < amount[1]) {
						tds = trs.eq(d).find("td");
						data[data.length] = topxstats.tools.filterData(this.id, [
							["username", tds.eq(0).html()],
							["group", tds.eq(1).html()],
							["lastactivity", tds.eq(2).html()],
							["joindate", tds.eq(3).html()],
							["posts", tds.eq(4).html()]
						]);
					} else {
						data[data.length] = topxstats.tools.generatePlaceholder(this.colspan);
					}
				}
				return data;
			}
		},
		"todays-posters" : {
			"id" : "todays-posters",
			"url" : main_url + "stats/top_posters/",
			"cb"  : function(d) {
				var trs = $("#top_posters tbody tr", d).not(":first, :last"),
					tds,
					amount = [topxstats.amount, trs.size()],
					data = [];
				$("#topxstats_todays-posters a").html(topxstats.modules[this.id].title + " (" + ($("#top_posters tr:last td", d).html().replace(/[^\d]+/, "")) + " posts made)");
				for(var d = 0; d < amount[0]; d++) {
					if(d < amount[1]) {
						tds = trs.eq(d).find("td");
						data[data.length] = topxstats.tools.filterData(this.id, [
							["username", tds.eq(1).html()],
							["joindate", tds.eq(2).html()],
							["posts", tds.eq(3).html()],
							["percentage", tds.eq(4).html()]
						]);
					} else {
						data[data.length] = topxstats.tools.generatePlaceholder(this.colspan);
					}
				}
				return data;
			}
		},
		"newest-replies" : {
			"id" : "newest-replies",
			"url" : main_url + "site",
			"cb" : function(d) {
				var	trs = $("#portal_main div:contains(Latest Posts)", d).parent().find("div.portal_content"),
					tds,
					amount = [topxstats.amount, trs.size()],
					data = [];
				for(var d = 0; d < amount[0]; d++) {
					if(d < amount[1]) {
						tds = trs.eq(d);
						data[data.length] = topxstats.tools.filterData(this.id, [
							["topic", tds.prev().find("a").parent().html()],
							["username", '<a href="' + tds.find("a").attr("href") + '">' + tds.find("a").text() + '</a>'],
							["replies", +tds.text().replace(/.*Replies: /, "")]
						]);
					} else {
						data[data.length] = topxstats.tools.generatePlaceholder(this.colspan);
					}
				}
				return data;
			}
		},
		"active-topics" : {
			"id" : "active-topics",
			"url" : main_url + "search/?c=5",
			"cb" : function(d) {
				var	trs = $("table.forums tr", d).filter(".row1, .row2"),
					tds,
					amount = [topxstats.amount, trs.size()],
					data = [],
					title;
				for(var d = 0; d < amount[0]; d++) {
					if(d < amount[1]) {
						tds = trs.eq(d);
						title = tds.find(".c_cat-title:eq(0)");
						title.find(":not(a)").remove();
						data[data.length] = topxstats.tools.filterData(this.id, [
							["title", title.html()],
							["starter", tds.find(".c_cat-starter").html()],
							["forum", tds.find(".c_cat-title:eq(1)").html()],
							["replies", tds.find(".c_cat-replies").html()],
							["views", tds.find(".c_cat-views").html()],
							["info", tds.find(".c_cat-lastpost").html()]
						]);
					} else {
						data[data.length] = topxstats.tools.generatePlaceholder(this.colspan);
					}
				}
				return data;
			}
		}
	},
	load : function(modules){ // can load all modules by passing nothing, or specific modules by passing an array of ids

		var that = this;
		modules = modules || (function() {
			var to_load = [];
			for(var m in that.modules) {
				if(that.tools.modules.state.get(that.modules[m].id) == "on") {
					to_load[to_load.length] = that.modules[m].id;
				}
			}
			return to_load;
		})();

		for(var m = 0; m < modules.length; m++) {
			this.tools.modules.load(modules[m]);
		}

	},
	settings : {
		ini : function() {

			var	that = topxstats,
				modules = that.modules,
				module,
				content = '<tr><th colspan="3">General</th></tr><tr><td>Reset</td><td class="reset" colspan="2"><a href="javascript:topxstats.settings.reset.ask();">Reset ALL Settings</a></td></tr>';

			var visible = that.tools.get("show", that.show) == "yes";
			var position = that.tools.get("position", that.position) == "top";

			content += '<tr><td>Visibility</td><td colspan="2">' + (visible ? 'Showing' : 'Hiding') + ' [<a href="javascript:topxstats.settings.visibility(\'' + (visible ? "no" : "yes") + '\');">' + (visible ? 'Hide' : 'Show') + '</a>]</td></tr><tr><td>Position</td><td colspan="2">' + (position ? 'Top' : 'Bottom') + ' [<a href="javascript:topxstats.settings.position(\'' + (position ? "bottom" : "top") + '\');">' + (position ? 'Move to Bottom' : 'Move to Top') + '</a>]</td></tr><tr><th colspan="3">Sections</th></tr>';

			for(var m in modules) {
				module = modules[m];
				if(that.tools.modules.state.get(module.id) != "disable") {
					state = that.tools.modules.state.get(module.id) == "on";
					state = (state ? 'Enabled' : 'Disabled') + ' [<a href="javascript:topxstats.settings.state(\'' + module.id + '\');">' + (state ? 'Disable' : 'Enable') + '</a>]';
					content += '<tr class="row"><td>' + module.title + '</td><td>' + state + '</td><td><a href="javascript:topxstats.settings.module.ini(\'' + module.id + '\');">More Settings</a></td></tr>';
				}
			}

			content += '<tr><td class="c_foot" colspan="3" /></tr>';

			that.tools.modules.status("refresh");
			$("#topxstats .status a").attr("href", "javascript:topxstats.ini();");
			$("#topxstats table.forums tbody").html(content);
			$("#topxstats table.forums tbody tr.row td").css("width", "33%");

		},
		state : function(id) {
			var	that = topxstats;
			that.tools.modules.state.set(id, that.tools.modules.state.get(id) == "on" ? "off" : "on");
			this.ini();
		},
		module : {
			ini : function(id) {
				var	that = topxstats,
					module = that.modules[id],
					data = module.data,
					content = '<tr><th colspan="2">' + module.title + ' Settings</th></tr>';

				for(var d in data) {
					if(that.tools.modules.sub_state.get(id, d) != "disable") {
						state = that.tools.modules.sub_state.get(id, d) == "on";
						content += '<tr class="row"><td>' + data[d].title + '</td><td>' + (state ? "Enabled" : "Disabled") + ' [<a href="javascript:topxstats.settings.module.state(\'' + module.id + '\', \'' + d + '\');">' + (state ? "Disable" : "Enable") + '</a>]</td></tr>';
					}
				}

				content += '<tr><td class="c_foot" colspan="2" /></tr>';

				$("#topxstats table.forums tbody").html(content);
				$("#topxstats table.forums tbody tr.row td").css("width", "50%");

			},
			state : function(id, did) {
				topxstats.tools.modules.sub_state.set(id, did, topxstats.tools.modules.sub_state.get(id, did) == "on" ? "off" : "on");
				this.ini(id);
			}
		},
		reset : {
			ask : function() {
				$("#topxstats .reset").html('Are you sure you want to reset all settings? [<a href="javascript:topxstats.settings.reset.perform();">Yes</a>] &middot; [<a href="javascript:topxstats.settings.ini();">No</a>]');
			},
			perform : function() {
				var	that = topxstats,
					del = that.tools.del,
					module;

				for(var m in that.modules) {
					module = that.modules[m];
					del(module.id + "_show");
					for(var d in module.data) {
						del(module.id + "_" + d + "_show");
					}
				}

				del("show");
				del("position");

				topxstats.settings.ini();
			}
		},
		visibility : function(state) {
			topxstats.tools.set("show", state);
			topxstats.settings.ini();
		},
		position : function(state) {
			topxstats.tools.set("position", state);
			topxstats.settings.ini();
		}
	},
	table : {
		generateCols : function(amount, current) {
			current = current || "";
			if(amount--) return this.generateCols(amount, current + '<td></td>');
			else return current;
		},
		generateTable : function(rows, cols, current) {
			current = current || "";
			if(rows--) return this.generateTable(rows, cols, current + '<tr class="row">' + this.generateCols(cols) + '</tr>');
			else return current;
		},
		destroy : function() {
			$("#topxstats").remove();
		},
		create : function() {

			var that = topxstats;

			var show = that.tools.get("show", that.show) === "yes";
			var hide_show = '<span class="' + (show ? 'collapse' : 'uncollapse') + '"><a href="javascript:topxstats.tools.' + (show ? 'collapse' : 'expand') + '();"><img src="' + (show ? that.collapse : that.expand) + '" alt="' + (show ? '-' : '+') + '"></a></span>';
			var status = show ? ' <span class="settings"><a href="javascript:topxstats.settings.ini();">' + that.options + '</a></span> &middot; <span class="status"></span>' : '';
			var title = '<a href="javascript:topxstats.ini();" class="title">' + that.title + '</a>';

			if(show) {

				var	module,
					colspan = 0,
					header = '<tr></tr>',
					header2 = '<tr></tr>',
					data,
					d;

				for(var m in that.modules) {
					module = that.modules[m];
					if(that.tools.modules.state.get(module.id) == "on") {
						module.colspan = that.tools.countCols(module.id);
						header += '<th colspan="' + module.colspan + '" id="topxstats_' + module.id + '" data-start="' + colspan + '"><a href="javascript:topxstats.load([\'' + module.id + '\']);" title="Refresh">' + module.title + '</a> <span class="mini-loader"></span></th>';
						data = module.data;
						for(d in data) {
							if(that.tools.modules.sub_state.get(module.id, d) != "on") continue;
							header2 += '<th>' + data[d].title + '</th>';
						}
						colspan += module.colspan;
					}
				}

				var body = colspan == 0 ? '<tr><td>You have not enabled any sections to show here. Please click <a href="javascript:topxstats.settings.ini();">here</a> to adjust your settings.</td></tr>' : this.generateTable(that.amount, colspan);

			} else {

				var	header = '',
					header2 = '',
					body = '',
					colspan = 1;

			}

			if(that.h2) {
				var content = '<div class="category" id="topxstats"><div class="h2wrap"><div class="h2left"><div class="h2right"><div class="h2center">' + hide_show + title + status + '</div></div></div></div><table class="forums" cellspacing="0" style="display: table;"><tbody>' + header + header2 + body + '<tr><td class="c_foot" colspan="' + colspan + '"></td></tr></tbody></table></div>';
			} else {
				var content = '<div id="topxstats" class="category"><table class="cat_head"><tbody><tr><td><h2>' + hide_show + title + status + '</h2></td></tr></tbody></table><table class="forums" cellspacing="0" style="display: table;"><tbody>' + header + header2 + body + '<tr><td class="c_foot" colspan="' + colspan + '"></td></tr></tbody></table></div>';
			}

			if(that.tools.get("position", that.position) == "top") $("#main").prepend(content);
			else $("#main").append(content);

			that.tools.modules.status("refresh");

			// equal width for each block
			$("#topxstats tr.row:first td").css("width", 100 / colspan + "%");

			// initially hide rows
			$("#topxstats tr.row").hide();

		}
	},
	tools : {
		get : function(id, default_val) {
			return $.zb.cookie.get("topxstats-" + id) || default_val;
		},
		set : function(id, val, time) {
			time = time || 365;
			return $.zb.cookie.set("topxstats-" + id, val, time);
		},
		del : function(id) {
			return $.zb.cookie.del("topxstats-" + id);
		},
		modules : {
			load : function(id) {
				$("#topxstats_" + id).addClass("loading").find("span.mini-loader").html(topxstats["mini-loading"]);
				this.pull(topxstats.modules[id]);
				this.status("loading");
			},
			pull : function(module) {
				$.ajax({
					url : module.url,
					type : "GET",
					beforeSend : function(e) {
						e.setRequestHeader("X-Requested-With", {
							toString: function() {
								return ""
							}
						})
					},
					success : function(d) {
						var data = module.cb(d);
						var header = $("#topxstats_" + module.id);
						var start = header.data("start");

						for(var d = 0; d < topxstats.amount; d++) {
							for(var m = 0; m < module.colspan; m++) {
							$("#topxstats tr.row:eq(" + d + ") td:eq(" + (start + m) + ")").html(data[d][m]);
							}
						}

						header.removeClass("loading").find(".mini-loader").empty();
						$("#topxstats tr.row").show();

						if(!$("#topxstats th.loading").size()) {
							topxstats.tools.modules.status("refresh");
						}

					}
				});
			},
			status : function(state) {
				var holder = $("#topxstats .status");
				switch(state) {
					case "loading" : holder.html(topxstats.loading); break;
					case "refresh" : holder.html('<a href="javascript:topxstats.load();">' + topxstats.refresh + '</a>'); break;
				}
			},
			state : {
				get : function(id) {
					return topxstats.modules[id].state == "disable" ? "disable" : topxstats.tools.get(id + "_show", topxstats.modules[id].state);
				},
				set : function(id, state) {
					return topxstats.tools.set(id + "_show", state);
				}
			},
			sub_state : {
				get : function(id, did) {
					return topxstats.modules[id].data[did].state == "disable" ? "disable" : topxstats.tools.get(id + "_" + did + "_show", topxstats.modules[id].data[did].state);
				},
				set : function(id, did, state) {
					if(state == "on" || topxstats.tools.countCols(id) == 0) topxstats.tools.modules.state.set(id, state); // enable module if enabling sub-set or disable module id all sub-sets disabled
					return topxstats.tools.set(id + "_" + did + "_show", state);
				}
			}
		},
		collapse : function() {
			this.set("show", "no");
			topxstats.ini();
		},
		expand : function() {
			this.set("show", "yes");
			topxstats.ini();
		},
		countCols : function(id) {
			var colspan = 0;
			var data = topxstats.modules[id].data;
			for(var d in data) {
				colspan += +(this.modules.sub_state.get(id, d) == "on");
			}
			return colspan;
		},
		filterData : function(id, info) {
			var data = topxstats.modules[id].data;
			var arr = [];
			for(var i = 0; i < info.length; i++) {
				if(!(info[i][0] in data) || this.modules.sub_state.get(id, info[i][0]) != "on") continue;
				arr[arr.length] = info[i][1];
			}
			return arr;
		},
		generatePlaceholder : function(len) {
			var	arr = [],
				ph = topxstats.placeholder;
			for(var l = 0; l < len; l++) arr[l] = ph;
			return arr;
		}
	}
});

topxstats.ini();
