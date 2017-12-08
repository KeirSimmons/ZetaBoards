<?php
	class page implements iPage {
	
		private $info;
	
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> db -> notice_id = "acp-users-refresh";
			$this -> cid = $this -> db -> cid;
			$this -> info = $this -> db -> secure($_GET['info']);
		}
	
		public function load() {
			$c = $this -> db -> secure($_GET['c']);
			switch($c) { // don't use $this -> $c to prevent someone passing in their own c method...
				case "list":
					$this -> full_list();
					break;
				case "request_pin":
					$this -> request_pin();
					break;
				default:
					unset($this -> db -> notice_id);
					$this -> db -> output(19);
					break;
			}
		}
		
		private function full_list() {
			$cid = $this -> cid;
			$per_page = 5;
			$to_refresh = $this -> db -> query("SELECT COUNT(`zbid`) FROM `users` WHERE `setup`='3' AND `cid`='$cid'");
			$num_rows = $this -> db -> get_result($to_refresh);
			$page = $this -> info["page"];
			$page = isset($page) ? $page : 1;
			if($num_rows){
				$total_pages = ceil($num_rows / $per_page);
				$page = min(max(1, $page), $total_pages);
				$start = ($page - 1) * $per_page;
				$to_refresh2 = $this -> db -> query("SELECT `zbid`, `username` FROM `users` WHERE cid='$cid' AND `setup`='3' LIMIT $start, $per_page",__LINE__,__FILE__);
				while($user = $to_refresh2 -> fetch_assoc()) {
					$this -> db -> output_vars["info"]["users"][] = $user;
				}
				$this -> db -> output_vars["info"]["page"] = $page;
				$this -> db -> output_vars["info"]["total_pages"] = $total_pages;
				$this -> db -> cb = "dynamo.acp.refresh.full_list";
			} else {
				$this -> db -> output(2);
			}
		}
		
		private function request_pin() {
			$user = $this -> db -> users["u-" . $this -> info["user"]];
			$zbid = $user["zbid"];
			if(isset($user) && $user["setup"] == 3) {
				$pin = rand(1000, 9999);
				$query = $this -> db -> query("UPDATE `users` SET `setup_pin`='$pin', `setup_first_try`='0', `setup_tries`='0', `setup`='2' WHERE `zbid`='$zbid' LIMIT 1");
				$this -> db -> output_vars["info"]["pin"] = $pin;
				$this -> db -> output_vars["info"]["user"] = array(
					"zbid" => $user["zbid"],
					"username" => $user["username"]
				);
				$this -> db -> cb = "dynamo.acp.refresh.finish";
			} else {
				$this -> full_list();
			}
		}
		
	}
?>