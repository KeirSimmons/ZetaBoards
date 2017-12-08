<?php
	header("Content-type: application/x-javascript");
	define("FROM","core");
	require_once("database.class.php");
	
	$database -> get_settings(); // validate forum (domain check) and get all settings from the 'core' table (1 query)
	$database -> get_modules(); // find all the installed modules and retrieve their settings (2 queries)
	$database -> get_groups(); // requires mids from get_modules - find details on just the group relevant to current user id (less queries this way), (2 queries if group exists, 4 queries otherwise)
	$database -> get_users(); // get user information for all zbids passed
	
	$database -> fire_event("core", "start");
	
	$cid = $database -> cid;
	$zbid = $database -> zbid;
	
	$posted = $database -> secure($_GET['posted']);
	$xc = $database -> secure($_GET['xc']);
	$posts = $database -> secure($_GET['new_posts']);
	if(strlen($posted) && strlen($xc) && strlen($posts)) {
		// posted, fire event
		if($posts - 1 == $database -> my["temp_posts"] && $xc == $database -> my["xc"]) {
			$database -> output_vars["posted"] = 1;
			$database -> query("UPDATE `users` SET `xc`='', `temp_posts`='0', `posts`='$posts' WHERE `cid`='$cid' AND `zbid`='$zbid' LIMIT 1");
			$database -> fire_event("core", "posted", array(
				"type" => $posted == 1
					? "topic"
					: "reply"
			));
		}
	}
	
	if($_GET['posting']) {
		$xc = substr($database -> generate_secure_string(), 0, 8);
		$database -> output_vars["xc"] = $xc;
		$database -> query("UPDATE `users` SET `xc`='$xc' WHERE `cid`='$cid' AND `zbid`='$zbid' LIMIT 1");
		//$database -> fire_event("core", "posting");
	}
	
	$page = $database -> secure($_GET['page']);
	if(in_array($page["id"], array(
		"topic",
		"profile",
		"single"
	))) {
		$database -> get_user_info();
	}
	
	$database -> output();
?>