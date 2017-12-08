<?php
	class page implements iPage {
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> db -> notice_id = "notifications-log";
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
			$this -> settings = $this -> db -> modules["notifications"]["settings"];
			$this -> info = $this -> db -> secure($_GET['info']);
		}
	
		public function load() {
			$c = $this -> db -> secure($_GET['c']);
			switch($c) { // don't use $this -> $c to prevent someone passing in their own c method...
				case "new":
					$this -> logs(0);
					break;
				case "old":
					$this -> logs(1);
					break;
				case "read":
					$this -> read();
					break;
				case "mark_all":
					$this -> mark_all();
					break;
				default:
					unset($this -> db -> notice_id);
					$this -> db -> output(19);
					break;
			}
		}
		
		private function logs($read){
			$cid = $this -> cid;
			$zbid = $this -> zbid;
			$this -> db -> output_vars["info"]["logs"] = array();
			$user = $this -> db -> my;
			$gid = $user["gid"];
			$group = $this -> db -> groups["id-" . $gid];
			$per_page = max(1, $this -> settings["perpage"]);
			$logs = $this -> db -> query("SELECT COUNT(`id`) FROM `notifications` WHERE `cid`='$cid' AND `zbid`='$zbid' AND `read`='$read'",__LINE__,__FILE__);
			$num_rows = $this -> db -> get_result($logs);
			$page = $this -> info["page"];
			$page = strlen($page) ? $page : 1;
			if($num_rows){
				$total_pages = ceil($num_rows / $per_page);
				$page = min(max(1, $page), $total_pages);
				$start = ($page - 1) * $per_page;
				
				$this -> db -> load_module_class("notifications");
				$this -> db -> output_vars["info"]["logs"]
					= $this -> db -> module_class["notifications"] -> load($start, $per_page, $read);
				
				$this -> db -> output_vars["info"]["page"] = +$page;
				$this -> db -> output_vars["info"]["read"] = +$read;
				$this -> db -> output_vars["info"]["total_pages"] = +$total_pages;
				$this -> db -> cb = "dynamo.notifications.logs.show";
			} else {
				$this -> db -> output($read + 1); // 1 for unread, 2 for read
			}
		}
		
		private function read() {
			$id = $this -> info["id"];
			if(
				strlen($id) &&
				$id > 0
			){
				$cid = $this -> cid;
				$zbid = $this -> zbid;
				$query = $this -> db -> query("UPDATE `notifications` SET `read`='1' WHERE `cid`='$cid' AND `zbid`='$zbid' AND `id`='$id' AND `read`='0' LIMIT 1");
				$this -> db -> output(
					$this -> db -> mysqli -> affected_rows == 0
						? 3
						: 4
				);
			} else {
				$this -> logs(0);
			}
		}
		
		private function mark_all() {
			$cid = $this -> cid;
			$zbid = $this -> zbid;
			$query = $this -> db -> query("UPDATE `notifications` SET `read`='1' WHERE `cid`='$cid' AND `zbid`='$zbid' AND `read`='0'");
			$this -> db -> output(
				$this -> db -> mysqli -> affected_rows == 0
					? 5
					: 6
			);
		}
		
	}
		
?>