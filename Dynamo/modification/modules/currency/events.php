<?php

	class currency_events implements iEvent {
		
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
		}
		
		public function ini() {
		
			$that = $this;
			
			/* CURRENCY EVENTS */
			
			$this -> db -> events["currency"]["interest"][] = function($data) use($that) {
				$amount = $data["amount"];
				$zbid = $that -> db -> zbid;
				$cid = $that -> db -> cid;
				$time = time();
				$query = "INSERT INTO `currency_history` (`cid`, `zbid`, `type`, `amount`, `time`) VALUES ('$cid', '$zbid', 'currency-interest', '$amount', '$time')";
				$query = $that -> db -> query($query);
			};
			
			$this -> db -> events["currency"]["user-money-edit"][] = function($data) use($that) {
				$zbid = $that -> db -> zbid;
				$cid = $that -> db -> cid;
				$difference = $data["difference"];
				$reason = $data["reason"];
				$type = $difference < 0 ? "minus" : "plus";
				$difference = abs($difference);
				$time = time();
				$query = "INSERT INTO `currency_history` (`cid`, `zbid`, `type`, `amount`, `message`, `time`) VALUES ('$cid', '$zbid', 'currency-user_money_edit_$type', '$difference', '$reason',  '$time')";
				$query = $that -> db -> query($query);
			};
			
			$this -> db -> events["currency"]["donate"][] = function($data) use ($that) {
				$amount = $data["amount"];
				$other_zbid = $data["zbid"];
				$message = $data["message"];
				$zbid = $that -> zbid;
				$cid = $that -> cid;
				$time = time();
				$query = <<<QUERY
INSERT INTO `currency_history`
(`cid`, `zbid`, `type`, `amount`, `data_zbid`, `message`, `time`)
VALUES
('$cid', '$zbid', 'currency-donate_to', '$amount', '$other_zbid', '$message', '$time')
QUERY;
				$query = $that -> db -> query($query);
				$query2 = <<<QUERY
INSERT INTO `currency_history`
(`cid`, `zbid`, `type`, `amount`, `data_zbid`, `message`, `time`)
VALUES
('$cid', '$other_zbid', 'currency-donate_from', '$amount', '$zbid', '$message', '$time')
QUERY;
				$query2 = $that -> db -> query($query2);
			};
			
			/* CURRENCY EVENTS */
			
			
			/* CORE EVENTS */
			
			$this -> db -> events["core"]["posted"][] = function($data) use ($that) {
				// add money to account
				// checks have already been done to ensure this is a real post
				$cid = $that -> cid;
				$zbid = $that -> zbid;
				$gid = $that -> db -> my["gid"];
				$settings = $that -> db -> groups["id-" . $gid]["config"]["currency"];
				$type = $data["type"];
				
				$extra = rand($settings[$type . "_min"], $settings[$type . "_max"]);
				
				$user_settings = $that -> db -> my["config"]["currency"];
				$money = $user_settings["money"];
				$that -> db -> update_user_config(array(
					array("currency", "money", $money + $extra)
				));
			};
			
			/* CORE EVENTS */
			
			
			/* LOTTERY EVENTS */
			
			$this -> db -> events["lottery"]["ticket_bought"][] = function($data) use ($that) {
				// lottery ticket has just been bought
				$cid = $that -> cid;
				$zbid = $that -> zbid;
				$time = time();
				$amount = $data["price"];
				$query = <<<QUERY
INSERT INTO `currency_history`
(`cid`, `zbid`, `type`, `amount`, `time`)
VALUES
('$cid', '$zbid', 'lottery-ticket_bought', '$amount', '$time')
QUERY;
				$query = $that -> db -> query($query);
			};
			
			// lottery - results drawn, add money and add to transaction history
			$this -> db -> events["lottery"]["draw_result"][] = function($data) use($that) {
				if(!empty($data)) {
					$time = time();
					$cid = $that -> db -> cid;
					$history = array();
					
					foreach($data as &$values) {
						$history[] = "('$cid', '{$values[0]}', 'lottery-winnings', '{$values[1]}', '$time')";
						$values = array("currency", "money", $values[1], $values[0]);
					}
					
					$that -> db -> update_user_config($data, "+`value`");
					
					$history = implode(", ", $history);
					
					$query = "INSERT INTO `currency_history` (`cid`, `zbid`, `type`, `amount`, `time`) VALUES $history";
					$query = $that -> db -> query($query);
				}
			};
			
			/* LOTTERY EVENTS */
			
		}
		
	}

?>