<?php
	class page implements iPage {
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
			$this -> user_settings = $this -> db -> my["config"]["currency"]; // settings specific to user
			$this -> group_settings = $this -> db -> groups["id-" . $this -> db -> my["gid"]]["config"]["currency"]; // settings specific to user's group
			$this -> settings = $this -> db -> modules["currency"]["settings"]; // settings specific to module
			$this -> info = $this -> db -> secure($_GET['info']);
			if($this -> db -> groups["id-" . $this -> db -> my["gid"]]["admin"] == 0) {
				$this -> db -> output(18);
			} else {
				$this -> db -> notice_id = "currency-acp-donate";
			}
		}
	
		public function load() {
			$c = $this -> db -> secure($_GET['c']);
			switch($c) {
				case "groups":
					$this -> groups();
					break;
				case "form":
					$this -> form();
					break;
				case "edit":
					$this -> edit();
					break;
				default:
					unset($this -> db -> notice_id);
					$this -> db -> output(19);
					break;
			}
		}
		
		private function groups() {
			$cid = $this -> cid;
			$query = $this -> db -> query("SELECT a.id, a.admin, a.name, COUNT(b.zbid) users FROM groups a LEFT JOIN users b ON b.gid = a.id WHERE a.cid='$cid' GROUP BY (a.id) ORDER BY a.admin DESC, users DESC", __LINE__, __FILE__);
			while($q = $query -> fetch_assoc()) {
				$this -> db -> output_vars["info"]["groups"][] = $q;
			}
			$this -> db -> cb = "dynamo.currency.acp.donate.groups";
		}
		
		private function form() {
			if(isset($this -> info["gid"])) {
				$gid = $this -> info["gid"];
				if(isset($this -> db -> groups["id-" . $gid])) {
					$group = $this -> db -> groups["id-" . $gid];
					$config = $group["config"]["currency"];
					$this -> db -> output_vars["info"] += array(
						"can" => $config["donate_can"],
						"times" => $config["donate_timesperday"],
						"amount" => $config["donate_amountperday"],
						"registered" => $config["donate_daysregistered"],
						"group" => array(
							"name" => $group["name"],
							"id" => $gid
						)
					);
					$this -> db -> cb = "dynamo.currency.acp.donate.form";
				}
			} else {
				$this -> groups();
			}
		}
		
		private function edit() {
			$can = +$this -> info["can"];
			$times = +$this -> info["times"];
			$amount = +$this -> info["amount"];
			$registered = +$this -> info["registered"];
			$gid = +$this -> info["gid"];
			if(
				!strlen($can) ||
				!strlen($times) ||
				!strlen($amount) ||
				!strlen($registered) ||
				!isset($this -> db -> groups["id-" . $gid]) ||
				$can < 1 ||
				$can > 2 ||
				$times < 0 ||
				$amount < 0 ||
				$registered < 0 ||
				$registered > 365
			) {
				$this -> groups();
			} else {
				$to_update = array();
				$to_update[] = array("currency", "donate_can", $gid, $can);
				$to_update[] = array("currency", "donate_timesperday", $gid, $times);
				$to_update[] = array("currency", "donate_amountperday", $gid, $amount);
				if($this -> db -> settings["premium"]) {
					$to_update[] = array("currency", "donate_daysregistered", $gid, $registered);
				}
				$update = $this -> db -> update_group_config($to_update);
				$this -> db -> output(
					$update !== false && $this -> db -> mysqli -> affected_rows > 0
						? 2
						: 1
				);
			}
		}
		
	}
		
?>