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
				$this -> db -> notice_id = "level-acp-reset";
			}
		}
	
		public function load() {
			$c = $this -> db -> secure($_GET['c']);
			switch($c) {
				case "confirm":
					$this -> confirm();
					break;
				case "confirmed":
					$this -> confirmed();
					break;
				default:
					unset($this -> db -> notice_id);
					$this -> db -> output(19);
					break;
			}
		}
		
		private function confirm() {
			$this -> db -> cb = "dynamo.level.acp.reset.confirm";
		}
		
		private function confirmed() {
			$cid = $this -> cid;
			$this -> db -> query("DELETE a FROM `user_config` a LEFT JOIN `user_settings` b on b.`id`=a.`sid` WHERE a.`cid`='$cid' AND b.`mid`='level' AND b.`name`='experience'");
			$this -> db -> output(1);
		}
	}
		
?>