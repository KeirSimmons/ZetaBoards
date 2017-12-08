<?php

	class notifications_events implements iEvent {
		
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
			$this -> settings = $this -> db -> modules["notifications"]["settings"];
			$this -> my_settings = $this -> db -> my["config"]["notifications"];
		}
		
		public function ini() {
			$that = $this;
			$this -> db -> load_module_class("notifications");
			
			// load notifications to show
			// only show if user wants it to be shown & not using a notifications module (apart from the 'add' subroutine)
			if($this -> my_settings["perpage"] > 0 && ((isset($_GET['m'], $_GET['p1']) && $_GET['p1'] == "add") || (!isset($_GET['m']) || $_GET['m'] != "notifications"))) {
				$this -> db -> events["core"]["output"][] = function($data) use($that) {
					
					$max = $that -> db -> module_class["notifications"] -> get_max_perpage();
					$toshow = max(0, min($max, $that -> db -> my["config"]["notifications"]["perpage"]));
					$notifications = $that -> db -> module_class["notifications"] -> load(0, $toshow, 0);
					$that -> db -> output_vars["info"]["notifications"] = $notifications;
					$that -> db -> output_vars["info"]["notification_count"] = count($notifications);
				};
			} else {
				$this -> db -> events["core"]["output"][] = function($data) use($that) {
					$that -> db -> output_vars["info"]["notification_count"]
						= $that -> db -> module_class["notifications"] -> getCount();
				};
			}
			
			// core - username change
			$this -> db -> events["core"]["name_change"][] = function($data) use($that) {
				$that -> db -> module_class["notifications"] -> notify(array(
					"type" => "core-name_change",
					"data" => $data["new"]
				));
			};
			
			// currency - donate
			$this -> db -> events["currency"]["donate"][] = function($data) use ($that) {
				$that -> db -> module_class["notifications"] -> notify(array(
					"zbid" => $data["zbid"],
					"type" => "currency-donation",
					"data" => $data["amount"],
					"data_zbid" => $data["from"]
				));
			};
			
			// currency - edited money
			$this -> db -> events["currency"]["user-money-edit"][] = function($data) use($that) {
				$difference = $data["difference"];
				$type = $difference < 0 ? "minus" : "plus";
				$difference = abs($difference);
				$that -> db -> module_class["notifications"] -> notify(array(
					"zbid" => $data["zbid"],
					"type" => "currency-user_money_edit_$type",
					"data" => $difference
				));
			};
			
			// lottery - results drawn
			$this -> db -> events["lottery"]["draw_result"][] = function($data) use($that) {
				if(!empty($data)) {
					$time = time();
					$cid = $that -> db -> cid;
					
					foreach($data as &$values) {
						$values = "('$cid', '{$values[0]}', 'lottery-result', '{$values[1]}', '$time')";
					}
					
					$values = implode(", ", $data);
					$that -> db -> query("INSERT INTO `notifications` (`cid`, `zbid`, `type`, `data`, `time`) VALUES $values");
				}
			};
			
			/* LEVEL EVENTS */
			
			$this -> db -> events["level"]["level_up"][] = function($data) use ($that) {
				// levelled up
				$that -> db -> module_class["notifications"] -> notify(array(
					"type" => "level-levelled_up",
					"data" => $data["level"]
				));
			};
			
			$this -> db -> events["level"]["user-exp-edit"][] = function($data) use($that) {
				$difference = $data["difference"];
				$type = $difference < 0 ? "minus" : "plus";
				$difference = abs($difference);
				$that -> db -> module_class["notifications"] -> notify(array(
					"zbid" => $data["zbid"],
					"type" => "level-user_exp_edit_$type",
					"data" => $difference
				));
			};
			
			/* LEVEL EVENTS */
			
			/* MEMBER TAG EVENTS */
			
			$this -> db -> events["member-tag"]["tag"][] = function($data) use ($that) {
				if(!empty($data)) {
					$time = time();
					$cid = $that -> db -> cid;
					$zbid = $that -> db -> zbid;
					
					$tid = $data[0];
					$pid = $data[1];
					
					foreach($data[2] as &$values) {
						$d = $values[1] . "||" . $tid . "||" . $pid;
						$values = "('$cid', '{$values[0]}', 'member_tag-tag', '$d', '$zbid', '$time')";
					}
					
					$values = implode(", ", $data[2]);
					$that -> db -> query("INSERT INTO `notifications` (`cid`, `zbid`, `type`, `data`, `data_zbid`, `time`) VALUES $values");
				}
			};
			
			/* MEMBER TAG EVENTS */
			
			/* POST COMPETITION */
			
			$this -> db -> events["post"]["position_change"][] = function($data) use ($that) {
				$cid = $that -> cid;
				$zbid = $that -> zbid;
				function ordinal($n) {
					$ends = array('th','st','nd','rd','th','th','th','th','th','th');
					if (($n %100) >= 11 && ($n%100) <= 13) {
						$n = $n . 'th';
					} else {
						$n = $n . $ends[$n % 10];
					}
					return $n;
				}
				$new = ordinal($data["new"]);
				$time = time();
				$values = $data["old"] == 0
					? "('$cid', '$zbid', 'post-position_entered', '$new', '$time')"
					: ($data["diff"] < 0
						? "('$cid', '$zbid', 'post-position_increase', '$new', '$time')"
						: "('$cid', '$zbid', 'post-position_decrease', '$new', '$time')");
				$that -> db -> query("INSERT INTO `notifications` (`cid`, `zbid`, `type`, `data`, `time`) VALUES $values");
			};
			
			/* POST COMPETITION */
			
		}
	}

?>