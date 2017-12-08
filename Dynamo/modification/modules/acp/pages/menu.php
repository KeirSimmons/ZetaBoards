<?php
	class page implements iPage {
		public function __construct() {
			global $database;
			$this -> db = $database;
		}
	
		public function load() {
			$this -> ini();
		}
		
		private function ini() {
			$this -> db -> cb = "dynamo.acp.menu.ini";
		}
	}
?>