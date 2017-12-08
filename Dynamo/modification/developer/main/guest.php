<?php
	header("Content-type: application/x-javascript");
	define("FROM","guest");
	require_once("database.class.php");
	
	$database -> get_settings(true); // validate forum (domain check) and get all settings from the 'core' table (1 query)
	$database -> get_modules(); // find all the installed modules and retrieve their settings (2 queries)
	$database -> update_modules(1);
	
	$database -> output();
?>