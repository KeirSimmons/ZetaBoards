<?php
	class page implements iPage {
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> db -> notice_id = "notifications-log";
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
			$this -> settings = $this -> db -> modules["notifications"]["settings"];
			$this -> my_settings = $this -> db -> my["config"]["notifications"];
			$this -> info = $this -> db -> secure($_GET['info']);
		}
	
		public function load() {
			$c = $this -> db -> secure($_GET['c']);
			switch($c) { // don't use $this -> $c to prevent someone passing in their own c method...
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
			$this -> db -> load_module_class("notifications");
			$this -> db -> output_vars["info"] = $this -> my_settings;
			$this -> db -> output_vars["info"] += array(
				"max" => $this -> db -> module_class["notifications"] -> get_max_perpage()
			);
			$this -> db -> output_vars["cb"] = "dynamo.notifications.settings.form";
		}
		
		private function edit() {
			$this -> db -> load_module_class("notifications");
			$max = $this -> db -> module_class["notifications"] -> get_max_perpage();
			$perpage = $this -> info["perpage"];
			if(
				!strlen($perpage) ||
				$perpage < 0 ||
				$perpage > $max
			) {
				$this -> form();
			} else {
				$update = $this -> db -> update_user_config(array(
					array("notifications", "perpage", $perpage)
				));
				$this -> db -> output(
					$update !== false && $this -> db -> mysqli -> affected_rows > 0
						? 8
						: 7
				);
			}
		}
		
	}
		
?>