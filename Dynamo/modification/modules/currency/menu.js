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