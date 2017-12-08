$(function() {
	var topic_rating = {
		ini : function() {
			var data = dynamo.server;
			if("info" in data && "topic_rating" in data.info) {
				this.data = data.info.topic_rating;
				var topics = this.data.ratings,
				page = dynamo.page.id,
				topic;
				if(page == "index") {
					var tids = [];
					for(var t = 0; t < topics.length; t++) {
						topic = topics[t];
						tids[tids.length] = topic.id;
						$("a.c_last-title[href=" + main_url + "topic/" + topic.id + "/]").after(this.display(topic.id, topic.rating));
					}
				} else if(page == "topic") {
					var topic = topics[0]; // should be the only one...
					var th = $("#topic_viewer th:first");
					th.html('<div style="float:right;width:50px;">' + this.display(topic.id, topic.rating) + '</div><div style="float:left;margin-right:50px;">' + th.html() + '</div>');
					//th.html('<div style="float:left;">' + th.html() + '</div><div style="float:right">' + this.display(topic.id, topic.rating) + '</div><div style="clear:both" />');
				} else if(/^\/forum\/\d+/.test(location.pathname)) {
					var table = $("table.posts");
					
					var header = table.find("thead tr th:first, thead tr td:first");
					header.attr("colspan", (+header.attr("colspan"))+1);

					var foot = table.find("tbody td.c_foot");
					foot.attr("colspan", (+foot.attr("colspan"))+1);

					table.find("tbody tr th.c_cat-title").before('<th class="c_cat-mark">Rating</th>');
					table.find("tbody tr td.c_cat-title").before('<td class="c_cat-mark">0</td>');
					
					for(var t = 0; t < topics.length; t++) {
						topic = topics[t];
						table.find("td.c_cat-title a[href=" + main_url + "topic/" + topic.id + "/]").closest("td").prev().html(this.display(topic.id, topic.rating));
					}
					
					this.setupTips();
					
				}
			}
		},
		display : function(tid, rating) {
			var rate_type = this.data.rate_type;
			var display_type = this.data.display_type;
			var no_rating = this.data.no_rating;
			rating = rating || (isNaN(+no_rating) ? no_rating : +no_rating);
			if($.type(rating) === "string") { // typeof new String("") does not return "string"!
				return rating;
			} else {
				switch(display_type) {
					case 1:
						return '<div class="dynamo-topic_rating-wrapper" data-topic_rating="' + rating + '" data-topic_id="' + tid + '"><div class="dynamo-topic_rating-content">' + rating + '</div><div class="dynamo-topic_rating-sidebar">&nbsp;</div><div class="dynamo-topic_rating-cleared"></div></div>';
						//return '<div class="dynamo_topic_rating" data-topic_rating="' + rating + '" data-topic_id="' + tid + '">' + rating + '</div>';
						break;
				}	
			}
		},
		setupTips : function() {
			var display_type = this.data.display_type;
			switch(display_type) {
				case 1:
					$(".dynamo_topic_rating").each(function() {
						var rating = $(this).data("topic_rating");
						dynamo.tip.tooltip.show({
							selector : $(this),
							message : "Loading...",
							events : {
								show : function() {
									var content = '<div style="text-align:center;">' + rating + '</div>';
									$(this).qtip("api").set("content.text", content);
								}
							},
							show : {
								event : 'click'
							},
							position : {
								my : 'bottom center',
								at : 'top center'
							}
						});
					});
					break;
			}	
		}
	};
	topic_rating.ini();
});