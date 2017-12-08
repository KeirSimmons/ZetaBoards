<?php
	class page implements iPage {
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
			$this -> user_settings = $this -> db -> my["config"]["post"]; // settings specific to user
			$this -> group_settings = $this -> db -> groups["id-" . $this -> db -> my["gid"]]["config"]["post"]; // settings specific to user's group
			$this -> settings = $this -> db -> modules["post"]["settings"]; // settings specific to module
			$this -> info = $this -> db -> secure($_GET['info']);
			if($this -> db -> groups["id-" . $this -> db -> my["gid"]]["admin"] == 0) {
				$this -> db -> output(18);
			} else {
				$this -> db -> notice_id = "post-acp-current";
			}
		}
	
		public function load() {
			$c = $this -> db -> secure($_GET['c']);
			switch($c) {
				case "form":
					$this -> form();
					break;
				case "create":
					$this -> create();
					break;
				case "end":
					$this -> end();
					break;
				default:
					unset($this -> db -> notice_id);
					$this -> db -> output(19);
					break;
			}
		}
		
		private function form() {
			$cid = $this -> cid;
			$end = $this -> settings["active"];
			$time_left = max(0, $end - time());
			if($end != 0 && $time_left > 0) {
				$query = $this -> db -> query("SELECT SUM(`value`) total_posts, COUNT(`zbid`) participants FROM `user_config` WHERE `sid`=(SELECT `id` FROM `user_settings` WHERE `mid`='post' AND `name`='posts') AND `cid`='$cid'");
				$this -> db -> output_vars["info"]["time_left"] = $time_left;
				$this -> db -> output_vars["info"]["total_posts"] = $this -> db -> get_result($query, 0, 0);
				$this -> db -> output_vars["info"]["participants"] = $this -> db -> get_result($query, 0, 1);
				$this -> db -> cb = "dynamo.post.acp.current.on.early";
			} elseif($end != 0) {
				$this -> end();
			} else {
				$this -> db -> cb = "dynamo.post.acp.current.off.form";
			}
		}
		
		private function create() {
			$end = $this -> settings["active"];
			$time_left = max(0, $end - time());
			$end_date = +$this -> info["end_date"];
			if(
				$time_left > 0 ||
				$end != 0 ||
				!strlen($end_date) ||
				$end_date < 1
			) {
				$this -> form();
			} else {
				$cid = $this -> cid;
				$end_date += time();
				$create = $this -> db -> update_module_config(array(
					array("post", "active", $end_date)
				));
				$this -> db -> output(
					$create !== false && $this -> db -> mysqli -> affected_rows > 0
						? 2
						: 1
				);
			}
		}
		
		private function end() {
			$cid = $this -> cid;
			$end = $this -> settings["active"];
			$time_left = max(0, $end - time());
			if($end == 0) {
				$this -> form();
			} else {
				$query = $this -> db -> query("SELECT a.* FROM `user_config` a, (SELECT `id` FROM `user_settings` WHERE `mid`='post' AND `name`='points') s WHERE a.`sid`=s.`id` AND a.`cid`='$cid' ORDER BY a.`value` * 1 DESC");
				$winners = array();
				$zbids = array();
				while($q = $query -> fetch_assoc()) {
					$winners["u-" . $q['zbid']] = array(
						"zbid" => $q['zbid'],
						"points" => $q['value']
					);
					$user = $this -> db -> get_user($q['zbid'], false);
					if($user !== false) {
						$winners["u-" . $q['zbid']]["username"] = $user['username'];
					} else {
						$zbids[] = $q['zbid'];
					}
				}
				if(count($zbids)) {
					$this -> db -> get_users($zbids);
					foreach($zbids as $u) {
						$user = $this -> db -> get_user($u, false);
						$winners["u-" . $u]["username"] = $user['username'];
					}
				}
				$reset = $this -> db -> query("DELETE FROM `user_config` WHERE `sid` IN (SELECT `id` FROM `user_settings` WHERE `mid`='post') AND `cid`='$cid'");
				$this -> db -> update_module_config(array(
					array("post", "active", 0)
				));
				$this -> db -> output_vars["info"]["winners"] = $winners;
				$this -> db -> cb = "dynamo.post.acp.current.ended";
			}
		}
		
	}
		
?>