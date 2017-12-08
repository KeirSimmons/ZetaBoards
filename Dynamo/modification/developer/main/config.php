<?php
	class config {
		public function __construct(){
			$this -> DYNAMO_ON = true; // On/off switch for entire Dynamo system
			$this -> SETUP_TRIES = 3; // Max setup pin tries per day before lockout
			$this -> NOTIFICATIONS_UNREAD_LIFE = array(60 * 86400, 14 * 86400); // how many seconds notifications stay if unread (premium, basic)
			$this -> NOTIFICATIONS_READ_LIFE = array(30 * 86400, 7 * 86400); // how many seconds notifications stay if read (premium, basic)
		}
	}
	$config = new config;
?>