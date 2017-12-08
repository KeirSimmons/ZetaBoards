<?php
	header("Content-type: application/x-javascript");
	define("FROM", "menu");
	require_once("../main/database.class.php");
	$load = $database -> secure($_GET['load']);
	if(file_exists($load.".js")){
		echo file_get_contents($load.".js");
	}
?>