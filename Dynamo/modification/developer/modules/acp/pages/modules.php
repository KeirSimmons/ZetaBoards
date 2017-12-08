<?php
	class page implements iPage {
	
		private $modules;
	
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> db -> notice_id = "acp-modules";
			$this -> cid = $this -> db -> cid;
		}
	
		public function load() {
			$c = $this -> db -> secure($_GET['c']);
			$this -> full_list();
			switch($c) { // don't use $this -> $c to prevent someone passing in their own c method...
				case "list": // provide a list of all modules so the admin can install/ uninstall
					$this -> return_list();
					break;
				case "install":
					$this -> install();
					break;
				case "uninstall":
					$this -> uninstall();
					break;
				default:
					unset($this -> db -> notice_id);
					$this -> db -> output(19);
					break;
			}
		}
		
		private function full_list() {
			// query returns list of modules in order of: online, forced to use, admin only and finally how many forums have it installed
			$query = $this -> db -> query("SELECT a.id, a.name, a.desc, a.online, a.forced, a.admin, a.premium, a.prerequisites, b.installed, IF(a.forced=1, NULL, (SELECT COUNT(c.id) FROM module_installed c WHERE c.mid=a.id)) total FROM modules a LEFT JOIN module_installed b ON b.mid=a.id AND b.cid='{$this -> cid}' WHERE a.forced='0' AND a.released='1' ORDER BY a.online DESC, a.forced DESC, a.admin DESC, total DESC", __LINE__, __FILE__);
			$modules = array();
			$module_prereqs = array();
			
			while($q = $query -> fetch_assoc()) {
				$prereqs = array_filter(explode(',', $q['prerequisites']));
				
				foreach($prereqs as $pre) {
					$module_prereqs[$pre][] = $q['id'];
				}
				
				$modules[$q["id"]] = $q;
				
			}
			
			foreach($modules as &$mod) {
				$can_install = $this -> can_install($mod, $modules);
				$mod["installed"] = $can_install["possible"] && ($mod["forced"] == 1 || $mod["installed"] !== NULL);
				if($mod["installed"]) {
					$mod["uninstall"] = $this -> can_uninstall($mod, $modules, $module_prereqs);
				} else {
					$mod["install"] = $can_install;
				}
			}
			
			foreach($modules as &$mod) {
				// run in a separate foreach block so that the can_uninstall and can_install from the previous block runs for all mods before unsetting data
				unset($mod["online"], $mod["forced"], $mod["admin"], $mod["premium"], $mod["prerequisites"], $mod["total"]);
			}
			
			$this -> modules = $modules;
			
		}
		
		private function can_install($module, $modules) {
			$prerequisites = array_filter(explode(',', $module['prerequisites']));
			$installed_mids = $this -> db -> mids;
			$need_to_install = array_diff($prerequisites, $installed_mids);
			
			foreach($need_to_install as &$mid) {
				$mid = $modules[$mid]["name"];
			}
			
			if($module['online'] == 0) {
				return array(
					"possible" => false, 
					"info" => array(
						"reason" => 1 // not online
					)
				);
			} else if($module['premium'] == 1 && !$this -> db -> settings["premium"]) {
				return array(
					"possible" => false, 
					"info" => array(
						"reason" => 2 // premium only
					)
				);
			} else if(!empty($need_to_install)) {
				return array(
					"possible" => false, 
					"info" => array(
						"reason" => 3, // prereqs not installed
						"to_install" => $need_to_install
					)
				); 
			} else {
				return array("possible" => true); // can be installed!
			}
		}
		
		private function can_uninstall($module, $modules, $module_prereqs) {
			$prereqs = $module_prereqs[$module["id"]];
			$need_to_uninstall = array();
			if(isset($prereqs)) {
				foreach($prereqs as $prereq) {
					$mod = $modules[$prereq];
					if(isset($mod) && $mod["installed"]){
						$need_to_uninstall[] = $mod["name"];
					}
				}
			}
			if($module["forced"] == 1) {
				return array(
					"possible" => false, 
					"info" => array(
						"reason" => 4 // forced to stay online (eg. acp)
					)
				);
			} else if(!empty($need_to_uninstall)){
				return array(
					"possible" => false,
					"info" => array(
						"reason" => 5, // some other installed modules rely on this one being installed
						"to_uninstall" => $need_to_uninstall
					)
				);
			} else {
				return array("possible" => true); // can be uninstalled!
			}
		}
		
		private function return_list() {
			$this -> db -> output_vars["info"]["modules"] = $this -> modules;
			$this -> db -> cb = "dynamo.acp.modules.ini";
		}
		
		private function install() {
			// default cb data (changed further down the function)
			$result = 0;
			
			$id = $this -> db -> secure($_GET['id']);
			$module = $this -> modules[$id];
			
			if(isset($module)) {
				if($module["installed"]) {
					$this -> db -> output(3, array(
						"prefix" => ""
					)); // already installed
				} else if($module["install"]["possible"]) {
					$this -> modules[$id]["installed"] = true;
					$installed = array();
					foreach($this -> modules as $module) {
						if($module["installed"]) {
							$installed[] = $module["id"];
						}
					}
					$this -> db -> create_menu_file($installed);
					$time = time();
					$cid = $this -> db -> cid;
					$query = $this -> db -> query("INSERT INTO module_installed (mid, cid, installed) VALUES('$id', '$cid', $time)", __LINE__, __FILE__);
					// need to update menu for prompt
					$this -> db -> output(1, array(
						"prefix" => ""
					));
				} else {
					$this -> db -> output(2, array(
						"prefix" => ""
					)); // cannot install for some reason (which can be found by hovering over - tooltip)
				}
			} else {
				$this -> db -> output(4, array(
					"prefix" => ""
				)); // doesnt exist
			}
		}
		
		private function uninstall() {
			
			$id = $this -> db -> secure($_GET['id']);
			$cid = $this -> db -> cid;
			$module = $this -> modules[$id];
			
			if(isset($module)) {
				if($module["installed"]) {
					if($module["uninstall"]["possible"]) {
						$this -> modules[$id]["installed"] = false;
						$installed = array();
						foreach($this -> modules as $module) {
							if($module["installed"]) {
								$installed[] = $module["id"];
							}
						}
						$this -> db -> create_menu_file($installed);
						// delete config settings relating to this module first (only for this cid of course!)
						$delete_config = $this -> db -> query("DELETE a FROM module_config a LEFT JOIN module_settings b ON b.id=a.sid WHERE b.mid='$id' AND a.cid='$cid'", __LINE__, __FILE__);
						// delete entry from module_installed
						$delete_install = $this -> db -> query("DELETE FROM module_installed WHERE mid='$id' AND cid='$cid' LIMIT 1", __LINE__, __FILE__);
						// need to update menu for prompt
						$this -> db -> output(1, array(
							"prefix" => "un"
						)); // uninstalled successfully!
					} else {
						$this -> db -> output(2, array(
							"prefix" => "un"
						)); // cannot uninstall for some reason (which can be found by hovering over - tooltip)
					}
				} else {
					$this -> db -> output(5, array(
						"prefix" => "un"
					)); // not installed yet...
				}
			} else {
				$this -> db -> output(4, array(
					"prefix" => "un"
				)); // doesnt exist
			}
			$this -> db -> output_vars["info"]["result"] = $result;
		}
		
	}
?>