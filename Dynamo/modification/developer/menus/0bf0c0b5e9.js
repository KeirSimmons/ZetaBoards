var menu_info = [], holder, tab_holder, sub_holder, sub_tab_holder;

/* START MENU FOR acp MODULE */

holder = $("<div>").addClass("dynamo_menu_holder");
	$("<div>").addClass("dynamo_menu_header dynamo_acp").text("Admin CP").appendTo(holder);
	tab_holder = $("<div>").addClass("dynamo_tab_holder");
		sub_holder = $("<div>").addClass("dynamo_menu_holder");
			$("<div>").addClass("dynamo_menu_header dynamo_acp_main").data({load : "acp", m : "acp"}).text("Main Settings").appendTo(sub_holder);
			sub_tab_holder = $("<div>").addClass("dynamo_tab_holder");
				// board advert
				sub_sub_holder = $("<div>").addClass("dynamo_menu_holder");
					$("<div>").addClass("dynamo_menu_header dynamo_acp_main_ad").data({p1 : "ad"}).text("Board Advert").appendTo(sub_sub_holder);
					sub_sub_tab_holder = $("<div>").addClass("dynamo_tab_holder");
						$("<div>").addClass("dynamo_tab dynamo_acp_ad_info").text("Information").data({p2 : "info"}).appendTo(sub_sub_tab_holder);
						$("<div>").addClass("dynamo_tab dynamo_acp_ad_credits").text("Credits").data({p2 : "credits"}).appendTo(sub_sub_tab_holder);
						$("<div>").addClass("dynamo_tab dynamo_acp_ad_mine").text("My Advert").data({p2 : "mine", c : "form"}).appendTo(sub_sub_tab_holder);
						$("<div>").addClass("dynamo_tab dynamo_acp_ad_stats").text("Stats").data({p2 : "stats"}).appendTo(sub_sub_tab_holder);
					sub_sub_tab_holder.appendTo(sub_sub_holder);
				sub_sub_holder.appendTo(sub_tab_holder);
				// end board advert
				$("<div>").addClass("dynamo_tab dynamo_acp_overview").text("Overview").data({p1 : "overview"}).appendTo(sub_tab_holder);
				$("<div>").addClass("dynamo_tab dynamo_acp_domains").text("Domain Manager").data({p1 : "domains", c : "list"}).appendTo(sub_tab_holder);
				$("<div>").addClass("dynamo_tab dynamo_acp_modules").text("Modules").data({p1 : "modules", c : "list"}).appendTo(sub_tab_holder);
				$("<div>").addClass("dynamo_tab dynamo_acp_groups").text("Groups (Permissions)").data({p1 : "groups", c :"list"}).appendTo(sub_tab_holder);
				$("<div>").addClass("dynamo_tab dynamo_acp_refresh").text("Refresh User").data({p1 : "refresh", c : "list"}).appendTo(sub_tab_holder);
			sub_tab_holder.appendTo(sub_holder);
		sub_holder.appendTo(tab_holder);
		
		/* START ADMIN CP FOR OTHER MODULES HERE */
		
		

sub_holder = $("<div>").addClass("dynamo_menu_holder");
	$("<div>").addClass("dynamo_menu_header dynamo_currency_acp").text(dynamo.server.modules.currency.name).data({load : "currency", m : "currency", p1 : "acp"}).appendTo(sub_holder);
	sub_tab_holder = $("<div>").addClass("dynamo_tab_holder");
		$("<div>").addClass("dynamo_tab dynamo_currency_acp_main").text("Main Settings").data({p2 : "main", c : "form"}).appendTo(sub_tab_holder);
		$("<div>").addClass("dynamo_tab dynamo_currency_acp_post").text(dynamo.server.modules.currency.settings.name + " per Post").data({p2 : "post", c : "groups"}).appendTo(sub_tab_holder);
		$("<div>").addClass("dynamo_tab dynamo_currency_acp_interest").text("Interest Settings").data({p2 : "interest", c : "groups"}).appendTo(sub_tab_holder);
		$("<div>").addClass("dynamo_tab dynamo_currency_acp_donate").text("Donation Settings").data({p2 : "donate", c : "groups"}).appendTo(sub_tab_holder);
		$("<div>").addClass("dynamo_tab dynamo_currency_acp_user").text("Edit User").data({p2 : "user", c : "search"}).appendTo(sub_tab_holder);
	sub_tab_holder.appendTo(sub_holder);
