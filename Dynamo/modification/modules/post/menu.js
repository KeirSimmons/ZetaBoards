/* START MENU FOR post MODULE */

holder = $("<div>").addClass("dynamo_menu_holder");
	$("<div>").addClass("dynamo_menu_header dynamo_post").text(dynamo.server.modules.post.name).data({load : "post", m : "post"}).appendTo(holder);
	var tab_holder = $("<div>").addClass("dynamo_tab_holder");
		$("<div>").addClass("dynamo_tab dynamo_post_current").data({p1 : "current"}).text("Current Competition").appendTo(tab_holder);
	tab_holder.appendTo(holder);
menu_info["post"] = holder;

/* END MENU FOR post MODULE */