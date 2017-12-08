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
				$this -> db -> notice_id = "currency-acp-post";
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
			$this -> db -> cb = "dynamo.currency.acp.post.groups";
		}
		
		private function form() {
			if(isset($this -> info["gid"])) {
				$gid = $this -> info["gid"];
				if(isset($this -> db -> groups["id-" . $gid])) {
					$group = $this -> db -> groups["id-" . $gid];
					$config = $group["config"]["currency"];
					$this -> db -> output_vars["info"] += array(
						"reply" => array(
							"min" => $config["reply_min"],
							"max" => $config["reply_max"],
						),
						"topic" => array(
							"min" => $config["topic_min"],
							"max" => $config["topic_max"],
						),
						"group" => array(
							"name" => $group["name"],
							"id" => $gid
						)
					);
					$this -> db -> cb = "dynamo.currency.acp.post.form";
				}
			} else {
				$this -> groups();
			}
		}
		
		private function edit() {
			$reply_min = +$this -> info["reply_min"];
			$reply_max = +$this -> info["reply_max"];
			$topic_min = +$this -> info["topic_min"];
			$topic_max = +$this -> info["topic_max"];
			$gid = +$this -> info["gid"];
			if(
				!strlen($reply_min) ||
				!strlen($reply_max) ||
				!strlen($topic_min) ||
				!strlen($topic_max) ||
				!isset($this -> db -> groups["id-" . $gid]) ||
				$reply_min < 0 ||
				$reply_max < 0 ||
				$topic_min < 0 ||
				$topic_max < 0
			) {
				$this -> groups();
			} else {
				$to_update = array();
				$to_update[] = array("currency", "reply_min", $gid, min($reply_min, $reply_max));
				$to_update[] = array("currency", "reply_max", $gid, max($reply_min, $reply_max));
				$to_update[] = array("currency", "topic_min", $gid, min($topic_min, $topic_max));
				$to_update[] = array("currency", "topic_max", $gid, max($topic_min, $topic_max));
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