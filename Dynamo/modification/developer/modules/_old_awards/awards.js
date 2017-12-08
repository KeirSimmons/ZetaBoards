var awards = $("<div>").addClass("dynamo_tab_holder");
	$("<div>").addClass("dynamo_tab dynamo_awards").text(dynamo.toolbox.plural(dynamo.settings.awards_name)).data({"load":"awards","p":"awards"}).appendTo(awards);
	var awards_holder = $("<div>").addClass("dynamo_tab_holder");
		$("<div>").addClass("dynamo_tab dynamo_awards_achieved").data({t:"achieved"}).text("Achieved").appendTo(awards_holder);
		$("<div>").addClass("dynamo_tab dynamo_awards_list").data({t:"list"}).text("List of " + dynamo.toolbox.plural(dynamo.settings.awards_name)).appendTo(awards_holder);
	awards_holder.appendTo(awards);
awards.appendTo(menu_holder);