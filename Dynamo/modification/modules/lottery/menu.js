/* START MENU FOR lottery MODULE */

holder = $("<div>").addClass("dynamo_menu_holder");
	$("<div>").addClass("dynamo_menu_header dynamo_lottery").text(dynamo.server.modules.lottery.name).data({load : "lottery", m : "lottery"}).appendTo(holder);
	var tab_holder = $("<div>").addClass("dynamo_tab_holder");
		$("<div>").addClass("dynamo_tab dynamo_lottery_current").data({p1 : "current", c : "show"}).text("Current " + dynamo.server.modules.lottery.name).appendTo(tab_holder);
		$("<div>").addClass("dynamo_tab dynamo_lottery_previous").data({p1 : "previous", c : "show"}).text("Previous " + dynamo.toolbox.plural(dynamo.server.modules.lottery.name)).appendTo(tab_holder);
	tab_holder.appendTo(holder);
menu_info["lottery"] = holder;

/* END MENU FOR lottery MODULE */