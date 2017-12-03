/*
Open-source, free to use. Find more modifications at https://github.com/KeirSimmons/ZetaBoards
Modification: Change Shoutbox Name
*/

$(document).ready(function() {
	forum = 3120372; // forum id to get the topic from
	title = 'Announcements'; // title of the new table
	speed = 2; // higher = faster
	height = 100; // in pixels
	if(location.href.match(/\/index\/?/)){
		$.get(main_url+'forum/'+forum+'/1/?cutoff=100&sort_key=unix&sort_by=DESC',function(d){
			$.get($("#inlinetopic table.posts tbody tr:eq(1) td.c_cat-title a",d).attr("href")+'1/',function(e){
				content = $('td.c_post:first',e).html();
				$("div.category:first").prepend('<div id="news" style="padding-bottom:10px;"><div class="category"><table class="cat_head"><tbody><tr><td><h2>'+title+'</h2></td></tr></tbody></table><table><tbody><tr><td valign="center"><div style="width:50%;text-align:center;margin-left:25%;height:'+height+'px;"><marquee height="'+height+'" direction="up" onmouseover="this.stop();" onmouseout="this.start();" scrollamount="'+speed+'" style="text-align:center;">' + content + '</marquee></div></td></tr></tbody></table></div></div>');
			});
		})
	}
});
