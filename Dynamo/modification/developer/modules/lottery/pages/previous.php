<?php
	class page implements iPage {
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> db -> notice_id = "lottery-previous";
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
			$this -> settings = $this -> db -> modules["lottery"]["settings"];
			$this -> user_settings = $this -> db -> my["config"]["lottery"]; // settings specific to user
			$this -> group_settings = $this -> db -> groups["id-" . $this -> db -> my["gid"]]["config"]["lottery"]; // settings specific to user's group
			$this -> info = $this -> db -> secure($_GET['info']);
		}
	
		public function load() {
			$c = $this -> db -> secure($_GET['c']);
			switch($c) {
				case "show":
					$this -> show();
					break;
				case "prizes":
					$this -> prizes();
					break;
				case "winners":
					$this -> winners();
					break;
				default:
					unset($this -> db -> notice_id);
					$this -> db -> output(19);
					break;
			}
		}
		
		private function show() {
			$cid = $this -> cid;
			$lotteries = $this -> db -> query("SELECT COUNT(*) FROM `lotteries` WHERE `cid`='$cid' AND `drawn`='1'");
			$completed = $this -> db -> get_result($lotteries);
			if($completed == 0) {
				$this -> db -> output(1);
			} else {
				$per_page = 5;
				$page = $this -> info["page"];
				$page = strlen($page) ? $page : 1;
				$total_pages = ceil($completed / $per_page);
				$page = min(max(1, $page), $total_pages);
				$start = ($page - 1) * $per_page;
				$lotteries_q = $this -> db -> query("SELECT `id`, `price`, `pot`, `r`, `winning_numbers`, `rollover`, `end_date` FROM `lotteries` WHERE `cid`='$cid' AND `drawn`='1' ORDER BY `end_date` DESC LIMIT $start, $per_page");
				$lotteries = array();
				$this -> db -> load_module_class("lottery");
				while($lottery = $lotteries_q -> fetch_assoc()) {
					$lottery["prizes"] = $this -> db -> module_class["lottery"] -> winnings($lottery["pot"], $lottery["r"]);
					$lottery["jackpot"] = $lottery["prizes"][count($lottery["prizes"]) - 1];
					$lotteries[] = $lottery;
				}
				$this -> db -> output_vars["info"]["page"] = $page;
				$this -> db -> output_vars["info"]["total_pages"] = $total_pages;
				$this -> db -> output_vars["info"]["lotteries"] = $lotteries;
				$this -> db -> cb = "dynamo.lottery.previous.show";
			}
		}
		
		private function prizes() {
			$cid = $this -> cid;
			$lid = $this -> info["id"];
			$lottery_q = $this -> db -> query("SELECT `pot`, `r` FROM `lotteries` WHERE `cid`='$cid' AND `id`='$lid' AND `drawn`='1' LIMIT 1");
			if($lottery_q -> num_rows == 0) {
				$this -> show();
			} else {
				$lottery = $lottery_q -> fetch_assoc();
				$tickets_q = $this -> db -> query("SELECT `matched`, COUNT(`matched`) `count` FROM `lottery_tickets` WHERE `cid`='$cid' AND `lid`='$lid' AND `matched`>0 GROUP BY `matched`");
				
				$this -> db -> load_module_class("lottery");
				$initial_winnings = $this -> db -> module_class["lottery"] -> winnings($lottery["pot"], $lottery["r"]);
				$tickets = array_fill(0, $lottery["r"] - 1, 0);
				while($ticket = $tickets_q -> fetch_assoc()) {
					$tickets[$ticket["matched"]  - 1] = $ticket["count"];
				}
				
				$split_winnings = array();
				
				foreach($initial_winnings as $key => $value) {
					$split_winnings[$key] = floor($value / max(1, $tickets[$key]));
				}
				
				$this -> db -> output_vars["info"]["winners"] = $tickets;
				$this -> db -> output_vars["info"]["initial_winnings"] = $initial_winnings;
				$this -> db -> output_vars["info"]["split_winnings"] = $split_winnings;
				$this -> db -> cb = "dynamo.lottery.previous.prizes.show";
			}
		}
		
		private function winners() {
			$cid = $this -> cid;
			$lid = $this -> info["id"];
			$lottery_q = $this -> db -> query("SELECT `id`, `winning_numbers`, `pot`, `r` FROM `lotteries` WHERE `cid`='$cid' AND `id`='$lid' LIMIT 1");
			if($lottery_q -> num_rows == 0) {
				$this -> show();
			} else {
				$lottery = $lottery_q -> fetch_assoc();
				$winners_q = $this -> db -> query("SELECT COUNT(*) FROM `lottery_tickets` WHERE `cid`='$cid' AND `lid`='$lid' AND `matched`>0");
				$amount = $this -> db -> get_result($winners_q);
				if($amount > 0) {
					$per_page = 5;
					$page = $this -> info["page"];
					$page = strlen($page) ? $page : 1;
					$total_pages = ceil($amount / $per_page);
					$page = min(max(1, $page), $total_pages);
					$start = ($page - 1) * $per_page;
					$winners_q = $this -> db -> query("SELECT `zbid`, `numbers`, `matched`, `prize`, `bought` FROM `lottery_tickets` WHERE `cid`='$cid' AND `lid`='$lid' AND `matched`>0 ORDER BY `matched` DESC, `bought` ASC LIMIT $start, $per_page");
					if($winners_q -> num_rows == 0) {
						$this -> db -> output(2);
					} else {
						$zbids = array();
						$winners = array();
						$to_find = array();
						$matches = array_fill(0, $lottery["r"], 0);
						
						while($winner = $winners_q -> fetch_assoc()) {
							$user = $this -> db -> get_user($winner["zbid"]);
							$matches[$winner["matched"] - 1]++;
							if($user === false) {
								if(!in_array($winner["zbid"], $zbids)) {
									$zbids[] = $winner["zbid"];
								}
								$to_find["id-" . $winner["zbid"]][] = $winner;
							} else {
								$winner["username"] = $user["username"];
								$winners[] = $winner;
							}
						}
						
						if(!empty($zbids)) {
							$this -> db -> get_users($zbids);
							foreach($zbids as $z) {
								$user = $this -> db -> get_user($z);
								if($user !== false) {
									foreach($to_find["id-" . $z] as $t) {
										$t['username'] = $user["username"];
										$winners[] = $t;
									}
								} else {
									foreach($to_find["id-" . $z] as $t) {
										$t['username'] = "Unknown user";
										$winners[] = $t;
									}
								}
								unset($to_find["id-" . $z]);
							}
						}
						
						usort($winners, function($a, $b) {
							// show most matches first
							if($a["matched"] == $b["matched"]) {
								return $a["bought"] - $b["bought"];
							} else {
								return $b["matched"] - $a["matched"];
							}
						});
						
						$this -> db -> output_vars["info"]["lid"] = $lottery["id"];
						$this -> db -> output_vars["info"]["r"] = $lottery["r"];
						$this -> db -> output_vars["info"]["page"] = $page;
						$this -> db -> output_vars["info"]["total_pages"] = $total_pages;
						$this -> db -> output_vars["info"]["winners"] = $winners;
						$this -> db -> output_vars["info"]["winning_numbers"] = $lottery["winning_numbers"];
						$this -> db -> cb = "dynamo.lottery.previous.winners.show";
					}
				} else {
					$this -> db -> output(2);
				}
			}
		}
		
	}
?>