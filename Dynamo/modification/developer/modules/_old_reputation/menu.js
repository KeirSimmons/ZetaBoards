var reputation = $("<div>").addClass("dynamo_tab_holder");
	$("<div>").addClass("dynamo_tab dynamo_reputation").text(dynamo.settings.reputation_name).appendTo(reputation);
	var reputation_holder = $("<div>").addClass("dynamo_tab_holder");
		$("<div>").addClass("dynamo_tab dynamo_reputation_log").text("Log").appendTo(reputation_holder);
		reputation_holder.appendTo(reputation);
reputation.appendTo(menu_holder);