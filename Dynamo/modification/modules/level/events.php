<?php

	class level_events implements iEvent {
		
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
			$this -> gid = $this -> db -> my["gid"];
			$this -> settings = $this -> db -> groups["id-" . $this -> gid]["config"]["level"];
			$this -> user_settings = $this -> db -> my["config"]["level"];
		}
		
		public function ini() {
		
			$that = $this;
			
			/* CORE EVENTS */
			
			$this -> db -> events["core"]["posted"][] = function($data) use ($that) {
				// add exp
				// checks have already been done to ensure this is a real post
				$cid = $that -> cid;
				$zbid = $that -> zbid;
				$type = $data["type"];
				$extra = rand($that -> settings[$type . "_min"], $that -> settings[$type . "_max"]);
				
				$exp = $that -> user_settings["experience"];
				$that -> db -> load_module_class("level");
				$info = $that -> db -> module_class["level"] -> get_info($exp);
				if($info["level"] < $info["max_level"]) { // only add experience if you can still level up
					$new_exp = min($info["max_exp"], $exp + $extra); // don't go above max exp
					
					if($new_exp >= $info["exp_next_level"]) {
						$new_info = $that -> db -> module_class["level"] -> get_info($new_exp);
						$that -> db -> fire_event("level", "level_up", array(
							"level" => $new_info["level"]
						));
					}
					
					$that -> db -> update_user_config(array(
						array("level", "experience", $new_exp)
					));
				}
			};
			
			/* CORE EVENTS */
			
		}
		
	}

?>