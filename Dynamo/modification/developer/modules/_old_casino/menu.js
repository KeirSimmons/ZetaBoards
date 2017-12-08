var casino = $("<div>").addClass("dynamo_tab_holder");
	$("<div>").addClass("dynamo_tab dynamo_casino").text(dynamo.settings.casino_name).data({"load":"casino","p":"casino","t":"lottery"}).appendTo(casino);
	var casino_holder = $("<div>").addClass("dynamo_tab_holder"); // Make lottery into its own tab after releasing other casino plugins!
		$("<div>").addClass("dynamo_tab dynamo_casino_currentlottery").data({"c":"get_current"}).text("Current " + dynamo.settings.casino_lottery_name).appendTo(casino_holder);
		$("<div>").addClass("dynamo_tab dynamo_casino_previouslottery").data({"c":"past"}).text("Previous " + dynamo.toolbox.plural(dynamo.settings.casino_lottery_name)).appendTo(casino_holder);
	casino_holder.appendTo(casino);
casino.appendTo(menu_holder);