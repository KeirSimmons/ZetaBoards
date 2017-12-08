/* START MENU FOR level MODULE */

holder = $("<div>").addClass("dynamo_menu_holder");
	$("<div>").addClass("dynamo_menu_header dynamo_currency").text(dynamo.server.modules.level.name).data({load : "level", m : "level"}).appendTo(holder);
	var tab_holder = $("<div>").addClass("dynamo_tab_holder");
		$("<div>").addClass("dynamo_tab dynamo_level_stats").data({p1 : "stats"}).text("My Stats").appendTo(tab_holder);
	tab_holder.appendTo(holder);
menu_info["level"] = holder;

/* END MENU FOR level MODULE */