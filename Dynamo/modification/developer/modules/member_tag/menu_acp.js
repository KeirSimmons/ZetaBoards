sub_holder = $("<div>").addClass("dynamo_menu_holder");
	$("<div>").addClass("dynamo_menu_header dynamo_member_tag_acp").text(dynamo.server.modules.member_tag.name).data({load : "member_tag", m : "member_tag", p1 : "acp"}).appendTo(sub_holder);
	sub_tab_holder = $("<div>").addClass("dynamo_tab_holder");
		$("<div>").addClass("dynamo_tab dynamo_member_tag_acp_main").text("Main Settings").data({p2 : "main", c : "form"}).appendTo(sub_tab_holder);
	sub_tab_holder.appendTo(sub_holder);
sub_holder.appendTo(tab_holder);