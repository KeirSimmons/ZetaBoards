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