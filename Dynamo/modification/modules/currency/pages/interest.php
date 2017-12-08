<?php
	class page implements iPage {
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> db -> notice_id = "currency-interest";
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
			$this -> premium = $this -> db -> premium;
			$this -> user_settings = $this -> db -> my["config"]["currency"]; // settings specific to user
			$this -> group_settings = $this -> db -> groups["id-" . $this -> db -> my["gid"]]["config"]["currency"]; // settings specific to user's group
			$this -> settings = $this -> db -> modules["currency"]["settings"]; // settings specific to module
			$this -> info = $this -> db -> secure($_GET['info']);
		}
	
		public function load() {
			$this -> ini();
		}
		
		private function ini() {
			$zbid = $this -> zbid;
			$interest_rate = ($this -> group_settings["interest_rate"]) / 100; // 1 => can collect interest, 0 => cannot collect interest
			if($interest_rate > 0) { // group can collect interest
				$time = time();
				$interest_last_collected = $this -> user_settings["interest_last_collected"];
				$interest_every = $this -> group_settings["interest_every"];
				$difference = $time - $interest_last_collected; // how long ago (in seconds) that I last collected interest
				$time_to_wait = $interest_every - $difference;
				if($time_to_wait > 0) {
					$this -> db -> output(2, array("to_wait" => $time_to_wait));
				} else {
					$money = $this -> user_settings["money"];
					$cap = $this -> premium ? $this -> group_settings["interest_cap"] : 0; // 0 means no cap (PREMIUM only)
					$extra = ceil($money * $interest_rate);
					$extra = $cap == 0 ? $extra : min($cap, $extra);
					
					$this -> db -> update_user_config(array(
						array('currency', 'interest_last_collected', $time),
						array('currency', 'money', $money + $extra)
					));
					
					$this -> db -> get_user_info(); 
					$this -> db -> fire_event(
						"currency",
						"interest",
						array(
							"amount" => 3
						)
					);
					$this -> db -> output(3, array("amount" => ($extra)));
				}
			} else {
				$this -> db -> output(1);
			}
		}
		
	}
		
?>