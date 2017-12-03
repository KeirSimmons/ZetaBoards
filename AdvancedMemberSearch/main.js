/*
Open-source, free to use. Find more modifications at https://github.com/KeirSimmons/ZetaBoards
Modification: Remove "Users Viewing" from forum view
*/

var memberSearch = {
	userGroups : [], joinableGroups : [], users : [], started : false,
	tabs : function(){
		$('#submenu a[href='+main_url+'members/]').remove();
		$("#top_menu").append('<li id="menu_mem"><a href="'+main_url+'members/">Members</a><ul><li><a href="javascript:memberSearch.ini();">Search</a></li></ul></li>'); // Add search link to topmenu
	},
	ini : function(){
		if(memberSearch.started === false){
			if(confirm('This process may take a while, depending on the number of members registered on this forum.\nAre you sure you wish to continue?')){
				$('#wrap').prepend('<div class="meta_box" id="memberSearch"><a href="javascript:memberSearch.noMore();">[x]</a> <u><strong>Advanced Member Search</strong></u><br /><div class="load">Please wait, gathering member data...<br /><u>Step 1</u> - <span id="s1percent">0%</span><br /><u>Step 2</u> - <span id="s2percent">0%</span></div></div>');
				memberSearch.started = true;
				memberSearch.gatherPrelimData();
			}
		}
	},
	gatherPrelimData : function(){
    // go to the members page and aggregate data
		$.ajax({
			url: main_url+'members/',
			async: false,
			success: function(d){
				$('.c_foot select[name=group] option',d).not(":first").each(function(){
					memberSearch.userGroups[memberSearch.userGroups.length] = [$(this).text().replace(/ \(hidden\)/,''),$(this).val()];
				});
				pages = $('.cat-pages:first',d);
				current = 1;
				last = pages.find('li:last').text();
				memberData = $('#member_list_full tbody tr[class*=row]',d);
				memberSearch.groupData(memberData);
				$('#s1percent').text(Math.round(current/last*100)+'%');
				while(current++ < last){
					$.ajax({
						url: main_url+'members/'+current,
						async: false,
						success: function(e){
							memberData = $('#member_list_full tbody tr[class*=row]',e);
							memberSearch.groupData(memberData);
							$('#s1percent').text(Math.round(current/last*100)+'%');
						}
					});
				}
			}
		});
		$.ajax({
      // Get data from the "Joinable Groups" page
			url: main_url+'home/?c=22',
			async: false,
			success: function(d){
				Rows = $('#joinable_groups tbody tr',d).not(":first");
				if(Rows.find('td:contains(There are no groups available to join.)').size() == 1){
					$('#s2percent').text('100%');
				} else {
					current = 0;
					total = Rows.size();
					Rows.each(function(){
						name = $(this).children('td').eq(0).text();
						url = $(this).children('td').eq(2).find('a').attr('href');
						id = parseInt(url.split('?joinable=')[1]);
						memberSearch.joinableGroups[memberSearch.joinableGroups.length] = [name,id];
						$.ajax({
							url: url,
							async: false,
							success: function(f){
								memberData = $('#member_list_full tbody tr[class*=row]',f);
								memberSearch.joinableGroupData(memberData,id);
								$('#s2percent').text(Math.round(++current/total*100)+'%');
							}
						});
					});
				}
			}
		});
		$.ajax({
      // Get data from your address book
			url: main_url+'msg/?c=16',
			async: false,
			success: function(g){
				memberData = $('#address_book tbody tr',g).not(':first');
				if(memberData.find('td:contains(You have no contacts in your address book.)').size() == 0){
					memberSearch.addressBookData(memberData);
				}
				memberSearch.openForm();
			}
		});
	},
	groupData : function(memberData){
    // Get data based on user groups
		memberData.each(function(){
			// [zbid,username,group,posts,[joinable group ids],addressbook] - addressbook === true ? 1 : 0
			zbid = parseInt($(this).find('td:first a').attr('href').split('profile/')[1]);
			username = $.trim($(this).find('td:first a').text());
			group = $.trim($(this).find('td').eq(1).text());
			g = memberSearch.userGroups.length;
			while(g--){
				if(memberSearch.userGroups[g][0] == group){
					group = memberSearch.userGroups[g][1];
					break;
				}
			}
			posts = parseInt($(this).find('td').eq(4).text().replace(/[\,\. ]/g,''));
			memberSearch.users[memberSearch.users.length] = [zbid,username,group,posts,[],0];
		});
	},
	joinableGroupData : function(memberData,group){
		memberData.each(function(){
			zbid = parseInt($(this).find('td:first a').attr('href').split('profile/')[1]);
			lUsers = memberSearch.users.length;
			while(lUsers--){
				if(memberSearch.users[lUsers][0] == zbid){
					memberSearch.users[lUsers][4][memberSearch.users[lUsers][4].length] = group;
					break;
				}
			}
		});
	},
	addressBookData : function(memberData){
		memberData.each(function(){
			zbid = parseInt($(this).find('td:first a').attr('href').split('profile/')[1]);
			lUsers = memberSearch.users.length;
			while(lUsers--){
				if(memberSearch.users[lUsers][0] == zbid){
					memberSearch.users[lUsers][5] = 1;
					break;
				}
			}
		});
	},
	openForm : function(){
		uL = memberSearch.userGroups.length;
		groups = '<option value="0">Any</option>';
		joinableGroups = '<option value="0">Any</option>';
		for(i=0;i<uL;i++){
			groups += '<option value="'+memberSearch.userGroups[i][1]+'">'+memberSearch.userGroups[i][0]+'</option>';
		}
		uJ = memberSearch.joinableGroups.length;
		for(j=0;j<uJ;j++){
			joinableGroups += '<option value="'+memberSearch.joinableGroups[j][1]+'">'+memberSearch.joinableGroups[j][0]+'</option>';
		}
		results = '';
		uU = memberSearch.users.length;
		for(k=0;k<uU;k++){
			results += '<tr><td><a href="'+main_url+'profile/'+memberSearch.users[k][0]+'">'+memberSearch.users[k][1]+'</a></td></tr>';
		}
		content = '<br /><form onsubmit="memberSearch.refine(event);"><table><tr><th style="width:50%;">Search Criteria</th><th>Results [<span class="remaining">' + uU + '</span>]</th></tr><tr><td valign="top"><table><tr><td colspan="2"><a href="javascript:memberSearch.toggleCriteria(1);"><span style="display:none;" class="username">[+]</span><span class="username">[-]</span></a> Username</td></tr><tr class="username"><td class="c_desc">Username Contains</td><td><input type="text" name="usernamecontains" size="32" maxlength="32" /></td></tr><tr class="username"><td class="c_desc">Username Starts With</td><td><input type="text" name="usernamestartswith" size="32" maxlength="32" /></td></tr><tr class="username"><td class="c_desc">Username Ends With</td><td><input type="text" name="usernameendswith" size="32" maxlength="32" /></td></tr><tr><td colspan="2"><a href="javascript:memberSearch.toggleCriteria(2);"><span style="display:none;" class="zbid">[+]</span><span class="zbid">[-]</span></a> User ID</td></tr><tr class="zbid"><td class="c_desc">User ID Contains</td><td><input type="text" name="zbidcontains" size="8" maxlength="8" /></td></tr><tr class="zbid"><td class="c_desc">User ID Starts With</td><td><input type="text" name="zbidstartswith" size="8" maxlength="8" /></td></tr><tr class="zbid"><td class="c_desc">User ID Ends With</td><td><input type="text" name="zbidendswith" size="8" maxlength="8" /></td></tr><tr><td colspan="2"><a href="javascript:memberSearch.toggleCriteria(3);"><span style="display:none;" class="misc">[+]</span><span class="misc">[-]</span></a> Miscellaneous</td></tr><tr class="misc"><td class="c_desc">Post Count</td><td><select name="postcountsign"><option value="1"><</option><option value="2"><=</option><option value="3">=</option><option value="4" selected="selected">>=</option><option value="5">></option></select> <input type="text" name="postcount" size="8" maxlength="32" /></td></tr><tr class="misc"><td class="c_desc">In Address Book</td><td><select name="addressbook"><option value="1">Doesn\'t Matter</option><option value="2">Yes</option><option value="3">No</option></select></td></tr><tr class="misc"><td class="c_desc">In Group</td><td><select name="group">'+groups+'</select></td></tr><tr class="misc"><td class="c_desc">In Joinable Group</td><td><select name="joinablegroup">'+joinableGroups+'</select></td></tr><tr><td /><td><button id="mem_search_button" name="mem_search_button" class="btn_default" type="submit">Search</button></td></tr></table></td><td valign="top"><div style="overflow:auto;height:433px;"><table class="results">'+results+'</table></form></div></td></tr></table>';
		$('#memberSearch .load').before(content).remove();
		$('#memberSearch input').keyup(function(e){memberSearch.refine(e);});
	},
	toggleCriteria : function(a){
		switch(a){
			case 1:h='username';break;
			case 2:h='zbid';break;
			case 3:h='misc';break;
			default:h='username';break;
		}
		$('.'+h).toggle();
	},
	refine : function(e){
		e.returnValue = e.preventDefault && e.preventDefault() ? false : false;
		remaining = [];
		uU = memberSearch.users.length;
		for(i=0;i<uU;i++){
			remaining[remaining.length] = memberSearch.users[i];
		}
		usernamecontains = memberSearch.clean($('#memberSearch input[name=usernamecontains]').val());
		usernamestartswith = memberSearch.clean($('#memberSearch input[name=usernamestartswith]').val());
		usernameendswith = memberSearch.clean($('#memberSearch input[name=usernameendswith]').val());
		useridcontains = memberSearch.clean($('#memberSearch input[name=zbidcontains]').val());
		useridstartswith = memberSearch.clean($('#memberSearch input[name=zbidstartswith]').val());
		useridendswith = memberSearch.clean($('#memberSearch input[name=zbidendswith]').val());
		postcount = parseInt($('#memberSearch input[name=postcount]').val());
		if(!(postcount == postcount * 1 && postcount >= 0)){
			postcount = 0;
			$('#memberSearch input[name=postcount]').val(0);
		}
		postcountsign = $('#memberSearch select[name=postcountsign]').val();
		regex1 = new RegExp(usernamecontains,'i');
		regex2 = new RegExp('^'+usernamestartswith,'i');
		regex3 = new RegExp(usernameendswith+'$','i');
		regex4 = new RegExp(useridcontains,'i');
		regex5 = new RegExp('^'+useridstartswith,'i');
		regex6 = new RegExp(useridendswith+'$','i');
		group = $('#memberSearch select[name=group]').val();
		uR = remaining.length;
		newRemaining = [];
		for(l=0;l<uR;l++){
			if(
				regex1.test(remaining[l][1]) &&
				regex2.test(remaining[l][1]) &&
				regex3.test(remaining[l][1]) &&
				regex4.test(remaining[l][0]) &&
				regex5.test(remaining[l][0]) &&
				regex6.test(remaining[l][0]) &&
				(remaining[l][2] == group || group == 0)
			){
				switch(postcountsign * 1){
					case 1: // <
						pc = remaining[l][3] < postcount; break;
					case 2: // <=
						pc = remaining[l][3] <= postcount; break;
					case 3: // =
						pc = remaining[l][3] == postcount; break;
					case 4: // >=
						pc = remaining[l][3] >= postcount; break;
					case 5: // >
						pc = remaining[l][3] > postcount; break;
					default: pc = false;
				}
				if(pc === true){
					ab = $('#memberSearch select[name=addressbook]').val();
					if(ab == 1 || (ab == 2 && remaining[l][5] == 1) || (ab == 3 && remaining[l][5] == 0)){
						joinableGroup = $('#memberSearch select[name=joinablegroup]').val();
						carryOn = true;
						if(joinableGroup != 0){
							carryOn = false;
							jG = remaining[l][4].length;
							while(jG--){
								if(remaining[l][4][jG] == joinableGroup){
									carryOn = true;
									break;
								}
							}
						}
						if(carryOn === true){
							newRemaining[newRemaining.length] = remaining[l];
						}
					}
				}
			}
		}
		remaining = newRemaining;
		// update results
		uR = remaining.length;
		$('#memberSearch .remaining').text(uR);
		if(uR == 0){
			results = '<tr><td style="text-align:center"><em>There were no matches. Please refine your search criteria.</em></td></tr>';
		} else {
			results = '';
			for(m=0;m<uR;m++){
				results += '<tr><td><a href="'+main_url+'profile/'+remaining[m][0]+'">'+remaining[m][1]+'</a></td></tr>';
			}
		}
		$('#memberSearch .results').html(results);
	},
	clean : function(str){
		return str.replace(/\,/g,"\\,").replace(/\./g,"\\.").replace(/\+/g,"\\+").replace(/\-/g,"\\-").replace(/\[/g,"\\[").replace(/\]/g,"\\]").replace(/\(/g,"\\(").replace(/\)/g,"\\)");
	},
	noMore : function(){
		$('#memberSearch').remove();
		memberSearch.started = false;
	}
};
memberSearch.tabs();
