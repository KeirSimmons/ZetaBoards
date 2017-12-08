<?php
	class currency_profile implements iProfile {
		public function __construct() {
			global $database;
			$this -> db = $database;
		}
		
		public function get() {
			if($this -> db -> modules["currency"]["settings"]["profile"] == 1) {
				foreach($this -> db -> output_vars["users"] as &$user) {
					$settings = $this -> db -> users["u-" . $user["zbid"]]["config"]["currency"];
					$user["config"]["currency"] = array(
						"money" => $settings["money"]
					);
				}
			}
		}
	}
?>