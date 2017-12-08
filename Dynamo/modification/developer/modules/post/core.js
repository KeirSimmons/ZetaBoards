dynamo.post = {
	version : 1,
	settings : dynamo.server.modules.post.settings,
	
	__construct : function() {
		dynamo.tip.preloaded.add_msg([
			["post-acp-current-1", {type : 5, message : "The competition could not be created."}],
			["post-acp-current-2", {type : 5, message : "The competition has been created successfully."}],
			["post-current-1", {type : 5, message : "There aren't any post competitions running at the moment."}]
		]);
	},
	acp : {
		current : {
			off : {
				form : function(data) {
					dynamo.tip.prompt.content(function() {
						dynamo.form.create(".dynamo_content", {
							fields : [
								{
									field : {
										type : 'input',
										spec : 'number',
										name : 'end_date'
									},
									content : {
										label : 'Proposed end date',
										desc : 'Input the number of seconds that the post competition should last for.<br><br>3,600 seconds = 1 hour<br>86,400 seconds = 1 day',
										placeholder : 0,
										value : 0
									},
									rules : {
										required : true,
										min : 1
									}
								}
							],
							submit : {
								to_call : function(data){
									dynamo.tip.prompt.load({
										m : "post",
										p1 : "acp",
										p2 : "current",
										c : "create",
										info : data
									});
								},
								value : 'Start',
								inline : false
							}
						});		
						$(".dynamo_content form tr:first").before('<tr><th colspan="2">Information</th></tr><tr><td colspan="2">Use this form to start a post competition with a proposed end date. The competition will not end automatically - please come back to end it manually.</td></tr>');
					}, dynamo.server.modules.post.name + ' - ACP - Current Competition');
				}
			},
			on : {
				early : function(data) {
					var total_posts = dynamo.toolbox.format_number(data.info.total_posts);
					var participants = dynamo.toolbox.format_number(data.info.participants);
					var time_left = dynamo.toolbox.time_string(data.info.time_left, 1);
					dynamo.tip.prompt.content(function() {
						var rows = [
							{
								cells : [
									{
										content : 'Field',
										type : 'th',
										style : {
											width : '50%'
										}
									},
									{
										content : 'Value',
										type : 'th'
									}
								]
							}, {
								cells : [
									{
										content : 'Total posts',
										style : {
											classes : 'c_desc'
										}
									}, {
										content : total_posts
									}
								]
							}, {
								cells : [
									{
										content : 'Participants',
										style : {
											classes : 'c_desc'
										}
									}, {
										content : participants
									}
								]
							}, {
								cells : [
									{
										content : 'Ending in',
										style : {
											classes : 'c_desc'
										}
									}, {
										content : time_left + ' [<a href="javascript:dynamo.post.acp.current.on.end();">End Early</a>]'
									}
								]
							}
						];
						dynamo.table.create(".dynamo_content", {
							rows : rows
						});
					}, dynamo.server.modules.post.name + ' - ACP - Current Competition');
				},
				end : function() {
					dynamo.tip.prompt.load({
						m : "post",
						p1 : "acp",
						p2 : "current",
						c : "end"
					});
				}
			},
			ended : function(data) {
				dynamo.tip.prompt.content(function() {
					var rows = [
						{
							cells : [
								{
									content : 'Information',
									colspan : 3,
									type : 'th'
								}
							]
						},
						{
							cells : [
								{
									content : 'The competition has ended. The winners are presented below; please save this data yourself as once you navigate away you will not be able to retrieve the winners again.',
									colspan : 3
								}
							]
						},
						{
							cells : [
								{
									content : 'Position',
									type : 'th',
									style : {
										width : '25%'
									}
								},
								{
									content : 'User',
									type : 'th',
									style : {
										width : '50%'
									}
								},
								{
									content : dynamo.server.modules.post.settings.points_name,
									type : 'th'
								}
							]
						}
					];
					var winners = data.info.winners;console.log(winners);
					var i = 1, current, script = ['Position - ZBID - Username - Profile Link - Points'], url, link, points;
					for(var w in winners) {
						current = winners[w];
						url = main_url + 'profile/' + current.zbid;
						link = '<a href="' + url + '">' + current.username + '</a>';
						points = dynamo.toolbox.format_number(current.points, dynamo.server.modules.post.settings.decimals);
						rows[rows.length] = {
							cells : [
								{content : "#" + i},
								{content : link},
								{content : points}
							]
						};
						script[script.length] = (i++) + ' - ' + current.zbid + ' - ' + current.username + ' - ' + url + ' - ' + points;
					}
					if(i == 1) {
						rows[rows.length] = {
							cells : [
								{
									content : 'No one earned any ' + dynamo.toolbox.lowercase(dynamo.server.modules.post.settings.points_name) + ' in this competition.',
									colspan : 3
								}
							]
						};
					} else {
						rows[rows.length] = {
							cells : [
								{
									content : '<textarea rows="5">' + script.join("\n") + '</textarea>',
									colspan : 3
								}
							]
						};
					}
					dynamo.table.create(".dynamo_content", {
						rows : rows,
						colspan : 3
					});
				}, dynamo.server.modules.post.name + ' - ACP - Current Competition - Results');
			}
		}
	},
	current : function(data) {console.log(data);
		dynamo.tip.prompt.content(function() {
			$(".dynamo_content").html('<div /><br /><div />');
			var rows = [{
				cells : [
					{
						content : 'Position',
						type : 'th',
						style : {
							width : '25%'
						}
					},
					{
						content : 'User',
						type : 'th',
						style : {
							width : '50%'
						}
					},
					{content : dynamo.server.modules.post.settings.points_name, type : 'th'}
				]
			}];
			var i = 1, current;
			for(var l in data.info.leaderboard) {
				current = data.info.leaderboard[l];
				rows[rows.length] = {
					cells : [
						{content : "#" + i++},
						{content : '<a href="' + main_url + 'profile/' + current.zbid + '">' + current.username + '</a>'},
						{content : dynamo.toolbox.format_number(current.points, dynamo.server.modules.post.settings.decimals)}
					]
				}
			}
			if(rows.length == 1) {
				rows[2] = {cells : [
					{
						content : 'The leaderboard is currently empty.',
						colspan : 3
					}
				]};
			}
			dynamo.table.create(".dynamo_content div:eq(0)", {
				rows : rows,
				colspan : 3
			});
			dynamo.table.create(".dynamo_content div:eq(1)", {
				rows : [
					{
						cells : [
							{
								content : 'My Position',
								style : {
									width : '50%',
									classes : 'c_desc'
								}
							},
							{content : +data.info.position == 0 ? "Unranked" : "#" + dynamo.toolbox.format_number(data.info.position)}
						]
					},
					{
						cells : [
							{
								content : 'My ' + dynamo.server.modules.post.settings.points_name,
								style : {
									width : '50%',
									classes : 'c_desc'
								}
							},
							{content : dynamo.toolbox.format_number(data.info.points, dynamo.server.modules.post.settings.decimals)}
						]
					}
				]
			});
		}, dynamo.server.modules.post.name + ' - Current Competition' + (data.info.ended ? " (ENDED)" : ""));
	}
};