<?php
	class page implements iPage {
	
		private $info;
	
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> db -> notice_id = "acp-ad-info";
			$this -> cid = $this -> db -> cid;
		}
	
		public function load() {
			$this -> show();
		}
		
		private function show() {
			$this -> db -> cb = "dynamo.acp.ad.info";
		}
		
	}
?>