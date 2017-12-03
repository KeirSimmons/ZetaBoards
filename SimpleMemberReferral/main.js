/*
Open-source, free to use. Find more modifications at https://github.com/KeirSimmons/ZetaBoards
Modification: Simple Member Referral
*/

var referral = {
  field : { // information regarding the referral registration field
		title : "Referred By", // title
		desc : "Username of the member that referred you", // small description (can be blank)
	},
	pm_info : { // information regarding the PM which will be sent when a new user registers and fills in the referral field
		username : "Admin username here", // username of the person you want to send the message to
		title : "I've been referred by %REFERRER%", // title of the PM. Use %REFERRER% to place the referrer's name
		message : "[b]%REFERRER%[/b] referred me to this forum!" // PM message. Use %REFERRER% to place the referrer's name. BB Code allowed.
	},
	/* END OF EDITS */
	checking : {
		can_register : true,
		query : false
	},
	get_username : function() {
		return $("#top_info a[href*=/profile/]").text();
	},
	ini : function() {
		if($.zb.logged_in) {
			var username = this.get_username();
			var my_referrer = $.zb.get("referrer_" + username);
			if(my_referrer.length) {
				this.send_pm(my_referrer);
			}
		} else if($("table.register").size() && new RegExp("^" + main_url + "register/").test(location.href)) {
      // if on the registration page
			var holder = $("table.register tr:contains(Optional Information)");
			var colspan = +holder.next().find("td:eq(1)").attr("colspan"); // get colspan - don't assume constant val

      // Add the new field
			holder.after('<tr><td class="c_desc">' + this.field.title + '<small>' + this.field.desc + '</small></td><td colspan="' + colspan + '"><input type="text" name="referrer" id="referrer" /></td></tr>');
			$("#referrer").bind("propertychange keyup input paste", function() {
        // Check if the input username belongs to a real member
				clearTimeout(referral.checking.query);
				referral.checking.query = window.setTimeout((function(that) {
					return function() {
						var username = that.val();
						$("#referral_response").remove();
						that.after('<span id="referral_response">Checking username...</span>');
						if(username.length) {
							$.getJSON(main_url + "tasks/?name=" + username + "&mode=1&task=7", function(d){
								$("#referral_response").text(d.lang);
								if(d.ok) { // member found
									$("#referrer").closest("tr").removeClass("referral_fail").addClass("referral_success");
									referral.checking.can_register = true;
								} else {
									$("#referrer").closest("tr").addClass("referral_fail").removeClass("referral_success");
									referral.checking.can_register = false;
								}
							});
						} else {
							referral.checking.can_register = true;
						}
					};
				})($(this)), 1000);
			});
			$("table.register").closest("form").submit(function(e) {
				if(!referral.checking.can_register) {
					e.preventDefault();
					$("#referrer").focus();
				} else {
          // When completing the registration form, set a cookie so that on the next page load (when user is a full member) the PM will be sent to the admin
					$.zb.set("referrer_" + $("table.register input[name=name]").val(), $("#referrer").val());
				}
			});
		}
	},
	send_pm : function(referrer) {
    // Send PM to admin - of course this will only work if the user has PM priviledges
		var options = this.pm_info;
		options.title = options.title.replace(/%REFERRER%/g, referrer);
		options.message = options.message.replace(/%REFERRER%/g, referrer);
		$.get(main_url + "msg/?c=2&force_ads", function(d){
			var form = $(d).find("form[name=posting]");
			form.find("input[name=name]").val(options.username);
			form.find("input[name=title]").val("title" in options ? options.title : "No Title");
			form.find("#c_post-text").val("message" in options ? options.message : "No message.");
			var data = form.serializeArray();
			$.post(main_url + "msg/?c=3&sd=1&force_ads", data, function() {
				$.zb.del("referrer_" + referral.get_username()); // delete cookie so no more pms are sent
			});
		});
	}
}

referral.ini();
