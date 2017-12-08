<?php
	class page implements iPage {
	
		private $info;
	
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> db -> notice_id = "acp-groups";
			$this -> cid = $this -> db -> cid;
			$this -> info = $this -> db -> secure($_GET['info']);
		}
	
		public function load() {
			$c = $this -> db -> secure($_GET['c']);
			switch($c) { // don't use $this -> $c to prevent someone passing in their own c method...
				case "list":
					$this -> full_list();
					break;
				case "update":
					$this -> update();
					break;
				case "change_access":
					$this -> change_access();
					break;
				default:
					unset($this -> db -> notice_id);
					$this -> db -> output(19);
					break;
			}
		}
		
		private function full_list() {
			$cid = $this -> cid;
			$query = $this -> db -> query("SELECT a.id, a.admin, a.name, COUNT(b.zbid) users FROM groups a LEFT JOIN users b ON b.gid = a.id WHERE a.cid='$cid' GROUP BY (a.id) ORDER BY a.admin DESC, users DESC", __LINE__, __FILE__);
			while($q = $query -> fetch_assoc()) {
				$this -> db -> output_vars["info"]["groups"][] = $q;
			}
			$this -> db -> cb = "dynamo.acp.groups.full_list";
		}
		
		private function update() {
			$cid = $this -> cid;
			if(isset($this -> info["groups"])) {
				$groups = $this -> info["groups"];
				$values = array();
				$new_groups = array();
				$old_groups = array();
				foreach($groups as $g) {
					$new_groups[] = $g['id'];
					$values[] = "({$g['id']}, $cid, '{$g['name']}')";
				}
				$values = implode(", ", $values);
				foreach($this -> db -> groups as $group) {
					$old_groups[] = $group['id'];
				}
				// first delete groups that no longer exist
				$diff = array_diff($old_groups, $new_groups);
				if(count($diff)) {
					$this -> db -> query("DELETE FROM `groups` WHERE `id` IN (" . implode(", ", $diff) . ") AND `cid`='$cid'");
				}
				$this -> db -> query("INSERT INTO groups (id, cid, name) VALUES $values ON DUPLICATE KEY UPDATE name = VALUES(name)");
				$this -> db -> output_vars["info"]["updated"] = true;
				$this -> db -> output(1);
			} else {
				$this -> full_list();
			}
		}
		
		private function change_access() {
			$cid = $this -> cid;
			$id = $this -> info["id"];
			$new_access = +$this -> info["new_access"];
			if(strlen($id) && strlen($new_access)) {
				if($new_access === 0 || $new_access == 1) {
					$query = $this -> db -> query("UPDATE groups SET admin='$new_access' WHERE cid='$cid' AND id='$id' AND admin!='2' LIMIT 1", __LINE__, __FILE__);
					if($this -> db -> mysqli -> affected_rows > 0) {
						$this -> db -> output(2);	
					} else {
						$this -> db -> output(3);
					}
				} else {
					$this -> db -> output(4);
				}
			} else {
				$this -> db -> output(5);
			}
		}
		
	}
?>