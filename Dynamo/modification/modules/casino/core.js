dynamo.casino = {
	lottery : {
		current : {
			name : '',
			winnings : [],
			show : function(data){
				if(data.login && data.login == 1){
					if("no_lottery" in data){console.log(data);
						var reason = data.no_lottery == 1 ? 'The current '+dynamo.settings.casino_lottery_name+' has just ended. Please check back soon for the results!' : 'There is no '+dynamo.settings.casino_lottery_name+' running at the moment. Please check again later.';
						dynamo.tip.prompt.content(reason,"Current " + dynamo.settings.casino_lottery_name);
					} else {
						dynamo.casino.lottery.current.winnings = data.winnings;
						dynamo.casino.lottery.current.name = data.name;
						var your_tickets_help = ' <a href="javascript:void(0);" rel="your_tickets">[?]</a>';
						var your_tickets = data.your_tickets == 0 ? 0 : '<a href="javascript:dynamo.casino.lottery.current.get_mine(1);">'+dynamo.toolbox.format_number(data.your_tickets)+'</a>'+your_tickets_help;
						var tickets_left_help = data.starting_tickets == 0 ? '' : ' <a href="javascript:void(0);" rel="tickets_left">[?]</a>';
						var tickets_left = data.your_max_tickets-data.your_tickets;
						dynamo.tip.prompt.content(function(){
							var buy_ticket = (data.your_max_tickets == 0 || tickets_left > 0) ? '<br /><div style="text-align:center;"><button type="button" value="buy" onclick="dynamo.casino.lottery.current.request_buy_form();">Buy Ticket</button></div>' : '';
							$(".dynamo_content").html('<table><tr><td class="c_desc" style="width:40%;">Current Pot:</td><td>'+dynamo.settings.money_sign+dynamo.toolbox.format_number(data.current_pot)+' <a href="javascript:void(0);" rel="current_pot">[?]</a></td></tr><tr><td class="c_desc">Ticket Price:</td><td>'+dynamo.settings.money_sign+dynamo.toolbox.format_number(data.ticket_price)+'</td></tr><tr><td class="c_desc">Your Tickets:</td><td>'+your_tickets+'</td></tr><tr><td class="c_desc">Total Tickets Bought</td><td>'+dynamo.toolbox.format_number(data.tickets_bought)+tickets_left_help+'</td></tr><tr><td class="c_desc">Ending:</td><td>'+dynamo.toolbox.time_string(data.ending_in,2,1,"","in ")+' <a href="javascript:void(0);" rel="end_time">[?]</a></td></tr></table>'+buy_ticket);
							var options = {
								style : {
									width : 150
								}
							};
							dynamo.tip.ini("#ui-tooltip-prompt-content a[rel=current_pot]",$.extend({},options,{
								content : {
									text : '<table id="current_lottery_winnings" style="text-align:center;"><tr><th style="width:50%;">Match</th><th>Winnings</th></tr><tr><td colspan="2">Loading...</td></tr>'
								},
								events : {
									render : function(event,api){
										dynamo.casino.lottery.current.winnings_page(1);
									}
								},
								hide : {
									delay : 500,
									fixed : true
								}
							}));
							dynamo.tip.ini("#ui-tooltip-prompt-content a[rel=your_tickets]",$.extend({},options,{
								content : {
									text : data.your_max_tickets == 0
										? 'You can buy as many tickets as you like!'
										: (tickets_left == 0
											? 'You can\'t buy any more tickets!'
											: 'You can buy '+dynamo.toolbox.format_number(tickets_left)+' more ticket'+(tickets_left==1?'':'s')+'')
								}
							}));
							if(data.starting_tickets != 0){
								tickets_left = data.starting_tickets - data.tickets_bought;
								dynamo.tip.ini("#ui-tooltip-prompt-content a[rel=tickets_left]",$.extend({},options,{
									content : {
										text : tickets_left == 0
											? 'There aren\'t any tickets left!'
											: 'There '+(tickets_left==1?'is':'are')+' '+dynamo.toolbox.format_number(tickets_left)+' ticket'+(tickets_left==1?'':'s')+' left'
									}
								}));
							}
							dynamo.tip.ini("#ui-tooltip-prompt-content a[rel=end_time]",$.extend({},options,{
								content : {
									text : "Started: " + dynamo.toolbox.time_string(data.started,1)
								}
							}));
							
						},"Current " + dynamo.settings.casino_lottery_name + " - " + dynamo.casino.lottery.current.name);
					}
				}
			},
			winnings_page : function(page){
				amount = dynamo.casino.lottery.current.winnings.length;
				total_pages = amount > 5 ? 2 : 1;
				page = Math.max(1,Math.min(total_pages,page));
				content = '<tr><th>Match</th><th>Winnings</th></tr>';
				to_start = (page - 1) * 5;
				to_end = Math.min(amount,page * 5);
				for(w=to_start;w<to_end;w++){
					content += '<tr><td style="width:50%;">'+(amount - w)+'</td><td>'+dynamo.settings.money_sign+dynamo.toolbox.format_number(dynamo.casino.lottery.current.winnings[w])+'</td></tr>';
				}
				if(total_pages == 2){
					prev_page = page == 1 ? '<<' : '<a href="javascript:dynamo.casino.lottery.current.winnings_page(1);"><<</a>';
					next_page = page == 2 || total_pages == 1 ? '>>' : '<a href="javascript:dynamo.casino.lottery.current.winnings_page(2);">>></a>';
					content += '<tr><td class="c_foot">'+prev_page+'</td><td class="c_foot">'+next_page+'</td></tr>';
				}
				$("#current_lottery_winnings").html(content);
				$("#ui-tooltip-prompt-content a[rel=current_pot]").qtip("reposition");
			},
			unavailable : function(data){
				switch(data.state * 1){
					case 1:
						content = 'You have already bought a maximum of '+dynamo.toolbox.format_number(data.reason)+' ticket'+(data.reason==1?'':'s')+'.';
						break;
					case 2:
						content = 'All '+dynamo.toolbox.format_number(data.reason)+' ticket'+(data.reason==1?'':'s')+' have been bought!';
						break;
					case 3:
						content = 'There was an error with the numbers you had chosen. Please try again later.';
						break;
					case 4:
						content = 'You can only choose each number once!';
						break;
					case 5:
						content = 'You do not have enough '+(dynamo.settings.money_name).toLowerCase()+' on hand to buy a ticket.';
						break;
					case 6:
						content = 'You need to earn '+dynamo.toolbox.format_number(data.reason)+' more '+dynamo.settings.reputation_name+' point'+(data.reason==1?'':'s')+' before being allowed to purchase a ticket.';
						break;
					case 7:
						content = 'You cannot purchase the same ticket twice!';
						break;
				}
				dynamo.tip.prompt.content(content,"Current " + dynamo.settings.casino_lottery_name + " - " + dynamo.casino.lottery.current.name + " - Error");
			},
			request_buy_form : function(){
				dynamo.tip.prompt.loading();
				dynamo.module.server_call(2,{p:"casino",t:"lottery",c:"buy",stage:"1"});
			},
			buy_form : function(data){
				if(data.login && data.login == 1){
					var new_width = 150 + (data.r > 4 ? 380 + (data.r - 4) * 45 : 380 - (4 - data.r) * 45);
					dynamo.tip.prompt.content(function(){
						var content = '<tr><td class="c_desc" colspan="2">Choose ' + data.r + ' number' + ( data.r == 1 ? '' : 's' ) + ' from 1 - ' + data.n + '</td><tr><td><input type="button" value="Lucky Dip" onclick="dynamo.casino.lottery.current.lucky_dip('+data.n+');" /></td><td id="dynamo_numbers"><form onsubmit="dynamo.casino.lottery.current.buy(event);">';
						for(i=1;i<=data.r;i++){
							content += ' <input type="number" min="1" max="'+data.n+'" style="width:30px;" required /> ';
						}
						content += ' <input type="submit" value="Buy Ticket" /></form></td></tr><tr><td class="c_foot" colspan="2"> </td></tr>';
						$(".dynamo_content").html('<table>'+content+'</table>');
					},"Current " + dynamo.settings.casino_lottery_name + " - " + dynamo.casino.lottery.current.name + " - Buying Ticket",new_width);
				}
			},
			lucky_dip : function(n){
				holder = $("#dynamo_numbers input:not([type='button']):not([type='submit'])");
				r = holder.size();
				if(r < n){
					chosen = [];
					intervals = [];
					for(i=0;i<r;i++){
						while(true){
							rand = Math.round(Math.random() * n);
							if(!dynamo.toolbox.in_array(rand,chosen)){
								chosen[chosen.length] = rand;
								break;
							}
						}
						holder.val(1);
						dynamo.casino.lottery.current.animating(i,rand);
					}
					
				}
			},
			animating : function(i,rand){
				holder = $("#dynamo_numbers input:not([type='button']):not([type='submit'])").eq(i);
				if(holder.val() < rand){
					holder.val(holder.val()*1+1);
					setTimeout(function(){
						dynamo.casino.lottery.current.animating(i,rand);
					},Math.round(1000/rand));
				}
			},
			buy : function(e){
				e.returnValue = e.preventDefault && e.preventDefault() ? false : false;
				holder = $("#dynamo_numbers input:not([type='button']):not([type='submit'])");
				r = holder.size();
				numbers = [];
				var carry_on = true;
				for(i=0;i<r;i++){
					this_number = holder.eq(i).val();
					if(!dynamo.toolbox.is_integer(this_number) || dynamo.toolbox.in_array(this_number,numbers)){
						carry_on = i;
						break;
					} else {
						numbers[numbers.length] = this_number;
					} 
				}
				if(carry_on === true){
					dynamo.tip.prompt.loading();
					dynamo.module.server_call(2,{p:"casino",t:"lottery",c:"buy",stage:2,numbers:numbers.join("|")});
				} else {
					holder.eq(carry_on).val("").focus();
				}
			},
			bought : function(data){
				if(data.login && data.login == 1){
					dynamo.tip.prompt.content('You have successfully purchased your '+dynamo.settings.casino_lottery_name+' ticket. Please check back later for the results!',"Current " + dynamo.settings.casino_lottery_name + " - " + dynamo.casino.lottery.current.name + " - Purchase Successful");
				}
			},
			get_mine : function(page){
				dynamo.tip.prompt.loading();
				dynamo.module.server_call(2,{p:"casino",t:"lottery",c:"my_tickets",page:page});
			},
			show_mine : function(data){
				if(data.login && data.login == 1){
					var page = data.page;
					var total_pages = data.total_pages;
					var cur_page = data.tickets.length ? ' - Page ' + page + '/' + total_pages : '';
					dynamo.tip.prompt.content(function(){
						if(data.tickets.length){
							var rspan = data.tickets.length + 2;
							var prev_page = page > 1 ? '<td rowspan="'+rspan+'" class="dynamo_prev_page"><</td>' : '';
							var next_page = page < total_pages ? '<td rowspan="'+rspan+'" class="dynamo_next_page">></td>' : '';
							var content = '<tr>'+prev_page+'<th style="width:30%;">Purchase Date</th><th style="width:45%;">Numbers</th><th>Sell Ticket <a href="javascript:void(0);" rel="sale_price">[?]</a></th>'+next_page+'</tr>';
							for(t=0;t<data.tickets.length;t++){
								content += '<tr><td>'+dynamo.toolbox.time_string(data.tickets[t].bought,1)+'</td><td>'+data.tickets[t].numbers+'</td><td><a href="javascript:dynamo.casino.lottery.current.sell_ticket('+data.tickets[t].id+','+data.page+');">Sell</a></td></tr>';
							}
							content += '<tr><td class="c_foot" colspan="3"> </td></tr>';
						} else {
							var content = '<tr><td>You have not purchased any tickets.</td></tr><tr><td class="c_foot"> </td></tr>';
						}
						$(".dynamo_content").html('<table>'+content+'</table>');
						$(".dynamo_prev_page").bind("click",{page:(+page)-1},function(e){
						dynamo.tip.prompt.load('',{
							p : "casino",
							t : "lottery",
							c : "my_tickets",
							page : e.data.page
						});
						});
						$(".dynamo_next_page").bind("click",{page:(+page)+1},function(e){
							dynamo.tip.prompt.load('',{
								p : "casino",
								t : "lottery",
								c : "my_tickets",
								page : e.data.page
							});
						});
						var options = {
							style : {
								width : 150
							}
						};
						dynamo.tip.ini("#ui-tooltip-prompt-content a[rel=sale_price]",$.extend({},options,{
							content : {
								text : 'You can sell your tickets for '+dynamo.settings.money_sign+dynamo.toolbox.format_number(data.sale_price)+' each'
							}
						}));
					},"Current " + dynamo.settings.casino_lottery_name + " - " + dynamo.casino.lottery.current.name + " - My Tickets" + cur_page);
				}
			},
			sell_ticket : function(id,page){
				dynamo.tip.prompt.loading();
				dynamo.module.server_call(2,{p:"casino",t:"lottery",c:"sell",tid:id,page:page});
			}
		},
		past : {
			ini : function(page){
				page = page !== undefined && page !== null ? page : 1;
				dynamo.tip.prompt.loading();
				dynamo.module.server_call(2,{p:"casino",t:"lottery",c:"past",page:page});
			},
			show_page : function(data){
				if(data.login && data.login == 1){
					var total_pages = data.total_pages;
					if(total_pages == 0){
						dynamo.tip.prompt.content('No ' + dynamo.toolbox.plural(dynamo.settings.casino_lottery_name) + ' have finished yet. Please check again later.',"Past "+dynamo.toolbox.plural(dynamo.settings.casino_lottery_name));
					} else {
						var page = data.page;
						var cur_page = page + '/' + total_pages;
						dynamo.tip.prompt.content(function(){
							var pL = data.past.length;
							var rspan = pL + 2;
							var prev_page = page > 1 ? '<td rowspan="'+rspan+'" class="dynamo_prev_page"><</td>' : '';
							var next_page = page < total_pages ? '<td rowspan="'+rspan+'" class="dynamo_next_page">></td>' : '';
							var content = '<tr>'+prev_page+'<th>Name</th><th>Amount Won</th><th>Remaining Amount</th><th>Winning Numbers</th><th>Winners</th><th>Ended</th>'+next_page+'</tr>';
							for(p=0;p<pL;p++){
								lotto = data.past[p];
								var winners = lotto.winners > 0 ? '<a href="javascript:dynamo.casino.lottery.past.winners.ini('+lotto.id+');">'+dynamo.toolbox.format_number(lotto.winners)+'</a>' : 0;
								content += '<tr><td>'+lotto.name+'</td><td>'+dynamo.settings.money_sign+dynamo.toolbox.format_number(lotto.won)+'</td><td>'+dynamo.settings.money_sign+dynamo.toolbox.format_number(lotto.remaining)+'</td><td>'+lotto.numbers+'</td><td>'+winners+'</td><td>'+dynamo.toolbox.time_string(lotto.ended,1)+'</td></tr>';
							}
							content += '<tr><td class="c_foot" colspan="6"> </td></tr>';
							$(".dynamo_content").html('<table>'+content+'</table>');
							$(".dynamo_prev_page").bind("click",{page:(+page)-1},function(e){
							dynamo.tip.prompt.load('',{
								p : "casino",
								t : "lottery",
								c : "past",
								page : e.data.page
							});
							});
							$(".dynamo_next_page").bind("click",{page:(+page)+1},function(e){
								dynamo.tip.prompt.load('',{
									p : "casino",
									t : "lottery",
									c : "past",
									page : e.data.page
								});
							});
						},"Past "+dynamo.toolbox.plural(dynamo.settings.casino_lottery_name)+" - Page "+cur_page,720);
					}
				}
			},
			winners : {
				ini : function(id,page){
					dynamo.tip.prompt.loading();
					page = page !== undefined && page !== null ? page : 1;
					dynamo.module.server_call(2,{p:"casino",t:"lottery",c:"winners",id:id,page:page});
				},
				show : function(data){
					if(data.login && data.login == 1){
						var wL = data.winners.length;
						if(wL){
							var page = data.page;
							var total_pages = data.total_pages;
							var cur_page = page + '/' + total_pages;
							var rspan = wL + 2;
							var prev_page = page > 1 ? '<td rowspan="'+rspan+'" class="dynamo_prev_page"><</td>' : '';
							var next_page = page < total_pages ? '<td rowspan="'+rspan+'" class="dynamo_next_page">></td>' : '';
							dynamo.tip.prompt.content(function(){
								var content = '<tr>'+prev_page+'<th>Username</th><th>Numbers</th><th>Winnings</th><th>Total Winnings</th>'+next_page+'</tr>';
								for(var w=0;w<wL;w++){
									var winner = data.winners[w];
									var numbers = winner.numbers.split(",");
									var nL = numbers.length;
									var correct_numbers = data.numbers.split(",");
									for(n=0;n<nL;n++){
										if(dynamo.toolbox.in_array(numbers[n],correct_numbers)){
											numbers[n] = '<span class="dynamo_casino_lottery_correct">'+numbers[n]+'</span>';
										} else {
											numbers[n] = '<span class="dynamo_casino_lottery_incorrect">'+numbers[n]+'</span>';
										}
									}
									numbers = numbers.join(",");
									content += '<tr><td><a href="'+main_url+'profile/'+winner.zbid+'">'+winner.name+'</a></td><td>'+numbers+'</td><td>'+dynamo.settings.money_sign+dynamo.toolbox.format_number(winner.amount)+'</td><td>'+dynamo.settings.money_sign+dynamo.toolbox.format_number(winner.totalAmount)+'</td></tr>';
								}
								content += '<tr><td colspan="4" class="c_foot"> </td></tr>';
								$(".dynamo_content").html('<table>'+content+'</table>');
								$(".dynamo_prev_page").bind("click",{id:data.id,page:(+page)-1},function(e){
								dynamo.tip.prompt.load('',{
									p : "casino",
									t : "lottery",
									c : "winners",
									id : e.data.id,
									page : e.data.page
								});
								});
								$(".dynamo_next_page").bind("click",{id:data.id,page:(+page)+1},function(e){
									dynamo.tip.prompt.load('',{
										p : "casino",
										t : "lottery",
										c : "winners",
										id : e.data.id,
										page : e.data.page
									});
								});
							},dynamo.settings.casino_lottery_name + " - " + data.name + " - Winners - Page " + cur_page,550);
						} else {
							dynamo.tip.prompt.content('There were no winners in this '+dynamo.settings.casino_lottery_name,dynamo.settings.casino_lottery_name + " Winners");
						}
					}
				}
			}
		}
	}
};