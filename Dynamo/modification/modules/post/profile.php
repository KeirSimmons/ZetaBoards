<?php
	class post_profile implements iProfile {
		public function __construct() {
			global $database;
			$this -> db = $database;
		}
		
		public function get() {
			if($this -> db -> modules["post"]["settings"]["active"] != 0) {
				$cid = $this -> db -> cid;
				if($this -> db -> modules["post"]["settings"]["profile"] == 1) {
					$users = array();
					foreach($this -> db -> output_vars["users"] as $u) {
						$users[] = $u['zbid'];
					}
					$users = implode(", ", $users);
					$query = $this -> db -> query("SELECT b.`position`, b.`zbid`, b.`value` AS `points` FROM (SELECT @rownum:=@rownum+1 position, a.* FROM `user_config` a, (SELECT @rownum:=0) r, (SELECT `id` FROM `user_settings` WHERE `mid`='post' AND `name`='points') s WHERE a.`sid`=s.`id` AND a.`cid`='$cid' ORDER BY a.`value` * 1 DESC) b WHERE b.`zbid` IN ($users)");
					while($q = $query -> fetch_assoc()) {
						$this -> db -> users["u-" . $q["zbid"]]["config"]["post"]["position"] = $q['position'];
					}
					foreach($this -> db -> output_vars["users"] as &$user) {
						$settings = $this -> db -> users["u-" . $user["zbid"]]["config"]["post"];
						$user["config"]["post"] = array(
							"points" => $settings["points"],
							"position" => isset($settings["position"]) ? $settings["position"] : 0
						);
					}
				}
			}
		}
	}
?>