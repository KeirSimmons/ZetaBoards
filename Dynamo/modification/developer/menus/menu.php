<?php
	header("Content-type: application/x-javascript");
	define("FROM", "menu");
	require_once("../main/database.class.php");
	$menu = $database -> secure($_GET['menu']);
	if(file_exists($menu.".js")){
		echo file_get_contents($menu.".js");
	}
?>