sub_holder.appendTo(tab_holder);

sub_holder = $("<div>").addClass("dynamo_menu_holder");
	$("<div>").addClass("dynamo_menu_header dynamo_level_acp").text(dynamo.server.modules.level.name).data({load : "level", m : "level", p1 : "acp"}).appendTo(sub_holder);
	sub_tab_holder = $("<div>").addClass("dynamo_tab_holder");
		$("<div>").addClass("dynamo_tab dynamo_level_acp_main").text("Main Settings").data({p2 : "main", c : "form"}).appendTo(sub_tab_holder);
		$("<div>").addClass("dynamo_tab dynamo_level_acp_progression").text("Progression Settings").data({p2 : "progression", c : "form"}).appendTo(sub_tab_holder);
		$("<div>").addClass("dynamo_tab dynamo_level_acp_post").text(dynamo.server.modules.level.settings.exp_name + " per Post").data({p2 : "post", c : "groups"}).appendTo(sub_tab_holder);
		$("<div>").addClass("dynamo_tab dynamo_level_acp_user").text("Edit User").data({p2 : "user", c : "search"}).appendTo(sub_tab_holder);
		$("<div>").addClass("dynamo_tab dynamo_level_acp_reset").text("Reset").data({p2 : "reset", c : "confirm"}).appendTo(sub_tab_holder);
	sub_tab_holder.appendTo(sub_holder);
sub_holder.appendTo(tab_holder);

sub_holder = $("<div>").addClass("dynamo_menu_holder");
	$("<div>").addClass("dynamo_menu_header dynamo_lottery_acp").text(dynamo.server.modules.lottery.name).data({load : "lottery", m : "lottery", p1 : "acp"}).appendTo(sub_holder);
	sub_tab_holder = $("<div>").addClass("dynamo_tab_holder");
		$("<div>").addClass("dynamo_tab dynamo_lottery_acp_current").text("Current " + dynamo.server.modules.lottery.name).data({p2 : "current", c : "form"}).appendTo(sub_tab_holder);
	sub_tab_holder.appendTo(sub_holder);
sub_holder.appendTo(tab_holder);

sub_holder = $("<div>").addClass("dynamo_menu_holder");
	$("<div>").addClass("dynamo_menu_header dynamo_member_tag_acp").text(dynamo.server.modules.member_tag.name).data({load : "member_tag", m : "member_tag", p1 : "acp"}).appendTo(sub_holder);
	sub_tab_holder = $("<div>").addClass("dynamo_tab_holder");
		$("<div>").addClass("dynamo_tab dynamo_member_tag_acp_main").text("Main Settings").data({p2 : "main", c : "form"}).appendTo(sub_tab_holder);
	sub_tab_holder.appendTo(sub_holder);
sub_holder.appendTo(tab_holder);

sub_holder = $("<div>").addClass("dynamo_menu_holder");
	$("<div>").addClass("dynamo_menu_header dynamo_online_acp").text(dynamo.server.modules.online.name).data({load : "online", m : "online", p1 : "acp"}).appendTo(sub_holder);
	sub_tab_holder = $("<div>").addClass("dynamo_tab_holder");
		$("<div>").addClass("dynamo_tab dynamo_online_acp_main").text("Settings").data({p2 : "main", c : "form"}).appendTo(sub_tab_holder);
	sub_tab_holder.appendTo(sub_holder);
sub_holder.appendTo(tab_holder);

sub_holder = $("<div>").addClass("dynamo_menu_holder");
	$("<div>").addClass("dynamo_menu_header dynamo_post_acp").text(dynamo.server.modules.post.name).data({load : "post", m : "post", p1 : "acp"}).appendTo(sub_holder);
	sub_tab_holder = $("<div>").addClass("dynamo_tab_holder");
		$("<div>").addClass("dynamo_tab dynamo_post_acp_main").text("Current Competition").data({p2 : "current", c : "form"}).appendTo(sub_tab_holder);
	sub_tab_holder.appendTo(sub_holder);
sub_holder.appendTo(tab_holder);
		
		/* END ADMIN CP FOR OTHER MODULES HERE */
		
	tab_holder.appendTo(holder);	
