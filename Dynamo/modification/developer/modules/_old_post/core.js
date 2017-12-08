dynamo.post = {
	current : {
		show : function(data){
			var post_comp = data.post_comp;
			var post_comp_len = post_comp.length;
			var cur_page = '1/1';
			if(post_comp_len){
				var content = '';
				var order = data.first_order;
				for(var p=0;p<post_comp_len;p++){
					content += '<tr><td>#'+(++order)+'</td><td><a href="'+main_url+'profile/'+post_comp[p].zbid+'">'+post_comp[p].username+'</a></td><td>'+post_comp[p].posts+'</td></tr>';
				}
				if("my_info" in data){
					var position = data.my_info.my_pos == 0 ? 'Last' : '#' + data.my_info.my_pos;
					content += '<tr><th class="post_sep" colspan="3" style="line-height:0;">&nbsp;</th></tr><tr><td>'+position+'</td><td><a href="'+main_url+'profile/'+dynamo.toolbox.get_zbid()+'">'+dynamo.toolbox.get_username()+'</a></td><td>'+data.my_info.posts+'</td></tr>';
				}
				content += '<tr><th class="post_sep" colspan="3" style="line-height:0;">&nbsp;</th></tr><tr><td class="c_desc">Total Posts Made:</td><td colspan="2">' + dynamo.toolbox.format_number(data.total_posts) + '</td></tr><tr><td class="c_desc ending_date">Ending Date:</td><td colspan="2">'+dynamo.toolbox.time_string(dynamo.settings.post_end,2,1,"","in ")+'</td></tr><tr><td class="c_foot" colspan="3"> </td></tr>';
				var page = data.page;
				var total_pages = data.total_pages;
				var cur_page = page + '/' + total_pages;
				var prev_page = $("<button>").attr("type","submit").css("width","80px").html("<").css("opacity",0.5).addClass("dynamo_prev_page");
				var next_page = $("<button>").attr("type","submit").css("width","80px").html(">").css("opacity",0.5).addClass("dynamo_next_page");
				dynamo.tip.prompt.content(function(){
					$(".dynamo_content").html('<table><tr><th style="width:30%;">Position</th><th>Username</th><th style="width:30%;">Post Count</th></tr>' + content + '</table><br /><div style="text-align:center;" class="dynamo_pages_holder"></div>');
					$(".dynamo_pages_holder").append(prev_page).append(' ').append(next_page);
					$(".dynamo_content em").css("opacity",0.5);
					if(page > 1){
						$(".dynamo_prev_page").bind("click",{page:(+page)-1,zbid:data.user_zbid},function(e){
							dynamo.tip.prompt.load('',{
								p : "post",
								t : "current",
								page : e.data.page
							});
						}).css("opacity",1);
					}
					if(page < total_pages){
						$(".dynamo_next_page").bind("click",{page:(+page)+1,zbid:data.user_zbid},function(e){
							dynamo.tip.prompt.load('',{
								p : "post",
								t : "current",
								page : e.data.page
							});
						}).css("opacity",1);
					}
				},dynamo.settings.post_name+' - Current Competition - Page ' + cur_page);
			} else {
				dynamo.tip.prompt.content('No one has made any posts since the start of this competition.',dynamo.settings.post_name+' - Current Competition');
			}
		},
		none : function(data){
			var msg = data.reason == 1
				? 'The current competition has ended and the results are being calculated.'
				: 'There are no competitions running at the moment.';
			dynamo.tip.prompt.content(msg,dynamo.settings.post_name+' - Current Competition');
		}
	},
	past : {
		show : function(data){
			var past = data.past;
			var past_len = past.length;
			var content = '';
			for(var p=0;p<past_len;p++){
				content += '<tr><td>#'+dynamo.toolbox.format_number(past[p].comp_number)+'</td><td>'+dynamo.toolbox.format_number(past[p].total_posts)+' <span>[<a href="javascript:dynamo.post.past.winners.ini('+past[p].id+');" id="p-'+past[p].id+'">View Winners</a>]</span></td><td>'+dynamo.toolbox.time_string(past[p].ended,1)+'</td></tr>';
			}
			content += '<tr><th class="post_sep" colspan="3" style="line-height:0;">&nbsp;</th></tr><tr><td class="c_desc total_posts" colspan="2">Total Posts Made:</td><td>' + dynamo.toolbox.format_number(data.total_posts) + '</td></tr>';
			var page = data.page;
			var total_pages = data.total_pages;
			var cur_page = dynamo.toolbox.format_number(page) + '/' + dynamo.toolbox.format_number(total_pages);
			content += '<tr><td class="c_foot" colspan="3"></td></tr>';
			var prev_page = $("<button>").attr("type","submit").css("width","80px").html("<").css("opacity",0.5).addClass("dynamo_prev_page");
			var next_page = $("<button>").attr("type","submit").css("width","80px").html(">").css("opacity",0.5).addClass("dynamo_next_page");
			dynamo.tip.prompt.content(function(){
				$(".dynamo_content").html('<table><tr><th style="width:20%;">Number</th><th class="subtotal_posts" style="width:40%;">Posts Made</th><th>End Date</th></tr>' + content + '</table><br /><div style="text-align:center;" class="dynamo_pages_holder"></div>');
				$(".dynamo_pages_holder").append(prev_page).append(' ').append(next_page);
				$(".dynamo_content em").css("opacity",0.5);
				if(page > 1){
					$(".dynamo_prev_page").bind("click",{page:(+page)-1,zbid:data.user_zbid},function(e){
						dynamo.tip.prompt.load('',{
							p : "post",
							t : "past",
							page : e.data.page
						});
					}).css("opacity",1);
				}
				if(page < total_pages){
					$(".dynamo_next_page").bind("click",{page:(+page)+1,zbid:data.user_zbid},function(e){
						dynamo.tip.prompt.load('',{
							p : "post",
							t : "past",
							page : e.data.page
						});
					}).css("opacity",1);
				}
			},'Previous Competitions - Page ' + cur_page);
		},
		none : function(data){
			dynamo.tip.prompt.content('There are no completed competitions.',dynamo.settings.post_name+' - Previous Competitions');
		},
		winners : {
			ini : function(id){
				if(!$("a#p-"+id).hasClass("tipadded")){
					comp_number = $("a#p-"+id).parent().parent().prev().text().split("#")[1];
					dynamo.tip.ini("a#p-"+id,{
						show : {
							event : 'click'
						},
						content : {
							text : '<div id="qtip-load-'+id+'" class="dynamo_tooltip_loading"></div>',
							title : {
								text : 'Winners of Competition #' + comp_number,
								button : true
							}
						},
						hide : {
							event : 'click',
							fixed : true
						},
						position : {
							my : 'top center',
							at : 'bottom center',
							adjust : {
								y : 2
							}
						},
						events : {
							render : function(event,api){
								dynamo.module.server_call(2,{p:"post",t:"winners",id:encodeURIComponent(id)});
							}
						},
						style : {
							width : 250
						}
					});
					$("a#p-"+id).addClass("tipadded");
				}
				$("a#p-"+id).click();
			}, 
			show : function(data){
				if(data.state == 1){
					winners = data.winners;
					winners_len = winners.length;
					content = '<table><tr><th>Position</th><th>Name</th><th>Posts</th></tr>';
					for(w=0;w<winners_len;w++){
						content += '<tr><td>#'+dynamo.toolbox.format_number(winners[w].position)+'</td><td><a href="'+main_url+'profile/'+winners[w].zbid+'">'+winners[w].username+'</a></td><td>'+dynamo.toolbox.format_number(winners[w].posts)+'</td></tr>';
					}
					content += '</table>';
				} else {
					content = 'There were no winners in this contest.';
				}
				id = data.id;
				$("#qtip-load-"+id).slideFadeToggle("fast",function(){
					$(this).removeClass("dynamo_tooltip_loading").html(content).slideFadeToggle("fast");
				});
			}
		}
	}
};