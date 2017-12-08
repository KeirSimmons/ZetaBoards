<?php
	class level_profile implements iProfile {
		public function __construct() {
			global $database;
			$this -> db = $database;
		}
		
		public function get() {
			if($this -> db -> modules["level"]["settings"]["profile_type"] != 1) {
				foreach($this -> db -> output_vars["users"] as &$user) {
				
					$exp = $this -> db -> users["u-" . $user["zbid"]]["config"]["level"]["experience"];
					$this -> db -> load_module_class("level");
					$info = $this -> db -> module_class["level"] -> get_info($exp);
					
					switch(+$info["profile_type"]) {
						case 2: $user["config"]["level"] = array(
							"level_1" => $info["level"],
							"exp_1" => $info["percent"]
						); break;
						case 3: $user["config"]["level"] = array(
							"level_1" => $info["level"],
							"exp_2" => $info["exp"]
						); break;
						case 4: $user["config"]["level"]["level_1"] = $info["level"]; break;
						case 5: $user["config"]["level"]["exp_2"] = $info["exp"]; break;
					}
				}
			}
		}
	}
?>