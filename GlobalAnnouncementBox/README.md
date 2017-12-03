## Description

This makes an announcement box which automatically retrieves the contents of the first post in the latest topic posted in a specific forum. For example, this code could automatically retrieve the latest news you post in the announcement forum, and then members will be able to see it in an announcements box at the top of the index page. The news in the announcement box is in a marquee (it scrolls) so you can see everything without it taking too much space.

**Note**: Every time this is used (each time the index page is loaded), 2 AJAX requests are fired, which will cost 2 ad credits. Keep this in mind if you have purchased ad removal.

**Original Release Date**: September 2, 2010

## Preview

**Announcement Box**

![Before](./Preview/box.png)

## Installation Instructions

`main.js`: Admin CP **>>** Themes **>>** Board Templates **>>** Below the Board

`forum = 3120372;` needs to be modified to the ID of the forum from which you want to retrieve the announcement. For example, if the forum is `http://s15.zetaboards.com/ViralTest/forum/5179056/` then the ID would be `5179056`. 
