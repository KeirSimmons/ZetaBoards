$("<div>").addClass("dynamo_tab dynamo_acp_post").data({"t":"post"}).text("Post Competition").appendTo(acp_holder);
	acp_sub_holder = $("<div>").addClass("dynamo_tab_holder");
		$("<div>").addClass("dynamo_tab dynamo_acp_post_current").text("Current Competition").data({"c":"current"}).appendTo(acp_sub_holder);
		$("<div>").addClass("dynamo_tab dynamo_acp_post_past").text("Past Competition").data({"c":"past"}).appendTo(acp_sub_holder);
		acp_sub_holder.appendTo(acp_holder);