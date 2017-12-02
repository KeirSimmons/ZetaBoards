## Description

Adds a field to the registration page to allow new members to say who referred them to the forum. Upon registering, a user of your choice (i.e the root admin) will be sent a PM to notify them of the referral. The code will always ensure that the username given as the referrer is a real user on the forum.

Caveat: The group which a new member is put in must have PM privileges and be able to PM the user of choice otherwise this will not work.

**Original Release Date**: September 27, 2014

## Preview

**Registration Page - New Field**

![Before](https://github.com/KeirSimmons/ZetaBoards/blob/master/SimpleMemberReferral/reg_page_1.png)

**Registration Page - Unknown User**

![Before](https://github.com/KeirSimmons/ZetaBoards/blob/master/SimpleMemberReferral/reg_page_2.png)

**Registration Page - Known User**

![Before](https://github.com/KeirSimmons/ZetaBoards/blob/master/SimpleMemberReferral/reg_page_3.png)

**Inbox - PM to Chosen User**

![Before](https://github.com/KeirSimmons/ZetaBoards/blob/master/SimpleMemberReferral/pm.png)

## Installation Instructions

`main.js`: Admin CP **>>** Themes **>>** Board Templates **>>** Above the Board

To modify the registration field, find the following snippet of code in `main.js` (near the top):

~~~~
field : { // information regarding the referral registration field
	title : "Referred By", // title
	desc : "Username of the member that referred you", // small description (can be blank)
},
~~~~

The title and description of the field can be changed accordingly. Ensure you keep the text enclosed in either `""` or `''`.

To modify the PM sent, and who it is sent to, find the following snippet of code in `main.js` (just below the previous snippet):

~~~~
pm_info : { // information regarding the PM which will be sent when a new user registers and fills in the referral field
	username : "Admin username here", // username of the person you want to send the message to
	title : "I've been referred by %REFERRER%", // title of the PM. Use %REFERRER% to place the referrer's name
	message : "[b]%REFERRER%[/b] referred me to this forum!" // PM message. Use %REFERRER% to place the referrer's name. BB Code allowed.
},
~~~~

Again, these fields can be changed accordingly. `"Admin username here"` needs to be changed to an existing member (the user you want the PM to be sent to) before the modification will work.
