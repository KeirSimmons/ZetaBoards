<?php
	class page implements iPage {
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> db -> notice_id = "acp-overview";
			$this -> cid = $this -> db -> cid;
		}
	
		public function load() {
			$this -> ini();
		}
		
		private function ini() {
			/*$query = $this -> db -> query("SELECT COUNT(zbid) total, (SELECT COUNT(zbid) FROM users WHERE cid='{$this -> cid}') loyal FROM users");
			$query = $query -> fetch_assoc();
			$this -> db -> output_vars["info"]["stock"] = round(($query["loyal"] / max(1,$query["total"])) * 100, 2);*/
			$cid = $this -> cid;
			$query = $this -> db -> query("SELECT COUNT(`zbid`) FROM `users` WHERE `cid`='$cid'");
			$module_query = $this -> db -> query("SELECT COUNT(`id`) FROM `modules` WHERE `online`='1' AND `forced`='0'", __LINE__, __FILE__);
			$total_modules = $this -> db -> get_result($module_query);
			$this -> db -> output_vars["info"]["premium"] = array(
				"on" => $this -> db -> premium,
				"end" => $this -> db -> settings["premium"]
			);
			$this -> db -> output_vars["info"]["ad_removal"] = array(
				"on" => $this -> db -> ad_removal,
				"credits" => $this -> db -> settings["ad_removal"]
			);
			$this -> db -> output_vars["info"]["members"] = +$this -> db -> get_result($query);
			function is_forced($module) {
				return $module["forced"] == 0; // don't show acp for example!
			}
			$this -> db -> output_vars["info"]["modules"] = array(
				"in_use" => count(array_filter($this -> db -> modules, function ($module) {
					return $module["forced"] == 0;
				})),
				"available" => $total_modules);
			$this -> db -> cb = "dynamo.acp.overview";
		}
	}
?>