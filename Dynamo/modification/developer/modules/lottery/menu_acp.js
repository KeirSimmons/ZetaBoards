sub_holder = $("<div>").addClass("dynamo_menu_holder");
	$("<div>").addClass("dynamo_menu_header dynamo_lottery_acp").text(dynamo.server.modules.lottery.name).data({load : "lottery", m : "lottery", p1 : "acp"}).appendTo(sub_holder);
	sub_tab_holder = $("<div>").addClass("dynamo_tab_holder");
		$("<div>").addClass("dynamo_tab dynamo_lottery_acp_current").text("Current " + dynamo.server.modules.lottery.name).data({p2 : "current", c : "form"}).appendTo(sub_tab_holder);
	sub_tab_holder.appendTo(sub_holder);
sub_holder.appendTo(tab_holder);