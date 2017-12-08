dynamo.post_rating = {
	page : 0, // 1 = single, 2 = topic
	ini : function(pids){
		if(location.href.match(/\/single\//) && location.href.match(/p=(\d+)/)){
			dynamo.post_rating.page = 1;
			pid = RegExp.$1;
			if("p-" + pid in pids){
				p_rating = pids["p-" + pid];
			}
		} else {
			dynamo.post_rating.page = 2;
			$("#topic_viewer tr[id^=post-]").each(function(){
				pid = $(this).attr("id").split("post-")[1];
				p_rating = "p-" + pid in pids ? pids["p-" + pid] : {
					down : {
						amount : 0,
						users : []
					},
					up : {
						amount : 0,
						users : []
					},
					id : pid
				};
				dynamo.post_rating.icon_content(p_rating);
				dynamo.post_rating.post_content(p_rating);
			});
		}
	},
	loading : function(){
		$("#dynamo_post_rating_window .dynamo_content tbody").html('<tr><td>'+dynamo_options.loading.message+'</td></tr><tr><td class="c_foot"> </td></tr>').css("text-align","center");
		$("#dynamo_post_rating_window .dynamo_header h2").html(dynamo_options.loading.title);
		$(".dynamo_temp_button").remove();
	},
	currently_rating : [],
	rate : function(id,rating){ // id = post id, pid = poster's zbid!
		if(!("p-" + id in dynamo.post_rating.currently_rating)){
			dynamo.post_rating.currently_rating["p-"+id] = true;
			var holder = $("#dynamo_post_rating_post-"+id);
			if(holder.size()){
				holder.html('<div class="dynamo_post_rating_post_loading"> </div>');
			} else {
				var content = '<div class="dynamo_post_rating_post" id="dynamo_post_rating_post-'+id+'"><div class="dynamo_post_rating_post_loading"> </div></div>';
				if(dynamo.post_rating.page == 1){ // single
					$("#single_post .c_post").append(content);
				} else if(dynamo.post_rating.page == 2){ // topic
					$("#post-"+id).next().find(".c_post").append(content);
				}
			}
			var pid = dynamo.post_rating.page == 1 ? location.href.match(/p=(\d+)/)[1] : parseInt($("#post-"+id+" .c_username a.member:first").attr("href").split("profile/")[1]);
			var tid = dynamo.post_rating.page == 1 ? location.href.match(/t=(\d+)/)[1] : parseInt($("a[href^="+main_url+"single/?p="+id+"]").eq(0).attr("href").split("&t=")[1]);
			dynamo.toolbox.load_task(["p=post_rating","t=rate","id="+id,"pid="+pid,"tid="+tid,"rating="+rating]);
		}
	},
	icon_content : function(p_rating){
		pid = p_rating.id;
		var like = dynamo_options.post_rating.like;
		like = !like.length
			? ""
			: (like.match(/^http:\/\//)
				? '<img src="'+like+'" alt="" />'
				: like);
		var dislike = dynamo_options.post_rating.dislike;
		dislike = !dislike.length
			? ""
			: (dislike.match(/^http:\/\//)
				? '<img src="'+dislike+'" alt="" />'
				: dislike);
		like = like.length ? '<a href="javascript:dynamo.post_rating.rate('+pid+',1);">'+like+'</a> ' : '';
		dislike = dislike.length ? '<a href="javascript:dynamo.post_rating.rate('+pid+',2);">'+dislike+'</a> ' : '';
		if(dynamo.settings.post_rating_location == 1){
				like += like.length ? '<span class="dynamo_post_rating_like">' + p_rating.up.amount + '</span> ' : '';
				dislike += dislike.length ? '<span class="dynamo_post_rating_dislike">' + p_rating.down.amount + '</span> ' : '';
		}
		content = '<span class="dynamo_post_rating" id="dynamo_post_rating-'+pid+'">'+like+dislike+'</span>';
		$("#dynamo_post_rating-"+pid).remove();
		if(dynamo.post_rating.page == 1){ // single
			$("#single_post .c_postfoot .right").eq(0).prepend(content);
		} else if(dynamo.post_rating.page == 2){ // topic
			var iterations = 0;
			var $this = $("#post-"+pid);
			while(!$this.is(".c_postfoot") && iterations < 10){
				$this = $this.next();
				iterations++; // prevent infinite looping on error
			}
			$this.find("td.c_footicons .right").prepend(content);
		}
	},
	post_content : function(p_rating){
		if(dynamo.settings.post_rating_location == 2){
			var like_mems = p_rating.up.users;
			var like_mems_l = like_mems.length;
			var likers = [];
			for(l=0;l<like_mems_l;l++){
				likers[likers.length] = like_mems[l][0] == dynamo.toolbox.get_zbid() ? '<a href="javascript:dynamo.post_rating.rate('+p_rating.id+',0);" title="Click to remove rating">You</a>' : '<a href="'+main_url+'profile/'+like_mems[l][0]+'">'+like_mems[l][1]+'</a>';
			}
			var extra_likes = p_rating.up.amount - likers.length;
			if(extra_likes){
				likers[likers.length] = '<a href="javascript:dynamo.post_rating.get_all('+p_rating.id+',1);">' + extra_likes + " other member" + (extra_likes == 1 ? '' : 's') + '</a>';
			}
			if(likers.length > 1){
				likers_f = likers[likers.length-1];
				likers.pop();
				likers = likers.join(", ") + " and " + likers_f;
			} else {
				likers = likers.join("");
			}
			var likers = p_rating.up.users.length == 0
				? ''
				: '<div class="dynamo_post_rating_like_post">'+likers+' like'+(p_rating.up.users.length==1&&p_rating.up.users[0][0]!=dynamo.toolbox.get_zbid()?'s':'')+' this.</div>';
			var dislike_mems = p_rating.down.users;
			var dislike_mems_l = dislike_mems.length;
			var dislikers = [];
			for(d=0;d<dislike_mems_l;d++){
				dislikers[dislikers.length] = dislike_mems[d][0] == dynamo.toolbox.get_zbid() ? '<a href="javascript:dynamo.post_rating.rate('+p_rating.id+',0);" title="Click to remove rating">You</a>' : '<a href="'+main_url+'profile/'+dislike_mems[d][0]+'">'+dislike_mems[d][1]+'</a>';
			}
			var extra_dislikes = p_rating.down.amount - dislikers.length;
			if(extra_dislikes){
				dislikers[dislikers.length] = '<a href="javascript:dynamo.post_rating.get_all('+p_rating.id+',2);">' + extra_dislikes + " other member" + (extra_dislikes == 1 ? '' : 's') + '</a>';
			}
			if(dislikers.length > 1){
				dislikers_f = dislikers[dislikers.length-1];
				dislikers.pop();
				dislikers = dislikers.join(", ") + " and " + dislikers_f;
			} else {
				dislikers = dislikers.join("");
			}
			var dislikers = p_rating.down.users.length == 0
				? ''
				: '<div class="dynamo_post_rating_dislike_post">'+dislikers+' dislike'+(p_rating.down.users.length==1&&p_rating.down.users[0][0]!=dynamo.toolbox.get_zbid()?'s':'')+' this.</div>';
			content = (likers.length + dislikers.length) ? '<div class="dynamo_post_rating_post" id="dynamo_post_rating_post-'+p_rating.id+'">' + likers + dislikers + '</div>' : '';
			$("#dynamo_post_rating_post-"+p_rating.id).remove();
			if(dynamo.post_rating.page == 1){ // single
				$("#single_post .c_post").append(content);
			} else if(dynamo.post_rating.page == 2){ // topic
				$("#post-"+p_rating.id).next().find(".c_post").append(content);
			}
		}
	},
	get_all : function(pid,type,page){
		page = page == null ? 1 : page;
		dynamo.module.start(["p=post_rating","t=show_all","pid="+pid,"type="+type,"page="+page]);
	},
	show_all : function(data){
		dynamo.toolbox.error_check(data);
		if(data.login && data.login == 1){
			title = data.type == 1 ? 'Likes' : 'Dislikes';
			if(data.ratings.length){
				content = '<tr><th>Who</th><th>When</th></tr>';
				ratings = data.ratings;
				rL = ratings.length;
				for(r=0;r<rL;r++){
					content += '<tr><td><a href="'+main_url+'profile/'+ratings[r].zbid+'">'+ratings[r].username+'</a></td><td>'+dynamo.toolbox.time_string(ratings[r].time)+'</td></tr>';
				}
				page = data.page;
				total_pages = data.total_pages;
				cur_page = page + '/' + total_pages;
				content += '<tr><td class="c_foot" colspan="4"> </td></tr>';
				$("#dynamo_post_rating_window .dynamo_header h2").html('Post '+title+'s - Page ' + cur_page);
				prev_page = page <= 1 ? '' : '<button value="prev" onclick="dynamo.post_rating.get_all('+data.pid+','+data.type+','+(page*1-1)+')" id="jqi_state0_buttonPrev" name="jqi_state0_buttonPrev" class="dynamo_temp_button">Previous Page</button>';
				next_page = page >= total_pages ? '' : '<button value="next" onclick="dynamo.post_rating.get_all('+data.pid+','+data.type+','+(page*1+1)+')" id="jqi_state0_buttonNext" name="jqi_state0_buttonNext" class="dynamo_temp_button">Next Page</button>';
				$("#jqi_state0_buttonMain").before(prev_page + next_page);
			} else {
				content = '<tr><td>There are no '+title.toLowerCase()+'s for this post yet.</td></tr><tr><td class="c_foot"> </td></tr>';
				$("#dynamo_post_rating_window .dynamo_header h2").html('Post '+title+'s');
			}
			$("#dynamo_post_rating_window .dynamo_content tbody").html(content);
		}
	},
	update : function(data){
		dynamo.toolbox.error_check(data);
		if(data.login && data.login == 1){
			delete dynamo.post_rating.currently_rating["p-"+data.pid];
			if(data.total * 1){
				p_rating = data.pids["p-" + data.pid];
				dynamo.post_rating.icon_content(p_rating);
				dynamo.post_rating.post_content(p_rating);
			} else {
				$("#dynamo_post_rating_post-" + data.pid).slideFadeToggle("fast",function(){
					$(this).remove();
				});
			}
		}
	},
	unavailable : function(data){
		dynamo.toolbox.error_check(data);
		if(data.login && data.login == 1){
			dynamo.post_rating.currently_updating = false;
			var title = "Post Rating";
			switch(data.state*1){
				case 1:
					message = 'You are not permitted to rate posts at this time.';
					break;
				case 2:
					message = 'You have already rated a maximum of '+(dynamo.toolbox.format_number(data.reason))+' post'+(data.reason==1?'':'s')+' today. Please try again tomorrow!';
					break;
				case 3:
					message = 'You need to earn another '+(dynamo.toolbox.format_number(data.reason))+' '+dynamo.settings.reputation_name+' point'+(data.reason==1?'':'s')+' before being permitted to rate posts.';
					break;
				case 4:
					message = 'You cannot rate your own posts!';
					break;
				default:
					message = 'Please try again later.';
					break;
			}
			dynamo.tip.notify.ini([message,options]);
		}
	}
};