menu_info["acp"] = holder;

/* END MENU FOR acp MODULE */

/* START MENU FOR currency MODULE */

holder = $("<div>").addClass("dynamo_menu_holder");
	$("<div>").addClass("dynamo_menu_header dynamo_currency").text(dynamo.server.modules.currency.name).data({load : "currency", m : "currency"}).appendTo(holder);
	var tab_holder = $("<div>").addClass("dynamo_tab_holder");
		$("<div>").addClass("dynamo_tab dynamo_currency_transactionhistory").data({p1 : "history", c : "show"}).text("Transaction History").appendTo(tab_holder);
		$("<div>").addClass("dynamo_tab dynamo_currency_balance").data({p1 : "balance"}).text("Check Balance").appendTo(tab_holder);
		$("<div>").addClass("dynamo_tab dynamo_currency_interest").data({p1 : "interest"}).text("Collect Interest").appendTo(tab_holder);
		$("<div>").addClass("dynamo_tab dynamo_currency_donate").data({p1 : "donate", c : "form"}).text("Donate").appendTo(tab_holder);
	tab_holder.appendTo(holder);
menu_info["currency"] = holder;

/* END MENU FOR currency MODULE */

/* START MENU FOR level MODULE */

holder = $("<div>").addClass("dynamo_menu_holder");
	$("<div>").addClass("dynamo_menu_header dynamo_currency").text(dynamo.server.modules.level.name).data({load : "level", m : "level"}).appendTo(holder);
	var tab_holder = $("<div>").addClass("dynamo_tab_holder");
		$("<div>").addClass("dynamo_tab dynamo_level_stats").data({p1 : "stats"}).text("My Stats").appendTo(tab_holder);
	tab_holder.appendTo(holder);
menu_info["level"] = holder;

/* END MENU FOR level MODULE */

/* START MENU FOR lottery MODULE */

holder = $("<div>").addClass("dynamo_menu_holder");
	$("<div>").addClass("dynamo_menu_header dynamo_lottery").text(dynamo.server.modules.lottery.name).data({load : "lottery", m : "lottery"}).appendTo(holder);
	var tab_holder = $("<div>").addClass("dynamo_tab_holder");
		$("<div>").addClass("dynamo_tab dynamo_lottery_current").data({p1 : "current", c : "show"}).text("Current " + dynamo.server.modules.lottery.name).appendTo(tab_holder);
		$("<div>").addClass("dynamo_tab dynamo_lottery_previous").data({p1 : "previous", c : "show"}).text("Previous " + dynamo.toolbox.plural(dynamo.server.modules.lottery.name)).appendTo(tab_holder);
	tab_holder.appendTo(holder);
menu_info["lottery"] = holder;

/* END MENU FOR lottery MODULE */

/* START MENU FOR notification center MODULE */

holder = $("<div>").addClass("dynamo_menu_holder");
	$("<div>").addClass("dynamo_menu_header dynamo_notifications").text(dynamo.server.modules.notifications.name).data({load : "notifications", m : "notifications"}).appendTo(holder);
	var tab_holder = $("<div>").addClass("dynamo_tab_holder");
		$("<div>").addClass("dynamo_tab dynamo_notifications_unread").data({p1 : "log", c : "new"}).text("Unread").appendTo(tab_holder);
		$("<div>").addClass("dynamo_tab dynamo_notifications_read").data({p1 : "log", c : "old"}).text("History").appendTo(tab_holder);
		$("<div>").addClass("dynamo_tab dynamo_notifications_settings").data({p1 : "settings", c : "form"}).text("Settings").appendTo(tab_holder);
	tab_holder.appendTo(holder);
menu_info["notifications"] = holder;

/* END MENU FOR notification center MODULE */

/* START MENU FOR post MODULE */

holder = $("<div>").addClass("dynamo_menu_holder");
	$("<div>").addClass("dynamo_menu_header dynamo_post").text(dynamo.server.modules.post.name).data({load : "post", m : "post"}).appendTo(holder);
	var tab_holder = $("<div>").addClass("dynamo_tab_holder");
		$("<div>").addClass("dynamo_tab dynamo_post_current").data({p1 : "current"}).text("Current Competition").appendTo(tab_holder);
	tab_holder.appendTo(holder);
menu_info["post"] = holder;

/* END MENU FOR post MODULE */