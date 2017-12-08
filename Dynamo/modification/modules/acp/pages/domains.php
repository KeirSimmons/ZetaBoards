<?php
	class page implements iPage {
	
		private $info;
	
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> db -> notice_id = "acp-domains";
			$this -> cid = $this -> db -> cid;
			$this -> info = $this -> db -> secure($_GET['info']);
			$this -> domains = explode(",", $this -> db -> settings["domains"]);
		}
	
		public function load() {
			$c = $this -> db -> secure($_GET['c']);
			switch($c) { // don't use $this -> $c to prevent someone passing in their own c method...
				case "list":
					$this -> full_list();
					break;
				case "add":
					$this -> add();
					break;
				case "edit":
					$this -> edit();
					break;
				case "remove":
					$this -> remove();
					break;
				default:
					unset($this -> db -> notice_id);
					$this -> db -> output(19);
					break;
			}
		}
		
		private function clean($url) {
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
		
		private function full_list() {
			$this -> db -> cb = "dynamo.acp.domains.full_list";
			$this -> db -> output_vars["info"]["domains"] = $this -> domains;
		}
		
		private function add() {
			$cid = $this -> cid;
			$addr = $this -> info["addr"];
			if(strlen($addr)) {
				$addr_info = $this -> clean($addr);
				$addr = $addr_info["url"];
				$zb = $addr_info["zb"];
				if($addr !== false) {
					// address has been stripped now check if alr in database
					foreach($this -> domains as &$d) {
						if($d == $addr) {
							$d = "";
						}
					}
					if(count(array_filter($this -> domains, 'strlen')) == count($this -> domains)) { // domain not alr added by own forum
						if($zb == 2) {
							// insert (if domain alr added it wont insert)
							$query = $this -> db -> query("INSERT INTO domains (`cid`, `zb`, `domain`) VALUES('$cid', '$zb', '$addr')");
							if($this -> db -> mysqli -> affected_rows > 0) { // inserted
								$this -> db -> output(6);
							} else {
								$this -> db -> output(5);
							}
						} else { // trying to add another zb domain
							$this -> db -> output(9);
						}
					} else {
						$this -> db -> output(3);
					}
				} else {
					$this -> db -> output(2);
				}
			} else {
				$this -> db -> output(2);
			}
		}
		
		private function edit() {
			$cid = $this -> cid;
			$new_addr = $this -> info["new_addr"];
			$old_addr = $this -> info["old_addr"];
			if(strlen($new_addr) && strlen($old_addr)) {
				$new_addr_info = $this -> clean($new_addr);
				$old_addr_info = $this -> clean($old_addr);
				$new_addr = $new_addr_info["url"];
				$new_zb = $new_addr_info["zb"];
				$old_addr = $old_addr_info["url"];
				$old_zb = $old_addr_info["zb"];
				$current_info = $this -> clean($this -> db -> url);
				if($new_addr !== false) {
					if($new_addr != $old_addr) {
						if($current_info["url"] != $old_addr) {
							// address has been stripped now check if alr in database
							foreach($this -> domains as &$d) {
								if($d == $new_addr) {
									$d = "";
								}
							}
							if(count(array_filter($this -> domains, 'strlen')) == count($this -> domains)) { // domain not alr added by own forum
								if($new_zb == $old_zb) {
									// insert (if domain alr added it wont insert)
									$query = $this -> db -> query("UPDATE domains SET `domain`='$new_addr' WHERE `domain`='$old_addr' AND `cid`='$cid' LIMIT 1");
									if($this -> db -> mysqli -> affected_rows > 0) { // edited
										$this -> db -> output(12);
									} else {
										$this -> db -> output(11);
									}
								} elseif($new_zb != $old_zb && $new_zb == 1) {
									$this -> db -> output(9); // trying to add another zb domain
								} else { // $new_zb == 2, $old_zb == 1
									$this -> db -> output(10); // trying to remove zb domain
								}
							} else {
								$this -> db -> output(3);
							}
						} else {
							$this -> db -> output(16);
						}
					} else {
						$this -> db -> output(8);
					}	
				} else {
					$this -> db -> output(2);
				}
			} else {
				$this -> db -> output(11);
			}
		}
		
		private function remove() {
			$cid = $this -> cid;
			$addr = $this -> info["addr"];
			if(strlen($addr)) {
				$addr_info = $this -> clean($addr);
				$addr = $addr_info["url"];
				$zb = $addr_info["zb"];
				$current_info = $this -> clean($this -> db -> url);
				if($zb == 2) {
					if($current_info["url"] != $addr) {
						$query = $this -> db -> query("DELETE FROM `domains` WHERE `domain`='$addr' AND `cid`='$cid' LIMIT 1");
						if($this -> db -> mysqli -> affected_rows > 0) { // deleted
							$this -> db -> output(14);
						} else {
							$this -> db -> output(13);
						}
					} else {
						$this -> db -> output(15);
					}
				} else {
					$this -> db -> output(10); // trying to remove zb domain
				}
			} else {
				$this -> db -> output(13);
			}
		}
		
	}
?>