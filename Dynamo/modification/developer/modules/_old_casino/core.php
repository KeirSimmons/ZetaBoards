<?php
	if(in_array("/home/viralsmo/public_html/dynamo/database.class.php",get_included_files())){
		class casino {
			public function __construct(){
				global $database;
				$this -> db = $database;
				if(!defined(sha1(($this -> db -> cid) . "casino"))){
					$this -> db -> output_vars["error"][] = 33;
					$this -> db -> output();
				}
			}
		}
		$casino = new casino;
		class lottery extends casino {
			public function current(){
				$cid = $this -> db -> cid;
				$zbid = $this -> db -> zbid;
				$gid = $this -> db -> my["gid"];
				$group = $this -> db -> groups["g-" . $gid];
				$current_lottery = $this -> db -> query("SELECT  a.id, a.name, a.n, a.r, a.pot, a.ticket_price, a.starting_tickets, a.started, a.end, COUNT(b.id) tickets_bought FROM current_lotteries a JOIN lottery_tickets b ON b.lid=a.id WHERE a.cid=$cid GROUP BY(b.lid) ORDER BY started DESC LIMIT 1  ",__LINE__,__FILE__);
				$current = $current_lottery -> fetch_assoc();
				$ended = $current_lottery -> num_rows == 1 ? ($current["end"] - time() > 0 ? 2 : 1) : 0;
				if($ended == 2){
					$lottery_id = $this -> db -> secure($current["id"]);
					$my_tickets = $this -> db -> query("SELECT COUNT(id) FROM lottery_tickets WHERE zbid=$zbid AND cid=$cid AND lid=$lottery_id",__LINE__,__FILE__);
					$this -> db -> output_vars["name"] = $current["name"];
					$this -> db -> output_vars["current_pot"] = $current["pot"];
					$this -> db -> output_vars["ticket_price"] = $current["ticket_price"];
					$this -> db -> output_vars["your_tickets"] = $this -> db -> get_result($my_tickets);
					$this -> db -> output_vars["your_max_tickets"] = $group["casino_lottery_maxtickets"];
					$this -> db -> output_vars["starting_tickets"] = $current["starting_tickets"];
					$this -> db -> output_vars["tickets_bought"] = $current["tickets_bought"];
					$this -> db -> output_vars["ending_in"] = $current["end"];
					$this -> db -> output_vars["started"] = $current["started"];
					$this -> db -> output_vars["winnings"] = array_reverse($this -> winnings($current["pot"],$current["r"]));
					$this -> db -> output_vars["n"] = $current["n"];
					$this -> db -> output_vars["r"] = $current["r"];
				} else {
					$this -> db -> output_vars["no_lottery"] = $ended;
				}
				$this -> db -> cb = "dynamo.casino.lottery.current.show";
			}
			public function my_tickets($page=0){
				$zbid = $this -> db -> zbid;
				$cid  = $this -> db -> cid;
				$per_page = min(MAX_LOTTERY_TICKETS_PAGE,max(1,$this -> db -> settings["casino_lottery_perpage"]));
				$current_lottery = $this -> db -> query("SELECT id,end,sale_price FROM current_lotteries WHERE cid=$cid LIMIT 1",__LINE__,__FILE__);
				$current = $current_lottery -> fetch_assoc();
				$ended = $current_lottery -> num_rows == 1 ? ($current["end"] - time() > 0 ? 2 : 1) : 0;
				if($ended == 2){
					$lottery_id = $this -> db -> secure($current["id"]);
					$total_ticket_q = $this -> db -> query("SELECT COUNT(id) FROM lottery_tickets WHERE zbid=$zbid AND cid=$cid AND lid=$lottery_id",__LINE__,__FILE__);
					$amount = $this -> db -> get_result($total_ticket_q);
					$this -> db -> output_vars["tickets"] = array();
					if($amount == 0){
						$this -> current();
					} else {
						$total_pages = ceil($amount / $per_page);
						$page = $page == 0 ? $this -> db -> secure($_GET['page']) : $page;
						$page = min(max(1,$page),$total_pages);
						$start = ($page - 1) * $per_page;
						$tickets_q = $this -> db -> query("SELECT id,bought,numbers FROM lottery_tickets WHERE zbid=$zbid AND cid=$cid AND lid=$lottery_id ORDER BY bought DESC LIMIT $start,$per_page",__LINE__,__FILE__);
						while($t = $tickets_q -> fetch_assoc()){
							$this -> db -> output_vars["tickets"][] = $t;
						}
						$sale_price = $current["sale_price"];
						$this -> db -> output_vars["page"] = $page;
						$this -> db -> output_vars["total_pages"] = $total_pages;
						$this -> db -> output_vars["sale_price"] = $sale_price;
						$this -> db -> cb = "dynamo.casino.lottery.current.show_mine";
					}
				} else {
					$this -> db -> output_vars["no_lottery"] = $ended;
				$this -> db -> cb = "dynamo.casino.lottery.current.show";
				}
			}
			public function buy(){
				$zbid = $this -> db -> zbid;
				$cid  = $this -> db -> cid;
				$gid = $this -> db -> my["gid"];
				$group = $this -> db -> groups["g-" . $gid];
				$current_lottery = $this -> db -> query("SELECT a.id,a.end,a.ticket_price,a.r,a.n,a.starting_tickets,COUNT(b.id) tickets_bought FROM current_lotteries a JOIN lottery_tickets b WHERE a.cid=$cid LIMIT 1",__LINE__,__FILE__);
				$current = $current_lottery -> fetch_assoc();
				$ended = $current_lottery -> num_rows == 1 ? ($current["end"] - time() > 0 ? 2 : 1) : 0;
				if($ended == 2){
					$lottery_id = $this -> db -> secure($current["id"]);
					$my_money = $this -> db -> my["money_hand"];
					$price = $current["ticket_price"];
					$money_left = $my_money - $price;
					if($money_left >= 0){
						$my_rep = $this -> db -> my["reputation_add"] - $this -> db -> my["reputation_minus"];
						$rep_to_earn = $group["casino_lottery_minrep_check"]
							? $group["casino_lottery_minrep"] - $my_rep
							: 0;
						if($rep_to_earn <= 0){
							if($current["starting_tickets"] != 0 && $current["starting_tickets"] <= $current["tickets_bought"]){
								$this -> db -> output_vars["state"] = 2;
								$this -> db -> output_vars["reason"] = $current["starting_tickets"];
								$this -> db -> cb = "dynamo.casino.lottery.current.unavailable";
							} else {
								$total_ticket_q = $this -> db -> query("SELECT COUNT(id) FROM lottery_tickets WHERE zbid=$zbid AND cid=$cid AND lid=$lottery_id",__LINE__,__FILE__);
								$amount = $this -> db -> get_result($total_ticket_q);
								if($group["casino_lottery_maxtickets"] != 0 && $group["casino_lottery_maxtickets"] <= $amount){
									$this -> db -> output_vars["state"] = 1;
									$this -> db -> output_vars["reason"] = $group["casino_lottery_maxtickets"];
									$this -> db -> cb = "dynamo.casino.lottery.current.unavailable";
								} else { // Passed all checks, now show form or complete purchase
									$stage = $this -> db -> secure($_GET['stage']);
									if($stage == 1){ // form
										$this -> db -> output_vars["n"] = $current["n"];
										$this -> db -> output_vars["r"] = $current["r"];
										$this -> db -> cb = "dynamo.casino.lottery.current.buy_form";
									} else { // buy ticket
										$numbers = explode("|",$this -> db -> secure($_GET['numbers']));
											sort($numbers);
										$to_check = implode(",",$numbers);
										$checking = $this -> db -> query("SELECT COUNT(id) FROM lottery_tickets WHERE zbid=$zbid AND cid=$cid AND lid=$lottery_id AND numbers='$to_check' LIMIT 1",__LINE__,__FILE__);
										if($this -> db -> get_result($checking)){
											$this -> db -> output_vars["state"] = 7;
											$this -> db -> cb = "dynamo.casino.lottery.current.unavailable";
										} else {
											$num_error = 0;
											foreach($numbers as $n){
												if(!$this -> db -> is_number($n) || $n*1 > $current["n"] || $n*1 < 1){
													$num_error = 1;
													break;
												}
											}
											if($num_error || count($numbers) != $current["r"]){
												$this -> db -> output_vars["state"] = 3;
												$this -> db -> cb = "dynamo.casino.lottery.current.unavailable";
											} elseif(count($numbers) != count(array_unique($numbers))){
												$this -> db -> output_vars["state"] = 4;
												$this -> db -> cb = "dynamo.casino.lottery.current.unavailable";
											} else {
												$numbers = $to_check;
												$time = time();
												if($price > 0){
													$update_me = $this -> db -> query("UPDATE users SET money_hand=money_hand-$price WHERE zbid=$zbid AND cid=$cid LIMIT 1",__LINE__,__FILE__);
													$this -> db -> history_log($zbid,7,$price);
												}
												$update_lottery = $this -> db -> query("UPDATE current_lotteries SET pot=pot+$price WHERE id=$lottery_id AND cid=$cid LIMIT 1",__LINE__,__FILE__);
												$add_ticket = $this -> db -> query("INSERT INTO lottery_tickets (cid,lid,zbid,numbers,bought) VALUES($cid,$lottery_id,$zbid,'$numbers',$time)",__LINE__,__FILE__);
												$this -> db -> cb = "dynamo.casino.lottery.current.bought";
											}
										}
									}
								}
							}
						} else {
							$this -> db -> output_vars["state"] = 6;
							$this -> db -> output_vars["reason"] = $rep_to_earn;
							$this -> db -> cb = "dynamo.casino.lottery.current.unavailable";
						}
					} else {
						$this -> db -> output_vars["state"] = 5;
						$this -> db -> cb = "dynamo.casino.lottery.current.unavailable";
					}
				} else {
					$this -> db -> output_vars["no_lottery"] = $ended;
					$this -> db -> cb = "dynamo.casino.lottery.current.show";
				}
			}
			public function sell(){
				$zbid = $this -> db -> zbid;
				$cid  = $this -> db -> cid;
				$tid = $this -> db -> secure($_GET['tid']); // ticket id
				$page = $this -> db -> secure($_GET['page']);
				if($tid && $page){
					$current_lottery = $this -> db -> query("SELECT id,end,sale_price,ticket_price FROM current_lotteries WHERE cid=$cid LIMIT 1",__LINE__,__FILE__);
					$current = $current_lottery -> fetch_assoc();
					$ended = $current_lottery -> num_rows == 1 ? ($current["end"] - time() > 0 ? 2 : 1) : 0;
					if($ended == 2){
						$lottery_id = $current["id"];
						$delete = $this -> db -> query("DELETE FROM lottery_tickets WHERE zbid=$zbid AND cid=$cid AND lid=$lottery_id AND id=$tid LIMIT 1",__LINE__,__FILE__);
						if($this -> db -> mysqli -> affected_rows == 1){
							$sale_price = $current["sale_price"];
							$ticket_price = $current["ticket_price"];
							if($sale_price){
								$date = time();
								$update_user = $this -> db -> query("UPDATE users SET money_hand=money_hand+$sale_price WHERE zbid=$zbid AND cid=$cid LIMIT 1",__LINE__,__FILE__);
								$this -> db -> history_log($zbid,6,$sale_price);
							}
							$update_lottery = $this -> db -> query("UPDATE current_lotteries SET pot=pot-$ticket_price WHERE cid=$cid AND id=$lottery_id LIMIT 1",__LINE__,__FILE__);
						}
						$this -> my_tickets($page);
					} else {
						$this -> db -> output_vars["no_lottery"] = $ended;
						$this -> db -> cb = "dynamo.casino.lottery.current.show";
					}
				} else {
					$this -> my_tickets();
				}
			}
			public function past($page=0){
				$cid  = $this -> db -> cid;
				$per_page = min(MAX_LOTTERY_PAST_PAGE,max(1,$this -> db -> settings["casino_lottery_past_perpage"]));
				$past = $this -> db -> query("SELECT id FROM past_lotteries WHERE cid=$cid",__LINE__,__FILE__);
				$num_rows = $past -> num_rows;
				if($num_rows == 0){
					$this -> db -> output_vars["total_pages"] = 0;
				} else {
					$total_pages = ceil($num_rows / $per_page);
					$page = min(max(1,$page==0?$this -> db -> secure($_GET['page']):$page),$total_pages);
					$start = ($page - 1) * $per_page;
					$past2 = $this -> db -> query("SELECT a.id,a.name,a.numbers,a.won,a.remaining,a.ended,(SELECT count(b.id) FROM lottery_winners b WHERE b.plid=a.id) winners FROM past_lotteries a WHERE a.cid=$cid ORDER BY ended DESC LIMIT $start,$per_page",__LINE__,__FILE__);
					while($p = $past2 -> fetch_assoc()){
						$this -> db -> output_vars["past"][] = $p;
					}
					$this -> db -> output_vars["page"] = $page;
					$this -> db -> output_vars["total_pages"] = $total_pages;
					$this -> db -> output_vars["name"] = $total_pages;
				}
				$this -> db -> cb = "dynamo.casino.lottery.past.show_page";
			}
			public function winners(){
				$cid  = $this -> db -> cid;
				$id = $this -> db -> secure($_GET['id']);
				$this -> db -> output_vars["winners"] = array();
				$this -> db -> cb = "dynamo.casino.lottery.past.winners.show";
				$per_page = min(MAX_LOTTERY_WINNERS_PAGE,max(1,$this -> db -> settings["casino_lottery_winners_perpage"]));
				$past_lottery = $this -> db -> query("SELECT numbers,name FROM past_lotteries WHERE cid=$cid AND id=$id LIMIT 1",__LINE__,__FILE__);
				if($past_lottery -> num_rows){
					$this -> db -> output_vars["name"] = $this -> db -> get_result($past_lottery,0,1);
					$total_winners = $this -> db -> query("SELECT id FROM lottery_winners WHERE cid=$cid AND plid=$id",__LINE__,__FILE__);
					$num_rows = $total_winners -> num_rows;
					if($num_rows){
						$total_pages = ceil($num_rows / $per_page);
						$page = min(max(1,$this -> db -> secure($_GET['page'])),$total_pages);
						$start = ($page - 1) * $per_page;
						$winners = $this -> db -> query("SELECT a.id,a.plid,a.zbid,a.amount,a.numbers,c.totalAmount FROM lottery_winners a INNER JOIN ( SELECT b.zbid, SUM(b.amount) totalAmount FROM lottery_winners b WHERE b.plid=$id GROUP BY b.zbid ) c ON a.zbid = c.zbid WHERE a.plid=$id ORDER BY c.totalAmount DESC, a.amount DESC LIMIT $start,$per_page",__LINE__,__FILE__);
						while($w = $winners -> fetch_assoc()){
							$w_user = $this -> db -> get_user($w['zbid']);
							$w['name'] = $w_user === false ? "Unknown" : $w_user["username"];
							$this -> db -> output_vars["winners"][] = $w;
						}
						$this -> db -> output_vars["numbers"] = $this -> db -> get_result($past_lottery);
						$this -> db -> output_vars["page"] = $page;
						$this -> db -> output_vars["total_pages"] = $total_pages;
						$this -> db -> output_vars["id"] = $id;
					} else {
						$this -> past(1);
					}
				} else {
					$this -> past(1);
				}
			}
			private function winnings($pot,$r){
				$matches = array();
				$biggest = $pot * ((1 - exp(-1)) / (1 - exp(-$r)));
				for($i=1;$i<$r;$i++){
					$matches[] = floor($biggest * exp($i - $r));
				}
				$matches[] = floor($biggest);
				return $matches;
			}
		}
		$lottery = new lottery;
	} else {
		require_once("../database.class.php");
		$database -> output_vars["error"][] = 35;
		$database -> output();
	}
	
?>