dynamo.awards = {
	loading : function(){
		$("#dynamo_awards_window .dynamo_content tbody").html('<tr><td>'+dynamo_options.loading.message+'</td></tr><tr><td class="c_foot"> </td></tr>').css("text-align","center");
		$("#dynamo_awards_window .dynamo_header h2").html(dynamo_options.loading.title);
		$(".dynamo_temp_button").remove();
	},
	tooltip : {
		ini : function(counter,id){
			dynamo.prompt.load_js(function(){
				var selector = "#dynamo_award-"+counter+"-"+id;
				if(!$(selector).hasClass("tipadded")){
					dynamo.prompt.tooltip(selector,{
						style : {
							width : 200
						},
						show : {
							event : 'click',
							button : true
						},
						content : {
							text : '<div id="qtip-load-award-'+counter+'-'+id+'" class="dynamo_awards_tooltip">'+dynamo_options.tooltip.loading+'</div>',
							title : {
								text : 'Loading...'
							}
						},
						position : {
							my : 'top left',
							at : 'bottom right'
						},
						hide : {
							fixed : true,
							delay : 1000
						},
						events : {
							render : function(event,api){
								// call function to update tooltip here
								dynamo.awards.tooltip.get_info(counter,id);
							}
						}
					});
					$(selector).addClass("tipadded");
				}
				$(selector).qtip("show");
			});
		},
		get_info : function(counter,id){
			dynamo.module.server_call(2,{p:"awards",t:"get_info",aid:id,counter:counter});
		},
		show_info : function(data){
			dynamo.toolbox.error_check(data);
			if(data.login && data.login == 1){
				$("#qtip-load-award-"+data.counter+"-"+data.id).slideFadeToggle("fast",function(){
					var others = data.info.total == 0
						? "No other users have this " + (dynamo.settings.awards_name).toLowerCase()
						: dynamo.toolbox.format_number(data.info.total) + " other user"+(data.info.total==1?'':'s')+" ha"+(data.info.total==1?'s':'ve')+" this " + (dynamo.settings.awards_name).toLowerCase();
					$(this).html('<span class="dynamo_awards_description"><strong>Description:</strong> ' + data.info.desc + '</span><br /><span class="dynamo_awards_received"><strong>Received:</strong> ' + dynamo.toolbox.time_string(data.info.time,2) + '</span><hr /><span class="dynamo_awards_others">'+others+'.</span>').slideFadeToggle("fast").parent().prev().children("div").html('<img src="'+data.info.image+'" alt="" /> ' + data.info.name);
				});
			}
		}
	},
	achieved :  function(data){
		if(data.login && data.login == 1){
			var aL = data.awards.length;
			var title = dynamo.toolbox.plural(dynamo.settings.awards_name) + " - " + (data.a_zbid == dynamo.toolbox.get_zbid()
				? "My"
				: dynamo.toolbox.possession(data.a_username))
			+ " " + dynamo.toolbox.plural(dynamo.settings.awards_name);
			if(aL){
				var page = data.page;
				var total_pages = data.total_pages;
				var cur_page = "Page " + page + '/' + total_pages;
				var rspan = aL + 2;
				var prev_page = page > 1 ? '<td rowspan="'+rspan+'" class="dynamo_prev_page"><</td>' : '';
				var next_page = page < total_pages ? '<td rowspan="'+rspan+'" class="dynamo_next_page">></td>' : '';
				dynamo.tip.prompt.content(function(){
					var content = '<tr>'+prev_page+'<th /><th>'+dynamo.settings.awards_name+' Name</th><th>Description</th><th>Received</th>'+next_page+'</tr>';
					for(var a=0;a<aL;a++){
						content += '<tr><td style="text-align:center;"><img src="'+data.awards[a].image+'" alt="" /></td><td>'+data.awards[a].name+'</td><td>'+data.awards[a].description+'</td><td>'+dynamo.toolbox.time_string(data.awards[a].time,1)+'</td></tr>';
					}
					content += '<tr><td colspan="4" class="c_foot"> </td></tr>';
					$(".dynamo_content").html('<table>'+content+'</table>');
					$(".dynamo_prev_page").bind("click",{page:(+page)-1,a_zbid:data.a_zbid},function(e){
						dynamo.tip.prompt.load('',{
							p : "awards",
							t : "achieved",
							page : e.data.page,
							award_zbid : e.data.a_zbid
						});
					});
					$(".dynamo_next_page").bind("click",{page:(+page)+1,a_zbid:data.a_zbid},function(e){
						dynamo.tip.prompt.load('',{
							p : "awards",
							t : "achieved",
							page : e.data.page,
							award_zbid : e.data.a_zbid
						});
					});
				},title + " - " + cur_page,650);
			} else {
				var is_it_me = dynamo.toolbox.get_zbid() == data.a_zbid;
				dynamo.tip.prompt.content((is_it_me?"You":data.a_username)+' ha'+(is_it_me?'ve':'s')+' not achieved any '+(dynamo.toolbox.plural(dynamo.settings.awards_name)).toLowerCase()+'.',title);
			}
		}
	},
	full_list : function(data){
		var aL = data.awards.length;
		if(aL){
			var page = data.page;
			var total_pages = data.total_pages;
			var cur_page = "Page " + page + '/' + total_pages;
			var rspan = aL + 2;
			var prev_page = page > 1 ? '<td rowspan="'+rspan+'" class="dynamo_prev_page"><</td>' : '';
			var next_page = page < total_pages ? '<td rowspan="'+rspan+'" class="dynamo_next_page">></td>' : '';
			dynamo.tip.prompt.content(function(){
				var content = '<tr>'+prev_page+'<th /><th>'+dynamo.settings.awards_name+' Name</th><th>Description</th>'+next_page+'</tr>';
				for(var a=0;a<aL;a++){
					content += '<tr><td style="text-align:center;"><img src="'+data.awards[a].image+'" alt="" /></td><td>'+data.awards[a].name+'</td><td>'+data.awards[a].description+'</td></tr>';
				}
				content += '<tr><td colspan="3" class="c_foot"> </td></tr>';
				$(".dynamo_content").html('<table>'+content+'</table>');
				$(".dynamo_prev_page").bind("click",{page:(+page)-1},function(e){
					dynamo.tip.prompt.load('',{
						p : "awards",
						t : "list",
						page : e.data.page
					});
				});
				$(".dynamo_next_page").bind("click",{page:(+page)+1},function(e){
					dynamo.tip.prompt.load('',{
						p : "awards",
						t : "list",
						page : e.data.page
					});
				});
			},dynamo.toolbox.plural(dynamo.settings.awards_name) + " - Full List - " + cur_page);
		}
	}
};