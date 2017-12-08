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
				$this -> db -> notice_id = "level-acp-progression";
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
			$this -> db -> cb = "dynamo.level.acp.progression";
		}
		
		private function edit() {
			$type = $this -> info["type"];
			$max_level = $this -> info["max_level"];
			$max_exp = $this -> info["max_exp"];
			if(
				!strlen($type) ||
				!strlen($max_level) ||
				!strlen($max_exp) ||
				$type < 1 ||
				$type > 3 ||
				$max_level < 1 ||
				$max_exp < 0
			) {
				$this -> form();
			} else {
				$update = $this -> db -> update_module_config(array(
					array("level", "type", $type),
					array("level", "max_level", $max_level),
					array("level", "max_exp", $max_exp)
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