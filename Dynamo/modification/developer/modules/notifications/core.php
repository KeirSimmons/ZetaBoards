<?php
	class notifications {
	
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
			$this -> settings = $this -> db -> modules["notifications"]["settings"];
		}
		
		public function get_max_perpage() {
			return $this -> db -> settings["premium"] ? 5 : 2; // max per page for premium and basic account
		}
	
		public function load($start, $amount, $read, $mod = 1) {
			$zbid = $this -> zbid;
			$cid = $this -> cid;
			$time = time();
			$query = <<<QUERY
SELECT `id`, `type`, `data`, `data_zbid`, `time`
FROM `notifications`
WHERE `cid`='$cid' AND `zbid`='$zbid' AND `read`='$read'
ORDER BY `time` DESC
LIMIT $start, $amount
QUERY;

			$zbids = array();
			$notifications = array();
			$to_find = array();
			$query = $this -> db -> query($query);
			while($q = $query -> fetch_assoc()) {
				if($q['data_zbid'] !== null) {
					$user = $this -> db -> get_user($q['data_zbid']);
					if($user === false) {
						if(!in_array($q['data_zbid'], $zbids)) {
							$zbids[] = $q['data_zbid'];
						}
						$to_find["id-" . $q['data_zbid']][] = $q;
						continue;
					} else {
						$q['username'] = $user['username'];
					}
				}
				$notifications[] = $q;
			}
			if(!empty($zbids)) {
				$this -> db -> get_users($zbids);
				foreach($zbids as $z) {
					$user = $this -> db -> get_user($z);
					if($user !== false) {
						foreach($to_find["id-" . $z] as $t) {
							$t['username'] = $user["username"];
							$notifications[] = $t;
						}
					} else {
						foreach($to_find["id-" . $z] as $t) {
							$t['username'] = "Unknown user";
							$notifications[] = $t;
						}
					}
					unset($to_find["id-" . $z]);
				}
			}
			
			usort($notifications, function($a, $b) {
				// show most recent first
				return $b["time"] - $a["time"];
			});
			return $notifications;
		}
		
		public function getCount() {
			$zbid = $this -> zbid;
			$cid = $this -> cid;
			$query = <<<QUERY
SELECT COUNT(*)
FROM `notifications`
WHERE `cid`='$cid' AND `zbid`='$zbid' AND `read`='0'
QUERY;
			$query = $this -> db -> query($query);
			
			return $this -> db -> get_result($query);
		}
	
		public function notify($arr) {
			$cid = isset($arr["cid"]) ? $arr["cid"] : $this -> cid;
			$zbid = isset($arr["zbid"]) ? $arr["zbid"] : $this -> zbid;
			$type = $arr["type"];
			$data = isset($arr["data"]) ? $arr["data"] : "";
			$data_zbid = isset($arr["data_zbid"]) ? $arr["data_zbid"] : null;
			$time = time();
			return $this -> db -> query("INSERT INTO `notifications` (`cid`, `zbid`, `type`, `data`, `data_zbid`, `time`) VALUES('$cid', '$zbid', '$type', '$data', '$data_zbid', '$time')");
		}
		
	}
?>