var menu_info = [], holder, tab_holder, sub_holder, sub_tab_holder;

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