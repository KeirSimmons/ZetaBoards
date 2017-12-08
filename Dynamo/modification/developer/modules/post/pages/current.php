<?php
	class page implements iPage {
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> db -> notice_id = "post-current";
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
			$this -> settings = $this -> db -> modules["post"]["settings"];
			$this -> info = $this -> db -> secure($_GET['info']);
		}
	
		public function load() {
			$this -> ini();
		}
		
		private function ini() {
			$end = $this -> settings["active"];
			$active = max(0, $end - time());
			if($end == 0) {
				$this -> db -> output(1);
			} else {
				$zbid = $this -> zbid;
				$cid = $this -> cid;
				$query_table = $this -> db -> query("SELECT a.* FROM `user_config` a, (SELECT `id` FROM `user_settings` WHERE `mid`='post' AND `name`='points') s WHERE a.`sid`=s.`id` AND a.`cid`='$cid' ORDER BY a.`value` * 1 DESC LIMIT 5");
				
				$users = array();
				$leaderboard = array();
				while($q = $query_table -> fetch_assoc()) {
					$user = $this -> db -> get_user($q['zbid'], false);
					if($user === false) {
						$users[] = $q['zbid'];
					} else {
						$q['points'] = $this -> db -> users["u-" . $q['zbid']]["config"]["post"]["points"];
						$q['username'] = $user["username"];
					}
					$leaderboard["u-" . $q['zbid']] = $q;
				}
				
				if(count($users)) {
					$this -> db -> get_users($users);
					foreach($users as $u) {
						$user = $this -> db -> get_user($u, false);
						$leaderboard["u-" . $u]["username"] = $user["username"];
						$leaderboard["u-" . $u]["points"] = $this -> db -> users["u-" . $u]["config"]["post"]["points"];
					}
				}
				
				$this -> db -> output_vars["info"]["leaderboard"] = $leaderboard;
				
				$query_me = $this -> db -> query("SELECT b.`position` FROM (SELECT @rownum:=@rownum+1 position, a.* FROM `user_config` a, (SELECT @rownum:=0) r, (SELECT `id` FROM `user_settings` WHERE `mid`='post' AND `name`='points') s WHERE a.`sid`=s.`id` AND a.`cid`='$cid' ORDER BY a.`value` * 1 DESC) b WHERE b.`zbid` = '$zbid' LIMIT 1");
				$this -> db -> output_vars["info"]["position"] = $this -> db -> get_result($query_me, 0);
				$this -> db -> output_vars["info"]["points"] = $this -> db -> my["config"]["post"]["points"];
				$this -> db -> output_vars["info"]["ended"] = $active == 0;
				$this -> db -> cb = "dynamo.post.current";
			}
		}
	}
		
?>