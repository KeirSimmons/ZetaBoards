<?php
	class page implements iPage {
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> db -> notice_id = "lottery-current";
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
				case "buy":
					$this -> buy();
					break;
				case "view_tickets":
					$this -> view_tickets();
					break;
				default:
					unset($this -> db -> notice_id);
					$this -> db -> output(19);
					break;
			}
		}
		
		private function get_current_info(){
			$cid = $this -> cid;
			$zbid = $this -> zbid;
			$time = time();
			$lotteries = $this -> db -> query("SELECT `id`, `price`, `tickets`, `user_limit`, `pot`, `n`, `r`, `end_date` FROM `lotteries` WHERE `cid`='$cid' AND `drawn`='0' ORDER BY `end_date` DESC LIMIT 1");
			if($lotteries -> num_rows == 1) {
				$lottery = $lotteries -> fetch_assoc();
				$my_money = +$this -> db -> my["config"]["currency"]["money"];
				$time_left = $lottery["end_date"] - $time; 
				$max = $lottery["tickets"];
				$lottery_id = $lottery["id"];
				$tickets = $this -> db -> query("SELECT COUNT(*) FROM `lottery_tickets` WHERE `cid`='$cid' AND `lid`='$lottery_id'");
				$my_tickets = $this -> db -> query("SELECT COUNT(*) FROM `lottery_tickets` WHERE `cid`='$cid' AND `zbid`='$zbid' AND `lid`='$lottery_id'");
			
				$this -> db -> load_module_class("lottery");
				$lottery["winnings"] = $this -> db -> module_class["lottery"] -> winnings($lottery["pot"], $lottery["r"]);
				
				$lottery["tickets"] = array(
					"bought" => $this -> db -> get_result($tickets),
					"max" => $lottery["tickets"]
				);
				
				$lottery += array(
					"my_tickets" => array(
						"bought" => $this -> db -> get_result($my_tickets),
						"max" => $lottery["user_limit"]
					),
					"balance" => $my_money
				);
				
				$total_tickets_left = $lottery["tickets"]["bought"] < $lottery["tickets"]["max"] || $lottery["tickets"]["max"] == 0;
				$my_tickets_left = $lottery["my_tickets"]["bought"] < $lottery["my_tickets"]["max"] || $lottery["my_tickets"]["max"] == 0;
				$enough_money = +$lottery["price"] < $my_money;
				
				$can_buy = false;
				if(!$total_tickets_left) {
					$reason = 1; // no tickets left
				} elseif(!$my_tickets_left) {
					$reason = 2; // reached max limit
				} elseif(!$enough_money) {
					$reason = 3; // not enough money
				} elseif($time_left <= 0) {
					$reason = 4; // ended
				} else {
					$can_buy = true;
					$reason = 0;
				}	
				
				$lottery += array(
					"can_buy" => $can_buy,
					"reason" => $reason
				);
				
				unset($lottery["user_limit"]);
				
				return $lottery;
			} else {
				$this -> db -> output(1);
			}
		}
		
		private function show($lottery = array()) {
			$lottery = empty($lottery) ? $this -> get_current_info() : $lottery;
			$lottery["jackpot"] = $lottery["winnings"][count($lottery["winnings"]) - 1]; // only show jackpot
			unset($lottery["winnings"], $lottery["id"]);
			
			$this -> db -> output_vars["info"] += $lottery;
			$this -> db -> cb = "dynamo.lottery.current.show";
		}
		
		private function buy() {
		
			$cid = $this -> cid;
			$zbid = $this -> zbid;
		
			$numbers = array_unique($this -> info["numbers"]);
			sort($numbers);
			$lottery = $this -> get_current_info();
			
			if($lottery["can_buy"]) {
				// passed the initial checks
				if(count($numbers) == $lottery["r"]) {
					$lid = $lottery["id"];
					$numbers = implode(",", $numbers);
					$check_for_existing = $this -> db -> query("SELECT COUNT(`id`) FROM `lottery_tickets` WHERE `lid`='$lid' AND `cid`='$cid' AND `zbid`='$zbid' AND `numbers`='$numbers'");
					if(+$this -> db -> get_result($check_for_existing) == 0) {
						$balance = +$this -> db -> my["config"]["currency"]["money"];
						$price = $lottery["price"];
						$new_balance = $balance - $price;
						$time = time();

						$this -> db -> update_user_config(array(
							array("currency", "money", $new_balance)
						)); // update money (transaction history will be handled as an event)

						$ticket = $this -> db -> query("INSERT INTO `lottery_tickets` (`cid`, `lid`, `zbid`, `numbers`, `bought`) VALUES('$cid', '$lid', '$zbid', '$numbers', '$time')");
						$update_pot = $this -> db -> query("UPDATE `lotteries` SET `pot`=`pot`+'$price' WHERE `id`='$lid' AND `cid`='$cid' AND `drawn`='0' LIMIT 1");
						
						$this -> db -> fire_event("lottery", "ticket_bought", array(
							"price" => $price
						));
						
						$this -> db -> output($this -> db -> mysqli -> affected_rows == 0
							? 3
							: 4);
							
					} else {
						$this -> db -> output(2);
					}
				} else {
					$this -> show($lottery); // not enough numbers given (or maybe there were duplicates!)
				}
			} else {
				$this -> show($lottery);
			}
		}
		
		public function view_tickets() {
			$lottery = $this -> get_current_info();
			if(+$lottery["my_tickets"]["bought"] == 0) {
				$this -> show($lottery);
			} else {
				$cid = $this -> cid;
				$zbid = $this -> zbid;
				$lottery_id = $lottery["id"];
				$per_page = 5;
				$page = $this -> info["page"];
				$page = strlen($page) ? $page : 1;
				$total_pages = ceil($lottery["my_tickets"]["bought"] / $per_page);
				$page = min(max(1, $page), $total_pages);
				$start = ($page - 1) * $per_page;
				$my_tickets = $this -> db -> query("SELECT `numbers`, `bought` FROM `lottery_tickets` WHERE `cid`='$cid' AND `zbid`='$zbid' AND `lid`='$lottery_id' ORDER BY `bought` DESC LIMIT $start, $per_page");
				$tickets = array();
				while($ticket = $my_tickets -> fetch_assoc()) {
					$tickets[] = $ticket;
				}
				$this -> db -> output_vars["info"]["page"] = $page;
				$this -> db -> output_vars["info"]["total_pages"] = $total_pages;
				$this -> db -> output_vars["info"]["tickets"] = $tickets;
				$this -> db -> cb = "dynamo.lottery.current.view_tickets.show";
			}
		}
		
	}
?>