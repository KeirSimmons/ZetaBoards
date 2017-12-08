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
				$this -> db -> notice_id = "level-acp-user";
			}
		}
	
		public function load() {
			$c = $this -> db -> secure($_GET['c']);
			switch($c) {
				case "search":
					$this -> search();
					break;
				case "select":
					$this -> select();
					break;
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
		
		private function search() {
			$this -> db -> cb = "dynamo.level.acp.user.search";
		}
		
		private function select() {
			$cid = $this -> cid;
			$user = $this -> info['user'];
			if(
				strlen($user) < 3 ||
				strlen($user) > 32
			) {
				$this -> search();
			} else {
				$per_page = 2;
				$query1 = $this -> db -> query("SELECT COUNT(zbid) FROM users WHERE cid='$cid' AND username LIKE '$user%'",__LINE__,__FILE__);
				$num_rows = $this -> db -> get_result($query1);
				$page = $this -> info["page"];
				$page = strlen($page) ? $page : 1;
				if($num_rows){
					$total_pages = ceil($num_rows / $per_page);
					$page = min(max(1, $page), $total_pages);
					$start = ($page - 1) * $per_page;
					$query2 = $this -> db -> query("SELECT zbid, username FROM users WHERE cid='$cid' AND username LIKE '$user%' ORDER BY length(username) ASC LIMIT $start, $per_page",__LINE__,__FILE__);
					$users = array();
					while($q = $query2 -> fetch_assoc()) {
						$users[] = array(
							"zbid" => $q['zbid'],
							"username" => $q['username']
						);
					}
					$this -> db -> output_vars["info"]["page"] = $page;
					$this -> db -> output_vars["info"]["total_pages"] = $total_pages;
					$this -> db -> output_vars["info"]["users"] = $users;
					$this -> db -> output_vars["info"]["user"] = $user;
					$this -> db -> cb = "dynamo.level.acp.user.choose";
				} else {
					$this -> db -> output(1, array(
						"username" => $user
					));
				}
			}
		}
		
		private function form() {
			$user_zbid = $this -> info["zbid"];
			if(
				!strlen($user_zbid) ||
				$this -> db -> get_user($user_zbid) === false
			) {
				$this -> search();
			} else {
				$user_settings = $this -> db -> users["u-" . $user_zbid]["config"]["level"];
				$this -> db -> output_vars["info"] += array(
					"exp" => $user_settings["experience"],
					"username" => $this -> db -> users["u-" . $user_zbid]["username"],
					"zbid" => $user_zbid
				);
				$this -> db -> cb = "dynamo.level.acp.user.form";
			}
		}
		
		private function edit() {
			$exp = +$this -> info["exp"];
			$user_zbid = +$this -> info["zbid"];
			$user = $this -> db -> get_user($user_zbid, true);
			if(
				!strlen($exp) ||
				!strlen($user_zbid) ||
				$exp < 0 ||
				$user === false
			) {
				$this -> search();
			} else {
				$to_update = array();
				$old = $user["config"]["level"]["experience"];
				$difference = $exp - $old;
				if($difference != 0) {
					$to_update[] = array("level", "experience", $exp, $user_zbid);
					$update = $this -> db -> update_user_config($to_update);
					if($update !== false && $this -> db -> mysqli -> affected_rows > 0) {
						$this -> db -> fire_event("level", "user-exp-edit", array(
							"old" => $old,
							"new" => $exp,
							"zbid" => $user_zbid,
							"difference" => $difference
						));
						$this -> db -> get_user_info();
						$this -> db -> output(3);
					} else {
						$this -> db -> get_user_info();
						$this -> db -> output(2);
					}
				} else {
					$this -> search();
				}
			}
		}
		
	}
		
?>