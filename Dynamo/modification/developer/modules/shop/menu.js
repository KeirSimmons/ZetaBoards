/* START MENU FOR shop MODULE */

holder = $("<div>").addClass("dynamo_menu_holder");
	$("<div>").addClass("dynamo_menu_header dynamo_shop").text(dynamo.toolbox.plural(dynamo.server.modules.shop.name)).data({load : "shop", m : "shop"}).appendTo(holder);
	var tab_holder = $("<div>").addClass("dynamo_tab_holder");
		$("<div>").addClass("dynamo_tab dynamo_shop_official").data({p1 : "official", c : "view"}).text("Official " + dynamo.server.modules.shop.settings.name).appendTo(tab_holder);
		$("<div>").addClass("dynamo_tab dynamo_shop_mine").data({p1 : "mine", c : "view"}).text("My " + dynamo.server.modules.shop.settings.name).appendTo(tab_holder);
		$("<div>").addClass("dynamo_tab dynamo_shop_search").data({p1 : "search", c : "form"}).text("Search " + dynamo.server.modules.shop.settings.name).appendTo(tab_holder);
		$("<div>").addClass("dynamo_tab dynamo_shop_purchases").data({p1 : "purchases"}).text("My Purchases").appendTo(tab_holder);
	tab_holder.appendTo(holder);
menu_info["shop"] = holder;

/* END MENU FOR shop MODULE */