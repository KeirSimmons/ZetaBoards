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
				$this -> db -> notice_id = "currency-acp-interest";
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
			$this -> db -> cb = "dynamo.currency.acp.interest.groups";
		}
		
		private function form() {
			if(isset($this -> info["gid"])) {
				$gid = $this -> info["gid"];
				if(isset($this -> db -> groups["id-" . $gid])) {
					$group = $this -> db -> groups["id-" . $gid];
					$config = $group["config"]["currency"];
					$this -> db -> output_vars["info"] += array(
						"rate" => $config["interest_rate"],
						"every" => $config["interest_every"],
						"cap" => $config["interest_cap"],
						"group" => array(
							"name" => $group["name"],
							"id" => $gid
						)
					);
					$this -> db -> cb = "dynamo.currency.acp.interest.form";
				}
			} else {
				$this -> groups();
			}
		}
		
		private function edit() {
			$rate = +$this -> info["rate"];
			$every = +$this -> info["every"];
			$cap = +$this -> info["cap"];
			$gid = +$this -> info["gid"];
			if(
				!strlen($rate) ||
				!strlen($every) ||
				!strlen($cap) ||
				!strlen($gid) ||
				!isset($this -> db -> groups["id-" . $gid]) ||
				$rate < 0 ||
				$rate > 100 ||
				$every < 0 ||
				$every > 31557600 ||
				$cap < 0
			) {
				$this -> groups();
			} else {
				$to_update = array();
				$to_update[] = array("currency", "interest_rate", $gid, $rate);
				$to_update[] = array("currency", "interest_every", $gid, $every);
				if($this -> db -> settings["premium"]) {
					$to_update[] = array("currency", "interest_cap", $gid, $cap);
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