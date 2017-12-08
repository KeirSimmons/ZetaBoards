var post = $("<div>").addClass("dynamo_tab_holder");
	$("<div>").addClass("dynamo_tab dynamo_post").text(dynamo.settings.post_name).data({"load":"post","p":"post"}).appendTo(post);
	var post_holder = $("<div>").addClass("dynamo_tab_holder");
		$("<div>").addClass("dynamo_tab dynamo_post_current").data({"t":"current"}).text("Current Competition").appendTo(post_holder);
		$("<div>").addClass("dynamo_tab dynamo_post_previous").data({"t":"past","page":1}).text("Previous Competitions").appendTo(post_holder);
	post_holder.appendTo(post);
menu_info["post"] = post;