<?php
	class page implements iPage {
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> db -> notice_id = "currency-donate";
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
			$this -> user_settings = $this -> db -> my["config"]["currency"]; // settings specific to user
			$this -> group_settings = $this -> db -> groups["id-" . $this -> db -> my["gid"]]["config"]["currency"]; // settings specific to user's group
			$this -> settings = $this -> db -> modules["currency"]["settings"]; // settings specific to module
			$this -> info = $this -> db -> secure($_GET['info']);
		}
	
		public function load() {
			$c = $this -> db -> secure($_GET['c']);
			switch($c) {
				case "form":
					$this -> form();
					break;
				case "user":
					$this -> find_user();
					break;
				case "finish":
					$this -> finish();
					break;
				default:
					unset($this -> db -> notice_id);
					$this -> db -> output(19);
					break;
			}
		}
		
		private function can_donate($amount = 0){
			/* GROUP SETTINGS */
			// for min post count, make a group which cannot donate but is promoted to a group on x posts which can donate
			// max times per day (donate_timesperday) -> 0 implies group cannot donate ever
			// max amount per day (donate_amountperday) -> 0 implies no limit
			// PREMIUM : registered for x days (donate_daysregistered) -> 0 implies can donate from registration. NB: dynamo registration not board reg

			/* USER SETTINGS */
			// times donated today (donate_timestoday)
			// amount donated today (donate_amounttoday)
			// first donation today (24 hours after this, above = 0) (donate_firsttoday)
			$zbid = $this -> zbid;
			$cid = $this -> cid;
			$time = time();
			$premium = $this -> db -> settings["premium"];
			
			$group_can_donate = $this -> group_settings["donate_can"];
			$group_times_per_day = $this -> group_settings["donate_timesperday"];
			$group_amount_per_day = $this -> group_settings["donate_amountperday"];
			$group_registered = $this -> group_settings["donate_daysregistered"];
			
			$money = $this -> user_settings["money"];
			$my_first_today = $this -> user_settings["donate_firsttoday"];
			$my_times_today = $this -> user_settings["donate_timestoday"];
			$my_amount_today = $this -> user_settings["donate_amounttoday"];
			
			$seconds_to_next_day = $my_first_today + 86400 - $time; // positive means you are still in the same day
			
			if($seconds_to_next_day < 0) {
				// reset day counter
				$my_first_today = $time;
				$my_times_today = 0;
				$my_amount_today = 0;
			}
			
			$registered = $this -> db -> my["registered"];
			$register_wait = ($group_registered * 86400) - ($time - $registered);
			$amount_left = max(0, $group_amount_per_day == 0 ? $money : min($money, $group_amount_per_day - $my_amount_today));
			$amount = abs($amount);
			
			if($premium && $register_wait > 0) {
				// not registered long enough
				$this -> db -> output(2, array(
					"initial" => 86400 * $group_registered,
					"to_wait" => $register_wait
				));
			} elseif($money == 0) {
				$this -> db -> output(4);
			} elseif($group_can_donate == 0) {
				$this -> db -> output(12);
			} elseif($my_times_today >= $group_times_per_day && $group_times_per_day > 0) {
				// donated max times today already, please wait
				$this -> db -> output(3, array(
					"max" => $group_times_per_day,
					"to_wait" => $seconds_to_next_day
				));
			} elseif($money < $amount) {
				// donating more than available
				$this -> db -> output(7, array(
					"money" => $amount_left
				));
			} elseif($amount_left < $amount && $group_amount_per_day > 0) {
				// donating more than can be allowed today
				$this -> db -> output(5, array(
					"already" => $my_amount_today,
					"per_day" => $group_amount_per_day,
					"max" => $amount_left,
					"to_wait" => $seconds_to_next_day
				));
			} else {
				// able to donate, carry on
				return array($my_first_today, $my_times_today, $my_amount_today, $amount_left);
			}
		}
		
		private function form() {
			$this -> can_donate(); // this will end execution if you cannot donate!
			$this -> db -> cb = "dynamo.currency.donate.form_1";
		}
		
		private function find_user() {
			list($my_first_today, $my_times_today, $my_amount_today, $amount_left) = $this -> can_donate();
			$cid = $this -> cid;
			$zbid = $this -> zbid;
			$user = $this -> info['user'];
			$instant = $this -> info["instant"];
			if(strlen($user) > 2 || (strlen($instant) && $this -> db -> get_user($instant, true) !== false)){
				if(strlen($user) > 2) {
					$search = $this -> db -> query("SELECT zbid, username FROM users WHERE cid='$cid' AND zbid!='$zbid' AND username LIKE '$user%' ORDER BY length(username) ASC LIMIT 10",__LINE__,__FILE__);
					if($search -> num_rows == 0){
						$this -> db -> output(6, array(
							"username" => $user
						));
					} 
					$this -> db -> output_vars["info"]["matches"] = array();
					while($s = $search -> fetch_assoc()){
						$this -> db -> output_vars["info"]["matches"][] = array(
							"zbid" => $s['zbid'], 
							"username" => $s['username']
						);
					}
				} else {
					$user = $this -> db -> get_user($instant);
					$this -> db -> output_vars["info"]["matches"][] = array(
						"zbid" => $user["zbid"],
						"username" => $user["username"]
					);
				}
				$this -> db -> output_vars["info"]["left"] = $amount_left;
				$this -> db -> output_vars["info"]["money"] = $this -> user_settings["money"];
				$this -> db -> output_vars["info"]["donated"] = $this -> user_settings["donate_amounttoday"];
				$this -> db -> output_vars["info"]["max_amount"] = $this -> group_settings["donate_amountperday"];
				$this -> db -> cb = "dynamo.currency.donate.form_2";
			} else {
				$this -> db -> cb = "dynamo.currency.donate.form_1";
			}
		}
		
		private function finish() {
			$zbid = $this -> zbid;
			$other_zbid = $this -> info['user'];
			$message = $this -> info['message'];
			$amount = $this -> info['amount'];
			$money = $this -> user_settings["money"];
			list($my_first_today, $my_times_today, $my_amount_today, $amount_left) = $this -> can_donate($amount);
			if(strlen($other_zbid) && strlen($amount) && $other_zbid != $zbid && $other_zbid > 0) {
				$money -= $amount;
				$other_user = $this -> db -> get_user($other_zbid, true);
				if($other_user !== false) {
					$my_first_today = $my_first_today == 0 ? time() : $my_first_today;
					$my_times_today++;
					$my_amount_today += $amount;
					$other_money = $other_user["config"]["currency"]["money"] + $amount;
					$this -> db -> update_user_config(array(
						array('currency', 'donate_firsttoday', $my_first_today),
						array('currency', 'donate_timestoday', $my_times_today),
						array('currency', 'donate_amounttoday', $my_amount_today),
						array('currency', 'money', $money),
						array('currency', 'money', $other_money, $other_zbid)
					));
					$this -> db -> fire_event(
						"currency",
						"donate",
						array(
							"amount" => $amount,
							"zbid" => $other_zbid,
							"from" => $zbid,
							"message" => $message
						)
					);
					$this -> db -> get_user_info(); 
					$this -> db -> output(11);
				} else { // user does not exist
					$this -> db -> output(12);
				}
			} else { // not enough params passed
				$this -> db -> cb = "dynamo.currency.donate.form_1";
			}
		}
		
	}
		
?>