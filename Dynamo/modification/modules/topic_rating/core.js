dynamo.topic_rating = {
	ini : function(topics){
		$("table.posts,table#forum_footer tr").find("th,td").each(function(){
			t = $(this).attr("colspan");
			if(t && t * 1 > 4){
				$(this).attr("colspan",t * 1 + 1);
			}
		});
		$("table.posts").find("th.c_cat-title").before('<th>Rating</th>').end().find("td.c_cat-title").each(function(){
			var container = $(this);
			topic_id = $(this).find("> a").attr("href").match(/topic\/(\d+)/)[1];
			container.before('<td id="dynamo_topic_'+topic_id+'" style="width:90px;"></td>');
			dynamo.topic_rating.star.ini("#dynamo_topic_"+topic_id,{starId:topic_id,rated:topics["r-"+topic_id].rated,currentRating:topics["r-"+topic_id].rating});
		});
	},
	topic : function(topic_info){
		topic_id = location.href.match(/\/topic\/(\d+)\/?/)[1];
		$("#topic_viewer tbody tr:eq(0) .right").prepend('<div style="position:relative;float:right;width:90px;left:5px;right:5px;" id="dynamo_topic_'+topic_id+'_holder"></div>');
		dynamo.topic_rating.star.ini("#dynamo_topic_"+topic_id+"_holder",{starId:topic_id,rated:topic_info.rated,currentRating:topic_info.rating});
	},
	single : function(topic_info){
		topic_id = location.href.match(/&t=(\d+)/)[1];
		$("td.c_topicfoot").prepend('<div style="position:relative;float:right;width:90px;left:5px;right:5px;" id="dynamo_topic_'+topic_id+'_holder"></div>');
		dynamo.topic_rating.star.ini("#dynamo_topic_"+topic_id+"_holder",{starId:topic_id,rated:topic_info.rated,currentRating:topic_info.rating});
	},
	update : function(data){
		dynamo.toolbox.error_check(data);
		if(data.login && data.login == 1){
			dynamo.topic_rating.star.update({"starId":data.rating.id,"rated":data.rating.rated},data.rating.rating);
		}
	},
	unavailable : function(data){
		dynamo.toolbox.error_check(data);
		if(data.login && data.login == 1){
			var title = "Topic Rating";
			switch(data.state*1){
				case 1:
					message = 'You are not permitted to rate topics at this time.';
					break;
				case 2:
					message = 'You have already rated a maximum of '+(dynamo.toolbox.format_number(data.reason))+' topic'+(data.reason==1?'':'s')+' today. Please try again tomorrow!';
					break;
				case 3:
					message = 'You need to make another '+(dynamo.toolbox.format_number(data.reason))+' post'+(data.reason==1?'':'s')+' before being permitted to rate topics.';
					break;
				case 4:
					message = 'You need to earn another '+(dynamo.toolbox.format_number(data.reason))+' '+dynamo.settings.reputation_name+' point'+(data.reason==1?'':'s')+' before being permitted to rate topics.';
					break;
				case 5:
					message = 'You cannot rate your own topics!';
					break;
				default:
					message = 'Please try again later.';
					break;
			}
			dynamo.tip.notify.ini([message,title]);
			dynamo.topic_rating.star.ratings["r-"+data.tid]["disabled"] = 0;
			dynamo.topic_rating.star.stop_ani(data.tid);
		}
	},
	star : {
		ratings : [],
		ini : function(selector, data){
			var container = $(selector);
			container.append('<div id="dynamo_rating_'+data.starId+'"></div>');
			container = $("#dynamo_rating_"+data.starId);
			container.css({"margin":"auto","width":"85px","overflow":"hidden"});
			currentRating = data.currentRating || 0;
			dynamo.topic_rating.star.ratings["r-"+data.starId] = {"rating":currentRating,"disabled":0,"refresher":false,current:0};
			var starsCollection = [];
			for(var s=0;s<5;s++){
				var starElement = document.createElement("div");
				var stars = $(starElement);
				starElement.rating = s + 1;
				stars.addClass('dynamo_star_empty');
				stars.html('<div class="dynamo_star_full"> </div>');
				if(data.rated){
					stars.find(".dynamo_star_full").css("backgroundPosition","0px -16px");
				}
				$("#dynamo_rating_"+data.starId).append(stars);
				starsCollection.push(stars);
				stars.click(function(){
					t = $(this);
					if(dynamo.topic_rating.star.ratings["r-"+data.starId]["disabled"] == 0){
						dynamo.topic_rating.star.ratings["r-"+data.starId]["disabled"] = 1;
						myRating = this.rating;
						dynamo.topic_rating.star.stop_ani(data.starId);
						$("#dynamo_rating_"+data.starId).find(".dynamo_star_full").css("opacity",0).parent().css("opacity",0.75);
						dynamo.topic_rating.star.ratings["r-"+data.starId]["refresher"] = setInterval(function(){
							current = dynamo.topic_rating.star.ratings["r-"+data.starId]["current"];
							$("#dynamo_rating_"+data.starId).find(".dynamo_star_empty").eq(current).fadeTo(100,0.01);
							$("#dynamo_rating_"+data.starId).find(".dynamo_star_empty").eq((current-1==-1?4:current-1)).fadeTo(100,0.75);
							current = current == 4 ? 0 : current + 1;
							dynamo.topic_rating.star.ratings["r-"+data.starId]["current"] = current;
						},100);
						if(location.href.match(/\/forum\/\d+/)){
							pid = parseInt(t.closest("tr").find("td.c_cat-starter a").attr("href").split("profile/")[1]);
							dynamo.toolbox.load_task(["p=topic_rating","t=rate","id="+data.starId,"rating="+myRating,"pid="+pid]);
						} else if(location.href.match(/\/topic\/\d+\/(\d+)?/)){
							page = RegExp.$1 || 1;
							if(page == 1){
								pid = parseInt($("#topic_viewer a.member:first").attr("href").split("profile/")[1]);
								dynamo.toolbox.load_task(["p=topic_rating","t=rate","id="+data.starId,"rating="+myRating,"pid="+pid]);
							} else {
								$.get(location.href.replace(/\/topic\/(\d+)\/\d+/,"/topic/$1/1"),function(d){
									pid = parseInt($("#topic_viewer a.member:first",d).attr("href").split("profile/")[1]);
									dynamo.toolbox.load_task(["p=topic_rating","t=rate","id="+data.starId,"rating="+myRating,"pid="+pid]);
								});
							}
						} else if(location.href.match(/\/single\//) && location.href.match(/&t=(\d+)/)){
							topic_id = RegExp.$1;
							$.get(location.href.replace(/\/single\/.*$/,"/topic/"+topic_id+"/1"),function(d){
								pid = parseInt($("#topic_viewer a.member:first",d).attr("href").split("profile/")[1]);
								dynamo.toolbox.load_task(["p=topic_rating","t=rate","id="+data.starId,"rating="+myRating,"pid="+pid]);
							});
						}
					}
				});
				stars.mouseenter(function(){
					rating = this.rating;
					for(var i=0;i<rating;i++){
						starsCollection[i].find(".dynamo_star_full").css("width","16px");
					}
					for(var i=rating;i<5;i++){
						starsCollection[i].find(".dynamo_star_full").css("width","0px");
					}
				});
				container.mouseleave(function(){dynamo.topic_rating.star.refresh(data)});
			}
			dynamo.topic_rating.star.refresh(data);
		},
		update : function(data,newRating){
			dynamo.topic_rating.star.ratings["r-"+data.starId]["rating"] = newRating;
			dynamo.topic_rating.star.ratings["r-"+data.starId]["disabled"] = 0;
			dynamo.topic_rating.star.stop_ani(data.starId);
			dynamo.topic_rating.star.refresh(data);
		},
		stop_ani : function(id){
			clearInterval(dynamo.topic_rating.star.ratings["r-"+id]["refresher"]);
			$("#dynamo_rating_"+id).find(".dynamo_star_empty").stop().fadeTo(100,1);
			$("#dynamo_rating_"+id).find(".dynamo_star_full").css("opacity",1).parent().css("opacity",1);
			return true;
		},
		refresh : function(data){
			var container = $("#dynamo_rating_"+data.starId+" .dynamo_star_full");
			rating = dynamo.topic_rating.star.ratings["r-"+data.starId]["rating"];
			if(data.rated){
				container.css("backgroundPosition","0px -16px");
			}
			for(var i=0;i<5;i++){
				if(i >= rating){
					container.eq(i).css("width","0px");
				} else if(i == Math.floor(rating)){
					newWidth = Math.round((rating - Math.floor(rating)) * 16);
					container.eq(i).css("width",newWidth+"px");
				} else {
					container.eq(i).css("width","16px");
				}
			}
		}
	}
};