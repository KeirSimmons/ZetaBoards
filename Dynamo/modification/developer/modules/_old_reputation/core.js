dynamo.reputation = {
	loading : function(){
		$("#dynamo_reputation_window .dynamo_content tbody").html('<tr><td>'+dynamo_options.loading.message+'</td></tr><tr><td class="c_foot"> </td></tr>').css("text-align","center");
		$("#dynamo_reputation_window .dynamo_header h2").html(dynamo_options.loading.title);
		$(".dynamo_temp_button").remove();
	},
	show_form : function(data){
		dynamo.prompt.width(400,function(){
			prefix = data.reputation_modify == 1 ? "In" : "De";
			$("#dynamo_reputation_window .dynamo_header h2").html(prefix + "creasing " + dynamo.settings.reputation_name);
			$("#dynamo_reputation_window .dynamo_content").html('<form id="dynamo_reputation_form" onsubmit="dynamo.reputation.modify(event,'+data.reputation_modify+');"><table class="forums"><tbody style="text-align:center;"><tr><td style="width:30%;" class="c_desc">Reason:<br /><em><small>0/150</small></em></td><td style="width:50%;"><textarea rows="3" cols="5" name="reason" maxlength="150" placeholder="No reason" autofocus></textarea></td><td style="width:20%;"><input type="hidden" name="to_zbid" value="'+data.to_zbid+'" /><input type="submit" name="submit" value="'+prefix+'crease" /></td></tr><tr><td colspan="3" class="c_foot"> </td></tr></tbody></table></form>');
			$("#dynamo_reputation_window .dynamo_content textarea:first").keyup(function(){
				$(this).parent().parent().find("em small").eq(0).html($.trim($(this).val()).length + "/150");
			});
		});
	},
	modify : function(e,type){
		// type = 1 => add, type = 2 => minus
		e.returnValue = e.preventDefault && e.preventDefault() ? false : false;
		reason = $.trim($("#dynamo_reputation_window .dynamo_content textarea[name=reason]").val().substr(0,150));
		to_zbid = $.trim($("#dynamo_reputation_window .dynamo_content input[name=to_zbid]").val());
		dynamo.reputation.loading();
		dynamo.toolbox.load_task(["p=reputation","t=modify","u="+encodeURIComponent(to_zbid),"r="+encodeURIComponent(reason),"m="+encodeURIComponent(type)]);
	},
	finished : function(data){
		$("#dynamo_reputation_window .dynamo_content tbody").html('<tr><td>You have successfully adjusted <a href="'+main_url+'profile/'+data.other_zbid+'">'+dynamo.toolbox.possession(data.other_name)+'</a> '+dynamo.settings.reputation_name+'.</td></tr><tr><td class="c_foot"> </td></tr>').css("text-align","center");
		$("#dynamo_reputation_window .dynamo_header h2").html(dynamo.settings.reputation_name + ' Change Successful');
		$(".user_info.dynamo_"+data.other_zbid).each(function(){
			holder = $(this).find("dt.reputation").next().find("a.value");
			holder.text(dynamo.toolbox.format_number(data.reputation).toString());
		});
	},
	unavailable : function(data){
		switch(data.rep_reason * 1){
			case 0: // repping self
				message = 'You cannot adjust your own '+dynamo.settings.reputation_name+'.';
				break;
			case 1: // to_zbid invalid
				message = 'This member\'s '+dynamo.settings.reputation_name+' cannot be adjusted at the moment.';
				break;
			case 2: // disabled
				message = 'You are not permitted to adjust another member\'s '+dynamo.settings.reputation_name+'.';
				break;
			case 3: // rep too low
				message = 'You need to earn '+dynamo.toolbox.format_number(data.more_rep)+' more '+dynamo.settings.reputation_name+' point'+(data.more_rep==1?'':'s')+' before being allowed to adjust another member\'s '+dynamo.settings.reputation_name+'.';
				break;
			case 4: // not enough money
				message = 'You need to earn another '+dynamo.settings.money_sign+dynamo.toolbox.format_number(data.more_money)+' before being allowed to adjust another member\'s '+dynamo.settings.reputation_name+'.';
				break;
			case 5: // need to wait
				time_left = dynamo.toolbox.time_string(data.wait_dif,1,1,"");
				message = 'You cannot adjust another member\'s '+dynamo.settings.reputation_name+' for '+time_left+' as you have only recently registered.';
				break;
			case 6: // reached daily limit
				message = 'You have reached the daily limit of '+dynamo.toolbox.format_number(data.max_times)+' '+dynamo.settings.reputation_name+' change'+(data.max_times==1?'':'s')+'. Please try again tomorrow.';
				break;
			case 7: // reached daily limit for specific user
				message = 'You have reached the daily limit of '+dynamo.toolbox.format_number(data.max_times)+' '+dynamo.settings.reputation_name+' change'+(data.max_times==1?'':'s')+' for this member. Please try again tomorrow.';
				break;
			default:
				message = 'An unknown error occurred.';
				break;
		}
		$("#dynamo_reputation_window .dynamo_header h2").html('Error');
		$("#dynamo_reputation_window .dynamo_content tbody").html('<tr><td>'+message+'</td></tr><tr><td class="c_foot"> </td></tr>');
	},
	log : {
		ini : function(page,user_zbid){
			dynamo.reputation.loading();
			dynamo.toolbox.load_task(["p=reputation","t=logs","user_zbid="+user_zbid,"page="+page]);
		},
		show : function(data){
			logs = data.logs;
			logs_len = logs.length;
			if(logs_len){
				dynamo.prompt.width(540,function(){
					content = '<tr><th style="width:25%;">Date</th><th style="width:22%;">From</th><th style="width:13%;">Amount</th><th style="width:40%;">Reason</th></tr>';
					for(l=0;l<logs_len;l++){
						reason = logs[l].reason.length ? logs[l].reason : '<em>No reason.</em>';
						amount = logs[l].amount * 1;
						amount = amount == 0 
							? '<span class="reputation_neutral">=' + amount + '</span>'
							: (
								amount < 0
									? '<span class="reputation_minus">-' + dynamo.toolbox.format_number(amount*-1) + '</span>'
									: '<span class="reputation_add">+' + dynamo.toolbox.format_number(amount) + '</span>'
							);
						content += '<tr><td>'+dynamo.toolbox.time_string(logs[l].time,1)+'</td><td><a href="'+main_url+'profile/'+logs[l].from_zbid+'">'+logs[l].username+'</a></td><td>'+amount+'</td><td>'+reason+'</td></tr>';
					}
					page = data.page;
					total_pages = data.total_pages;
					cur_page = page + '/' + total_pages;
					content += '<tr><td class="c_foot" colspan="4"> </td></tr>';
					$("#dynamo_reputation_window .dynamo_content tbody").html(content).css("text-align","left").find("em").fadeTo("fast",0.5);
					$("#dynamo_reputation_window .dynamo_header h2").html(dynamo.toolbox.possession(data.rep_username) + ' ' + dynamo.settings.reputation_name+ ' Log - Page ' + cur_page);
					prev_page = page <= 1 ? '' : '<button value="prev" onclick="dynamo.reputation.log.ini('+(page*1-1)+','+data.user_zbid+')" id="jqi_state0_buttonPrev" name="jqi_state0_buttonPrev" class="dynamo_temp_button">Previous Page</button>';
					next_page = page >= total_pages ? '' : '<button value="next" onclick="dynamo.reputation.log.ini('+(page*1+1)+','+data.user_zbid+')" id="jqi_state0_buttonNext" name="jqi_state0_buttonNext" class="dynamo_temp_button">Next Page</button>';
					$("#jqi_state0_buttonClose").before(prev_page + next_page);
				});
			} else {
				$("#dynamo_reputation_window .dynamo_content tbody").html('<tr><td>There are no '+dynamo.settings.reputation_name+' logs for this user.</td></tr><tr><td class="c_foot"> </td></tr>');
				$("#dynamo_reputation_window .dynamo_header h2").html(dynamo.toolbox.possession(data.rep_username) + ' ' + dynamo.settings.reputation_name+ ' Log');
			}
		}
	}
};