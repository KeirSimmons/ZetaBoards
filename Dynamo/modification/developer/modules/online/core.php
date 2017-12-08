<?php
	class online {
	
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
			$this -> settings = $this -> db -> modules["online"]["settings"];
			
			$this -> config = array(
				"users" => array(0, 50), // setting to 0 removes the restriction
				"period" => array(267840, 86400)
			);
		}
		
	}
?>