/*
Open-source, free to use. Find more modifications at https://github.com/KeirSimmons/ZetaBoards
Modification: Advanced Affiliates and Topsites System
*/

var aff = {
	name : 'Affiliates and Topsites', // title
	image : 'http://z3.ifrm.com/28068/97/0/p319576/Stats.png', // image that goes left to the affiliates
	ours : 'http://dynamo.viralsmods.com/images/aff2.gif', // affiliate button for your forum
	newwindow : true, // true opens in new window, false opens in same window
	topsites : [
		[0,0,'right',true], // settings: [speed,hoverspeed,direction,random]
		['http://google.com','http://dynamo.viralsmods.com/images/aff2.gif'], // copy and paste this line for more topsites (last topsite should NOT have a comma at the end)
		['http://google.com','http://dynamo.viralsmods.com/images/aff2.gif'] // << no comma!
	],
	affiliates : [
		[5,0,'left',true], // settings: [speed,hoverspeed,direction,random]
		['http://google.com','http://dynamo.viralsmods.com/images/aff2.gif'], // copy and paste this line for more affiliates (last topsite should NOT have a comma at the end)
		['http://google.com','http://dynamo.viralsmods.com/images/aff2.gif'] // << no comma!
	],
	/* STOP EDITING HERE!!! */
	topsite : function(){
		var topsites = this.topsites;
		var content = topsites[0][0] == 0 ? '' : '<marquee scrollamount="'+topsites[0][0]+'" onmouseover="this.setAttribute(\'scrollamount\','+topsites[0][1]+',0);" onmouseout="this.setAttribute(\'scrollamount\','+topsites[0][0]+',0);" direction="'+topsites[0][2]+'">';
		var end = topsites == 0 ? '' : '</marquee>';
		if(topsites[0][3] === true) {
			topsites.sort(this.mix);
		}
		var tL = topsites.length;
		var target = this.newwindow === true ? 'target="_blank"' : 'target="_self"';
		while(tL--){
			if(topsites[tL].length == 2) content += '<a href="'+topsites[tL][0]+'" '+target+'><img src="'+topsites[tL][1]+'" alt="" width="88" height"31" /></a> ';
		}
		return content + end;
	},
	affiliate : function(){
		var affiliates = this.affiliates;
		var content = affiliates[0][0] == 0 ? '' : '<marquee scrollamount="'+affiliates[0][0]+'" onmouseover="this.setAttribute(\'scrollamount\','+affiliates[0][1]+',0);" onmouseout="this.setAttribute(\'scrollamount\','+affiliates[0][0]+',0);" direction="'+affiliates[0][2]+'">';
		var end = affiliates[0][0] == 0 ? '' : '</marquee>';
		if(affiliates[0][3] === true) {
			affiliates.sort(this.mix);
		}
		var aL = affiliates.length;
		var target = this.newwindow === true ? 'target="_blank"' : 'target="_self"';
		while(aL--){
			if(affiliates[aL].length == 2) content += '<a href="'+affiliates[aL][0]+'" '+target+'><img src="'+affiliates[aL][1]+'" alt="" width="88" height"31" /></a> ';
		}
		return content + end;
	},
	mix : function(){
		return (Math.round(Math.random())-0.5);
	}
}
$("#stats table.forums").find("th[colspan=2],td.c_foot").attr("colspan",3).end().find("td").not(".c_mark,.c_foot").attr("colspan",2);
$("#stats table.forums th:contains(Board Statistics)").parent().before('<tr><th colspan="3">'+aff.name+'</th></tr><tr><td class="c_mark" rowspan="2"><img src="'+aff.image+'" alt="'+aff.name+'" /></td><td>'+aff.affiliate()+'</td><td><a href="'+main_url+'"><img src="'+aff.ours+'" alt="" /></a></td></tr><tr><td>'+aff.topsite()+'</td><td><textarea rows="1" cols="1" style="height:20px;width:88px;"><a href="'+main_url+'"><img src="'+aff.ours+'" alt="" /></a></textarea></td></tr>');
