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
		
		/% ACP MENUS HERE %/
		
		/* END ADMIN CP FOR OTHER MODULES HERE */
		
	tab_holder.appendTo(holder);	
menu_info["acp"] = holder;

/* END MENU FOR acp MODULE */