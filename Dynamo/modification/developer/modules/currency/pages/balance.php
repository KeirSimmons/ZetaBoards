<?php
	class page implements iPage {
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> db -> notice_id = "currency-balance";
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
			$this -> settings = $this -> db -> modules["currency"]["settings"];
			$this -> info = $this -> db -> secure($_GET['info']);
		}
	
		public function load() {
			$this -> ini();
		}
		
		private function ini() {
			$zbid = $this -> zbid;
			$this -> db -> output_vars["info"]["money"] = $this -> db -> my["config"]["currency"]["money"];
			$this -> db -> cb = "dynamo.currency.balance";
		}
	}
		
?>