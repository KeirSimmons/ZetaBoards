<?php
	class page implements iPage {
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
			$this -> user_settings = $this -> db -> my["config"]["level"]; // settings specific to user
			$this -> group_settings = $this -> db -> groups["id-" . $this -> db -> my["gid"]]["config"]["level"]; // settings specific to user's group
			$this -> settings = $this -> db -> modules["level"]["settings"]; // settings specific to module
			$this -> info = $this -> db -> secure($_GET['info']);
			if($this -> db -> groups["id-" . $this -> db -> my["gid"]]["admin"] == 0) {
				$this -> db -> output(18);
			} else {
				$this -> db -> notice_id = "level-acp-main";
			}
		}
	
		public function load() {
			$c = $this -> db -> secure($_GET['c']);
			switch($c) {
				case "form":
					$this -> form();
					break;
				case "edit":
					$this -> edit();
					break;
				default:
					unset($this -> db -> notice_id);
					$this -> db -> output(19);
					break;
			}
		}
		
		private function form() {
			$this -> db -> output_vars["info"] = $this -> settings;
			$this -> db -> cb = "dynamo.level.acp.main";
		}
		
		private function edit() {
			$level = $this -> info["level"];
			$experience = $this -> info["experience"];
			$profile = $this -> info["profile"];
			if(
				!strlen($level) ||
				!strlen($experience) ||
				!strlen($profile) ||
				strlen($level) < 1 ||
				strlen($level) > 32 ||
				strlen($experience) < 1 ||
				strlen($experience) > 32 ||
				$profile < 1 ||
				$profile > 5
			) {
				$this -> form();
			} else {
				$update = $this -> db -> update_module_config(array(
					array("level", "level_name", $level),
					array("level", "exp_name", $experience),
					array("level", "profile_type", $profile)
				));
				$this -> db -> output(
					$update !== false && $this -> db -> mysqli -> affected_rows > 0
						? 2
						: 1
				);
			}
		}
	}
		
?>