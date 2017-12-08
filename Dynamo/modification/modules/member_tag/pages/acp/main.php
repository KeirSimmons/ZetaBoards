<?php
	class page implements iPage {
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
			$this -> user_settings = $this -> db -> my["config"]["member_tag"]; // settings specific to user
			$this -> group_settings = $this -> db -> groups["id-" . $this -> db -> my["gid"]]["config"]["member_tag"]; // settings specific to user's group
			$this -> settings = $this -> db -> modules["member_tag"]["settings"]; // settings specific to module
			$this -> info = $this -> db -> secure($_GET['info']);
			if($this -> db -> groups["id-" . $this -> db -> my["gid"]]["admin"] == 0) {
				$this -> db -> output(18);
			} else {
				$this -> db -> notice_id = "member_tag-acp-main";
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
			$this -> db -> cb = "dynamo.member_tag.acp.main";
		}
		
		private function edit() {
			$tag = $this -> info["tag"];
			if(
				!strlen($tag) ||
				strlen($tag) < 11 ||
				strlen($tag) > 42 ||
				!(preg_match("/^.+%USERNAME%/", $tag) || preg_match("/%USERNAME%.+$/", $tag))
			) {
				$this -> form();
			} else {
				$update = $this -> db -> update_module_config(array(
					array("member_tag", "tag", $tag)
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