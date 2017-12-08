<?php

	define("FROM", "cron");
	require_once("../../main/database.class.php");
	require_once("../../main/config.php");
	
	$config = new config();
	list($premium_unread, $basic_unread) = $config -> NOTIFICATIONS_UNREAD_LIFE;
	list($premium_read, $basic_read) = $config -> NOTIFICATIONS_READ_LIFE;
	
	$query = <<<"QUERY"
DELETE a.*
FROM `notifications` a
LEFT JOIN `core` b
	ON a.`cid` = b.`id`
WHERE
	a.`time` < UNIX_TIMESTAMP() - IF(b.`premium` >= UNIX_TIMESTAMP(), IF(a.`read`=1, $premium_read, $premium_unread), IF(a.`read`=1, $basic_read, $basic_unread))
QUERY;

	$database -> query($query);
	$database -> query("OPTIMIZE TABLE `notifications`");
	
?>