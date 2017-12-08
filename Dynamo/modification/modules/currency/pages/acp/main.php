<?php
	class page implements iPage {
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
			$this -> user_settings = $this -> db -> my["config"]["currency"]; // settings specific to user
			$this -> group_settings = $this -> db -> groups["id-" . $this -> db -> my["gid"]]["config"]["currency"]; // settings specific to user's group
			$this -> settings = $this -> db -> modules["currency"]["settings"]; // settings specific to module
			$this -> info = $this -> db -> secure($_GET['info']);
			if($this -> db -> groups["id-" . $this -> db -> my["gid"]]["admin"] == 0) {
				$this -> db -> output(18);
			} else {
				$this -> db -> notice_id = "currency-acp-main";
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
			$this -> db -> cb = "dynamo.currency.acp.main";
		}
		
		private function edit() {
			$name = $this -> info["name"];
			$symbol = $this -> info["symbol"]; // optional (can be empty)
			$history_perpage = +$this -> info["history_perpage"];
			$profile = +$this -> info["profile"];
			if(
				!strlen($name) ||
				!strlen($history_perpage) ||
				!strlen($profile) ||
				strlen($name) < 3 ||
				strlen($name) > 32 ||
				strlen($symbol) > 10 ||
				$history_perpage < 1 ||
				$history_perpage > 10 ||
				$profile < 0 ||
				$profile > 1
			) {
				$this -> form();
			} else {
				$update = $this -> db -> update_module_config(array(
					array("currency", "name", $name),
					array("currency", "symbol", $symbol),
					array("currency", "history_perpage", $history_perpage),
					array("currency", "profile", $profile)
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