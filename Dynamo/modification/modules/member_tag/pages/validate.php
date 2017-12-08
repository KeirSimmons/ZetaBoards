<?php
	class page implements iPage {
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> db -> notice_id = "member_tag-validate";
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
			$premium = $this -> db -> premium;
			$max = $premium ? 15 : 2;
			$cid = $this -> db -> cid;
			$users = $this -> info['users'];
			if(count($users) <= $max) {
				$query = $this -> db -> query("SELECT `username` FROM `users` WHERE `username` IN ('" . implode("', '", $users) . "') AND `cid`='$cid'");
				$difference = count($users) - ($query -> num_rows);
				if($difference == 0) {
					$this -> db -> output_vars["info"]["successful"] = true;
				} else {
					$matched = array();
					while($q = $query -> fetch_assoc()) {
						$matched[] = $q["username"];
					}
					$not_matched = array_values(array_udiff($users, $matched, "strcasecmp"));
					$this -> db -> output_vars["info"]["successful"] = false;
					$this -> db -> output_vars["info"]["matched"] = $matched;
					$this -> db -> output_vars["info"]["not_matched"] = $not_matched;
				}
			} else {
				$this -> db -> output_vars["info"]["successful"] = false;
				$this -> db -> output_vars["info"]["matched"] = array();
				$this -> db -> output_vars["info"]["not_matched"] = array();
			}
			$this -> db -> cb = "dynamo.member_tag.afterload.validate";
		}
		
	}
?>