var shop = $("<div>").addClass("dynamo_tab_holder");
	$("<div>").addClass("dynamo_tab dynamo_shop").text(dynamo.settings.shop_name).data({load:"shop",p:"shop"}).appendTo(shop);
	var shop_holder = $("<div>").addClass("dynamo_tab_holder");
		$("<div>").addClass("dynamo_tab dynamo_shop_official").data({t:"enter",shop_zbid:0}).text("Enter Official " + dynamo.settings.shop_name).appendTo(shop_holder);
		$("<div>").addClass("dynamo_tab dynamo_shop_members").data({t:"members"}).text("View Member's " + dynamo.toolbox.plural(dynamo.settings.shop_name)).appendTo(shop_holder);
		$("<div>").addClass("dynamo_tab dynamo_shop_mine").text("Manage my " + dynamo.settings.shop_name).appendTo(shop_holder);
		var mine = $("<div>").addClass("dynamo_tab_holder");
			$("<div>").addClass("dynamo_tab dynamo_shop_mine_settings").text("Settings").appendTo(mine);
			$("<div>").addClass("dynamo_tab dynamo_shop_mine_add").text("Add Items").appendTo(mine);
			$("<div>").addClass("dynamo_tab dynamo_shop_mine_edit").text("Edit Items").appendTo(mine);
			$("<div>").addClass("dynamo_tab dynamo_shop_mine_purchases").text("View Purchases").appendTo(mine);
		mine.appendTo(shop_holder);
		$("<div>").addClass("dynamo_tab dynamo_shop_inventory").text("View " + dynamo.settings.shop_inventory_name).appendTo(shop_holder);
		//$("<div>").addClass("dynamo_tab dynamo_shop_").text().appendTo(shop_holder);
		shop_holder.appendTo(shop);
shop.appendTo(menu_holder);