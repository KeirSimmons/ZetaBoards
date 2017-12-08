<?php

	class post_events implements iEvent {
		
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
			$this -> gid = $this -> db -> my["gid"];
			$this -> settings = $this -> db -> modules["post"]["settings"];
			$this -> group_settings = $this -> db -> groups["id-" . $this -> gid]["config"]["post"];
			$this -> user_settings = $this -> db -> my["config"]["post"];
		}
		
		public function ini() {
		
			$that = $this;
			
			/* CORE EVENTS */
			
			$this -> db -> events["core"]["posted"][] = function($data) use ($that) {
				// increase post count
				// checks have already been done to ensure this is a real post
				$active = max(0, $that -> settings["active"] - time());
				if($active != 0) {
					$gid = $that -> db -> my["gid"];
					$settings = $that -> db -> groups["id-" . $gid]["config"]["post"];
					$extra = $settings["points"];
					$user_settings = $that -> db -> my["config"]["post"];
					$points = $user_settings["points"];
					$posts = $user_settings["posts"];
					$that -> db -> update_user_config(array(
						array("post", "points", $points + $extra),
						array("post", "posts", $posts + 1)
					));
				}
			};
			
			$this -> db -> events["core"]["output"][] = function($data) use ($that) {
				$active = max(0, $that -> settings["active"] - time());
				if($active != 0) {
					$cid = $that -> cid;
					$zbid = $that -> zbid;
					if($that -> settings["alert"] == 1 && $that -> db -> premium == 1) {
						// send alert if position has changed
						$query_me = $that -> db -> query("SELECT b.`position` FROM (SELECT @rownum:=@rownum+1 position, a.* FROM `user_config` a, (SELECT @rownum:=0) r, (SELECT `id` FROM `user_settings` WHERE `mid`='post' AND `name`='points') s WHERE a.`sid`=s.`id` AND a.`cid`='$cid' ORDER BY a.`value` * 1 DESC) b WHERE b.`zbid` = '$zbid' LIMIT 1");
						$current_position = $that -> user_settings["current_position"];
						$new_position = $query_me -> num_rows == 1 ? $that -> db -> get_result($query_me, 0) : 0;
						$difference = $new_position - $current_position;
						if($difference != 0) {
							$that -> db -> update_user_config(array(
								array('post', 'current_position', $new_position)
							));
							$that -> db -> fire_event("post", "position_change", array(
								"old" => $current_position,
								"new" => $new_position,
								"diff" => $difference
							));
						}
					}
				}
			};
			
			/* CORE EVENTS */
			
		}
		
	}

?>