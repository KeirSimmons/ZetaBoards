<?php
	class page implements iPage {
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
			$this -> settings = $this -> db -> modules["online"]["settings"]; // settings specific to module
			$this -> info = $this -> db -> secure($_GET['info']);
			$this -> db -> load_module_class("online");
			$this -> config = $this -> db -> module_class["online"] -> config;
			if($this -> db -> groups["id-" . $this -> db -> my["gid"]]["admin"] == 0) {
				$this -> db -> output(18);
			} else {
				$this -> db -> notice_id = "online-acp-main";
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
			$this -> db -> output_vars["info"] += array("max_period" => $this -> config["period"][$this -> db -> premium]);
			$this -> db -> cb = "dynamo.online.acp.main";
		}
		
		private function edit() {
			$title = $this -> info["title"];
			$period = $this -> info["period"];
			$img = $this -> info["img"];
			if(
				!strlen($title) ||
				!strlen($period) ||
				!strlen($img) ||
				strlen($title) < 1 ||
				strlen($title) > 32 ||
				strlen($img) < 16 ||
				strlen($img) > 100 ||
				$period < 1
			) {
				$this -> form();
			} else {
				$update = $this -> db -> update_module_config(array(
					array("online", "title", $title),
					array("online", "period", min($period, $this -> config["period"][$this -> db -> premium])),
					array("online", "img", $img)
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