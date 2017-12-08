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