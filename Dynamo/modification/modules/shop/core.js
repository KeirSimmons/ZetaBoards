dynamo.shop = {
	version : 1,
	settings : dynamo.server.modules.shop.settings,
	__construct : function() {
		// construct
	},
	view : {
		ini : function(data) {
			var info = data.info;
			var page = info.page;
			var total_pages = info.total_pages;
			var cur_page = page + '/' + total_pages;
			var prev_page = $("<button>").attr("type", "submit").css("width", "80px").html("<").css("opacity", 0.5).addClass("dynamo_prev_page");
			var next_page = $("<button>").attr("type", "submit").css("width", "80px").html(">").css("opacity", 0.5).addClass("dynamo_next_page");
			
			dynamo.tip.prompt.content(function() {
				$(".dynamo_content").empty().append('<div></div><br /><div style="text-align:center;" class="dynamo_pages_holder"></div>');
				
				var rows = [
					{
						cells : [{
							colspan : 6,
							content : 'Add another item',
							style : {
								align : 'center'
							}
						}]
					},
					{
						cells : [
							{
								content : 'Image',
								type : 'th'
							},
							{
								content : 'Name',
								type : 'th'
							},
							{
								content : 'Description',
								type : 'th'
							},
							{
								content : 'Price',
								type : 'th'
							},
							{
								content : 'Stock',
								type : 'th'
							},
							{
								content : 'Purchased',
								type : 'th'
							}
						]
					}
				];
				
				var items = info.items, i, item;
				if(items.length) {
					for(i in items) {
						item = items[i];
						rows[rows.length] = {cells : [
							{
								content : item.preview.length ? '<img src="' + item.preview + '" alt="' + item.name + ' Preview Image" class="dynamo_shop_preview" />' : '',
								style : {
									align : 'center'
								},
								desc : '<img src="' + item.preview + '" alt="' + item.name + ' Preview Image" class="dynamo_shop_full_preview" />',
								tip : {
									position : {
										my : 'center',
										at : 'center'
									},
									show : 'click',
									hide : 'click',
									underline : false,
									events : {
										visible : function() {
											$(this).qtip("api").updateWidth("500px");
										}
									}
								}
							},
							{content : item.name},
							{content : item.description},
							{content : item.price},
							{content : item.stock},
							{content : item.purchased}
						]};
					}
				} else {
					rows[rows.length] = {cells : [{
						colspan : 6,
						content : 'No items!'
					}]};
				}
				
				dynamo.table.create(".dynamo_content div:first", {
					colspan : 6,
					rows : rows
				});
				
				$(".dynamo_pages_holder").append(prev_page).append(' ').append(next_page);
				$(".dynamo_content em").css("opacity",0.5);
				
				if(page > 1){
					$(".dynamo_prev_page").bind("click", function(e) {
						dynamo.tip.prompt.load({
							m : "shop",
							p1 : "mine",
							c : "view",
							info : {
								page : page - 1
							}
						});
					}).css("opacity", 1);
				}
				
				if(page < total_pages){
					$(".dynamo_next_page").bind("click", function(e) {
						dynamo.tip.prompt.load({
							m : "shop",
							p1 : "mine",
							c : "view",
							info : {
								page : page + 1
							}
						});
					}).css("opacity", 1);
				}
			}, dynamo.server.modules.shop.name + " - My " + dynamo.shop.settings.name + " - Page " + cur_page, 800);
		}
	}
};