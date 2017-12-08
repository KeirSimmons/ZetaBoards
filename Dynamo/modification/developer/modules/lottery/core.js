dynamo.lottery = {
	version : 2,
	settings : dynamo.server.modules.lottery.settings,
	__construct : function() {
		dynamo.tip.preloaded.add_msg([
			["lottery-current-1", {type : 5, message : "There are no " + dynamo.toolbox.lowercase(dynamo.toolbox.plural(dynamo.server.modules.lottery.name)) + " running at the moment.", title : "Current " + dynamo.server.modules.lottery.name + " - Not Available"}],
			["lottery-current-2", {type : 5, message : "You have already bought a ticket with these numbers.", title : "Current " + dynamo.server.modules.lottery.name + " - Ticket Unavailable"}],
			["lottery-current-3", {type : 5, message : "The " + dynamo.toolbox.lowercase(dynamo.server.modules.lottery.name) + " ticket could not be purchased. Please try again later.", title : "Current " + dynamo.server.modules.lottery.name + " - Ticket Unavailable"}],
			["lottery-current-4", {type : 5, message : "The " + dynamo.toolbox.lowercase(dynamo.server.modules.lottery.name) + " ticket was purchased successfully. Good luck!", title : "Current " + dynamo.server.modules.lottery.name + " - Ticket Bought"}],
			["lottery-previous-1", {type : 5, message : "There haven't been any previous " + dynamo.toolbox.lowercase(dynamo.toolbox.plural(dynamo.server.modules.lottery.name)) + ". Please check back later!", title : "Previous " + dynamo.toolbox.plural(dynamo.server.modules.lottery.name) + " - Not Available"}],
			["lottery-previous-2", {type : 5, message : "No one matched any numbers in this " + dynamo.toolbox.lowercase(dynamo.server.modules.lottery.name) + ".", title : "Previous " + dynamo.toolbox.plural(dynamo.server.modules.lottery.name) + " - Viewing Winners"}],
			["lottery-acp-current-1", {type : 5, message : "There must be more numbers to choose from than to pick.", title : dynamo.server.modules.lottery.name + " - ACP - Creating " + dynamo.server.modules.lottery.name + " - Error"}],
			["lottery-acp-current-2", {type : 5, message : "The " + dynamo.toolbox.lowercase(dynamo.lottery.settings.name) + " could not be created. Please try again later.", title : dynamo.server.modules.lottery.name + " - ACP - Creating " + dynamo.server.modules.lottery.name + " - Unsuccessful"}],
			["lottery-acp-current-3", {type : 5, message : "The " + dynamo.toolbox.lowercase(dynamo.lottery.settings.name) + " has been created successfully. Please come back to draw the results when the " + dynamo.toolbox.lowercase(dynamo.lottery.settings.name) + " has ended.", title : dynamo.server.modules.lottery.name + " - ACP - Creating " + dynamo.server.modules.lottery.name + " - Successful"}],
			["lottery-acp-current-4", {type : 5, message : "The " + dynamo.toolbox.lowercase(dynamo.lottery.settings.name) + " has been drawn. You can now check the results. ", title : dynamo.server.modules.lottery.name + " - ACP - Ended"}]
		]);
	},
	current : {
		show : function(data) {
			var info = data.info;
			var my_tickets = info.my_tickets;
		
			dynamo.tip.prompt.content(function(){
				
				var symbol = dynamo.server.modules.currency.settings.symbol;
				
				var buy_another = info.can_buy
					? ' [<a href="javascript:dynamo.lottery.current.form.show({n : ' + info.n + ', r : ' + info.r + '});">Buy a ticket</a>]'
					: ' [Buy a Ticket]';
				
				var view_my_tickets = info.my_tickets.bought == 0
					? ''
					: ' [<a href="javascript:dynamo.lottery.current.view_tickets.request();">View my tickets</a>]';
					
				switch(+info.reason) {
					case 0: var reason = ''; break;
					case 1: var reason = 'There are no tickets left to buy. Please wait for a staff member to draw the results.'; break;
					case 2: var reason = 'You cannot buy any more tickets. Please wait for a staff member to draw the results.'; break;
					case 3: var reason = 'You do not have enough ' + dynamo.toolbox.lowercase(dynamo.server.modules.currency.settings.name) + ' to buy a ticket.'; break;
					case 4: var reason = 'This ' + dynamo.toolbox.lowercase(dynamo.server.modules.lottery.settings.name) + ' has ended. Please wait for a staff member to draw the results.'; break;
				}
				
				dynamo.table.create(".dynamo_content", {
					rows : [
						{
							cells : [
								{
									colspan : 2,
									content : buy_another,
									desc : reason,
									tip : {
										position : {
											my : 'bottom center',
											at : 'top center'
										}
									},
									style : {
										align : 'center'
									}
								}
							]
						},
						{
							cells : [
								{
									content : 'Draw Date',
									style : { classes : 'c_desc' }
								},
								{content : +info.reason == 4 ? "Now" : dynamo.toolbox.time_string(info.end_date, 3)}
							]
						},
						{
							cells : [
								{
									content : 'Jackpot',
									desc : 'The total ' + dynamo.toolbox.lowercase(dynamo.server.modules.currency.settings.name) + ' in the pot is ' + symbol + dynamo.toolbox.format_number(info.pot) + '.<br><br>The jackpot keeps increasing for every ticket that is bought!',
									style : {
										width : '40%',
										classes : 'c_desc'
									}
								},
								{content : symbol + dynamo.toolbox.format_number(info.jackpot)}
							]
						},
						{
							cells : [
								{
									content : 'Ticket Price',
									desc : 'Your balance is ' + symbol + dynamo.toolbox.format_number(info.balance) + '.',
									style : { classes : 'c_desc' }
								},
								{content : symbol + dynamo.toolbox.format_number(info.price)}
							]
						},
						{
							cells : [
								{
									content : 'My Tickets',
									style : { classes : 'c_desc' }
								},
								{content : dynamo.toolbox.format_number(info.my_tickets.bought) + ' / ' + (info.my_tickets.max == 0 ? 'Unlimited' : info.my_tickets.max) + view_my_tickets}
							]
						},
						{
							cells : [
								{
									content : 'Total Tickets Bought',
									style : { classes : 'c_desc' }
								},
								{content : dynamo.toolbox.format_number(info.tickets.bought) + ' / ' + (info.tickets.max == 0 ? 'Unlimited' : info.tickets.max)}
							]
						}
					]
				});			
				
			}, "Current " + dynamo.server.modules.lottery.name);
		
		},
		form : {
			show : function(data) {
				var new_width = 150 + (data.r > 4 ? 380 + (data.r - 4) * 45 : 380 - (4 - data.r) * 45);
				dynamo.tip.prompt.content(function(){
					var content = '<tr><td class="c_desc" colspan="2">Choose ' + data.r + ' number' + ( data.r == 1 ? '' : 's' ) + ' from 1 - ' + data.n + '</td><tr><td><input type="button" value="Lucky Dip" onclick="dynamo.lottery.current.form.lucky_dip({n : ' + data.n + ', r : ' + data.r + '});" /></td><td id="dynamo_numbers"><form onsubmit="dynamo.lottery.current.form.buy(event);">';
					for(var i = 1; i <= data.r; i++){
						content += ' <input type="number" min="1" max="' + data.n + '" style="width:30px;" required /> ';
					}
					content += '<input type="hidden" name="n" value="' + data.n + '" /><input type="hidden" name="r" value="' + data.r + '" /><input type="submit" value="Buy Ticket" /></form></td></tr><tr><td class="c_foot" colspan="2"> </td></tr>';
					$(".dynamo_content").html('<table>' + content + '</table>');
				}, "Current " + dynamo.server.modules.lottery.name + " - Buying Ticket", new_width);
			},
			lucky_dip : function(data){
				var n = data.n, r = data.r;
				var holder = $("#dynamo_numbers").find("input:not([type='button']):not([type='submit']):not([type='hidden'])");
				if(r < n){
					var chosen = [];
					var intervals = [];
					for(var i = 0; i < r; i++){
						while(true){
							rand = Math.round(Math.random() * n);
							if(!dynamo.toolbox.in_array(rand, chosen)){
								chosen[chosen.length] = rand;
								break;
							}
						}
						holder.val(1);
						dynamo.lottery.current.form.animating(i, rand);
					}
				}
			},
			animating : function(i, rand){
				var holder = $("#dynamo_numbers input:not([type='button']):not([type='submit']):not([type='hidden'])").eq(i);
				if(holder.val() < rand){
					holder.val(holder.val() * 1 + 1);
					setTimeout(function(){
						dynamo.lottery.current.form.animating(i, rand);
					}, Math.round(1000 / rand));
				}
			},
			buy : function(e){
				e.preventDefault();
				var holder = $("#dynamo_numbers input:not([type='button']):not([type='submit']):not([type='hidden'])");
				var r = $("#dynamo_numbers input[name=r]").val();
				var n = $("#dynamo_numbers input[name=n]").val();
				dynamo.toolbox.log("r:",r,"n:",n);
				var numbers = [];
				var carry_on = true, i, this_number;
				for(i = 0; i < r; i++){
					this_number = holder.eq(i).val();
					if(dynamo.toolbox.in_array(this_number, numbers)){
						carry_on = i;
						break;
					} else {
						numbers[numbers.length] = this_number;
					} 
				}
				if(carry_on === true){
					console.log(numbers);
					dynamo.tip.prompt.load({
						m : "lottery",
						p1 : "current",
						c : "buy",
						info : {
							numbers : numbers
						}
					});
				} else {
					holder.eq(carry_on).val("").focus();
				}
			},
		},
		view_tickets : {
			request : function() {
				dynamo.tip.prompt.ini({
					m : "lottery",
					p1 : "current",
					c : "view_tickets"
				});
			},
			show : function(data) {
				var info = data.info;
				var tickets = info.tickets, tL = tickets.length, t;
				var page = info.page;
				var total_pages = info.total_pages;
				var cur_page = page + '/' + total_pages;
				var prev_page = $("<button>").attr("type", "submit").css("width", "80px").html("<").css("opacity", 0.5).addClass("dynamo_prev_page");
				var next_page = $("<button>").attr("type", "submit").css("width", "80px").html(">").css("opacity", 0.5).addClass("dynamo_next_page");
			
				var rows = [
					{
						cells : [
							{
								content : 'Numbers',
								style : {
									width : '50%'
								},
								type : 'th'
							},
							{
								content : 'Bought',
								type : 'th'
							}
						]
					}
				];
				
				for(t = 0; t < tL; t++){
					rows[rows.length] = {
						cells : [
							{content : tickets[t].numbers.replace(/\,/g, ", ")},
							{content : dynamo.toolbox.time_string(tickets[t].bought, 2)}
						]
					};
				}
			
				dynamo.tip.prompt.content(function(){
					$(".dynamo_content").empty().append('<div></div><br /><div style="text-align:center;" class="dynamo_pages_holder"></div>');
					
					dynamo.table.create(".dynamo_content div:first", {
						rows : rows
					});
					
					$(".dynamo_pages_holder").append(prev_page).append(' ').append(next_page);
					$(".dynamo_content em").css("opacity",0.5);
					
					if(page > 1){
						$(".dynamo_prev_page").bind("click", function(e) {
							dynamo.tip.prompt.load({
								m : "lottery",
								p1 : "current",
								c : "view_tickets",
								info : {
									page : page - 1
								}
							});
						}).css("opacity", 1);
					}
					
					if(page < total_pages){
						$(".dynamo_next_page").bind("click", function(e) {
							dynamo.tip.prompt.load({
								m : "lottery",
								p1 : "current",
								c : "view_tickets",
								info : {
									page : page + 1
								}
							});
						}).css("opacity", 1);
					}
					
				}, "Current " + dynamo.server.modules.lottery.name + " - My Tickets - Page " + cur_page);
			
			}
		}
	},
	previous : {
		show : function(data) {
			var info = data.info;
			var lotteries = info.lotteries, lL = lotteries.length, l;
			var page = info.page;
			var total_pages = info.total_pages;
			var cur_page = page + '/' + total_pages;
			var prev_page = $("<button>").attr("type", "submit").css("width", "80px").html("<").css("opacity", 0.5).addClass("dynamo_prev_page");
			var next_page = $("<button>").attr("type", "submit").css("width", "80px").html(">").css("opacity", 0.5).addClass("dynamo_next_page");
		
			var rows = [
				{
					cells : [
						{
							content : 'Drawn',
							type : 'th'
						},
						{
							content : 'Ticket Price',
							type : 'th'
						},
						{
							content : 'Winning Numbers',
							type : 'th'
						},
						{
							content : 'Jackpot',
							type : 'th'
						},
						{
							content : 'Rollover',
							desc : 'This is the amount of ' + dynamo.toolbox.lowercase(dynamo.server.modules.currency.settings.name) + ' which was put into the pot but not won (which can then be \'rolled over\' into the next ' + dynamo.toolbox.lowercase(dynamo.server.modules.lottery.name) + ').',
							type : 'th'
						},
						{
							content : 'Individual Prizes',
							type : 'th'
						},
						{
							content : 'Winners',
							type : 'th'
						}
					]
				}
			];
			
			var symbol = dynamo.server.modules.currency.settings.symbol;
			
			for(l = 0; l < lL; l++){
				rows[rows.length] = {
					cells : [
						{content : dynamo.toolbox.time_string(lotteries[l].end_date, 2)},
						{content : symbol + dynamo.toolbox.format_number(lotteries[l].price)},
						{content : lotteries[l].winning_numbers.replace(/\,/g, ", ")},
						{content : symbol + dynamo.toolbox.format_number(lotteries[l].jackpot)},
						{content : symbol + dynamo.toolbox.format_number(lotteries[l].rollover) },
						{content : '<a href="javascript:dynamo.lottery.previous.prizes.request(' + lotteries[l].id + ');">View breakdown</a>'},
						{content : '<a href="javascript:dynamo.lottery.previous.winners.request(' + lotteries[l].id + ');">View winners</a>'}		
					]
				};
			}
		
			dynamo.tip.prompt.content(function(){
				$(".dynamo_content").empty().append('<div></div><br /><div style="text-align:center;" class="dynamo_pages_holder"></div>');
				
				dynamo.table.create(".dynamo_content div:first", {
					colspan : 7,
					rows : rows
				});
				
				$(".dynamo_pages_holder").append(prev_page).append(' ').append(next_page);
				$(".dynamo_content em").css("opacity",0.5);
				
				if(page > 1){
					$(".dynamo_prev_page").bind("click", function(e) {
						dynamo.tip.prompt.load({
							m : "lottery",
							p1 : "previous",
							c : "show",
							info : {
								page : page - 1
							}
						});
					}).css("opacity", 1);
				}
				
				if(page < total_pages){
					$(".dynamo_next_page").bind("click", function(e) {
						dynamo.tip.prompt.load({
							m : "lottery",
							p1 : "previous",
							c : "show",
							info : {
								page : page + 1
							}
						});
					}).css("opacity", 1);
				}
				
			}, "Previous " + dynamo.toolbox.plural(dynamo.server.modules.lottery.name) + " - Page " + cur_page, 800);
		},
		prizes : {
			request : function(id) {
				dynamo.tip.prompt.ini({
					m : "lottery",
					p1 : "previous",
					c : "prizes",
					info : {
						id : id
					}
				});
			},
			show : function(data) {
				dynamo.tip.prompt.content(function() {
					var winners = data.info.winners;
					var winnings = data.info.initial_winnings;
					var split_winnings = data.info.split_winnings;
					var rows = [
						{
							cells : [
								{
									content : 'Match <em>x</em> numbers',
									type : 'th'
								},
								{
									content : 'Winners',
									desc: 'This is how many users matched the respective amount of numbers on their lottery tickets.',
									tip : {
										position : {
											my : 'top center',
											at : 'bottom center'
										}
									},
									type : 'th'
								},
								{
									content : 'Winnings',
									desc: 'This is how much ' + dynamo.toolbox.lowercase(dynamo.server.modules.currency.settings.name) + ' you would win for matching the respective amount of numbers if no one else matches them as well.',
									tip : {
										position : {
											my : 'top center',
											at : 'bottom center'
										}
									},
									type : 'th'
								},
								{
									content : 'Split Winnings',
									desc: 'This is how much ' + dynamo.toolbox.lowercase(dynamo.server.modules.currency.settings.name) + ' you would win for matching the respective amount of numbers, taking into account that the winnings are split between everyone else who also matched the same amount of numbers.',
									tip : {
										position : {
											my : 'top center',
											at : 'bottom center'
										}
									},
									type : 'th'
								}
							]
						}
					];
					var symbol = dynamo.server.modules.currency.settings.symbol;
					var w = winnings.length;
					while(w--) {
						rows[rows.length] = {
							cells : [
								{ content : w + 1 },
								{ content : dynamo.toolbox.format_number(winners[w]) },
								{ content : symbol + dynamo.toolbox.format_number(winnings[w]) },
								{ content : symbol + dynamo.toolbox.format_number(split_winnings[w]) }
							]
						};
					}
					dynamo.table.create(".dynamo_content", {
						colspan : 4,
						rows : rows
					});
				}, "Previous " + dynamo.toolbox.plural(dynamo.server.modules.lottery.name) + " - Prize Breakdown");
			}
		},
		winners : {
			request : function(id) {
				dynamo.tip.prompt.ini({
					m : "lottery",
					p1 : "previous",
					c : "winners",
					info : {
						id : id
					}
				});
			},
			classify : function(numbers, winning) {
				// adds class to winning numbers (input: csv)
				numbers = numbers.split(",");
				winning = winning.split(",");
				var n = numbers.length;
				while(n--) {
					numbers[n] = dynamo.toolbox.in_array(numbers[n], winning)
						? '<span class="dynamo_lottery_winning_number">' + numbers[n] + '</span>'
						: numbers[n];
				}
				return numbers.join(", ");
			},
			show : function(data) {
			
				var info = data.info;
				var lid = info.lid;
				var page = info.page;
				var total_pages = info.total_pages;
				var cur_page = page + '/' + total_pages;
				var prev_page = $("<button>").attr("type", "submit").css("width", "80px").html("<").css("opacity", 0.5).addClass("dynamo_prev_page");
				var next_page = $("<button>").attr("type", "submit").css("width", "80px").html(">").css("opacity", 0.5).addClass("dynamo_next_page");
			
				dynamo.tip.prompt.content(function() {
					var winners = info.winners;
					var prizes = info.winnings;
					var rows = [
						{
							cells : [
								{
									content : 'User',
									style : {
										width : '50%'
									},
									type : 'th'
								},
								{
									content : 'Numbers',
									type : 'th'
								},
								{
									content : 'Matched',
									desc: 'Numbers matched on the respective ticket. Maximum numbers that could be matched was ' + info.r + '.',
									tip : {
										position : {
											my : 'top center',
											at : 'bottom center'
										}
									},
									type : 'th'
								},
								{
									content : 'Prize',
									type : 'th'
								}
							]
						}
					];
					
					var symbol = dynamo.server.modules.currency.settings.symbol;
					var w, wL = winners.length;
					
					for(w = 0; w < wL; w++) {
						rows[rows.length] = {
							cells : [
								{ content : '<a href="' + main_url + 'profile/' + winners[w].zbid + '/">' + winners[w].username + '</a>' },
								{ content : dynamo.lottery.previous.winners.classify(winners[w].numbers, info.winning_numbers) },
								{ content : winners[w].matched },
								{ content : symbol + dynamo.toolbox.format_number(winners[w].prize) }
							]
						};
					}
					
					$(".dynamo_content").empty().append('<div></div><br /><div style="text-align:center;" class="dynamo_pages_holder"></div>');
				
					dynamo.table.create(".dynamo_content div:first", {
						colspan : 4,
						rows : rows
					});
				
					$(".dynamo_pages_holder").append(prev_page).append(' ').append(next_page);
					$(".dynamo_content em").css("opacity",0.5);
					
					if(page > 1){
						$(".dynamo_prev_page").bind("click", function(e) {
							dynamo.tip.prompt.load({
								m : "lottery",
								p1 : "previous",
								c : "winners",
								info : {
									id : lid,
									page : page - 1
								}
							});
						}).css("opacity", 1);
					}
					
					if(page < total_pages){
						$(".dynamo_next_page").bind("click", function(e) {
							dynamo.tip.prompt.load({
								m : "lottery",
								p1 : "previous",
								c : "winners",
								info : {
									id : lid,
									page : page + 1
								}
							});
						}).css("opacity", 1);
					}
					
				},  "Previous " + dynamo.toolbox.plural(dynamo.server.modules.lottery.name) + " - Winners - Page " + cur_page, 570);
			}
		}
	},
	acp : {
		current : {
			request : function() {
				dynamo.tip.prompt.load({
					m : "lottery",
					p1 : "acp",
					p2 : "current",
					c : "form"
				});
			},
			probability : function(n, r) {
				n = +n;
				r = +r;
				var prob = 1, i = 0;
				for(r = r; r > 0; r--) {
					prob *= r / (n - i++);
				}
				return Math.ceil(1 / prob);
			},
			calculate : function() {
				var n = +$(".dynamo_content input[name=n]").val();
				var r = +$(".dynamo_content input[name=r]").val();
				if(n > 1 && r > 0) {
					var probability = dynamo.lottery.acp.current.probability(n, r);
					$(".dynamo_content form input[name=calculator]").val(probability);
				}
			},
			form_create : function(data) {
				var info = data.info;
				
				dynamo.tip.prompt.content(function() {
					dynamo.form.create(".dynamo_content", {
						fields : [
							{
								field : {
									type : 'input',
									spec : 'number',
									name : 'price'
								},
								content : {
									label : 'Ticket Price',
									placeholder : dynamo.server.modules.currency.settings.symbol,
									value : 0
								},
								rules : {
									required : true,
									min : 0
								}
							},
							{
								field : {
									type : 'input',
									spec : 'number',
									name : 'tickets'
								},
								content : {
									label : '# of tickets',
									desc : 'The number of tickets that will be put on sale.<br><br>Set to 0 for an unlimited amount.',
									placeholder : 0,
									value : 0
								},
								rules : {
									required : true,
									min : 0
								}
							},
							{
								field : {
									type : 'input',
									spec : 'number',
									name : 'max_tickets'
								},
								content : {
									label : 'Max tickets per user',
									desc : 'The maximum number of tickets each user can buy.<br><br>Set to 0 for no restriction.',
									placeholder : 0,
									value : 0
								},
								rules : {
									required : true,
									min : 0
								}
							},
							{
								field : {
									type : 'input',
									spec : 'number',
									name : 'pot'
								},
								content : {
									label : 'Starting pot',
									desc : 'This is the amount that is initially in the pot. If you have run a ' + dynamo.toolbox.lowercase(dynamo.lottery.settings.name) + ' before, the default value for this is the rollover amount (the amount which was not won in the previous ' + dynamo.toolbox.lowercase(dynamo.lottery.settings.name) + '.',
									placeholder : dynamo.server.modules.currency.settings.symbol,
									value : info.rollover
								},
								rules : {
									required : true,
									min : 0
								}
							},
							{
								field : {
									type : 'input',
									spec : 'number',
									name : 'end_date'
								},
								content : {
									label : 'End date',
									desc : 'Input the number of seconds that the ' + dynamo.toolbox.lowercase(dynamo.lottery.settings.name) + ' should last for.<br><br>3,600 seconds = 1 hour<br>86,400 seconds = 1 day',
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
								dynamo.form.create(".dynamo_content", {
									fields : [
										{
											field : {
												type : 'input',
												spec : 'number',
												name : 'calculator'
											},
											content : {
												label : 'Estimated # of tickets needed:',
												desc : 'This field updates automatically to give you an estimate of how many tickets will need to be bought for someone to match all numbers. Try and keep this number close to how many tickets you expect to sell for best results.',
												value : '0'
											}
										},
										{
											field : {
												type : 'input',
												spec : 'number',
												name : 'n'
											},
											content : {
												label : 'Choose from 1-?',
												desc : 'What numbers are you allowed to choose in the lottery? Please input the highest number (for example, for 1-20, enter \'20\').',
												placeholder : 0,
												value : 0
											},
											rules : {
												required : true,
												min : 2,
												max : 50
											}
										},
										{
											field : {
												type : 'input',
												spec : 'number',
												name : 'r'
											},
											content : {
												label : 'Select ? numbers?',
												desc : 'How many numbers do you want to have to choose on each ticket?',
												placeholder : 0,
												value : 0
											},
											rules : {
												required : true,
												min : 1,
												max : 10
											}
										}
									],
									submit : {
										to_call : function(data2){
											data = $.extend(true, {}, data, data2);
											delete data.calculator;
											dynamo.tip.prompt.load({
												m : "lottery",
												p1 : "acp",
												p2 : "current",
												c : "create",
												info : data
											});
										},
										value : 'Create ' + dynamo.lottery.settings.name,
										inline : false
									}
								});
								$(".dynamo_content form tr:first").before('<tr><th colspan="2">Calculator</th></tr>');
								$(".dynamo_content form input[name=calculator]").focus(function() {$(this).blur();}).after(' <input type="button" name="calc" value="Calculate" onclick="dynamo.lottery.acp.current.calculate();" />').closest("tr").after('<tr><td colspan="2" class="post_sep" /></tr>').next().find("input").focus();
								$(".dynamo_content form input").bind("keyup", dynamo.lottery.acp.current.calculate);
							},
							value : 'Next Page',
							inline : false
						}
					});				
				},  dynamo.server.modules.lottery.name + " - ACP - Creating " + dynamo.server.modules.lottery.name);
			},
			form_end : function(data) {
				var info = data.info;
				var my_tickets = info.my_tickets;
			
				dynamo.tip.prompt.content(function(){
					
					var symbol = dynamo.server.modules.currency.settings.symbol;
					
					switch(+info.reason) {
						case 0 : var draw = '[<a href="javascript:dynamo.lottery.acp.current.draw();">Draw Early</a>]'; break;
						default : var draw = '[<a href="javascript:dynamo.lottery.acp.current.draw();">Draw Now</a>]'; break;
					}
					
					var tickets_bought = info.tickets.bought >= info.tickets.max && info.tickets.max != 0
						? 'All ' + dynamo.toolbox.format_number(info.tickets.max) + ' tickets have been bought.'
						: (dynamo.toolbox.format_number(info.tickets.bought) + ' / ' + (info.tickets.max == 0 ? 'Unlimited' : info.tickets.max));
					
					dynamo.table.create(".dynamo_content", {
						rows : [
							{
								cells : [
									{
										colspan : 2,
										style : {align : 'center'},
										content : draw
									}
								]
							},
							{
								cells : [
									{
										content : 'Draw Date',
										style : {
											width : '40%',
											classes : 'c_desc'
										}
									},
									{content : dynamo.toolbox.time_string(info.end_date, info.ended ? 2 : 3)}
								]
							},
							{
								cells : [
									{
										content : 'Total Pot',
										desc : 'The maximum amount of ' + dynamo.toolbox.lowercase(dynamo.server.modules.currency.settings.name) + ' which will be won in total (all users, not per user).',
										style : {
											classes : 'c_desc'
										}
									},
									{content : symbol + dynamo.toolbox.format_number(info.pot)}
								]
							},
							{
								cells : [
									{
										content : 'Jackpot',
										desc : 'The maximum amount of ' + dynamo.toolbox.lowercase(dynamo.server.modules.currency.settings.name) + ' that can be won by a single user (by matching all of the numbers).',
										style : {
											classes : 'c_desc'
										}
									},
									{content : symbol + dynamo.toolbox.format_number(info.jackpot)}
								]
							},
							{
								cells : [
									{
										content : 'Total Tickets Bought',
										style : { classes : 'c_desc' }
									},
									{content : tickets_bought}
								]
							}
						]
					});			
					
				}, dynamo.server.modules.lottery.name + " - ACP - Current " + dynamo.server.modules.lottery.name);
			},
			draw : function() {
				dynamo.tip.prompt.ini({
					m : "lottery",
					p1 : "acp",
					p2 : "current",
					c : "draw"
				});
			}
		}
	}
};