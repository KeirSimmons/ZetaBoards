var data = dynamo.server;
if("info" in data && "online" in data.info) {
	var online = data.info.online.users;
	var total = data.info.online.total;
	var extra = total - online.length;
	var members = [];
	for(var o in online) {
		members[members.length] = '<a href="' + main_url + 'profile/' + online[o].zbid + '/">' + $("<div/>").html(online[o].username).text() + '</a>';
	}
	if(extra > 0) {
		members[members.length] = "<span class='dynamo_online_more'>+" + dynamo.toolbox.format_number(extra) + " more</span>";
	}
	members = members.join(", ");
	var block = $("#stats tr:last").prev().add($("#stats tr:last").prev().prev()).clone();
	block.eq(1).find("td:last").html(members).end().find("td img:first").prop("src", data.info.online.img).end().end().eq(0).find("th").html(dynamo.toolbox.format_number(total) + ' ' + data.info.online.title);
	block.insertBefore($("#stats tr:last").prev().prev());
}