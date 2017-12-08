dynamo.shop = {
	/*main : function(data){
		dynamo.toolbox.error_check(data);
		if(data.login && data.login == 1){
			dynamo.prompt.width(400,function(){
				$("#dynamo_shop_window .dynamo_header h2").html(dynamo.settings.shop_name);
				var forum_shop_name = "forum_shop_name" in data ? data.forum_shop_name : "Forum " + dynamo.settings.shop_name;
				var forum_shop = data.forum_shop == 1 ? '<a href="javascript:dynamo.shop.enter.access();">Enter '+forum_shop_name+'</a>' : '<em>Enter '+forum_shop_name+'</em> <a href="javascript:void(0);" class="forum_shop help">[?]</a>';
				var other_shops = data.other_shops == 1 ? '<a href="javascript:dynamo.shop.members.ini();">View Member\'s '+dynamo.toolbox.plural(dynamo.settings.shop_name)+'</a>' : '<em>View Member\'s '+dynamo.toolbox.plural(dynamo.settings.shop_name)+'</em> <a href="javascript:void(0);" class="other_shops help">[?]</a>';
				var my_shop = data.my_shop == 1 ? '<a href="javascript:dynamo.shop.mine.ini();">Manage my '+dynamo.settings.shop_name+'</a>' : (data.my_shop == 2 ? '<a href="javascript:dynamo.shop.mine.settings.page();">Open a '+dynamo.settings.shop_name+'</a>' : '<em>Open a '+dynamo.settings.shop_name+'</em> <a href="javascript:void(0);" class="my_shop help">[?]</a>');
				var inventory = data.inventory == 1 ? '<a href="javascript:dynamo.shop.inventory.ini();">View '+dynamo.settings.shop_inventory_name+'</a>' : '<em>View '+dynamo.settings.shop_inventory_name+'</em> <a href="javascript:void(0);" class="shop_inventory help">[?]</a>';
				$("#dynamo_shop_window .dynamo_content tbody").html('<tr><td style="width:50%;">'+forum_shop+'</td><td>'+other_shops+'</td></tr><tr><td>'+my_shop+'</td><td>'+inventory+'</td></tr><tr><td colspan="2" class="c_foot"> </td></tr>').css("text-align","center");
				var options = {
					style : {
						width : 150
					}
				};
				if(data.forum_shop != 1){
					dynamo.prompt.tooltip(".forum_shop",$.extend({},options,{
						content : {
							text : data.forum_shop == 2
								? forum_shop_name+' does not have any items for sale. Please check back later.'
								: (data.forum_shop == 3
									? forum_shop_name + ' is closed. Please check back later.'
									: 'The ' + forum_shop_name + ' is under construction. Please check back later.')
						}
					}));
				}
				if(data.other_shops != 1){
					dynamo.prompt.tooltip(".other_shops",$.extend({},options,{
						content : {
							text : 'No one has opened their own '+dynamo.settings.shop_name+'.'
						}
					}));
				}
				if(data.my_shop != 1){
					dynamo.prompt.tooltip(".my_shop",$.extend({},options,{
						content : {
							text : 'You are not permitted to open your own '+dynamo.settings.shop_name+'.'
						}
					}));
				}
				if(data.inventory != 1){
					dynamo.prompt.tooltip(".shop_inventory",$.extend({},options,{
						content : {
							text : 'You do not have any items in your '+(dynamo.settings.shop_inventory_name).toLowerCase()+'.'
						}
					}));
				}
			});
		}
	},*/
	box : {
		ini : function(data){
			/* var data = {id,right_text,preview,name,description}; */
			var container = $('<div>').attr("id",'dynamo_shop_item_id-'+data.id);
				var holder = $('<div>').addClass("dynamo_shop_holder");
					if("right_text" in data && data.right_text.length){
						var right = $('<div>').addClass("dynamo_right").html(data.right_text);
							right.appendTo(holder);
					}
					var left = $('<div>').addClass("dynamo_left");
						var preview = $('<div>').addClass("dynamo_preview");
							var fader = $('<div>').addClass("dynamo_fader");
								fader.appendTo(preview);
							var img = $('<img>').attr("src",data.preview).attr("alt","");
								img.appendTo(preview);
							preview.appendTo(left);
						var info = $('<div>').addClass("dynamo_info");
							var name = $('<span>').addClass("dynamo_name").html(data.name);
								name.appendTo(info);
							var description = $('<span>').addClass("dynamo_description").html(data.description);
								description.appendTo(info);
							info.appendTo(left);
						var preview_info_clear = $('<div>').addClass("dynamo_clear_left");
							preview_info_clear.appendTo(left);
						left.appendTo(holder);
					holder.appendTo(container);
				var holder_clear = $('<div>').addClass("dynamo_clear_right");
					holder_clear.appendTo(container);
			return container;
		},
		add_spacing : function(){
			$(".dynamo_content td").has(".dynamo_shop_holder").each(function(){
				$(this).find(".dynamo_shop_holder").not(":eq(0)").css("margin-top","3px");
			});
			dynamo.shop.enter.max_height = Math.max(dynamo.shop.enter.max_height,$(".dynamo_item_holder").height());
		},
		info : function(info){
			var content = $('<table>').addClass("dynamo_table"), i, row, cell_one, cell_two;
			var iL = info.length;
			for(i=0;i<iL;i++){
				row = $('<tr>');
					cell_one = $('<td>').css({"white-space":"nowrap","font-weight":"bold","text-align":"right"}).html(info[i][0]+":");
					cell_two = $('<td>').css("max-width","150px").html(info[i][1]);
					row.append(cell_one).append(cell_two);
				content.append(row);
			}
			return content;
		}
	},
	enter : {
		data : {},
		max_height : 0,
		loading : function(){
			$(".dynamo_content tbody .dynamo_item_holder").html(dynamo_options.loading.message).css("text-align","center");
			$(".dynamo_content")
				.find(".dynamo_shop_logo,.dynamo_shop_informationtitle,.c_foot").attr("colspan",2).end()
				.find(".dynamo_shop_itemtitle,.dynamo_shop_moneyonhand,.dynamo_shop_carttotal").attr("colspan",1);
			$(".dynamo_prev_page,.dynamo_next_page").unbind('click').remove();
		},
		show_items : function(data){console.log(data);
			if(data.login && data.login == 1){
				var title = dynamo.settings.shop_name + " - ";
				switch(+data.state){
					case 0: message = 'This '+(dynamo.settings.shop_name).toLowerCase()+' does not exist.'; title += 'Unknown ' + dynamo.settings.shop_name; break;
					case 1: message = 'This '+(dynamo.settings.shop_name).toLowerCase()+' is not currently open. Please check back later.'; title += data.name; break;
					case 2: message = 'There are currently no items in stock in this '+(dynamo.settings.shop_name).toLowerCase()+'. Please check back later.'; title += data.name; break;
					case 3: message = function(){
						var page = data.page;
						var total_pages = data.total_pages;
						var cur_page = page + '/' + total_pages;
						var loaded_before = $(".dynamo_cart_content").size();
						if(!loaded_before){
							// Add logo to shop, with preloader 
							var logo = "logo" in data && data.logo.length ? '<tr><td colspan="2" class="dynamo_shop_logo"><div class="dynamo_shop_banner_loading">'+dynamo_options.loading.message+'</div></td></tr>' : '';
							$(".dynamo_content").html('<table>' + logo + '<tr><th class="dynamo_shop_itemtitle">Items</th><th>'+dynamo.settings.shop_cart_name+'</th></tr><tr><td class="dynamo_item_holder" style="overflow:hidden;"></td><td class="dynamo_shop_cart" style="width:50%;overflow:hidden;"><div class="dynamo_cart_empty">There are no items in your '+(dynamo.settings.shop_cart_name).toLowerCase()+'.</div><div class="dynamo_cart_content"></td></tr><tr><th colspan="2" class="dynamo_shop_informationtitle">Information</th></tr><tr><td class="c_desc dynamo_shop_moneyonhand" style="width:50%;">'+dynamo.settings.money_name+' on hand: </td><td>'+dynamo.settings.money_sign+'<span class="dynamo_shop_money_on_hand">'+dynamo.toolbox.format_number(data.money)+'</span></td></tr><tr><td class="c_desc dynamo_shop_carttotal">'+dynamo.settings.shop_cart_name+' total: </td><td>'+dynamo.settings.money_sign+'<span class="dynamo_shop_cart_total">0</span> ('+dynamo.settings.money_sign+'<span class="dynamo_shop_money_left">'+dynamo.toolbox.format_number(data.money)+'</span> left)</td></tr><tr><td class="c_foot" colspan="2"></td></tr></table><br /><div style="text-align:center;"><button type="button" value="buy" onclick="dynamo.shop.enter.checkout();">Checkout</button></div>').css("text-align","left");
							if("logo" in data && data.logo.length){
								var _img = $("<img>").attr("src",data.logo).addClass("dynamo_offscreen").bind("load",function(){
									var width = $(this).width();
									var height = $(this).height();
									$(this).hide().removeClass("dynamo_offscreen").css({
										"margin" : "auto",
										"max-width" : "100%",
										"overflow" : "hidden"
									}).insertBefore(".dynamo_shop_banner_loading").stop().slideFadeToggle("fast");
									$(".dynamo_shop_banner_loading").remove();
								});
								$("body").append(_img);
							}
						} else {
							$(".dynamo_prev_page,.dynamo_next_page").unbind('click').remove();
							$(".dynamo_shop_money_on_hand,.dynamo_shop_money_left").text(dynamo.toolbox.format_number(data.money));
							$("dynamo_shop_cart_total").text(0);
						}
						var prev_page = page > 1 ? '<td class="dynamo_prev_page"><</td>' : '';
						var next_page = page < total_pages ? '<td class="dynamo_next_page">></td>' : '';
						var extra_cspan = (+!!prev_page.length) + (+!!next_page.length);
						$(".dynamo_content")
							.find(".dynamo_shop_logo,.dynamo_shop_informationtitle,.c_foot").attr("colspan",2+extra_cspan).end()
							.find(".dynamo_shop_itemtitle,.dynamo_shop_moneyonhand,.dynamo_shop_carttotal").attr("colspan",1+extra_cspan);
						$(".dynamo_item_holder").before(prev_page).after(next_page);
						$(".dynamo_prev_page").bind("click",{page:(+page)-1,shop_zbid:data.shop_zbid},function(e){
							dynamo.shop.enter.loading();
							dynamo.module.server_call(2,{p:"shop",t:"enter",page:e.data.page,shop_zbid:e.data.shop_zbid});
						});
						$(".dynamo_next_page").bind("click",{page:(+page)+1,shop_zbid:data.shop_zbid},function(e){
							dynamo.shop.enter.loading();
							dynamo.module.server_call(2,{p:"shop",t:"enter",page:e.data.page,shop_zbid:e.data.shop_zbid});
						});
						// Add checkout (un)successful message to cart 
						if("checkout" in data){
							$(".dynamo_temp_button").remove();
							var message = '';
							switch(+data.checkout){
								case 0: message = 'Checkout complete.'; break; // complete!
								case 1: message = 'There were no items in your ' + (dynamo.settings.shop_cart_name).toLowerCase() + '.'; break; // no items in cart
								case 2: message = 'One or more of the items in your ' + (dynamo.settings.shop_cart_name).toLowerCase() + ' did not exist.'; break; // some items don't exist
								case 3: message = 'One or more of the items in your ' + (dynamo.settings.shop_cart_name).toLowerCase() + ' was too low on stock.'; break; // too few items in stock
								case 4: message = 'You were trying to exceed the maximum limit of one or more of the items in your ' + (dynamo.settings.shop_cart_name).toLowerCase() + '.'; break; // trying to buy too many of one item (max_per_user)
								case 5: message = 'You did not have enough ' +  dynamo.settings.money_name + ' to buy those items.'; break; // not enough money
								case 6: message = 'The owner of this '+(dynamo.settings.shop_name).toLowercase()+' no longer exists.'; break; // store owner not found
								case 7: message = 'You cannot purchase items from your own shop!'; break;
								default: message = 'An unknown error occurred.'; // unknown state?
							}
							if(!dynamo.toolbox.in_array(+data.checkout,[0,7])){
								message += ' Please try again';
							}
							$(".dynamo_shop_checkout_load").stop().show().fadeOut("fast",function(){
								$(this).remove();
								$(".dynamo_cart_empty").parent().css("vertical-align","middle").end().prepend('<div class="dynamo_shop_temp_message">'+message+'</div>').stop().hide().slideFadeToggle("fast");
							});
						}
						dynamo.shop.enter.update(data);
					}; title = ''; break;
				}
				dynamo.tip.prompt.content(message,title,(+data.state === 3 ? 750 : null));
				dynamo.shop.enter.data = data;
			}
		},
		update : function(data){
			data = data !== undefined && data !== null ? data : dynamo.shop.enter.data;
			var items = data.items;
			var items_len = items.length, i, item_info, iD, stock, maximum, in_cart, cart_money, able_to_buy, reason;
			$("td.dynamo_item_holder").html('<div></div>');
			for(i=0;i<items_len;i++){
				iD = items[i];
				item_info = {
					id : iD.id,
					preview : "preview" in iD && iD.preview.length ? iD.preview : iD.img,
					name : iD.name,
					description : iD.description,
					right_text : dynamo.settings.money_sign + dynamo.toolbox.format_number(iD.price)
				};
				$("td.dynamo_item_holder > div").append(dynamo.shop.box.ini(item_info));
				able_to_buy = false;
				in_cart = +dynamo.toolbox.strip_number($("#dynamo_shop_cart_id-"+iD.id+" .dynamo_quantity").html() || "0");
				cart_money = dynamo.shop.enter.get_cart_money();
				$(".dynamo_shop_cart_total").text(dynamo.toolbox.format_number(cart_money));
				$(".dynamo_shop_money_left").text(dynamo.toolbox.format_number(data.money-cart_money));
				reason = "Add to Cart";
				if((+iD.price + cart_money) > data.money){
					reason = 'Item is too expensive';
				} else if(in_cart >= (+iD.stock - +iD.purchased) && +iD.stock !== 0){
					reason = 'Item out of stock';
				} else if(in_cart + +iD.owned >= +iD.max_per_user && +iD.max_per_user !== 0){
					reason = 'You cannot buy any more';
				} else {
					able_to_buy = true;
				}
				$("#dynamo_shop_item_id-"+iD.id+" .dynamo_right").addClass('dynamo_'+(able_to_buy?'':'un')+'able'); // styling for .dynamo_right
				dynamo.tip.ini("#dynamo_shop_item_id-"+iD.id+" .dynamo_right",{
					content : {
						text : '<div style="text-align:center;">' + reason + '</div>'
					},
					hide : {
						fixed : true
					},
					style : {
						width : 80
					},
					position : {
						my : (able_to_buy ? 'left ' : '') + 'center',
						at : (able_to_buy ? 'right ' : '') + 'center'
					}
				});
				if(able_to_buy){ // Add to cart functionality
					$("#dynamo_shop_item_id-"+iD.id+" .dynamo_right").bind('click',(function(data){
						return function(){
							var cart_holder = $("#dynamo_shop_cart_id-"+data.id);
							$(".dynamo_shop_temp_message").remove();
							if(cart_holder.size()){
								var quantity = cart_holder.find(".dynamo_quantity").text();
								cart_holder.find(".dynamo_quantity").text(++quantity);
								dynamo.shop.enter.update();
							} else {
								$(".dynamo_cart_empty").hide().closest("td.dynamo_shop_cart").css("vertical-align","baseline");
								var quantity_holder = $('<div>').addClass("dynamo_quantity").html(1);
								var price_holder = $('<div>').addClass("dynamo_price").hide().html(data.price);
								$("#dynamo_shop_item_id-"+data.id).clone()
									.attr("id","dynamo_shop_cart_id-"+data.id)
									.find(".dynamo_right").bind('click',function(){
										// This is the handler for removing items
										var cart_holder = $("#dynamo_shop_cart_id-"+data.id);
										var quantity = cart_holder.find(".dynamo_quantity").text();
										if(+quantity == 1){
											cart_holder.show().stop().slideFadeToggle("fast",function(){
												$(this).remove();
												if(!$(".dynamo_cart_content .dynamo_shop_holder").size()){
													$(".dynamo_cart_empty").parent().css("vertical-align","middle").end().hide().stop().slideFadeToggle("fast");
												}
												dynamo.shop.enter.update();
											})
										} else {
											cart_holder.find(".dynamo_quantity").text(--quantity);
											dynamo.shop.enter.update();
										}
									}).empty().append(quantity_holder).append(price_holder).end()
									.hide().appendTo(".dynamo_cart_content").stop().slideFadeToggle("fast",function(){
										if($(".dynamo_cart_content.dynamo_overflow").size()){
											var scroll_holder = $(".dynamo_cart_content");
											scroll_holder.stop().animate({
												scrollTop : scroll_holder.prop("scrollHeight") - scroll_holder.height()
											},"fast");
										}
									});
								dynamo.tip.ini("#dynamo_shop_cart_id-"+data.id+" .dynamo_right",{
									content : {
										text : '<div style="text-align:center;">Remove from '+dynamo.settings.shop_cart_name+'</div>'
									},
									position : {
										my : 'left center',
										at : 'right center'
									},
									style : {
										width : 80
									},
									hide : {
										fixed : true
									}
								});
								dynamo.shop.enter.interactive("#dynamo_shop_cart_id-"+data.id,data);
								dynamo.shop.enter.update();
							}
						};
					})(iD));
				}
				dynamo.shop.enter.interactive("#dynamo_shop_item_id-"+iD.id,iD);
				dynamo.shop.enter.update_cart_height();
			}
			dynamo.shop.box.add_spacing();
		},
		update_cart_height : function(){
			var cart_holder = $(".dynamo_cart_content .dynamo_shop_holder");
			if(cart_holder.size() > dynamo.shop.enter.data.per_page){
				$(".dynamo_cart_content").addClass("dynamo_overflow").css({"max-height":dynamo.shop.enter.max_height+"px","overflow":"auto"});
			} else {
				$(".dynamo_cart_content").removeClass("dynamo_overflow").css("max-height","none");
			}
		},
		interactive : function(selector,data){
			/* Add tooltip for image preview */
			dynamo.toolbox.preview_image(selector + " .dynamo_fader",data.img,data.watermark);
			/* Add tooltip for item description and info */
			var maximum = data.max_per_user == 0 ? 'unlimited' : dynamo.toolbox.format_number(data.max_per_user);
			var stock = data.stock == 0 ? 'Unlimited' : dynamo.toolbox.format_number(+data.stock - +data.purchased);
			dynamo.tip.ini(selector + " .dynamo_info",{
				content : {
					text : dynamo.shop.box.info([
						["Full Description",data.description],
						["In Stock",stock + ' ('+dynamo.toolbox.format_number(data.purchased)+' purchased)'],
						["Owned",dynamo.toolbox.format_number(data.owned)+' (Max: '+maximum+')']
					])
				}
			});
		},
		get_cart_money : function(){
			var cart_money = 0;
			$(".dynamo_content .dynamo_shop_cart .dynamo_quantity").each(function(){
				var quantity = +dynamo.toolbox.strip_number($(this).html());
				var price = +$(this).next().html();
				cart_money += price * quantity;
			});
			return cart_money;
		},
		checkout : function(){
			var items = {}, i=0;
			$(".dynamo_cart_content .dynamo_shop_holder").each(function(){
				var id = parseInt($(this).parent().attr("id").split("dynamo_shop_cart_id-")[1]);
				var quantity = $(this).find(".dynamo_quantity").html();
				items[i++] = [id,quantity];
			});
			if(i){
				$(".dynamo_cart_content").stop().show().slideFadeToggle("fast",function(){
					$(this).after('<div class="dynamo_shop_checkout_load">'+dynamo_options.loading.message+'</div>').empty().show();
					var params = {p:"shop",t:"enter_checkout",shop_zbid:dynamo.shop.enter.data.shop_zbid,price:dynamo.shop.enter.get_cart_money(),page:(+dynamo.shop.enter.data.page),i:items};
					dynamo.module.server_call(2,params);
				});
			} else {
				$(".dynamo_cart_empty").stop().show().slideFadeToggle("fast",function(){
					$(this).stop().hide().slideFadeToggle("fast");
				});
			}
		}
	},
	mine : {
		shop_name : dynamo.settings.shop_name,
		ini : function(){
			dynamo.shop.loading();
			dynamo.toolbox.load_task(["p=shop","t=control_panel","stage=1"]);
		},
		main : function(data){
			dynamo.toolbox.error_check(data);
			if(data.login && data.login == 1){
				dynamo.shop.mine.shop_name = data.name;
				dynamo.prompt.width(400,function(){
					$("#dynamo_shop_window .dynamo_header h2").html(data.name + ' - Control Panel');
					var edit_items = data.edit_items == 0 ? '<em>Edit Items</em> <a href="javascript:void(0);" class="edit_items help">[?]</a>' : '<a href="javascript:dynamo.shop.mine.edit.ini();">Edit Items</a>';
					var purchase = data.purchase == 0 ? '<em>View Purchases</em> <a href="javascript:void(0);" class="purchase_history help">[?]</a>' : '<a href="javascript:dynamo.shop.mine.purchase.ini();">View Purchases</a>';
					$("#dynamo_shop_window .dynamo_content tbody").html('<tr><td style="width:50%;"><a href="javascript:dynamo.shop.mine.settings.ini();">Settings</a></td><td><a href="javascript:dynamo.shop.mine.add.ini();">Add Items</a></td></tr><tr><td>'+edit_items+'</td><td>'+purchase+'</td></tr><tr><td colspan="2" class="c_foot"></td></tr>');
					var options = {
						style : {
							width : 150
						}
					};
					if(data.edit_items == 0){
						dynamo.prompt.tooltip(".edit_items",$.extend({},options,{
							content : {
								text : 'You do not have any items in your '+(dynamo.settings.shop_name).toLowerCase()+' to edit.'
							}
						}));
					}
					if(data.purchase == 0){
						dynamo.prompt.tooltip(".purchase_history",$.extend({},options,{
							content : {
								text : 'No one has purchased any of your items yet.'
							}
						}));
					}
				});
			}
		},
		settings : {
			ini : function(){
				dynamo.shop.loading();
				dynamo.toolbox.load_task(["p=shop","t=control_panel","stage=2"]);
			},
			page : function(data){
				data = data !== undefined && data !== null ? data : {
					login : 1,
					errors : []
				};
				dynamo.toolbox.error_check(data);
				if(data.login && data.login == 1){
					dynamo.shop.mine.shop_name = data.name;
					var title,button={};
					if("name" in data && "logo" in data){
						title = data.name + ' - Settings';
						button.text = 'Update ' + dynamo.settings.shop_name;
					} else {
						data.name = '';
						data.logo = '';
						title = 'Creating ' + dynamo.settings.shop_name;
						button.text = 'Create ' + dynamo.settings.shop_name;
					}
					dynamo.prompt.width(450,function(){
						$("#dynamo_shop_window .dynamo_content").html('<form id="dynamo_shop_settings" onsubmit="dynamo.shop.mine.settings.complete(event);"><table class="forums"><tbody><tr><td class="c_desc" style="width:50%;">Name:</td><td><input type="text" name="name" maxlength="32" value="'+data.name+'" required autofocus /></td></tr><tr><td class="c_desc" style="width:50%;">Description:</td><td><textarea name="description">'+data.description+'</textarea></td></tr><tr><td class="c_desc">Logo:<br /><small><em>Image URLs only.<br />Leave blank for no logo.</em></small></td><td><input type="url" maxlength="255" name="logo" value="'+data.logo+'" /><div style="padding-top:2px;"><input type="submit" name="submit" class="hide" /></div></td></tr><tr><td class="c_foot" colspan="2"></td></tr></tbody></table></form>');
						$("#dynamo_shop_window .dynamo_header h2").html(title);
						$("#dynamo_shop_window").find("input,textarea").bind('keyup blur',function(){
							$('div.qtip:visible').qtip('hide'); // close qtips
						});
						dynamo.toolbox.add_temp_button(button.text,function(){
							$("#dynamo_shop_settings").submit();
						});
						$("#dynamo_shop_window input").bind('keyup blur',function(){
							$('div.qtip:visible').qtip('hide'); // close qtips
						});
					});
				}
			},
			complete : function(e){
				e.returnValue = e.preventDefault && e.preventDefault() ? false : false;
				var name = $("#dynamo_shop_settings input[name=name]").val();
				var description = $("#dynamo_shop_settings textarea[name=description]").val();
				var logo = $("#dynamo_shop_settings input[name=logo]").val();
				
				var options = {
					show: {
						event: false,
						ready: true
					},
					hide: false,
					style: {
						classes: 'ui-tooltip-red', // Make it red... the classic error colour!
						width : 150
					}
				}
				
				var message = '', message_holder = '';
				
				if(!name.length || name.length > 32){
					message_holder = "input[name=name]";
					message = 'Please enter a <span class="dynamo_notify_important">name</span>.';
					$("#dynamo_shop_settings input[name=name]").val("").focus();
				} else if(description.length > 255){
					message_holder = "textarea[name=description]";
					message = 'The <span class="dynamo_notify_important">description</span> must be no longer than 255 characters in length.';
					$("#dynamo_shop_settings textarea[name=description]").val("").focus();
				} else if(logo.length > 255){
					message_holder = "input[name=logo]";
					message = 'The <span class="dynamo_notify_important">logo URL</span> must be no longer than 255 characters in length.';
					$("#dynamo_shop_settings input[name=logo]").val("").focus();
				}
				if(message.length){
					dynamo.prompt.tooltip(message_holder,$.extend({},options,{
						content : {
							text : message
						}
					}));
				} else {
					dynamo.shop.loading();
					dynamo.toolbox.load_task(["p=shop","t=settings","name="+name,"description="+description,"logo="+logo]);
				}
			}
		},
		add : {
			ini : function(data){
				data = data !== undefined && data !== null ? data : {
					login : 1,
					errors : []
				};
				dynamo.toolbox.error_check(data);
				if(data.login && data.login == 1){
					dynamo.shop.loading();
					dynamo.prompt.width(500,function(){
						
						var item = $.extend({},{
							id : '',
							name : '',
							description : '',
							price : '',
							stock : '',
							max_per_user : '',
							img : '',
							watermark : 0,
							preview : '',
							notify_me : 0,
							notify_them : ''
						},"item_info" in data ? data.item_info : {});
						
						item.preview = item.preview.length ? item.preview : item.img;
						item.watermark = item.watermark == 1 ? true : false;
						item.notify_me = item.notify_me == 1 ? true : false;
						
						$("#dynamo_shop_window .dynamo_content").html('<form id="dynamo_shop_add" onsubmit="dynamo.shop.mine.add.complete(event);"><table class="forums"><tbody><tr class="shop_page_1 shop_page"><th colspan="3">Item Information</th></tr><tr class="shop_page_1 shop_page"><td class="c_desc">Name:</td><td><input type="text" name="name" value="'+item.name+'" /></td></tr><tr class="shop_page_1 shop_page"><td class="c_desc">Description</td><td><textarea name="description" rows="5">'+item.description+'</textarea></td></tr><tr class="shop_page_1 shop_page"><td class="c_desc">Price:</td><td><input type="number" name="price" min="0" style="width:60px;" size="8" placeholder="'+dynamo.settings.money_sign+'" value="'+item.price+'" /></td></tr><tr class="shop_page_1 shop_page"><td class="c_desc">Stock <a href="javascript:void(0);" class="stock">[?]</a>:</td><td><input type="number" name="stock" min="0" style="width:60px;" size="8" placeholder="0" value="'+item.stock+'" /></td></tr><tr class="shop_page_1 shop_page"><td class="c_desc">Max Per User <a href="javascript:void(0);" class="max_per_user">[?]</a>:</td><td><input type="number" name="max_per_user" min="0" style="width:60px;" size="8" placeholder="0" value="'+item.max_per_user+'" /></td></tr><tr class="shop_page_2 shop_page"><th colspan="3">Image Details</th></tr><tr class="shop_page_2 shop_page"><td class="c_desc">Image URL <a href="javascript:void(0);" class="image_url">[?]</a>:</td><td><input type="url" name="image" value="'+item.img+'" /></td></tr><tr class="shop_page_2 shop_page"><td class="c_desc">Watermark Image <a href="javascript:void(0);" class="watermark">[?]</a>:</td><td><input type="checkbox" name="watermark" /></td></tr><tr class="shop_page_2 shop_page"><td class="c_desc">Preview Image URL <a href="javascript:void(0);" class="preview_url">[?]</a>:</td><td><input type="url" name="preview" value="'+item.preview+'" /></td></tr><tr class="shop_page_2 shop_page"><th colspan="3">Notifications</th></tr><tr class="shop_page_2 shop_page"><td class="c_desc">Notify me <a href="javascript:void(0);" class="notify_me">[?]</a>:</td><td><input type="checkbox" name="notify_me" /></td></tr><tr class="shop_page_2 shop_page"><td class="c_desc">Attachment <a href="javascript:void(0);" class="buyer_message">[?]</a>:</td><td><textarea name="buyer_message" rows="5">'+item.notify_them+'</textarea></td></tr><tr><td class="c_foot" colspan="3"><input type="hidden" name="id" value="'+item.id+'" /><input type="submit" name="submit" class="hide" /></td></tr></tbody></table></form>');
						$("#dynamo_shop_window .dynamo_header h2").html(dynamo.shop.mine.shop_name + ' - ' + ("item_info" in data ? 'Editing' : 'Adding') + ' Item');
						$("#dynamo_shop_window input[name=watermark]").attr("checked",item.watermark);
						$("#dynamo_shop_window input[name=notify_me]").attr("checked",item.notify_me);
						
						$("#dynamo_shop_window").find("input,textarea").eq(0).focus();
						
						$("#dynamo_shop_window").find("input,textarea").bind('keyup blur',function(){
							$('div.qtip:visible').qtip('hide'); // close qtips
						});
						
						dynamo.shop.mine.add.change_page(1,"item_info" in data ? 1 : 0)();
						
						var options = {
							style : {
								width : 150
							}
						};
						
						dynamo.prompt.tooltip(".max_per_user",$.extend({},options,{
							content : {
								text : 'Use <strong>0</strong> to allow users to buy as many as they like.'
							}
						}));
						dynamo.prompt.tooltip(".stock",$.extend({},options,{
							content : {
								text : 'Use <strong>0</strong> for an infinite stock (item will never run out).'
							}
						}));
						dynamo.prompt.tooltip(".image_url",$.extend({},options,{
							content : {
								text : 'Link to a full scale image of the item.'
							}
						}));
						dynamo.prompt.tooltip(".preview_url",$.extend({},options,{
							content : {
								text : 'Link to a preview image of the item. This will be scaled to 50x50 pixels.<br /><br />If left blank, the preview image will be the same as the full image but scaled.'
							}
						}));
						dynamo.prompt.tooltip(".watermark",$.extend({},options,{
							content : {
								text : 'Check this if you want the full image preview to be watermarked to help protect it against theft.'
							}
						}));
						dynamo.prompt.tooltip(".notify_me",$.extend({},options,{
							content : {
								text : 'Check this if you want to be notified when a user buys this item.'
							}
						}));
						dynamo.prompt.tooltip(".buyer_message",$.extend({},options,{
							content : {
								text : 'Message to give the user when they buy this item. They will only be notified once regardless of quantity bought.<br /><br />Leave blank for no message.'
							}
						}));	
					});
				};
			},
			complete : function(e){
				e.returnValue = e.preventDefault && e.preventDefault() ? false : false;
				var holder = $("#dynamo_shop_window");
				var name = holder.find("input[name=name]").val();
				var description = holder.find("textarea[name=description]").val();
				var price = (holder.find("input[name=price]").val() || 0) * 1;
				var stock = (holder.find("input[name=stock]").val() || 0) * 1;
				var max_per_user = (holder.find("input[name=max_per_user]").val() || 0) * 1;
				var image = holder.find("input[name=image]").val();
				var watermark = +holder.find("input[name=watermark]").is(":checked");
				var preview = holder.find("input[name=preview]").val();
					preview = preview == image ? '' : preview;
				var notify_me = +holder.find("input[name=notify_me]").is(":checked");
				var buyer_message = holder.find("textarea[name=buyer_message]").val();
				var id = holder.find("input[name=id]").val();
				
				var message = '', message_holder = '';
				
				var options = {
					show: {
						event: false,
						ready: true
					},
					hide: false,
					style: {
						classes: 'ui-tooltip-red', // Make it red... the classic error colour!
						width : 150
					}
				}
				
				if(!name.length || name.length > 32){
					dynamo.shop.mine.add.change_page(1)();
					holder.find("input[name=name]").val("").focus();
					message_holder = 'input[name=name]';
					message = !name.length ? 'Please enter a <span class="dynamo_notify_important">name</span>.' : 'Item <span class="dynamo_notify_important">name</span> must be no longer than 32 characters in length.';
				} else if(description.length && description.length > 200){
					dynamo.shop.mine.add.change_page(1)();
					holder.find("textarea[name=description]").focus();
					message_holder = 'textarea[name=description]';
					message = 'Item <span class="dynamo_notify_important">description</span> must be no longer than 200 characters in length.';
				} else if(!dynamo.toolbox.is_integer(price) || price < 0){
					dynamo.shop.mine.add.change_page(1)();
					holder.find("input[name=price]").val("").focus();
					message_holder = 'input[name=price]';
					message = 'Item <span class="dynamo_notify_important">price</span> must be an integer greater than or equal to 0.';
				} else if(!dynamo.toolbox.is_integer(stock) || stock < 0){
					dynamo.shop.mine.add.change_page(1)();
					holder.find("input[name=stock]").val("").focus();
					message_holder = 'input[name=stock]';
					message = 'Item <span class="dynamo_notify_important">stock</span> must be an integer greater than or equal to 0.';
				} else if(!dynamo.toolbox.is_integer(max_per_user) || max_per_user < 0){
					dynamo.shop.mine.add.change_page(1)();
					holder.find("input[name=max_per_user]").val("").focus();
					message_holder = 'input[name=max_per_user]';
					message = 'Item <span class="dynamo_notify_important">limit per user</span> must be an integer greater than or equal to 0.';
				} else if(!image.length || image.length > 75){
					dynamo.shop.mine.add.change_page(2)();
					holder.find("input[name=image]").val("").focus();
					message_holder = 'input[name=image]';
					message = !image.length ? 'Please enter an <span class="dynamo_notify_important">image URL</span>.' : '<span class="dynamo_notify_important">Image URL</span> must be no longer than 75 characters in length.';
				} else if(preview.length && preview.length > 75){
					dynamo.shop.mine.add.change_page(2)();
					holder.find("input[name=preview]").val("").focus();
					message_holder = 'input[name=preview]';
					message = !image.length ? 'Please enter an <span class="dynamo_notify_important">preview image URL</span>.' : '<span class="dynamo_notify_important">Preview image URL</span> must be no longer than 75 characters in length.';
				} else if(buyer_message.length && buyer_message.length > 200){
					dynamo.shop.mine.add.change_page(2)();
					holder.find("textarea[name=buyer_message]").focus();
					message_holder = 'textarea[name=buyer_message]';
					message = 'The <span class="dynamo_notify_important">buyer message</span> must be no longer than 200 characters in length.';
				}
				if(message.length){
					dynamo.prompt.tooltip(message_holder,$.extend({},options,{
						content : {
							text : message
						}
					}));
				} else {
					dynamo.shop.loading();
					dynamo.toolbox.load_task(["p=shop","t=add","stage=2","name="+name,"desc="+description,"price="+price,"stock="+stock,"max="+max_per_user,"image="+image,"watermark="+watermark,"preview="+preview,"notify="+notify_me,"msg="+buyer_message,"id="+id]);
				}
			},
			change_page : function(page,editing){
				return function(){
					$(".dynamo_temp_button").remove();
					if(page == 2){
						dynamo.toolbox.add_temp_button('Prev Page',dynamo.shop.mine.add.change_page(page-1,editing));
					}
					if(page == 1){
						dynamo.toolbox.add_temp_button('Next Page',dynamo.shop.mine.add.change_page(page+1,editing));
					}
					dynamo.toolbox.add_temp_button((editing == 1 ? 'Edit' : 'Add') + ' Item',function(){
						$("#dynamo_shop_add").submit();
					});
					$('div.qtip:visible').qtip('hide'); // close qtips
					$("#dynamo_shop_window").find(".shop_page").hide().end().find(".shop_page_"+page).show();
				};
			},
			success : function(data){
				dynamo.toolbox.error_check(data);
				if(data.login && data.login == 1){
					dynamo.prompt.width(400,function(){
						$("#dynamo_shop_window .dynamo_header h2").html(dynamo.shop.mine.shop_name + ' - Adding Item');
						$("#dynamo_shop_window .dynamo_content tbody").html('<tr><td>The item has' + (data.success == 1 ? ' ' : ' not ') + 'been added successfully.</td></tr><tr><td class="c_foot"></td></tr>');
					});
				};
			},
			from_edit : function(id){
				dynamo.shop.loading();
				dynamo.toolbox.load_task(["p=shop","t=edit","stage=2","id="+id]);
			}
		},
		edit : {
			ini : function(page){
				page = page !== undefined && page != null ? page : 1;
				dynamo.shop.loading();
				dynamo.toolbox.load_task(["p=shop","t=edit","stage=1","page="+page]);
			},
			show_page : function(data){
				dynamo.toolbox.error_check(data);
				if(data.login && data.login == 1){
					dynamo.prompt.width(400,function(){
						var iL = data.items.length, i;
						var container = $("#dynamo_shop_window .dynamo_content tbody");
						container.html('<tr><th>Items</th></tr><tr><td class="dynamo_items"></td></tr>').css("text-align","left");
						var item_container = container.find("td.dynamo_items");
						var stock, iD, right_container;
						for(i=0;i<iL;i++){
							iD = data.items[i];
							stock = iD.stock == 0 ? 'unlimited' : dynamo.toolbox.format_number((iD.stock-iD.purchased));
							item_container.append(dynamo.shop.box.ini({
								id : iD.id,
								right_text : 'Edit',
								preview : "preview" in iD ? iD.preview : iD.img,
								name : iD.name,
								description : iD.description
							}));
							dynamo.toolbox.preview_image("#dynamo_shop_item_id-"+iD.id+" .dynamo_fader",iD.img,iD.watermark);
							dynamo.prompt.tooltip("#dynamo_shop_item_id-"+iD.id+" .dynamo_info",{
								content : {
									text : dynamo.shop.box.info([
										["Full Description",iD.description],
										["In Stock",stock],
										["Purchased",dynamo.toolbox.format_number(iD.purchased)]
									])
								}
							});
							right_container = "#dynamo_shop_item_id-"+iD.id+" .dynamo_right";
							$(right_container).bind('click',(function(id){
								return function(){
									dynamo.shop.mine.add.from_edit(id);
								};
							})(iD.id));
							dynamo.prompt.tooltip(right_container,{
								content : {
									text : '<div style="text-align:center;"><a href="javascript:dynamo.shop.mine.edit.remove.ini('+iD.id+');">Delete</a></div>'
								},
								position : {
									my : 'center',
									at : 'center',
									adjust : {
										x : 80
									}
								},
								style : {
									width : 80
								},
								hide : {
									fixed : true,
									delay : 200
								}
							});
						}
						dynamo.shop.box.add_spacing();
						var page = data.page;
						var total_pages = data.total_pages;
						var cur_page = '<span class="dynamo_shop_current_page">'+page+'</span>/' + total_pages;
						container.append('<tr><td class="c_foot"> </td></tr>');
						$("#dynamo_shop_window .dynamo_header h2").html(dynamo.shop.mine.shop_name + ' - Editing Items - Page ' + cur_page);
						if(page > 1){
							dynamo.toolbox.add_temp_button("Previous Page",function(){
								dynamo.shop.mine.edit.ini(page-1);
							});
						}
						if(page < total_pages){
							dynamo.toolbox.add_temp_button("Next Page",function(){
								dynamo.shop.mine.edit.ini(page+1);
							});
						}
					});
				}
			},
			success : function(data){
				dynamo.toolbox.error_check(data);
				if(data.login && data.login == 1){
					dynamo.prompt.width(400,function(){
						$("#dynamo_shop_window .dynamo_header h2").html(dynamo.shop.mine.shop_name + ' - Editing Item');
						$("#dynamo_shop_window .dynamo_content tbody").html('<tr><td>The item has' + (data.success == 1 ? ' ' : ' not ') + 'been edited successfully.</td></tr><tr><td class="c_foot"></td></tr>');
					});
				};
			},
			remove : {
				ini : function(id){
					var notify_id = dynamo.tip.notify.ini(['<div class="dynamo_shop_remove_item dynamo_shop_remove_item_'+id+'">Are you sure you want to delete this item?<br />[<a href="javascript:dynamo.shop.mine.edit.remove.complete('+id+');">Yes</a>] [<a href="javascript:dynamo.shop.mine.edit.remove.mistake('+id+');">No</a>]</div>','Delete Item?']);
					$("#ui-tooltip-dynamo-notify-"+notify_id+" a").bind('click',(function(id){
						return function(){
							$("#ui-tooltip-dynamo-notify-"+id).qtip('hide');
						};
					})(notify_id));
				},
				mistake : function(id){
					$(".dynamo_shop_remove_item_"+id).closest(".jGrowl-notification").children(".jGrowl-close:first").click();
				},
				complete : function(id){
					dynamo.shop.mine.edit.remove.mistake(id);
					dynamo.shop.loading();
					var page = $(".dynamo_shop_current_page").html();
					dynamo.toolbox.load_task(["p=shop","t=delete","page="+page,"id="+id,"stage=1"]);
				}
			}
		},
		purchase : {
			ini : function(page){
				page = page !== undefined && page != null ? page : 1;
				dynamo.shop.loading();
				dynamo.toolbox.load_task(["p=shop","t=purchase","stage=1","page="+page]);
			},
			show_page : function(data){
				dynamo.toolbox.error_check(data);
				if(data.login && data.login == 1){
					dynamo.prompt.width(550,function(){
						var pL = data.purchases.length, p;
						var content = '<tr><th>Buyer</th><th>Items Bought</th><th>Total Price</th><th>Time</th></tr>';
						for(p=0;p<pL;p++){
							content += '<tr><td><a href="'+main_url+'profile/'+data.purchases[p].zbid+'">'+data.purchases[p].username+'</a></td><td><a href="javascript:dynamo.shop.mine.purchase.specific.ini('+data.purchases[p].time+','+data.purchases[p].zbid+');">'+dynamo.toolbox.format_number(data.purchases[p].quantity)+'</a></td><td>'+dynamo.settings.money_sign+dynamo.toolbox.format_number(data.purchases[p].price)+'</td><td>'+dynamo.toolbox.time_string(data.purchases[p].time)+'</td></tr>';
						}
						var page = data.page;
						var total_pages = data.total_pages;
						var cur_page = '<span class="dynamo_shop_current_page">'+page+'</span>/' + total_pages;
						content += '<tr><td class="c_foot" colspan="4"> </td></tr>';
						$("#dynamo_shop_window .dynamo_content tbody").html(content).css("text-align","left");
						$("#dynamo_shop_window .dynamo_header h2").html(dynamo.shop.mine.shop_name + ' - Viewing Purchases - Page ' + cur_page);
						if(page > 1){
							dynamo.toolbox.add_temp_button("Previous Page",function(){
								dynamo.shop.mine.purchase.ini((+page)-1);
							});
						}
						if(page < total_pages){
							dynamo.toolbox.add_temp_button("Next Page",function(){
								dynamo.shop.mine.purchase.ini((+page)+1);
							});
						}
					});
				}
			},
			specific : {
				ini : function(time,zbid){
					var page = $(".dynamo_shop_current_page").html();
					dynamo.shop.loading();
					dynamo.toolbox.load_task(["p=shop","t=purchase","stage=2","page="+page,"bought="+time,"buyer_zbid="+zbid]);
				},
				show : function(data){
					dynamo.toolbox.error_check(data);
					if(data.login && data.login == 1){
						dynamo.prompt.width(400,function(){
							var pL = data.purchases.length, p;
							var container = $("#dynamo_shop_window .dynamo_content tbody")
							container.html('<tr><th>Items</th></tr><tr><td class="dynamo_items"></td></tr>').css("text-align","left");
							var item_container = container.find("td.dynamo_items");
							for(p=0;p<pL;p++){
								pD = data.purchases[p];
								item_container.append(dynamo.shop.box.ini({
									id : pD.id,
									right_text : 'x' + dynamo.toolbox.format_number(pD.quantity),
									preview : "preview" in pD ? pD.preview : pD.img,
									name : '<a href="javascript:dynamo.shop.mine.add.from_edit('+pD.id+');">'+pD.name+'</a>',
									description : pD.description
								}));
								dynamo.toolbox.preview_image("#dynamo_shop_item_id-"+pD.id+" .dynamo_fader",pD.img,pD.watermark);
								dynamo.prompt.tooltip("#dynamo_shop_item_id-"+pD.id+" .dynamo_info",{
									content : {
										text : dynamo.shop.box.info([
											["Individual Price",dynamo.settings.money_sign+dynamo.toolbox.format_number(pD.price)],
											["Quantity Bought",dynamo.toolbox.format_number(pD.quantity)],
											["Total Price",dynamo.settings.money_sign+dynamo.toolbox.format_number(pD.total_price)]
										])
									}
								});
							}
							$(".dynamo_right").css("cursor","auto");
							dynamo.shop.box.add_spacing();
							container.append('<tr><td class="c_foot"> </td></tr>');
							$("#dynamo_shop_window .dynamo_header h2").html(dynamo.shop.mine.shop_name + ' - Viewing Purchase');
							dynamo.toolbox.add_temp_button("Back",function(){
								dynamo.shop.loading();
								dynamo.shop.mine.purchase.ini(data.page);
							});
						});
					}
				}
			}
		}
	},
	members : {
		default_logo : 'http://z5.ifrm.com/30052/123/0/f5129527/blank.gif',
		ini : function(page,order_by,order_type){
			page = page !== undefined && page !== null ? page : 1;
			order_by = order_by !== undefined && order_by !== null ? order_by : 1;
			order_type = order_type !== undefined && order_type !== null ? order_type : 1;
			dynamo.shop.loading();
			dynamo.toolbox.load_task(["p=shop","t=members","page="+page,"order_by="+order_by,"order_type="+order_type]);
		},
		show_page : function(data){
			console.log(data);
			if(data.login && data.login == 1){
				var page = data.page;
				var total_pages = data.total_pages;
				var cur_page = page + '/' + total_pages;
				dynamo.tip.prompt.content(function(){
					var sL = data.shops.length, s, right_text, order_by_name;
					switch(+data.order_by){
						case 1: order_by_name = 'Rating'; break;
						case 2: order_by_name = 'Last Updated'; break;
						case 3: order_by_name = 'No. of Items'; break;
						case 4: order_by_name = 'Average Price'; break;
						case 5: order_by_name = 'Sales Made'; break;
						case 6: order_by_name = 'Unique Buyers'; break;
						default: order_by_name = 'Rating'; break;
					}
					var prev_page = page > 1 ? '<td rowspan="5" class="dynamo_prev_page"><</td>' : '';
					var next_page = page < total_pages ? '<td rowspan="5" class="dynamo_next_page">></td>' : '';
					$(".dynamo_content").html('<table><tr><th colspan="2" style="text-align:right;">'+order_by_name+'</th></tr><tr><td class="dynamo_shops" colspan="2"></td></tr></table>').css("text-align","left");
					item_container = $(".dynamo_content").find(".dynamo_shops");
					for(s=0;s<sL;s++){
						var sD = data.shops[s];
						sD.id = sD.zbid;
						switch(+data.order_by){
							case 1: right_text = sD.rating + '/100'; break;
							case 2: right_text = dynamo.toolbox.time_string(sD.last_updated); break;
							case 3: right_text = dynamo.toolbox.format_number(sD.items); break;
							case 4: right_text = dynamo.settings.money_sign+dynamo.toolbox.format_number(sD.average_price); break;
							case 5: right_text = dynamo.toolbox.format_number(sD.purchased); break;
							case 6: right_text = dynamo.toolbox.format_number(sD.unique_buyers); break;
							default: right_text = sD.rating + '/100'; break;
						}
						item_container.append(dynamo.shop.box.ini({
							id : sD.id,
							preview : "logo" in sD ? sD.logo : dynamo.shop.members.default_logo,
							name : '<a href="javascript:dynamo.shop.enter.access(1,'+sD.id+');">'+sD.name+'</a>',
							description : sD.shop_desc,
							right_text : right_text
						}));
						if("logo" in sD){
							dynamo.toolbox.preview_image("#dynamo_shop_item_id-"+sD.id+" .dynamo_fader",sD.logo,0);
						}
						dynamo.tip.ini("#dynamo_shop_item_id-"+sD.id+" .dynamo_info",{
							content : {
								text : dynamo.shop.box.info([
									["Owner",'<a href="'+main_url+'profile/'+sD.zbid+'">'+sD.username+'</a>'],
									["Full Description",sD.shop_desc],
									["Rating",sD.rating+'/100'],
									["Last Updated",dynamo.toolbox.time_string(sD.last_updated)],
									["No. of Items",dynamo.toolbox.format_number(sD.items)],
									["Average Price",dynamo.settings.money_sign+dynamo.toolbox.format_number(sD.average_price)],
									["Purchases Made",dynamo.toolbox.format_number(sD.purchased)],
									["Unique Buyers",dynamo.toolbox.format_number(sD.unique_buyers)]
								])
							},
							hide : {
								fixed : true,
								delay : 200
							},
							position : {
								my : 'right center',
								at : 'left center'
							}
						});
						$("#dynamo_shop_item_id-"+sD.id+" .dynamo_right").css("font-size",(data.order_by==2?80:100)+"%").bind('click',(function(shop_id){
							return function(){
								dynamo.shop.enter.access(1,shop_id);
							};
						})(sD.id));;	
					}
					dynamo.shop.box.add_spacing();
					$(".dynamo_content table:first").append('<tr><th colspan="2">Sorting Options</th></tr><tr><td class="c_desc" style="width:35%;">Sort By: </td><td><select name="order_by"><option value="1" selected="selected">Rating</option><option value="2">Last Updated</option><option value="3">Number of Items</option><option value="4">Average Price</option><option value="5">Sales Made</option><option value="6">Unique Buyers</option></select> <select name="order_type"><option value="1" selected="selected">Descending</option><option value="2">Ascending</option></select></td></tr><tr><td class="c_foot" colspan="2"></td></tr>');
					$(".dynamo_content select[name=order_by]").val(data.order_by);
					$(".dynamo_content select[name=order_type]").val(data.order_type);
					$(".dynamo_content select").change(function(){
						var order_by = $(".dynamo_content select[name=order_by] option:selected").val();
						var order_type = $(".dynamo_content select[name=order_type] option:selected").val();
						var page = $(".dynamo_shop_current_page").text();
						dynamo.shop.members.ini(page,order_by,order_type);
					});
					$(".dynamo_content table:first tr:first").prepend(prev_page).append(next_page);
					$(".dynamo_prev_page").bind("click",{page:(+page)-1},function(e){
						dynamo.tip.prompt.load('',{
							p : "shop",
							t : "members",
							page : e.data.page
						});
					});
					$(".dynamo_next_page").bind("click",{page:(+page)+1},function(e){
						dynamo.tip.prompt.load('',{
							p : "shop",
							t : "members",
							page : e.data.page
						});
					});
				},'Member\'s ' + dynamo.toolbox.plural(dynamo.settings.shop_name) + ' - Page ' + cur_page);
			}
		}
	},
	inventory : {
		ini : function(zbid,page){
			zbid = zbid !== undefined && zbid !== null ? zbid : dynamo.toolbox.get_zbid();
			page = page !== undefined && page !== null ? page : 1;
			dynamo.shop.loading();
			dynamo.toolbox.load_task(["p=shop","t=inventory","stage=1","i_zbid="+zbid,"page="+page]);
		},
		show_page : function(data){
			dynamo.toolbox.error_check(data);
			if(data.login && data.login == 1){
				dynamo.prompt.width(400,function(){
					var iL = data.items.length, i;
					var container = $("#dynamo_shop_window .dynamo_content tbody");
					container.html('<tr><th>Items</th></tr><tr><td class="dynamo_items"></tr>').css("text-align","left");
					var item_container = container.find(".dynamo_items");
					var my_inventory = dynamo.toolbox.get_zbid() == data.i_zbid;
					var cur_page = '1/1';
					if(iL){
						for(i=0;i<iL;i++){
							var iD = data.items[i];
							//content += '<tr><td><img src="'+iD.preview+'" width="50" height="50" alt="" /></td><td>'+iD.name+'</td><td>Seller</td><td>'+iD.quantity+'</td><td>Note...</td></tr>';
							item_container.append(dynamo.shop.box.ini({
								id : iD.id,
								right_text : my_inventory ? 'Open' : '',
								preview : "preview" in iD ? iD.preview : iD.img,
								name : iD.name,
								description : iD.description
							}));
							dynamo.toolbox.preview_image("#dynamo_shop_item_id-"+iD.id+" .dynamo_fader",iD.img,iD.watermark);
							dynamo.prompt.tooltip("#dynamo_shop_item_id-"+iD.id+" .dynamo_info",{
								content : {
									text : dynamo.shop.box.info([
										["Seller","seller" in iD ? '<a href="'+main_url+'profile/'+iD.seller+'">'+iD.username+'</a>' : iD.username],
										["Quantity",dynamo.toolbox.format_number(iD.quantity)],
										["Purchased",dynamo.toolbox.time_string(iD.bought)]
									])
								},
								hide : {
									fixed : true,
									delay : 200
								}
							});
							$("#dynamo_shop_item_id-"+iD.id+" .dynamo_right").bind('click',(function(id){
								return function(){
									dynamo.shop.inventory.specific.ini(id);
								}
							})(iD.id));
						}
						dynamo.shop.box.add_spacing();
						var page = data.page;
						var total_pages = data.total_pages;
						var cur_page = '<span class="dynamo_shop_current_page">'+page+'</span>/' + total_pages;
						if(page > 1){
							dynamo.toolbox.add_temp_button("Previous Page",function(){
								dynamo.shop.inventory.ini(page-1,data.i_zbid);
							});
						}
						if(page < total_pages){
							dynamo.toolbox.add_temp_button("Next Page",function(){
								dynamo.shop.inventory.ini(page+1,data.i_zbid);
							});
						}
					} else {
						var user = my_inventory ? 'You' : data.i_username;
						item_container.append(user + ' ha'+(my_inventory?'ve':'s')+' not purchased any items yet.');
					}
					container.append('<tr><td class="c_foot"></td></tr>');
					$("#dynamo_shop_window .dynamo_header h2").html((my_inventory ? 'My ' : dynamo.toolbox.possession(data.i_username) + ' ') + dynamo.settings.shop_inventory_name + ' - Page ' + cur_page);
				});
			}
		},
		specific : {
			ini : function(id){
				var page = $(".dynamo_shop_current_page").text();
				dynamo.shop.loading();
				dynamo.toolbox.load_task(["p=shop","t=inventory","stage=2","page="+page,"iid="+id]);
			},
			show : function(data){
				dynamo.toolbox.error_check(data);
				if(data.login && data.login == 1){
					dynamo.prompt.width(400,function(){
						var message = data.message.length ? data.message : 'This item does not have any attachments.';
						$("#dynamo_shop_window .dynamo_header h2").html('My ' + dynamo.settings.shop_inventory_name + ' - ' + data.name);
						$("#dynamo_shop_window .dynamo_content tbody").html('<tr><th>Attachments</th></tr><tr><td>'+message+'</td></tr><tr><td class="c_foot"></td></tr>').css("text-align","left");
						dynamo.toolbox.add_temp_button("Back",function(){
							dynamo.shop.loading();
							dynamo.shop.inventory.ini(dynamo.toolbox.get_zbid(),data.page);
						});
					});
				}
			}
		}
	}
};