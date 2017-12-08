sub_holder = $("<div>").addClass("dynamo_menu_holder");
	$("<div>").addClass("dynamo_menu_header dynamo_post_acp").text(dynamo.server.modules.post.name).data({load : "post", m : "post", p1 : "acp"}).appendTo(sub_holder);
	sub_tab_holder = $("<div>").addClass("dynamo_tab_holder");
		$("<div>").addClass("dynamo_tab dynamo_post_acp_main").text("Current Competition").data({p2 : "current", c : "form"}).appendTo(sub_tab_holder);
	sub_tab_holder.appendTo(sub_holder);
sub_holder.appendTo(tab_holder);