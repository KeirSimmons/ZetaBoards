<?php
	
	class BoardTools {
	
		private $cid = false;
		private $mid, $url, $gid;
		private $can_delete = false;
	
		public function __construct() {
			global $database;
			if((FROM == "tasks" || FROM == "web" || FROM == "core" || FROM == "guest") && isset($database)) {
				$this -> db = $database;
			} else {
				die("Authentication error");
			}
		}
		
		public function clean($url) {
			$link_info = parse_url($url);
			$url = $link_info["host"];
			$url = preg_replace('/^www[\s|\d]?\./', "", $url);
			$url = preg_replace('/^[s|z|w]?(\d{1,2}\.zetaboards.com)$/', "$1", $url, -1, $count); // ? after [s|z] as after insertion, url no longer includes s or z
			if($count > 0) { // zetaboards address!
				$dirs = array_values(
					array_filter(
						explode("/", $link_info["path"]),
						'strlen'
					)
				);
				if(empty($dirs)) {
					return false;
				} else {
					$url .= "/" . $dirs[0];
				}
			}
			return array(
				"url" => $url,
				"zb" => (2 - $count) // $count == 1 -> 1 (zb), $count == 2 -> 2 (custom)
			);
		}
		
		public function exists($url, $gid, $mid) { // returns cid if it exists, otherwise false
			$this -> url = $this -> clean($url);
			$url = $this -> url["url"];
			$this -> mid = $mid;
			$this -> gid = $gid;
			$check_core = $this -> db -> query("SELECT `id` FROM `core` WHERE `zbid`='$mid' LIMIT 1");
				if($check_core -> num_rows == 1) { $this -> cid = $this -> db -> get_result($check_core); return true; }
			$check_domains = $this -> db -> query("SELECT `cid` FROM `domains` WHERE `domain`='$url' LIMIT 1");
				if($check_domains -> num_rows == 1) { $this -> cid = $this -> db -> get_result($check_domains); return true; }
			$check_groups = $this -> db -> query("SELECT `cid` FROM `groups` WHERE `id`='$gid' LIMIT 1");
				if($check_groups -> num_rows == 1) { $this -> cid = $this -> db -> get_result($check_groups); return true; }
			$check_users = $this -> db -> query("SELECT `cid` FROM `users` WHERE `zbid`='$mid' LIMIT 1");
				if($check_users -> num_rows == 1) { $this -> cid = $this -> db -> get_result($check_users); return true; }
			$this -> cid = false;
			return false;
		}
		
		public function can_delete($force = false) { // returns true if # of users <= 1
			$cid = $this -> cid;
			if($cid !== false) {
				if($force) {
					$this -> can_delete = true;
					return true;
				}
				$check_users = $this -> db -> query("SELECT COUNT(*) FROM `users` WHERE `cid`='$cid'");
				if($this -> db -> get_result($check_users) > 1) {
					$this -> can_delete = false;
					return false;
				} else {
					$this -> can_delete = true;
					return true;
				}
			} else {
				die("CID not yet found. Run `exists`");
			}
		}
		
		public function delete($pw = "") {
			$cid = $this -> cid;
			if($cid !== false) {
				if($this -> can_delete || $pw == "Z;3P08-cJ_|*=tE") {
					$delete_core = $this -> db -> query("DELETE FROM `core` WHERE `id`='$cid' LIMIT 1");
					$delete_domains = $this -> db -> query("DELETE FROM `domains` WHERE `cid`='$cid'");
					$delete_groups = $this -> db -> query("DELETE FROM `groups` WHERE `cid`='$cid'");
					$delete_users = $this -> db -> query("DELETE FROM `users` WHERE `cid`='$cid'");
					$delete_user_config = $this -> db -> query("DELETE FROM `user_config` WHERE `cid`='$cid'");
					$delete_module_config = $this -> db -> query("DELETE FROM `module_config` WHERE `cid`='$cid'");
					$delete_module_installed = $this -> db -> query("DELETE FROM `module_installed` WHERE `cid`='$cid'");
					// delete non core info:
					$delete_currency_history = $this -> db -> query("DELETE FROM `currency_history` WHERE `cid`='$cid'");
					$delete_lotteries = $this -> db -> query("DELETE FROM `lotteries` WHERE `cid`='$cid'");
					$delete_lottery_tickets = $this -> db -> query("DELETE FROM `lottery_tickets` WHERE `cid`='$cid'");
					$delete_notifications = $this -> db -> query("DELETE FROM `notifications` WHERE `cid`='$cid'");
					return true;
				} else {
					die("Permission denied. Cannot delete forum.");
				}
			} else {
				die("CID not yet found. Run `exists`");
			}
		}
		
		public function install() {
			$cid = $this -> cid;
			$mid = $this -> mid;
			$gid = $this -> gid;
			$domain = $this -> url["url"];
			$zb = $this -> url["zb"];
			if($cid === false) {
				$time = time();
				$core = $this -> db -> query("INSERT INTO `core` (`zbid`, `registered`) VALUES('$mid', '$time')", true);
				$core = $this -> db -> mysqli -> insert_id;
				if($this -> db -> mysqli -> affected_rows > 0) {
					$domain = $this -> db -> query("INSERT INTO `domains` (`cid`, `zb`, `domain`) VALUES('$core', '$zb', '$domain')", true);
					$domain = $this -> db -> mysqli -> insert_id;
					if($this -> db -> mysqli -> affected_rows > 0) {
						$group = $this -> db -> query("INSERT INTO `groups` (`id`, `cid`, `admin`) VALUES('$gid', '$core', '2')", true);
						$group = $this -> db -> mysqli -> insert_id;
						if($this -> db -> mysqli -> affected_rows > 0) {
							$password = $this -> db -> password();
							$ip = $_SERVER['REMOTE_ADDR'];
							$user = $this -> db -> query("INSERT INTO `users` (`zbid`, `cid`, `gid`, `username`, `password`, `ip`, `registered`) VALUES('$mid', '$core', '$gid', '$username', '$password', '$ip', '$time')");
							$user = $this -> db -> mysqli -> insert_id;
							if($this -> db -> mysqli -> affected_rows > 0) {
								die(json_encode(array(
									"cid" => $core
								)));
							} else {
								die(json_encode(array(
									"error" => 7
								)));
							}
						} else {
							die(json_encode(array(
								"error" => 6
							)));
						}
					} else {
						die(json_encode(array(
							"error" => 5
						)));
					}
				} else {
					die(json_encode(array(
						"error" => 4
					)));
				}
			} else {
				die(json_encode(array(
					"error" => 3
				)));
			}
		}
		
	}
?>