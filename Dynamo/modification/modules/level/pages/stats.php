<?php
	class page implements iPage {
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> db -> notice_id = "level-stats";
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
			$this -> user_settings = $this -> db -> my["config"]["level"]; // settings specific to user
			$this -> group_settings = $this -> db -> groups["id-" . $this -> db -> my["gid"]]["config"]["level"]; // settings specific to user's group
			$this -> settings = $this -> db -> modules["level"]["settings"]; // settings specific to module
			$this -> info = $this -> db -> secure($_GET['info']);
		}
	
		public function load() {
			$this -> ini();
		}
		
		private function ini() {
			$exp = $this -> user_settings["experience"];
			$this -> db -> load_module_class("level");
			$this -> db -> output_vars["info"] += $this -> db -> module_class["level"] -> get_info($exp);
			$this -> db -> cb = "dynamo.level.stats";
		}
		
	}
		
?>