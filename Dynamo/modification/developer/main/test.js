$("body").on("dynamo_loaded", function() {
	if("notifications" in dynamo.server.modules) {
		var poke_profile = "Poke"; // Poke link in profile ("___ USERNAME")
		var poke_post = "Poke"; // Poke link in topics and posts. Recommended to use an image: "<img src='imagelink.png' alt='Poke' />"
		dynamo.user_mods.poke_user = function(zbid, state) {
			$("a.dynamo_poke_" + zbid).remove();
			if(state == 2) {
				var notification = $(".dynamo_jgrowl a[href=" + main_url + "profile/" + zbid + "] ~ :contains('Poke them back')").closest(".qtip");
				var username = notification.find(".qtip-content a:first").eq(0).text();
				notification.qtip('hide');
			} else {
				var username = document.title;
			}
			dynamo.tip.growl.show({
				title : "Poked",
				message : "The user has been poked!"
			});
			dynamo.module.server_call(2, {
				m : "notifications",
				p1 : "add",
				info : {
					zbid : zbid,
					message : "[url=[main]profile/" + dynamo.toolbox.get_zbid() + "]" + dynamo.toolbox.get_username() + "[/url] has poked you" + (state == 1 ? '' : ' back') + ". [url=javascript:dynamo.user_mods.poke_user(" + dynamo.toolbox.get_zbid() + ", 2);]Poke them back[/url]."
				}
			});
		}
		var my_zbid = dynamo.toolbox.get_zbid();
		if(/profile/.test(location.href)) {
			var zbid = /mid=(\d+)/.exec($("a[href*='mid=']:first").attr("href"))[1];
			if(zbid != my_zbid) {
				$("#profile_menu ul").append('<li><a class="dynamo_poke_' + zbid + '" href="javascript:dynamo.user_mods.poke_user(' + zbid + ', 1);">' + poke_profile + ' ' + document.title + '</a></li>');
			}
		} else {
			$("tr.c_postfoot td, td.c_postfoot").each(function() {
				var a = $(this).find("img[alt=Profile]").closest("a");
				if(a.size()) {
					var zbid = a.attr("href").match(/profile\/(\d+)/)[1];
					if(zbid != my_zbid) {
						console.log(a);
						$(this).append('<a class="dynamo_poke_' + zbid + '" href="javascript:dynamo.user_mods.poke_user(' + zbid + ', 1);">' + poke_post + '</a>');
					}
				}
			});
		}
	}
});