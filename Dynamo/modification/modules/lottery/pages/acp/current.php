<?php
	class page implements iPage {
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
			$this -> user_settings = $this -> db -> my["config"]["lottery"]; // settings specific to user
			$this -> group_settings = $this -> db -> groups["id-" . $this -> db -> my["gid"]]["config"]["lottery"]; // settings specific to user's group
			$this -> settings = $this -> db -> modules["lottery"]["settings"]; // settings specific to module
			$this -> info = $this -> db -> secure($_GET['info']);
			if($this -> db -> groups["id-" . $this -> db -> my["gid"]]["admin"] == 0) {
				$this -> db -> output(18);
			} else {
				$this -> db -> notice_id = "lottery-acp-current";
			}
		}
	
		public function load() {
			$c = $this -> db -> secure($_GET['c']);
			switch($c) {
				case "form":
					$this -> form();
					break;
				case "create":
					$this -> create();
					break;
				case "draw":
					$this -> draw();
					break;
				default:
					unset($this -> db -> notice_id);
					$this -> db -> output(19);
					break;
			}
		}
		
		private function form() {
			$cid = $this -> cid;
			$time = time();
			$lotteries = $this -> db -> query("SELECT `id`, `tickets`, `pot`, `n`, `r`, `end_date` FROM `lotteries` WHERE `cid`='$cid' AND `drawn`='0' ORDER BY `end_date` DESC LIMIT 1");
			if($lotteries -> num_rows == 1) {
				$lottery = $lotteries -> fetch_assoc();
				$time_left = $lottery["end_date"] - $time; 
				$max = $lottery["tickets"];
				$lottery_id = $lottery["id"];
				$tickets = $this -> db -> query("SELECT COUNT(*) FROM `lottery_tickets` WHERE `cid`='$cid' AND `lid`='$lottery_id'");
				
				$this -> db -> load_module_class("lottery");
				$lottery["winnings"] = $this -> db -> module_class["lottery"] -> winnings($lottery["pot"], $lottery["r"]);
				
				$lottery["tickets"] = array(
					"bought" => $this -> db -> get_result($tickets),
					"max" => $lottery["tickets"]
				);
				
				$total_tickets_left = $lottery["tickets"]["bought"] < $lottery["tickets"]["max"] || $lottery["tickets"]["max"] == 0;
				
				$ended = true;
				if(!$total_tickets_left) {
					$reason = 1; // no tickets left
				} elseif($time_left <= 0) {
					$reason = 2; // ended
				} else {
					$ended = false;
					$reason = 0;
				}	
				
				$lottery += array(
					"ended" => $ended,
					"reason" => $reason
				);
				
				$lottery["jackpot"] = $lottery["winnings"][count($lottery["winnings"]) - 1]; // only show jackpot
				unset($lottery["winnings"], $lottery["id"]);
				
				$this -> db -> output_vars["info"] += $lottery;
				$this -> db -> cb = "dynamo.lottery.acp.current.form_end";
				
			} else {
				$lottery = $this -> db -> query("SELECT `rollover` FROM `lotteries` WHERE `cid`='$cid' ORDER BY `end_date` DESC LIMIT 1");
				$this -> db -> output_vars["info"]["rollover"] += $this -> db -> get_result($lottery);
				$this -> db -> cb = "dynamo.lottery.acp.current.form_create";
			}
		}
		
		private function create() {
			$price = +$this -> info["price"];
			$tickets = +$this -> info["tickets"];
			$max_tickets = +$this -> info["max_tickets"];
			$pot = +$this -> info["pot"];
			$n = +$this -> info["n"];
			$r = +$this -> info["r"];
			$end_date = +$this -> info["end_date"];
			if(
				!strlen($price) ||
				!strlen($tickets) ||
				!strlen($max_tickets) ||
				!strlen($pot) ||
				!strlen($n) ||
				!strlen($r) ||
				!strlen($end_date) ||
				$price < 0 ||
				$tickets < 0 ||
				$max_tickets < 0 ||
				$pot < 0 ||
				$n < 2 ||
				$n > 50 ||
				$r < 1 ||
				$r > 10 ||
				$end_date < 1
			) {
				$this -> form();
			} else {
				$cid = $this -> cid;
				$end_date += time();
				$lotteries = $this -> db -> query("SELECT `id`, `tickets`, `pot`, `n`, `r`, `end_date` FROM `lotteries` WHERE `cid`='$cid' AND `drawn`='0' ORDER BY `end_date` DESC LIMIT 1");
				if($lotteries -> num_rows == 1) {
					$this -> form();
				} else {
					if($n > $r) {
						$numbers = array();
						while(count($numbers) < $r) {
							$x = rand(1, $n);
							if(!in_array($x, $numbers)) {
								$numbers[] = $x;
							}
						}
						sort($numbers);
						$numbers = implode(",", $numbers);
						$this -> db -> query("INSERT INTO `lotteries` (`cid`, `price`, `tickets`, `user_limit`, `pot`, `n`, `r`, `winning_numbers`, `end_date`) VALUES('$cid', '$price', '$tickets', '$max_tickets', '$pot', '$n', '$r', '$numbers', '$end_date')");
						$this -> db -> output($this -> db -> mysqli -> affected_rows == 0
							? 2
							: 3
						);
					} else {
						$this -> db -> output(1);
					}
				}
			}
		}
		
		private function draw() {
			$cid = $this -> cid;
			$lotteries = $this -> db -> query("SELECT `id`, `tickets`, `pot`, `n`, `r`, `winning_numbers` FROM `lotteries` WHERE `cid`='$cid' AND `drawn`='0' ORDER BY `end_date` DESC LIMIT 1");
			if($lotteries -> num_rows == 1) {
				$lottery = $lotteries -> fetch_assoc();
				$this -> db -> load_module_class("lottery");
				$r = $lottery["r"];
				
				$initial_winnings = $this -> db -> module_class["lottery"] -> winnings($lottery["pot"], $r);
				$winning_numbers = explode(",", $lottery["winning_numbers"]);
				$lid = $lottery["id"];
				$tickets_q = $this -> db -> query("SELECT `id`, `zbid`, `numbers` FROM `lottery_tickets` WHERE `lid`='$lid' AND `cid`='$cid' ORDER BY `bought` ASC");
				
				$winners = array();
				$matches = array_fill(0, $r, 0);
				
				$zbids = array();
				$left = $lottery["pot"];
				
				while($ticket = $tickets_q -> fetch_assoc()) {
					$numbers = explode(",", $ticket["numbers"]);
					$count = $r - count(array_diff($winning_numbers, $numbers));
					if($count > 0) {
						$matches[$count - 1]++;
						$zbid = $ticket["zbid"];
						if($this -> db -> get_user($zbid) === false && !in_array($zbid, $zbids)) {
							$zbids[] = $zbid;
						}
						$winners["id-" . $zbid][] = array(
							"count" => $count,
							"id" => $ticket["id"], 
							"zbid" => $zbid
						);
					}
				}
				
				if(!empty($zbids)) {
					$this -> db -> get_users($zbids);
				}
				
				$split_winnings = array_fill(0, $r, 0);
				
				foreach($initial_winnings as $key => $value) {
					$split_winnings[$key] = floor($value / max(1, $matches[$key]));
				}
				
				$ticket_update = array();
				$user_update = array();
				$info_update = array();
				$time = time();
				foreach($winners as &$winner) {
					$total_won = 0;
					$winner_zbid = 0;
					foreach($winner as &$winnings) {
						$winner_zbid = $winnings["zbid"];
						$winnings["prize"] = $split_winnings[$winnings["count"] - 1];
						$total_won+= $winnings["prize"];
						$left -= $winnings["prize"]; // update this so it doesn't run on each loop, can work out total amount won from split_winnings and number of winners for each match...
						$ticket_update[] = "('{$winnings["id"]}', '{$winnings["count"]}', '{$winnings["prize"]}')";
					}
					if($total_won > 0) {
						$info_update[] = array($winner_zbid, $total_won);
					}
				}
				
				// set to drawn
				$this -> db -> query("UPDATE `lotteries` SET `rollover`='$left', `drawn`='1', `end_date`='$time' WHERE `id`='$lid' AND `cid`='$cid' AND `drawn`='0' LIMIT 1");
				
				// update lottery tickets to show how many numbers are matched and preload prizes
				if(!empty($ticket_update)) {
					$this -> db -> query("INSERT INTO `lottery_tickets` (`id`, `matched`, `prize`) VALUES " . implode(", ", $ticket_update) . " ON DUPLICATE KEY UPDATE `matched`=VALUES(`matched`), `prize`=VALUES(`prize`)");
				}
				
				// fire event (this will add money, send notifications etc)
				$this -> db -> fire_event("lottery", "draw_result", $info_update);
				
				$this -> db -> output(4);
				
			} else {
				$this -> form();
			}
		}
		
	}
		
?>