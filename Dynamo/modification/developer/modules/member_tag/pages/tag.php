<?php
	class page implements iPage {
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> db -> notice_id = "member_tag-tag";
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
			$this -> settings = $this -> db -> modules["member_tag"]["settings"];
			$this -> user_settings = $this -> db -> my["config"]["member_tag"]; // settings specific to user
			$this -> group_settings = $this -> db -> groups["id-" . $this -> db -> my["gid"]]["config"]["member_tag"]; // settings specific to user's group
			$this -> info = $this -> db -> secure($_GET['info']);
		}
	
		public function load() {
			$this -> ini();
		}
		
		private function ini() {
			$cid = $this -> db -> cid;
			$users = $this -> info ["users"];
			$tid = $this -> info ["tid"];
			$pid = $this -> info ["pid"];
			$query = $this -> db -> query("SELECT `zbid` FROM `users` WHERE `username` IN ('" . implode("', '", $users) . "') AND `cid`='$cid'");
			$matched = array();
			while($q = $query -> fetch_assoc()) {
				$matched[] = array(
					$q["zbid"],
					$this -> db -> my["username"]
				);
			}
			$this -> db -> fire_event("member-tag", "tag", array(
				$tid, $pid, $matched
			));
			$this -> db -> cb = "dynamo.member_tag.afterload.tagged";
		}
		
	}
?>