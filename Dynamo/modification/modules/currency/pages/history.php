<?php
	class page implements iPage {
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> db -> notice_id = "currency-history";
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
			$this -> settings = $this -> db -> modules["currency"]["settings"];
			$this -> info = $this -> db -> secure($_GET['info']);
		}
	
		public function load() {
			$c = $this -> db -> secure($_GET['c']);
			switch($c) {
				case "show":
					$this -> show();
					break;
				case "message":
					$this -> message();
					break;
				default:
					unset($this -> db -> notice_id);
					$this -> db -> output(19);
					break;
			}
		}
		
		private function show(){
			$cid = $this -> cid;
			$zbid = $this -> zbid;
			$this -> db -> output_vars["info"]["history"] = array();
			$user_zbid = isset($this -> info["user_zbid"]) && $this -> db -> premium ? $this -> info["user_zbid"] : $zbid;
			$_user = $this -> db -> get_user($user_zbid, true);
			if($_user !== false){
				$per_page = max(1, $this -> settings["history_perpage"]);
				$history = $this -> db -> query("SELECT COUNT(`id`) FROM `currency_history` WHERE `cid`='$cid' AND `zbid`='$user_zbid'");
				$num_rows = $this -> db -> get_result($history);
				$page = $this -> info["page"];
				$page = strlen($page) ? $page : 1;
				if($num_rows){
					$total_pages = ceil($num_rows / $per_page);
					$page = min(max(1, $page), $total_pages);
					$start = ($page - 1) * $per_page;
					$history2 = $this -> db -> query("SELECT id, type, amount, data_zbid, time, message FROM currency_history WHERE cid='$cid' AND zbid='$user_zbid' ORDER BY time DESC LIMIT $start, $per_page");
					$zbids = array();
					$log = array();
					$to_find = array();
					
					while($h = $history2 -> fetch_assoc()){
						if($h['data_zbid'] !== null) {
							$user = $this -> db -> get_user($h['data_zbid']);
							if($user === false) {
								if(!in_array($h['data_zbid'], $zbids)) {
									$zbids[] = $h['data_zbid'];
								}
								$to_find["id-" . $h['data_zbid']][] = $h;
								continue;
							} else {
								$h['username'] = $user['username'];
							}
						}
						$log[] = $h;
					}
					
					if(!empty($zbids)) {
						$this -> db -> get_users($zbids);
						foreach($zbids as $z) {
							$user = $this -> db -> get_user($z);
							if($user !== false) {
								foreach($to_find["id-" . $z] as $t) {
									$t['username'] = $user["username"];
									$log[] = $t;
								}
							} else {
								foreach($to_find["id-" . $z] as $t) {
									$t['username'] = "Unknown user";
									$log[] = $t;
								}
							}
							unset($to_find["id-" . $z]);
						}
					}
					
					usort($log, function($a, $b) {
						// show most recent first
						return $b["time"] - $a["time"];
					});
					
					$this -> db -> output_vars["info"]["history"] = $log;
					$this -> db -> output_vars["info"]["page"] = $page;
					$this -> db -> output_vars["info"]["total_pages"] = $total_pages;
					$this -> db -> output_vars["info"]["user_zbid"] = $user_zbid;
					$this -> db -> output_vars["info"]["users_name"] = $_user["username"];
					$this -> db -> cb = "dynamo.currency.history.show";
				} else {
					$this -> db -> output(4);
				}
			} else { //user does not exist
				$this -> db -> output(3);
			}
		}
		
		private function message() {
			$cid = $this -> cid;
			$zbid = $this -> zbid;
			$id = $this -> info["id"];
			if(strlen($id)) {
				$query = $this -> db -> query("SELECT message FROM currency_history WHERE id='$id' AND cid='$cid' AND (zbid='$zbid' OR data_zbid='$zbid') LIMIT 1", __LINE__, __FILE__);
				if($query -> num_rows == 1){
					$this -> db -> output_vars["info"]["message"] = $this -> db -> get_result($query);
					$this -> db -> output_vars["info"]["id"] = $id;
					$this -> db -> cb = "dynamo.currency.history.message.show";
				} else {
					$this -> db -> output(2);
				}
			} else {
				$this -> db -> output(2);
			}
		}
		
	}
?>