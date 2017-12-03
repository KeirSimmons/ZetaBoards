/*
Open-source, free to use. Find more modifications at https://github.com/KeirSimmons/ZetaBoards
Modification: Delete All Shouts
*/

var shout_del = {
	ini : function() {
    // If on the Shoutbox Archive page, show a link to delete all shouts
		if(location.href.match(/\/stats\/shout_archive\/?/i) && $("#menu_rcp").size()){
			$("#sbx_archive tr:last").after('<tr><th id="del_link" style="text-align:center;" colspan="2"><a href="javascript:shout_del.check(1);">Delete All</a></th></tr>');
		}
	},
	check : function(step) {
		switch(step){
			case 1: // Confirm desire to delete shouts
				$("#del_link").html('Delete All Shouts? &middot; <a href="javascript:shout_del.check(2);">Yes</a> &middot; <a href="javascript:shout_del.check(3);">No</a>');
				break;
			case 2: // Stop confirmation links from step 1 from doing anything, remove the confirmation box and then begin deletion
				$("#del_link").html('Delete All Shouts? &middot; <a href="javascript:void(0);">Yes</a> &middot; <a href="javascript:void(0);">No</a>').slideToggle("fast",function(){$(this).remove();});
				shout_del.load_page();
				break;
			case 3: // Decided to cancel the deletion, so hide confirmation box and do not proceed
				$("#del_link").parent().remove();
				shout_del.ini();
		}
	},
	load_page : function() { // Time to delete the shouts
		$.get(main_url+"stats/shout_archive/", function(d) { // Load shout archive page in the background and click the deletion button on each
			pages = $("ul.cat-pages:first li",d).not(".cat-pageshead").size();
			rows = $("#sbx_archive tbody tr",d);
			shout_del.del(rows); // Delete these shouts
			if(pages != 0){ // Once these shouts have been deleted, reloading the shout archive will show more shouts to delete, so continue
				shout_del.load_page();
			} else { // No more shouts to delete, so give a completion message
				$("#sbx_archive").html('<tbody><tr><td style="text-align:center;">All shouts have been deleted</td></tr></tbody>');
				$("ul.cat-pages").slideToggle("fast", function(){
          $(this).remove();
        });
			}
		});
	},
	del : function(rows){ // For each shout, click the [x] link (which will delete it)
		rows.each(function(){
			$(this).find("td:last a").click();
		});
	}
}
shout_del.ini();
