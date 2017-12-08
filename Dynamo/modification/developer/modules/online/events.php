<?php

	class online_events implements iEvent {
		
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
			$this -> settings = $this -> db -> modules["online"]["settings"];
			$this -> db -> load_module_class("online");
			$this -> config = $this -> db -> module_class["online"] -> config;
		}
		
		public function ini() {
		
			$that = $this;
			
			// core - start (validations checked)
			$this -> db -> events["core"]["start"][] = function($data) use($that) {
				$page = $that -> db -> secure($_GET['page']['id']);
				if($page == "index") {
					$cid = $that -> cid;
					$zbid = $that -> zbid;
					$that -> db -> query("UPDATE `users` SET `lastonline`=UNIX_TIMESTAMP() WHERE `cid`='$cid' AND `zbid`='$zbid' LIMIT 1");
				}
			};
			
			// core - output
			$this -> db -> events["core"]["output"][] = function($data) use($that) {
				$page = $that -> db -> secure($_GET['page']['id']);
				if($page == "index") {
					$cid = $that -> cid;
					$period = max(1, +$that -> settings["period"]);
					$limit = $that -> db -> premium ? "" : "LIMIT 5";
					$query = $that -> db -> query("SELECT `zbid`, `username`, `username_style` FROM `users` WHERE `lastonline` > UNIX_TIMESTAMP() - $period AND `cid`='$cid' ORDER BY `lastonline` DESC $limit");
					$that -> db -> output_vars["info"]["online"] = $that -> settings;
					$that -> db -> output_vars["info"]["online"]["total"] = $query -> num_rows;
					$that -> db -> output_vars["info"]["online"]["users"] = array();
					$i = 0;
					$j = $that -> config["users"][$that -> db -> premium];
					while($q = $query -> fetch_assoc()) {
						$q['username'] = strlen($q['username_style']) ? $q['username_style'] : $q['username'];
						unset($q['username_style']);
						$that -> db -> output_vars["info"]["online"]["users"][] = $q;
						if(++$i == $j) {
							break;
						}
					}
				}
			};
			
		}
	}

?>