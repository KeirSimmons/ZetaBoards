dynamo.acp = {
	version : 11,
	__construct : function() {
		dynamo.tip.preloaded.add_msg([
			["acp-modules-1", {type : 5, message : 'The module has been %DATA[prefix]%installed successfuly. Please <a href="javascript:location.reload();">reload</a> the page for the changes to take effect.'}],
			["acp-modules-2", {type : 5, message : 'The module could not be %DATA[prefix]%installed. Please try again later.'}],
			["acp-modules-3", {type : 5, message : 'This module has already been %DATA[prefix]%installed!'}],
			["acp-modules-4", {type : 5, message : 'The module you are trying to %DATA[prefix]%install does not exist, or you do not have permission to %DATA[prefix]%install it.'}],
			["acp-modules-5", {type : 5, message : 'You cannot uninstall this module as it has not been installed!'}],
			["acp-groups-1", {type : 5, message : "The groups were updated successfully."}],
			["acp-groups-2", {type : 5, message : "The group's 'dynamo admin' status was changed successfully."}],
			["acp-groups-3", {type : 5, message : "The group's 'dynamo admin' status was not changed successfully. Please try again later."}], // affected_rows = 0 (either tried to change status to same status or modify status of a root admin group)
			["acp-groups-4", {type : 5, message : "The group's 'dynamo admin' status was not changed successfully. Please try again later."}], // new_access was not 0 or 1
			["acp-groups-5", {type : 5, message : "The group's 'dynamo admin' status was not changed successfully. Please try again later."}], // not enough params passed (id, new_access)
			["acp-domains-2", {type : 5, message : "Please make sure you input a valid domain name, such as <em>" + main_url + "</em> or <em>http://s1.zetaboards.com/viralsmods/</em>."}],
			["acp-domains-3", {type : 5, message : "You have already added this domain."}],
			["acp-domains-5", {type : 5, message : "That domain has been added by another forum using Dynamo and cannot be associated with your account."}],
			["acp-domains-6", {type : 5, message : "The domain has been added successfully."}],
			["acp-domains-8", {type : 5, message : "You did not change the domain name."}],
			["acp-domains-9", {type : 5, message : "You can only add multiple custom domains, not ZetaBoards domains."}],
			["acp-domains-10", {type : 5, message : "You cannot remove your ZetaBoards domain."}],
			["acp-domains-11", {type : 5, message : "There was an error when trying to update the domain. Please try again later."}], // old_domain could not be found...
			["acp-domains-12", {type : 5, message : "The domain was updated successfully."}],
			["acp-domains-13", {type : 5, message : "There was an error when trying to remove the domain. Please try again later."}], // domain could not be found....
			["acp-domains-14", {type : 5, message : "The domain was removed successfully."}],
			["acp-domains-15", {type : 5, message : "You cannot remove the domain that you are using to access the page."}],
			["acp-domains-16", {type : 5, message : "You cannot edit the domain that you are using to access the page."}],
			["acp-users-refresh-2", {type : 5, message : "There are no user accounts which need refreshing at the moment. Please check back regularly."}],
			["acp-ad-mine-1", {type : 5, message : "You can only use a URL which links to a page on this forum."}],
			["acp-ad-mine-2", {type : 5, message : "Your board advert has been updated successfully."}]
		]);
	},
	settings : dynamo.server.modules.acp,
	overview : function(data){
		dynamo.tip.prompt.content(function(){
			dynamo.table.create(".dynamo_content", {
				rows : [
					{
						cells : [
							{
								content : 'Account type:',
								style : {
									classes : 'c_desc',
									width : '50%'
								}
							},
							{
								content : (data.info.premium.on ? "Premium" : "Basic [<a href=\"http://dynamo.viralsmods.com/extras.php\" target=\"_blank\">UPGRADE</a>]"),
								desc : data.info.premium.on ? "Ends in " + dynamo.toolbox.time_string(data.info.premium.end) : ""
							}
						]
					},
					{
						cells : [
							{
								content : 'Ad Removal:',
								style : {
									classes : 'c_desc'
								}
							},
							{
								content : (data.info.ad_removal.on ? "Yes" : "No [<a href=\"http://dynamo.viralsmods.com/extras.php\" target=\"_blank\">PURCHASE</a>]"),
								desc : data.info.ad_removal.on ? "Credits remaining: " + data.info.ad_removal.credits : ""
							}
						]
					},
					{
						cells : [
							{
								content : 'Modules installed:',
								style : {
									classes : 'c_desc'
								}
							},
							{
								content : dynamo.toolbox.format_number(data.info.modules.in_use) + ' / ' + dynamo.toolbox.format_number(data.info.modules.available)
							}
						]
					},
					{
						cells : [
							{
								content : 'Members using Dynamo:',
								style : {
									classes : 'c_desc'
								}
							},
							{
								content : dynamo.toolbox.format_number(data.info.members)
							}
						]
					}
				]
			});
		}, dynamo.acp.settings.name + " - Overview");
	},
	ad : {
		info : function(data) {
			dynamo.tip.prompt.content('<h2>General</h2>All forums which use Dynamo show a small affiliate button at the bottom of their board (unless they have purchased ad removal). This advertising button is there to generate the revenue required to keep Dynamo alive (after all, there are so many people using it - a lot of server power is needed!).<br><br>These buttons only advertise other ZetaBoard\'s forums to ensure that the adverts are all relevant and not too \'off-topic\'.<br><br>You can add your own forum to this service as well! It\'s completely optional - but if you choose to add your forum, members from all over ZetaBoards will see your advert and potentially join your forum, giving you a lot more exposure without the hassle of finding the right market (everyone who sees your advert are already interested in forums!).<br><br><h2>How does it work?</h2>The advert shown on the page is completely random, meaning small forums will have as much exposure as larger ones.<br><br>The adverts work on a credit-based system - you top up your account with a certain amount of credits, and each time your advert is viewed or clicked, you lose some credits. As long as you have credits, your advert will be shown - simple!<br><br><h2>How do I get credits?</h2>Credits can be purchased very cheaply on the <a href="http://dynamo.viralsmods.com/extras.php" target="_blank">website</a>. If you don\'t want to spend any money, don\'t worry - we give all forums some credits for free (you only need to pay if you run out of credits and decide you want to keep your advert button).', "Admin CP - Board Advert - Information");
		},
		credits : function(data) {
			dynamo.tip.prompt.content(function() {
				dynamo.table.create(".dynamo_content", {
					rows : [
						{
							cells : [
								{
									content : 'Credits Remaining:',
									style : {
										classes : 'c_desc',
										width : '40%'
									}
								},
								{
									content : (+data.info.credits).toFixed(2) + ' (equivalent to ' + dynamo.toolbox.format_number(Math.round(+data.info.credits / data.info.credits_per_view)) + ' ad views!)'
								}
							]
						},
						{
							cells : [
								{
									colspan : 2,
									style : {
										align : 'center'
									},
									content : '<a href="http://dynamo.viralsmods.com/extras.php" target="_blank">Click here to purchase more credits!</a>'
								}
							]
						}
					]
				});
			}, 'Admin CP - Board Advert - Credits');
		},
		mine : {
			form : function(data) {
				dynamo.tip.prompt.content(function() {
					dynamo.form.create(".dynamo_content", {
						fields : [
							{
								field : {
									type : 'select',
									name : 'active',
									options : [
										[1, "Yes", "ad" in data.info ? data.info.ad.active == 1 : true],
										[0, "No", "ad" in data.info ? data.info.ad.active == 0 : false]
									]
								},
								content : {
									label : 'Active',
									desc : 'Set this to <strong>yes</strong> if you want the advert to appear on other forums.'
								},
								rules : {
									required : true
								}
							},
							{
								field : {
									type : 'input',
									spec : 'url',
									name : 'url'
								},
								content : {
									label : 'URL',
									desc : 'This is where the user will be taken when they click your advert. It must be a page on your forum.',
									placeholder : 'http://',
									value : "ad" in data.info ? data.info.ad.url : main_url
								},
								rules : {
									required : true,
									minlength : 12,
									maxlength : 255
								}
							},
							{
								field : {
									type : 'input',
									spec : 'url',
									name : 'image'
								},
								content : {
									label : 'Image URL',
									desc : 'This must be an 88x31px image. Any images bigger or smaller or larger than 25kb in size will be removed. Please abide by the ZetaBoard\'s Terms of Service.',
									placeholder : 'http://',
									value : "ad" in data.info ? data.info.ad.image : 'http://'
								},
								rules : {
									required : true,
									minlength : 12,
									maxlength : 255
								}
							}
						],
						submit : {
							to_call : function(data){
								dynamo.tip.prompt.load({
									m : "acp",
									p1 : "ad",
									p2 : "mine",
									c : "submit",
									info : data
								});
							},
							value : "ad" in data.info ? "Update Advert" : "Add Advert",
							inline : false
						}
					});
				}, 'Admin CP - Board Advert - My Advert');
			}
		},
		stats : function(data) {
			var info = data.info;
			if("ad" in info) {
				var ad = info.ad;
				dynamo.tip.prompt.content(function() {
					dynamo.table.create(".dynamo_content", {
						rows : [
							{
								cells : [
									{
										content : 'Views:',
										style : {
											classes : 'c_desc',
											width : '40%'
										}
									},
									{
										content : dynamo.toolbox.format_number(ad.views)
									}
								]
							},
							{
								cells : [
									{
										content : 'Clicks:',
										style : {
											classes : 'c_desc'
										}
									},
									{
										content : dynamo.toolbox.format_number(ad.hits)
									}
								]
							},
							{
								cells : [
									{
										content : 'Unique Clicks:',
										desc : 'This is the number of clicks your ad has received by <strong>different</strong> users.',
										style : {
											classes : 'c_desc'
										}
									},
									{
										content : dynamo.toolbox.format_number(ad.unique_hits)
									}
								]
							},
							{
								cells : [
									{
										content : 'Ad Created:',
										style : {
											classes : 'c_desc'
										}
									},
									{
										content : dynamo.toolbox.time_string(ad.added, 2)
									}
								]
							}
						]
					});
				}, 'Admin CP - Board Advert - Stats');
			} else {
				dynamo.tip.prompt.content("You have not yet setup your advert. Please click <a href=\"javascript:dynamo.tip.prompt.ini('.dynamo_acp_ad_mine');\">here</a> to add an advert for your forum. You can then check back here later to see how well it's doing!", "Admin CP - Board Advert - Stats");
			}
		}
	},
	modules : {
		ini : function(data){
			var modules = data.info.modules;
			var installed = [];
			var uninstalled = [];
			for(var m in modules) {
				if(modules[m].installed) {
					installed[installed.length] = modules[m];
				} else {
					uninstalled[uninstalled.length] = modules[m];
				}
			}
			dynamo.tip.prompt.content(function() {
			
				$(".dynamo_content").empty().append("<div class='dynamo_acp_modules_installed'></div><br /><div class='dynamo_acp_modules_uninstalled'></div>");
			
				if(!installed.length) {
					dynamo.table.create(".dynamo_acp_modules_installed", {
						colspan : 1,
						rows : [
							{
								cells : [
									{
										content : 'You have not yet installed any modules.'
									}
								]
							}
						]
					});
				} else {
					var installed_rows = [{
						cells : [
							{
								content : 'Module Name',
								style : {
									width : '65%'
								},
								type : 'th'
							},
							{
								content : 'Uninstall',
								type : 'th'
							}
						]
					}];
					
					var uninstall_link, reason, desc, other_mods, info;
					
					$.each(installed, function(key, content) {
					
						uninstall_link = content.uninstall.possible
							? '<a href="javascript:dynamo.acp.modules.uninstall(\''+content.id+'\');">Uninstall</a>'
							: 'Uninstall';
						
						desc = '';
						
						if("info" in content.uninstall) { // add tooltip explaining why module cannot be uninstalled
							reason = content.uninstall.info.reason;
							switch(reason) {
								case 4: // forced = 1
									desc = "This is a core module of Dynamo and cannot be uninstalled.";
									break;
								case 5: // other modules rely on this
									other_mods = content.uninstall.info.to_uninstall;
									info = [];
									if(other_mods.length == 1){
										info[0] = '"' + other_mods[0] + '"';
										info[1] = "relies";
										info[2] = "this";
									} else {
										info[0] = '"' + other_mods.slice(0, -1).join('", "') + '" and "' + other_mods[other_mods.length - 1] + '"';
										info[1] = "rely";
										info[2] = "these";
									}
									desc = info[0] + " " + info[1] + " on this module to function properly. Please uninstall " + info[2] + " first.";
									break;
								default:
									desc = 'This module cannot be uninstalled.';
									break;
							}
						} 
						
						installed_rows[installed_rows.length] = {
							cells : [
								{
									content : content.name,
									desc : content.desc,
									tip : {
										position : {
											my : 'bottom center',
											at : 'top center'
										}
									}
								},
								{
									content : uninstall_link,
									desc : desc,
									tip : {
										position : {
											my : 'right center',
											at : 'left center'
										}
									}
								}
							]
						};
					});
					
					dynamo.table.create(".dynamo_acp_modules_installed", {
						rows : installed_rows
					});
				}
				
				if(!uninstalled.length) {
					dynamo.table.create(".dynamo_acp_modules_uninstalled", {
						colspan : 1,
						rows : [
							{
								cells : [
									{
										content : 'There are no other modules available to install.'
									}
								]
							}
						]
					});
				} else {
					var uninstalled_rows = [{
						cells : [
							{
								content : 'Module Name',
								style : {
									width : '65%'
								},
								type : 'th'
							},
							{
								content : 'Uninstall',
								type : 'th'
							}
						]
					}];
					
					var install_link, reason, desc, other_mods, info, to_install;
					
					$.each(uninstalled, function(key, content) {
					
						install_link = content.install.possible
							? '<a href="javascript:dynamo.acp.modules.install(\''+content.id+'\');">Install</a>'
							: 'Install';
						
						desc = '';
						
						if("info" in content.install) {
							reason = content.install.info.reason;
							switch(reason) {
								case 1: // online = 0
									desc = "This module is not currently available as it is under maintenance.";
									break;
								case 2: // premium only
									desc = "This module is only available to premium members of Dynamo.";
									break;
								case 3: // not all prereqs have been installed
									other_mods = content.install.info.to_install;
									to_install = other_mods.length == 1
										? '"' + other_mods[0] + '"'
										: '"' + other_mods.slice(0, -1).join('", "') + '" and "' + other_mods[other_mods.length - 1] + '"';
									desc = "This module cannot be installed without first installing " + to_install + ".";
									break;
								default:
									desc = 'This module cannot be uninstalled.';
									break;
							}
						}
						
						uninstalled_rows[uninstalled_rows.length] = {
							cells : [
								{
									content : content.name,
									desc : content.desc,
									tip : {
										position : {
											my : 'bottom center',
											at : 'top center'
										}
									}
								},
								{
									content : install_link,
									desc : desc,
									tip : {
										position : {
											my : 'right center',
											at : 'left center'
										}
									}
								}
							]
						};
					});
					
					dynamo.table.create(".dynamo_acp_modules_uninstalled", {
						rows : uninstalled_rows
					});
				}
			
			}, dynamo.acp.settings.name + " - Modules");
		},
		install : function(id){
			dynamo.tip.prompt.load({
				m : "acp",
				p1 : "modules",
				c : "install",
				id : id
			});
		},
		uninstall : function(id){
			dynamo.tip.prompt.load({
				m : "acp",
				p1 : "modules",
				c : "uninstall",
				id : id
			});
		}
	},
	groups : {
		full_list : function(data){
			var groups = data.info.groups, admin, group_len = groups.length, desc;
			dynamo.tip.prompt.content(function(){
				var rows = [
					{
						cells : [
							{
								colspan : 3,
								content : '<a href="javascript:dynamo.acp.groups.update();">Update Groups</a>',
								desc : 'Click this link after editing a group\'s name or adding or deleting a group in the Admin CP.',
								tip : {
									position : {
										my : 'top center',
										at : 'bottom center'
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
								content : 'Name',
								type : 'th'
							},
							{
								content : '# of Members in Group',
								type : 'th'
							},
							{
								content : 'Dynamo ACP Access',
								type : 'th'
							}
						]
					}
				];
				for(var g = 0; g < group_len; g++){
					admin = groups[g].admin == 2
						? 'Yes [root]'
						: (
							groups[g].admin == 1
								? '<a href="javascript:dynamo.acp.groups.change_access(' + groups[g].id + ', 0);">Yes</a>'
								: '<a href="javascript:dynamo.acp.groups.change_access(' + groups[g].id + ', 1);">No</a>'
						);
					desc = groups[g].admin == 2
						? 'You cannot change this group\'s Dynamo ACP access'
						: (
							groups[g].admin == 1
								? 'Remove this group\'s access to the Dynamo ACP'
								: 'Allow this group to access the Dynamo ACP'
						);
					rows[rows.length] = {
						cells : [
							{content : groups[g].name},
							{content : dynamo.toolbox.format_number(groups[g].users)},
							{
								content : admin,
								desc : desc,
								tip : {
									position : {
										my : 'right center',
										at : 'left center'
									},
									style : {
										width : '150px'
									}
								}
							}
						]
					};
				}
				dynamo.table.create(".dynamo_content", {
					colspan : 3,
					rows : rows
				});
				if(location.href == main_url + "members?dynamo=1" && !("info" in data && "updated" in data.info)){
					dynamo.tip.prompt.loading();
					dynamo.acp.groups.update();
				}
			}, dynamo.acp.settings.name + " - Main - Groups (Permissions)");
		},
		update : function(){
			var to_test = new RegExp("^"+main_url.replace(/\//g,"\\/")+"members");
			if(to_test.test(location.href)){
				var groups = [];
				$("select[name=group] option").each(function(){
					if($(this).val() != 0){
						groups[groups.length] = {
							id : $(this).val(),
							name : $(this).text().replace(/ \(hidden\)$/,"")
						}
					}
				});
				dynamo.tip.prompt.load({
					m : "acp",
					p1 : "groups",
					c : "update",
					info : {
						groups : groups
					}
				});
			} else {
				dynamo.tip.prompt.content("We need to redirect you to another page in order to complete the update process. Please wait...");
				setTimeout(function(){
					location.replace(main_url + "members?dynamo=1");
				}, 2500);
			}
		},
		change_access : function(id, new_access) {
			dynamo.tip.prompt.load({
				m : "acp",
				p1 : "groups",
				c : "change_access",
				info : {
					id : id,
					new_access : new_access
				}
			});
		}
	},
	domains : {
		full_list : function(data) {
			var domains = data.info.domains;
			dynamo.tip.prompt.content(function() {
				var rows = [
					{
						cells : [
							{
								content : 'Address',
								desc : "The domain addresses listed below have been displayed in their simplest form. This includes removing <em>http://</em>, <em>www.</em> and other unnecessary characters. All ZetaBoards domains have also had their leading character removed (either <em>s</em> or <em>z</em>).",
								type : 'th'
							},
							{
								content : 'Edit',
								type : 'th'
							},
							{
								content : 'Remove',
								type : 'th'
							}
						]
					}
				];
				for(var d in domains) {
					rows[rows.length] = {
						cells : [
							{
								content : domains[d]
							},
							{
								content : '<a href="javascript:dynamo.acp.domains.edit(\'' + domains[d] + '\');">Edit</a>'
							},
							{
								content : '<a href="javascript:dynamo.acp.domains.remove(\'' + domains[d] + '\');">Remove</a>'
							}
						]
					};
				}
				rows[rows.length] = {
					cells : [{
						colspan : 3,
						content : '<a href="javascript:dynamo.acp.domains.add();">Add another domain</a>',
						tip : {
							position : {
								my : 'right center',
								at : 'left center'
							},
							style : {
								width : '300px'
							}
						},
						style : {align : 'center'}
					}]
				};
				rows[rows.length] = {
					cells : [{
						colspan : 3,
						content : 'What is this?',
						desc : "Whenever you are about to add a new domain to your forum (via the main <a href=\"" + main_url + "admin\">Admin CP</a>) you must first add the domain here. If you do not add the domain via the Dynamo ACP first, any user who subsequently accesses the forum on the new domain will not be able to use Dynamo.",
						tip : {
							position : {
								my : 'top center',
								at : 'bottom center'
							},
							style : {
								width : '300px'
							}
						},
						style : {align : 'center'}
					}]
				};
				dynamo.table.create(".dynamo_content", {
					colspan : 3,
					rows : rows
				});
			}, dynamo.acp.settings.name + " - Domain Manager");
		},
		add : function() {
			dynamo.form.create(".dynamo_content", {
				fields : [
					{
						field : {
							type : 'input',
							spec : 'url',
							name : 'domain'
						},
						content : {
							label : 'Domain Address',
							placeholder : 'http://',
							value : 'http://'
						},
						rules : {
							required : true
						}
					}
				],
				submit : {
					to_call : function(data){
						dynamo.tip.prompt.load({
							m : "acp",
							p1 : "domains",
							c : "add",
							info : {
								addr : data.domain
							}
						});
					},
					value : 'Add',
					inline : true
				}
			});
		},
		edit : function(domain) {
			dynamo.form.create(".dynamo_content", {
				fields : [
					{
						field : {
							type : 'input',
							spec : 'url',
							name : 'new_domain'
						},
						content : {
							label : 'Domain Address',
							value : 'http://' + domain
						},
						rules : {
							required : true
						}
					}
				],
				submit : {
					to_call : function(data){
						dynamo.tip.prompt.load({
							m : "acp",
							p1 : "domains",
							c : "edit",
							info : {
								new_addr : data.new_domain,
								old_addr : 'http://' + domain
							}
						});
					},
					value : 'Edit',
					inline : true
				}
			});
		},
		remove : function(domain) {
			dynamo.tip.prompt.load({
				m : "acp",
				p1 : "domains",
				c : "remove",
				info : {
					addr : 'http://' + domain
				}
			});
		}
	},
	refresh : {
		full_list : function(data) {
			var page = data.info.page;
			var total_pages = data.info.total_pages;
			var prev_page = $("<button>").attr("type", "submit").css("width", "80px").html("<").css("opacity", 0.5).addClass("dynamo_prev_page");
			var next_page = $("<button>").attr("type", "submit").css("width", "80px").html(">").css("opacity", 0.5).addClass("dynamo_next_page");
			
			dynamo.tip.prompt.content(function() {
				$(".dynamo_content").empty().append("<div></div><br /><div style='text-align:center;' class='dynamo_pages_holder'></div>");
				
				var rows = [
					{
						cells : [
							{
								content : 'Username',
								type : 'th'
							},
							{
								content : 'Refresh Account',
								type : 'th'
							}
						]
					}
				];
				
				var users = data.info.users, user, u;
				for(u in users) {
					user = users[u];
					rows[rows.length] = {
						cells : [
							{content : '<a href="' + main_url + 'profile/' + user.zbid + '">' + user.username + '</a>'},
							{content : '<a href="javascript:dynamo.acp.refresh.message(' + user.zbid + ');">Refresh</a>'}
						]
					};
				}
				
				rows[rows.length] = {
					cells : [{
						colspan : 2,
						content : 'What is this?',
						desc : "All users in the above list have been blocked from using Dynamo as they failed to pass the initial (hidden) security tests. This could be due to the user accidentally tampering with the Dynamo system or another user trying to 'hack' into their account.<br /><br />If you refresh a user's account, they will be sent an automatic PM with a PIN to reset their security information for Dynamo so they can continue to use the system. If you do not refresh their account, they will be permanently blocked from using Dynamo.",
						tip : {
							position : {
								my : "bottom center",
								at : "top center"
							},
							style : {
								width : "350px"
							}
						},
						style : {
							align : 'center'
						}
					}]
				};
				
				dynamo.table.create(".dynamo_content div:first", {
					rows : rows
				});
				
				$(".dynamo_pages_holder").append(prev_page).append(' ').append(next_page);
				if(page > 1){
					$(".dynamo_prev_page").bind("click", {page : (+page) -1}, function(e) {
						dynamo.tip.prompt.load({
							m : "acp",
							p1 : "refresh",
							c : "list",
							info : {
								page : e.data.page
							}
						});
					}).css("opacity", 1);
				}
				if(page < total_pages){
					$(".dynamo_next_page").bind("click", {page : (+page) + 1}, function(e) {
						dynamo.tip.prompt.load({
							m : "acp",
							p1 : "refresh",
							c : "list",
							info : {
								page : e.data.page
							}
						});
					}).css("opacity", 1);
				}
			}, dynamo.acp.settings.name + " - Users - Refresh User");
		},
		message : function(zbid) {
			dynamo.tip.prompt.content("This user has been blocked from Dynamo as he/she failed to pass the initial (hidden) security tests. This could be due to the user accidentally tampering with the Dynamo system or another user trying to 'hack' into their account.<br /><br />If you refresh this user's account, he/she will be sent an automatic PM with a PIN to reset their security information for Dynamo so they can continue to use the system. If you do not refresh their account, they will be permanently blocked from using Dynamo.<br /><br /><a href='javascript:dynamo.acp.refresh.understood(" + zbid + ");'>I understand. Refresh this user's account</a>.",
				dynamo.acp.settings.name + " - Users - Refresh User - Confirm");
		},
		understood : function(zbid) {
			dynamo.tip.prompt.load({
				m : "acp",
				p1 : "refresh",
				c : "request_pin",
				zbids : [zbid], // preload info on serverside
				info : {
					user : zbid
				}
			});
		},
		finish : function(data) {
			var info = data.info;
			dynamo.toolbox.send_pm({
				username : info.user.username,
				title : "IMPORTANT - ZetaBoards Dynamo Refresh Information",
				message : "Dear " + info.user.username + ",\n\nYou are being sent this automatic message because an Administrator has refreshed your Dynamo account. Your account was refreshed as you were not able to access Dynamo's features recently. In order to continue using Dynamo, you will need to complete the refresh process by inputting your 4 digit PIN (given at the end of this message) into the notification which pops up when you refresh the page. If the PIN does not work, or the notification does not appear, please reply to this message so an Admin can assist you further.\n\n[center][b]PIN:[/b]\n\n[big][big]" + info.pin + "[/big][/big][/center]"
			}, function(d) {
				dynamo.tip.prompt.content(info.user.username + " has been PMed with instructions on how to complete the refreshing process.",
					dynamo.acp.settings.name + " - Users - Refresh User - Complete");
			});
		}
	}
};