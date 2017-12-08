<?php
	if(in_array("/home/viralsmo/public_html/dynamo/database.class.php",get_included_files())){
		class reputation {
			public function __construct(){
				global $database;
				$this -> db = $database;
				if(!defined(sha1(($this -> db -> cid) . "reputation"))){
					$this -> db -> output_vars["error"][] = 23;
					$this -> db -> output();
				}
			}
			public function check(){
				$cid = $this -> db -> cid;
				$zbid = $this -> db -> zbid;
				$gid = $this -> db -> my["gid"];
				$group = $this -> db -> groups["g-" . $gid];
				$can_rep = 0;
				$rep_reason = 0;
				$time = time();
				$to_zbid = $this -> db -> secure($_GET['u']);
				$to_user = $this -> db -> get_user($to_zbid);
				$reputation_times = $group['reputation_times'];
				$reputation_individual = $group['reputation_individual'];
				$more_rep = $group["reputation_min_reputation"] - ($this -> db -> my["reputation_add"] - $this -> db -> my["reputation_minus"]);
				$more_money = $group["reputation_min_money"] - ($this -> db -> my["money_hand"] + $this -> db -> my["money_bank"]);
				$reputation_wait = $group["reputation_wait"];
				$wait_dif = $this -> db -> my["registered"] + $reputation_wait - $time;
				if($to_zbid == $zbid){
					$rep_reason = 0;
				} elseif($to_user === false){
					$rep_reason = 1;
				} elseif($reputation_times == -1){
					$rep_reason = 2;
				} elseif($more_rep > 0 && $group["reputation_check_reputation"]){
					$rep_reason = 3;
					$this -> db -> output_vars["more_rep"] = $more_rep;
				} elseif($more_money > 0 && $group["reputation_check_money"]){
					$rep_reason = 4;
					$this -> db -> output_vars["more_money"] = $more_money;
				} elseif($wait_dif > 0){
					$rep_reason = 5;
					$this -> db -> output_vars["wait_dif"] = $this -> db -> my["registered"] + $reputation_wait;
				} else {
					$hours24 = time() - 86400;
					$can_go = 1;
					if($reputation_times != 0){
						$reputations = $this -> db -> query("SELECT id FROM reputation WHERE cid=$cid AND from_zbid=$zbid AND time>$hours24",__LINE__,__FILE__);
						if($reputations -> num_rows >= $reputation_times){
							$rep_reason = 6;
							$this -> db -> output_vars["max_times"] = $reputation_times;
							$can_go = 0;
						}
					}
					if($can_go == 1 && $reputation_individual != 0){
						$reputations = $this -> db -> query("SELECT id FROM reputation WHERE cid=$cid AND from_zbid=$zbid AND zbid=$to_zbid AND time>$hours24",__LINE__,__FILE__);
						if($reputations -> num_rows >= $reputation_individual){
							$rep_reason = 7;
							$this -> db -> output_vars["max_times"] = $reputation_individual;
							$can_go = 0;
						}
					}
					if($can_go){
						$can_rep = 1;
					}
				}
				return array($can_rep,$rep_reason);
			}
			public function add(){
				list($can_rep,$rep_reason) = $this -> check();
				if($can_rep){
					$to_zbid = $this -> db -> secure($_GET['u']);
					$this -> db -> cb = "dynamo.reputation.show_form";
					$this -> db -> output_vars["to_zbid"] = $to_zbid;
					$this -> db -> output_vars["reputation_modify"] = 1;
				} else {
					$this -> db -> output_vars["rep_reason"] = $rep_reason;
					$this -> db -> cb = "dynamo.reputation.unavailable";
				}
			}
			public function minus(){
				list($can_rep,$rep_reason) = $this -> check();
				if($can_rep){
					$to_zbid = $this -> db -> secure($_GET['u']);
					$this -> db -> cb = "dynamo.reputation.show_form";
					$this -> db -> output_vars["to_zbid"] = $to_zbid;
					$this -> db -> output_vars["reputation_modify"] = 2;
				} else {
					$this -> db -> output_vars["rep_reason"] = $rep_reason;
					$this -> db -> cb = "dynamo.reputation.unavailable";
				}
			}
			public function modify(){
				list($can_rep,$rep_reason) = $this -> check();
				if($can_rep){
					$zbid = $this -> db -> zbid;
					$cid = $this -> db -> cid;
					$gid = $this -> db -> my["gid"];
					$group = $this -> db -> groups["g-" . $gid];
					$to_zbid = $this -> db -> secure($_GET['u']);
					$to_user = $this -> db -> get_user($to_zbid);
					$type = $this -> db -> secure($_GET['m']); // 1 = increase, 2 = decrease
					$reputation_rep = $group["reputation_rep"];
					$reputation_money = $group["reputation_money"];
					$reputation_posts = $group["reputation_posts"];
					$reputation_modify_cap = $group["reputation_modify_cap"];
					$to_mod = $group["reputation_modify_default"];
					$to_mod += $reputation_rep == 0 ? 0 : floor(($this -> db -> my["reputation_add"] - $this -> db -> my["reputation_minus"]) / $reputation_rep);
					$to_mod += $reputation_money == 0 ? 0 : floor(($this -> db -> my["money_hand"] + $this -> db -> my["money_bank"]) / $reputation_money);
					$to_mod += $reputation_posts == 0 ? 0 : floor($this -> db -> my["posts"] / $reputation_posts);
					$to_mod = $reputation_modify_cap == 0 ? $to_mod : min($reputation_modify_cap,$to_mod);
					$reason = $this -> db -> secure($_GET['r']);
					$multiplier = $type == 2 ? -1 : 1;
					$amount = $multiplier * $to_mod;
					$time = time();
					$history = $this -> db -> query("INSERT DELAYED INTO reputation (cid,zbid,from_zbid,amount,reason,time) VALUES($cid,$to_zbid,$zbid,$amount,'$reason',$time)",__LINE__,__FILE__);
					if(($this -> db -> settings["notifications_reputation"])*1===1){
						$data = $type . "|" . $zbid;
						$this -> db -> new_notification($to_zbid,3,$data);
					}
					$suffix = $type == 1 ? "add" : "minus";
					$update = $this -> db -> query("UPDATE users SET reputation_".$suffix."=reputation_".$suffix."+$to_mod WHERE zbid=$to_zbid AND cid=$cid LIMIT 1",__LINE__,__FILE__);
					$this -> db -> cb = "dynamo.reputation.finished";
					/* Update stored values */
						$this -> db -> users["u-" . $to_zbid]["reputation_".$suffix] += $to_mod;
						$to_user["reputation_".$suffix] += $to_mod;
					/* Update stored values */
					$this -> db -> output_vars["reputation"] = $to_user["reputation_add"] - $to_user["reputation_minus"];
					$this -> db -> output_vars["other_zbid"] = $to_zbid;
					$this -> db -> output_vars["other_name"] = $to_user["username"];
				} else {
					$this -> db -> output_vars["rep_reason"] = $rep_reason;
					$this -> db -> cb = "dynamo.reputation.unavailable";
				}
			}
			public function logs(){
				$this -> db -> output_vars["logs"] = array();
				$cid = $this -> db -> cid;
				$zbid = $this -> db -> zbid;
				$user_zbid = $this -> db -> secure(isset($_GET['user_zbid']) ? $_GET['user_zbid'] : $zbid);
				$user = $this -> db -> get_user($user_zbid);
				if($user !== false){
					$per_page = min(max_reputation_page,max(1,$this -> db -> settings["reputation_perpage"]));
					$logs = $this -> db -> query("SELECT id FROM reputation WHERE cid='$cid' AND zbid='$user_zbid'",__LINE__,__FILE__);
					$num_rows = $logs -> num_rows;
					if($num_rows == 0){
						$total_pages = 0;
						$page = 0;
					} else {
						$total_pages = ceil($num_rows / $per_page);
						$page = min(max(1,$this -> db -> secure(isset($_GET['page']) ? $_GET['page'] : 1)),$total_pages);
						$start = ($page - 1) * $per_page;
						$logs2 = $this -> db -> query("SELECT from_zbid,reason,time,amount FROM reputation WHERE cid='$cid' AND zbid='$user_zbid' ORDER BY time DESC LIMIT $start,$per_page",__LINE__,__FILE__);
						while($l = $logs2 -> fetch_assoc()){
							$l_user = $this -> db -> get_user($l['from_zbid']);
							$l['username'] = $l_user === false ? "Unknown" : $l_user["username"];
							$this -> db -> output_vars["logs"][] = $l;
						}
					}
					$this -> db -> output_vars["rep_username"] = $user["username"];
					$this -> db -> output_vars["page"] = $page;
					$this -> db -> output_vars["total_pages"] = $total_pages;
					$this -> db -> output_vars["user_zbid"] = $user_zbid;
					$this -> db -> cb = "dynamo.reputation.log.show";
				} else {
					$this -> db -> output_vars["error"][] = 26;
					$this -> db -> cb = "dynamo.toolbox.error_check";
				}
			}
		}
		$reputation = new reputation;
	} else {
		require_once("../database.class.php");
		$database -> output_vars["error"][] = 25;
		$database -> output();
	}
	
?>