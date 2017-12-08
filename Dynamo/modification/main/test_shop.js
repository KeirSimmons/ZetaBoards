$("body").on("dynamo_loaded", function() {

	// Simple semi-automatic shop by Viral of http://viralsmods.com
	// You must be using ZetaBoards Dynamo for this to work http://dynamo.viralsmods.com
	
	var options = {
		preview_image : {
			_default : '', // image to show when none is given (leave blank for N/A)
			width : '50px',
			height : '50px'
		},
		message : "I have purchased an item from your shop (item ID: %ITEMID%)." // %ITEMID% gets replaced with the item's id
	};
	
	var items = [];
	
	items[items.length] = {
		id : 1,
		seller : [1, "username"],
		preview_image : '',
		name : "Item name",
		desc : "Item description",
		price : 200
	};
	
	/* END OF EDITS */
	
	if("currency" in dynamo.server.modules) {
	
		var symbol = dynamo.server.modules.currency.settings.symbol;

		window.buyItem = function(itemID, userID, price) {
			var formatted_price = dynamo.toolbox.format_number(price);
			var confirmation = confirm("Are you sure you want to purchase this item for " + symbol + formatted_price + "?");
			if(confirmation) {
				dynamo.module.load("currency", function() {
					dynamo.tip.prompt.ini({
						m : "currency",
						p1 : "donate",
						c : "finish",
						zbids : [userID],
						info : {
							user : userID,
							message : options.message.replace(/%ITEMID%/gi, itemID),
							amount : price
						}
					});
				});
			}
		};
		
		var rows = [{
			cells : [
				{
					content : 'Preview',
					type : 'th',
					style : {
						width : options.preview_image.width
					}
				},
				{
					content : 'Seller',
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
					content : 'Buy Item',
					type : 'th'
				}
			]
		}], i, item, preview;
		
		for(i in items) {
			item = items[i];
			formatted_price = dynamo.toolbox.format_number(item.price);
			preview = item.preview_image.length ? item.preview_image : options.preview_image._default;
			preview = preview.length
				? '<img src="' + preview + '" alt="' + item.name + '" width="' + options.preview_image.width + '" height="' + options.preview_image.height + '" />'
				: 'N/A';
			rows[rows.length] = {
				cells : [
					{
						content : preview,
						style : {
							align : 'center'
						}
					},
					{content : '<a href="' + main_url + 'profile/' + item.seller[0] + '">' + item.seller[1] + '</a>'},
					{content : item.name},
					{content : item.desc},
					{content : symbol + formatted_price},
					{content : '<a href="javascript:buyItem(' + item.id + ', ' + item.seller[0] + ', ' + item.price + ');">Buy</a>'}
				]
			};
		}
		
		dynamo.table.create("#main .site_wrapper", {
			colspan : 6,
			rows : rows
		});
	
	} else {
		$("#main .site_wrapper").html('The shop cannot be loaded as the currency system has not been installed.');
	}
	
});