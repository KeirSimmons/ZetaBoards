<?php
	class Database {
		public $mysqli,
		$settings = array(), // from core table and domains table
		$modules = array(),  // modules (from modules table) and non gid-specific settings with overriden values (if set, otherwise default); only for installed modules which are also turned on
		$mids = array(), // id of all installed modules (which are turned on)
		$groups = array(), // groups (from groups table) and gid-specific settings (from module_config/ module_settings) with overriden values (if set, otherwise default)
		$my = false,
		$new_member = false,
		$username,
		$zbid,
		$url,
		$gid,
		$cid,
		$password,
		$module_class = array();
		
		private $events_scraped = false;
		private $debugged = false;
		
		private $salt = "fewfe4356f;";
		
		function __construct(){
			if(FROM == "core" || FROM == "guest" || FROM == "tasks" || FROM == "menu" || FROM == "web" || FROM == "api" || FROM == "cron") {
				define("DATABASE_LOADED", true);
				require_once("config.php");
				if($config -> DYNAMO_ON){ // only continue if dynamo is online
					$this -> mysqli = new mysqli("127.0.0.1", "viralsmo_admin", "6r*pah3g9se=_F!v", "viralsmo_dynamo");
					if ($mysqli -> connect_errno) {
						// TODO : couldn't connect to db - hardlog to file?
					} else {
						$this -> config = $config;
						$cb = $this -> secure($_GET['cb']);
						if(!empty($cb)) {
							$this -> cb = "dynamo." . $cb;
						}
						$this -> developer = $this -> secure($_GET['developer']);
					}
				} else {
					$this -> output(12);
				}
			} else { // else security breach, don't load rest of file
				exit; 
			}
		}
		
		public function get_settings($guest = false){
		
			$this -> username = $username = $this -> secure($_GET['username']);
			$this -> zbid = $zbid = $this -> secure($_GET['zbid']);
			$this -> url = $url = $this -> secure($_GET['url']);
			$this -> gid = $gid = $this -> secure($_GET['gid']);
			$this -> cid = $cid = $this -> secure($_GET['cid']);
			$this -> password = $password = $this -> secure($_GET['password']);
			
			if(($cid && $url && $username && $zbid && $gid) || $guest) {
				$settings = $this -> query("SELECT GROUP_CONCAT(d.domain) AS domains, GROUP_CONCAT(d.zb) AS zb_info, c.* FROM core c JOIN domains d ON d.cid = c.id WHERE c.id ='$cid' LIMIT 1", __LINE__, __FILE__);
				$this -> settings = $settings -> fetch_assoc();
				$this -> premium = $this -> settings["premium"] > time();
				$this -> ad_removal = $this -> settings["ad_removal"] > 0.00;
				if(isset($this -> settings["domains"], $this -> settings["zb_info"], $this -> settings["id"])){
					if($this -> validate_forum(
						explode(",", $this -> settings["domains"]),
						explode(",", $this -> settings["zb_info"])
					)){
					} else {
						$this -> output(7);
					}
				} else {
					$this -> output(6);
				}
			} else {
				$this -> output(5);
			}
		}
			
		public function get_modules(){
			$cid = $this -> cid;
			// find the modules which have been installed (and ensure they are not turned off), and return their id, name, and menu information (uneditable settings)
			$modules = $this -> query("SELECT a.id id, a.name name, a.online online, a.admin admin, a.forced forced, a.premium premium, a.menu menu, a.prerequisites prereqs FROM modules a LEFT JOIN module_installed b ON b.mid=a.id WHERE (b.cid='$cid' OR a.forced=1) ORDER BY a.forced DESC, a.admin DESC, a.premium DESC, a.id ASC", __LINE__, __FILE__);
			while($m = $modules -> fetch_assoc()){
				// following check ensures that module is on not premium (or you have a premium account)
				// note: do not check if prereqs are installed here as this should be done on installation -> this means prereqs must never change!
				if($m['online'] == 1 && ($m['premium'] == 0 || $this -> premium)) {
					$this -> modules[$m['id']] = $m;
					$this -> modules[$m['id']]["settings"] = array();
					$this -> mids[] = $m['id'];
				}
			}
			
			// get all the [editable] (non group-specific) settings for the installed modules found above
			$modules_installed = "'" . implode("','", $this -> mids) . "'";
			$module_query = $this -> query("SELECT a.mid, a.name, COALESCE(b.value, a.initial) value FROM module_settings a LEFT JOIN module_config b ON b.sid = a.id AND b.cid='$cid' WHERE a.gid_specific=0 AND a.mid IN ($modules_installed)", __LINE__, __FILE__);
			while($m = $module_query -> fetch_assoc()){
				$this -> modules[$m['mid']]["settings"][$m['name']] = $m['value'];
			}
			foreach($this -> modules as &$mod) {
				$mod["name"] = isset($mod["settings"]["menu_name"]) ? $mod["settings"]["menu_name"] : $mod["name"];
				unset($mod["settings"]["menu_name"]);
			}
		}
		
		public function update_modules($my_admin = false) {
			// on initial get_modules() call, all admin modules are loaded. these must now be removed if not an admin!
			$my_admin = $my_admin == false ? $this -> groups["id-" . $this -> my["gid"]]["admin"] : $my_admin;
			$mids_to_remove = array();
			foreach($this -> modules as $module) {
				if($my_admin < $module["admin"]) {
					$mids_to_remove[] = $module["id"];
					unset($this -> modules[$module["id"]]);
				}
			}
			
			// update mids as well
			$this -> mids = array_diff($this -> mids, $mids_to_remove);
			
			/* load menu file */
			$this -> settings["menujs"] = $this -> create_menu_file($this -> mids);
			
			/* load afterload file if it has content */
			$afterload = $this -> create_afterload_file($this -> mids);
			
			if(strlen($afterload)){
				$this -> settings["afterload"] = $afterload;
			}
		}
		
		public function get_groups(){
		
			$cid = $this -> cid;
			$gid = $this -> gid;
			
			$query = $this -> query("SELECT * FROM groups WHERE cid='".$cid."'", __LINE__, __FILE__);
			$present = false;
			
			while($g = $query -> fetch_assoc()) {
				$this -> groups["id-" . $g["id"]] = $g;
				$this -> groups["id-" . $g["id"]]["config"] = array();
				$this -> gids[] = $g["id"];
				if($g["id"] == $gid){
					$present = true;
				}
			}
			
			if($present) {
				$config = $this -> query("SELECT a.id id, a.mid mid, a.name name, a.initial default_value, b.gid gid, COALESCE(b.value, a.initial) value FROM module_settings a LEFT JOIN module_config b ON b.sid=a.id AND b.cid='" . $cid . "' AND b.gid IN (" . implode($this -> gids, ", ") . ") WHERE a.gid_specific='1' AND a.mid IN ('" . implode($this -> mids, "', '") . "') ORDER BY a.id ASC, b.gid ASC");
				$config_mid = -1;
				$config_name = -1;
				while($c = $config -> fetch_assoc()) {
					$to_change = false;
					if($c["mid"] != $config_mid) { // now onto the next module so insert this setting array to all groups
						$config_mid = $c["mid"];
						$to_change = true;
						foreach($this -> groups as &$value) {
							$value["config"][$c["mid"]] = array();
						}
					}
					if($c["name"] != $config_name || $to_change) { // now onto the next specific setting, or the module just changed (implying that even if the name hasn't changed, the combination of mid and name results in a different setting id!
						$config_name = $c["name"];
						foreach($this -> groups as &$value) {
							$value["config"][$c["mid"]][$c["name"]] = $c["default_value"];
						}
					}
					// all default values for this setting have been established
					// override the value of the setting if it has been overriden in the database (for this gid)
					if(isset($this -> groups["id-" . $c["gid"]])) {
						$this -> groups["id-" . $c["gid"]]["config"][$c["mid"]][$c["name"]] = $c["value"];
					}
					// access:  $groups["id-#"]["config"]["module_name"]["setting_name"]
					// example: $groups["id-1234"]["config"]["currency"]["hand_default"] etc..
				}
				
				
			} else {
				$this -> create_group($gid);
				$this -> get_groups();
			}
			
		}
		
		private function create_group($gid) {
			$cid = $this -> cid;
			$query = $this -> query("INSERT INTO groups (id, cid) VALUES('$gid', '$cid')", __LINE__, __FILE__);
			// TODO : New group created, alert admin that they need to adjust settings -> admin_tasks?
		}
		
		public function get_users($zbids = array()){
			
			$username = $this -> username;
			$password = $this -> password;
			$zbid = $this -> zbid;
			$cid = $this -> cid;
			$gid = $this -> gid;
		
			if(empty($zbids)) { // initial call
				$this -> zbids = array_merge(
					isset($_GET['zbids']) ? $this -> secure($_GET['zbids']) : array(),
					array($this -> zbid)
				);
				
				$this -> users = array(); // reset
				
				$users = $this -> query("SELECT * FROM users WHERE cid='$cid' AND zbid IN (" . implode($this -> zbids, ", ") . ")", __LINE__, __FILE__);
				
				while($u = $users -> fetch_assoc()){
					$this -> users["u-" . $u['zbid']] = $u;
				}
				
				$this -> my = &$this -> get_user($zbid);
				
				if(!$this -> my){ // not present in database
					$this -> register();
				} else {
					$setup = $this -> my["setup"];
					if(($password == ($this -> my["password"])) && strlen($password) > 0){ // password matches, carry on with script
						if(!($this -> new_member)){ // password set, registered before this page load
							if($setup == 1){ // Password has been stored as a message tag, so now update user details to reflect this and secure account
								$update = $this -> query("UPDATE users SET setup='0' WHERE cid='$cid' AND zbid='$zbid' AND password='$password' LIMIT 1",__LINE__,__FILE__);
							} elseif($setup == 2 || $setup == 3) {
								// password was messed up, now its not -> most likely someone else tried to hack into account
								$query = $this -> query("UPDATE `users` SET `setup`='0', `setup_pin`='0' WHERE `cid`='$cid' AND `zbid`='$zbid' LIMIT 1");
							}
							$this -> output_vars["login"] = 1; // logged in as normal
						} else { // password has only just been set, and was just registered on this page load
							$this -> output_vars["login"] = 2; // Account just set up
							$this -> output_vars["password"] = $this -> my["password"];
						}
					} else {
						if($setup == 1){
							$this -> output_vars["login"] = 3; // Password not given, but setup not complete so resend password for storage
							$this -> output_vars["password"] = $this -> my["password"];
						} elseif($setup == 2) { // Admin has refreshed account - user needs to be sent a pin to re-activate account
							// TODO: Account refreshing has not been finished!
							$this -> output_vars["login"] = 0;
							$time = time();
							if(($time - $this -> my["setup_first_try"]) > 86400){
								$this -> my["setup_tries"] = 0;
							}
							if($this -> my["setup_tries"] < $this -> config -> SETUP_TRIES){ // Still have more attempts today - still not logged in but can request for pin
								$this -> output_vars["login"] = 4;
								$this -> output(9);
							} else { // All attempts used today
								$this -> output(10, array(
									"to_wait" => $this -> my["setup_first_try"] + 86400 - $time
								));
							}
						} elseif($setup == 3) {
							// Admin has been informed to refresh account
							$this -> output();
						} else { // setup == 0 -> either someone hacking into account or password is messed up. either way, ask admin to refresh account
							$query = $this -> query("UPDATE `users` SET `setup`='3' WHERE `cid`='$cid' AND `zbid`='$zbid' LIMIT 1");
							// TODO : user is told that admin has been informed and will send details on refreshing account (change setup to 2 and then pm the pin)
							$this -> output(8); // login unsuccessful
						}
					}
				}
				
				$old_gid = $this -> my["gid"];
				if($old_gid != $gid) {
					$new_group = $this -> groups["id-" . $gid];
					if(isset($new_group)) { // should have been set by get_groups() -> but making sure
						if($new_group["admin"] == 0 || true) { // doesn't require validation! (the true now forces promotion without validation. this is a security risk but will remain in place until a validation method is made clear)
							$this -> my["gid"] = $gid; // update locally
							$update = $this -> query("UPDATE users SET gid='$gid', gid_promote='' WHERE cid='$cid' AND zbid='$zbid' LIMIT 1", __LINE__, __FILE__);
							// TODO : Fire event!
						} else if($this -> my["gid_promote"] != $gid){ // requires admin validation AND haven't yet requested it
							// update gid_promote field (so the code knows not to request admin again)
							$update = $this -> query("UPDATE users SET gid_promote='$gid' WHERE cid='$cid' AND zbid='$zbid' LIMIT 1", __LINE__, __FILE__);
							// TODO : Send alert to admin that user needs to be promoted -> admin_tasks?
						}
					} // else don't bother trying to promote. somthing has gone wrong
				} elseif($this -> my["gid_promote"] != 0) {
					// requested a promotion before which needed validation, but then group changed back to normal, so reset the gid_promote field
					$update = $this -> query("UPDATE users SET gid='$gid', gid_promote='' WHERE cid='$cid' AND zbid='$zbid' LIMIT 1", __LINE__, __FILE__);
					// TODO : If using admin_tasks, maybe remove the notification for this case?
				}
				
				$old_username = $this -> secure($this -> my["username"]);
				$old_username_style = $this -> secure($this -> my["username_style"]);
				$username_style = $this -> secure($_GET['username_style']);
				if($username != $old_username || $username_style != $old_username_style){
					$query = $this -> query("UPDATE users SET username='$username', username_style='$username_style' WHERE zbid='$zbid' AND cid='$cid' LIMIT 1", __LINE__, __FILE__);
					$this -> my["username"] = $username;
					$this -> my["username_style"] = $username_style;
					if($username != $old_username) {
						$this -> fire_event("core", "name_change", array(
							"old" => $old_username,
							"new" => $username
						));
					}
				}
				
				if($this -> settings["activated"] == 0 && $this -> groups["id-" . $this -> my["gid"]]["admin"] == 0) {
					// dynamo turned off by an admin -> only allow admins to view
					exit;
				}
				
				$zbids = $this -> zbids;
				
			} else {
				$users = $this -> query("SELECT * FROM users WHERE cid='$cid' AND zbid IN (" . implode($zbids, ", ") . ")", __LINE__, __FILE__);

				while($u = $users -> fetch_assoc()){
					$this -> users["u-" . $u['zbid']] = $u;
				}
			}
			
			/* now get module settings for users */
			$config = $this -> query("SELECT a.mid, a.name, b.zbid, a.initial default_value, COALESCE(b.value, a.initial) value FROM user_settings a LEFT JOIN user_config b ON b.sid=a.id AND b.cid='$cid' AND b.zbid IN (" . implode($zbids, ", ") . ") WHERE a.mid IN ('" . implode($this -> mids, "', '") . "') ORDER BY a.id ASC, b.zbid ASC");

			$config_mid = -1;
			$config_name = -1;
			while($c = $config -> fetch_assoc()) {
				$to_change = false;
				if($c["mid"] != $config_mid) { // now onto the next module so insert this setting array to all users
					$config_mid = $c["mid"];
					$to_change = true;
					foreach($this -> users as &$value) {
						if(!isset($value["config"][$c["mid"]])) {
							$value["config"][$c["mid"]] = array();
						}
					}
				}
				if($c["name"] != $config_name || $to_change) { // now onto the next specific setting, or the module just changed (implying that even if the name hasn't changed, the combination of mid and name results in a different setting id!
					$config_name = $c["name"];
					foreach($this -> users as &$value) {
						if(!isset($value["config"][$c["mid"]][$c["name"]])) {
							$value["config"][$c["mid"]][$c["name"]] = $c["default_value"];
						}
					}
				}
				// all default values for this setting have been established
				// override the value of the setting if it has been overriden in the database (for this user)
				if(isset($this -> users["u-" . $c["zbid"]])) {
					$this -> users["u-" . $c["zbid"]]["config"][$c["mid"]][$c["name"]] = $c["value"];
				}
				// access:  $users["u-#"]["config"]["module_name"]["setting_name"]
				// example: $users["u-1234"]["config"]["currency"]["hand"] etc..
				
			}
				
			$this -> update_modules(); // update module info based on my info (admin etc)
			
		}
		
		private function register(){
		
			$cid = $this -> cid;
			$zbid = $this -> zbid;
			$gid = $this -> gid;
			if($this -> get_user($zbid) === false){ // double check if you need to register
				if($this -> new_member === false) {
					$this -> new_member = true;
					$username = $this -> username;
					/*$referrer = isset($_GET['referrer']) ? $this -> secure($_GET['referrer']) : null;
					if(strlen($referrer)) {
						$user_q = $this -> query("SELECT `zbid` FROM `users` WHERE `cid`='$cid' AND `username`='$referrer' LIMIT 1");
						$referrer = $user_q -> num_rows == 1 ? $this -> get_result($user_q) : null;
					}*/
					$this -> output_vars["password"] = $this -> password = $password = $this -> password();
					$ip = $_SERVER['REMOTE_ADDR'];
					$registered = time();
					$adding = $this -> query("INSERT INTO users (zbid, cid, gid, username, password, ip, registered) VALUES ('$zbid', '$cid', '$gid', '$username', '$password', '$ip', '$registered')", __LINE__, __FILE__);
					$this -> get_users();
				} else {
					$this -> output(43);
				}
			}

		}
		
		public function get_user_info() {
			foreach($this -> users as $user) {
				$this -> output_vars["users"][] = array(
					"zbid" => $user["zbid"]
				);
			}
			
			require_once("../modules/iProfile.php");
			
			foreach($this -> mids as $mid) {
				$path = "../modules/$mid/profile.php";
				if(file_exists($path)) {
					require_once($path);
					$profile_class = $mid . "_profile";
					$profile = new $profile_class();
					$profile -> get();
				}
			}
		}
		
		public function update_user_config($to_update, $modifier="") {
		
			/*
			$to_update = ARRAY(
				ARRAY(mid, name, value[, zbid, modifier]),
				ARRAY(mid, name, value[, zbid, modifier]), ...
			)
			DEFAULT zbid = $this -> zbid
			*/
		
			$cid = $this -> cid;
			$zbid = $this -> zbid;
			$count = count($to_update);
			
			if($count > 1) { // multiple updates so get info from user_settings table first (2 queries)
				$where = array();
				foreach($to_update as $u) {
					$where[] = "(`mid`='$u[0]' AND `name`='$u[1]')";
				}
				$where = implode(" OR ", $where);
				
				$query1 = <<<"QUERY1"
SELECT `id`, `mid`, `name`
	FROM `user_settings`
	WHERE $where
	LIMIT $count;
QUERY1;

				$query1 = $this -> query($query1);
				$sids = array();
				
				while($q = $query1 -> fetch_assoc()) {
					$sids[$q['mid']][$q['name']] = $q['id'];
				}
				
				$inserts = array();
				foreach($to_update as $u) {
					$u[3] = isset($u[3]) ? $u[3] : $zbid;
					$id = $sids[$u[0]][$u[1]];
					$inserts[] = "('$cid', '$u[3]', '$id', '$u[2]')";
					if(!isset($this -> users["u-" . $u[3]]["config"][$u[0]][$u[1]])){
						return false; // user setting not found
					}
					if($modifier[0] == "+") {
						$this -> users["u-" . $u[3]]["config"][$u[0]][$u[1]] += $u[2];
					} elseif($modifier[0] == "-") {
						$this -> users["u-" . $u[3]]["config"][$u[0]][$u[1]] -= $u[2];
					} else {
						$this -> users["u-" . $u[3]]["config"][$u[0]][$u[1]] = $u[2];
					}
				}
				$inserts = implode(", ", $inserts);
				
				$query2 = <<<"QUERY2"
INSERT INTO  `user_config` (
	`cid` ,
	`zbid` ,
	`sid` ,
	`value`
)
VALUES
	$inserts
ON DUPLICATE KEY UPDATE
	`value` = VALUES(
		`value`
	) $modifier;
QUERY2;
				return $this -> query($query2);
				
			} elseif($count == 1) { // 1 query
			
				$mid = $to_update[0][0];
				$name = $to_update[0][1];
				$value = $to_update[0][2];
				$zbid = isset($to_update[0][3]) ? $to_update[0][3] : $this -> my["zbid"];
				
				if(isset($this -> users["u-" . $zbid]["config"][$mid][$name])) {
				
					$query = <<<"QUERY"
INSERT INTO user_config(cid, zbid, sid, value)
	SELECT '$cid', '$zbid', `id`, '$value'
	FROM `user_settings`
	WHERE `mid` = '$mid' AND `name` = '$name'
	ON DUPLICATE KEY UPDATE `value` = '$value' $modifier;
QUERY;

					if($modifier[0] == "+") {
						$this -> users["u-" . $zbid]["config"][$mid][$name] += $value;
					} elseif($modifier[0] == "-") {
						$this -> users["u-" . $zbid]["config"][$mid][$name] -= $value;
					} else {
						$this -> users["u-" . $zbid]["config"][$mid][$name] = $value;
					}

					return $this -> query($query);
				
				} else {
					return false; // user settings not found
				}
				
			}
		}
		
		public function update_module_config($to_update) {
		
			/*
			$to_update = ARRAY(
				ARRAY(mid, name, value),
				ARRAY(mid, name, value), ...
			)
			*/
		
			$cid = $this -> cid;
			$count = count($to_update);
			
			if($count > 1) { // multiple updates so get info from user_settings table first (2 queries)
			
				$where = array();
				foreach($to_update as $u) {
					$where[] = "(`mid`='$u[0]' AND `name`='$u[1]')";
				}
				$where = implode(" OR ", $where);
				
				$query1 = <<<"QUERY1"
SELECT `id`, `mid`, `name`
	FROM `module_settings`
	WHERE
		$where AND
		`gid_specific`='0'
	LIMIT $count;
QUERY1;

				$query1 = $this -> query($query1);
				$sids = array();
				
				while($q = $query1 -> fetch_assoc()) {
					$sids[$q['mid']][$q['name']] = $q['id'];
				}
				
				$inserts = array();
				foreach($to_update as $u) {
					$id = $sids[$u[0]][$u[1]];
					$inserts[] = "('$cid', '$id', '$u[2]')";
					if(!isset($this -> modules[$u[0]]["settings"][$u[1]])) {
						return false; // module setting not found
					}
					$this -> modules[$u[0]]["settings"][$u[1]] = $u[2];
				}
				$inserts = implode(", ", $inserts);
				
				$query2 = <<<"QUERY2"
INSERT INTO  `module_config` (
	`cid` ,
	`sid` ,
	`value`
)
VALUES
	$inserts
ON DUPLICATE KEY UPDATE
	`value` = VALUES(
		`value`
	)
QUERY2;

				return $this -> query($query2);
				
			} elseif($count == 1) { // 1 query
			
				$mid = $to_update[0][0];
				$name = $to_update[0][1];
				$value = $to_update[0][2];
				
				if(isset($this -> modules[$mid]["settings"][$name])) {
				
					$query = <<<"QUERY"
INSERT INTO module_config(cid, sid, value)
	SELECT '$cid', `id`, '$value'
	FROM `module_settings`
	WHERE `mid` = '$mid' AND `name` = '$name' AND `gid_specific`='0'
	ON DUPLICATE KEY UPDATE `value` = '$value';
QUERY;

					$this -> modules[$mid]["settings"][$name] = $value;

					return $this -> query($query);
				
				} else {
					return false; // module setting not found
				}
				
			}
		}
		
		public function update_group_config($to_update) {
		
			/*
			$to_update = ARRAY(
				ARRAY(mid, name, gid, value),
				ARRAY(mid, name, gid, value), ...
			)
			*/
		
			$cid = $this -> cid;
			$count = count($to_update);
			
			if($count > 1) { // multiple updates so get info from user_settings table first (2 queries)
			
				$where = array();
				foreach($to_update as $u) {
					$where[] = "(`mid`='$u[0]' AND `name`='$u[1]')";
				}
				$where = implode(" OR ", $where);
				
				$query1 = <<<"QUERY1"
SELECT `id`, `mid`, `name`
	FROM `module_settings`
	WHERE
		$where AND
		`gid_specific` = '1'
	LIMIT $count;
QUERY1;

				$query1 = $this -> query($query1);
				$sids = array();
				
				while($q = $query1 -> fetch_assoc()) {
					$sids[$q['mid']][$q['name']] = $q['id'];
				}
				
				$inserts = array();
				foreach($to_update as $u) {
					$id = $sids[$u[0]][$u[1]];
					$inserts[] = "('$cid', '$id', '$u[2]', '$u[3]')";
					if(!isset($this -> groups["id-" . $u[2]]["config"][$u[0]][$u[1]])) {
						return false; // group setting not found
					}
					$this -> groups["id-" . $u[2]]["config"][$u[0]][$u[1]] = $u[3];
				}
				$inserts = implode(", ", $inserts);
				
				$query2 = <<<"QUERY2"
INSERT INTO  `module_config` (
	`cid` ,
	`sid` ,
	`gid` ,
	`value`
)
VALUES
	$inserts
ON DUPLICATE KEY UPDATE
	`value` = VALUES(
		`value`
	);
QUERY2;

				return $this -> query($query2);
				
			} elseif($count == 1) { // 1 query
			
				$mid = $to_update[0][0];
				$name = $to_update[0][1];
				$gid = $to_update[0][2];
				$value = $to_update[0][3];
				
				if(isset($this -> groups["id-" . $gid]["config"][$mid][$name])) {
				
					$query = <<<"QUERY"
INSERT INTO module_config(cid, sid, gid, value)
	SELECT '$cid', `id`, '$gid', '$value'
	FROM `module_settings`
	WHERE
		`mid` = '$mid' AND
		`name` = '$name' AND
		`gid_specific` = '1'
	ON DUPLICATE KEY UPDATE `value` = '$value';
QUERY;

					$this -> groups["id-" . $gid]["config"][$mid][$name] = $value;

					return $this -> query($query);
				
				} else {
					return false; // group setting not found
				}
				
			}
		}
				
		/* --------------------------------------- */
		
		public function output($notice = -1, $data = array(), $force = false){
		
			if($notice !== -1) {
				$id = isset($this -> notice_id) && strlen($this -> notice_id) ? $this -> notice_id . "-" : "";
				$id = $notice == "db-error" ? "" : $id; // don't prepend id for database error
				$this -> output_vars["notice"] = $id . $notice;
				if(!empty($data)) {
					$this -> output_vars["notice_data"] = $data;
				}
			}
		
			if(!$force) {
					
				$this -> output_vars["time"] = time();
		
				$this -> fire_event("core", "output"); // TODO : Move this into FROM == "core" block

				if(FROM == "core"){ // only resend data on page reload
				
					// load ad details
					require_once("./advert.php");
					$advert = new Advert();
					if($this -> ad_removal) {
						$advert -> reduce_removal_credits();
					} else {
						$this -> output_vars["ad"] = $advert -> getRandom();
					}
					
					$this -> output_vars["cb"] = "dynamo.toolbox.ini_return";
					
					/* clean settings data */
					foreach($this -> settings as $key => $value) {
						if(!in_array($key, array("menujs", "afterload", "premium"))) {
							unset($this -> settings[$key]);
						}
					}
					$this -> settings["premium_end"] = $this -> settings["premium"];
					$this -> settings["premium"] = $this -> premium;
					
					/* clean group data */
					if(is_array($this -> my)) {
						$group = $this -> groups["id-" . $this -> my["gid"]];
						foreach($group as $key => $value) {
							if(!in_array($key, array("admin"))) {
								unset($group[$key]);
							}
						}
					}
					
					/* clean module data */
					foreach($this -> modules as &$module) {
						foreach($module as $key => $value) {
							if(!in_array($key, array("id", "name", "menu", "settings"))){
								unset($module[$key]);
							}
						}
					}
				
					/* clean user data */
					if(is_array($this -> my)) {
						foreach($this -> my as $key => $value) {
							if(!in_array($key, array("config"))) {
								unset($this -> my[$key]);
							}
						}
					}
					
					$this -> output_vars["user"] = $this -> my;
					$this -> output_vars["group"] = $group; 
					$this -> output_vars["settings"] = $this -> settings; 
					$this -> output_vars["modules"] = $this -> modules;
				} elseif(FROM == "guest") {
					$this -> output_vars["cb"] = "dynamo.toolbox.guest_return";
				
					/* clean settings data */
					foreach($this -> settings as $key => $value) {
						if(!in_array($key, array("menujs", "afterload", "premium"))) {
							unset($this -> settings[$key]);
						}
					}
					$this -> settings["premium_end"] = $this -> settings["premium"];
					$this -> settings["premium"] = $this -> premium;
					
					/* clean module data */
					foreach($this -> modules as &$module) {
						foreach($module as $key => $value) {
							if(!in_array($key, array("id", "name", "menu", "settings"))){
								unset($module[$key]);
							}
						}
					}
					$this -> output_vars["settings"] = $this -> settings; 
					$this -> output_vars["modules"] = $this -> modules;
				} else {
					if(isset($this -> cb)) {
						$this -> output_vars["cb"] = $this -> cb;
					}
				}
			
			}
			
			echo 'dynamo.module.callback(' . json_encode($this -> output_vars) . ');';
			exit;
	
		}
	
		public function get_result($res, $row = 0, $field = 0){ // similar to mysql_result
			$res -> data_seek($row);
			$datarow = $res -> fetch_array();
			return $datarow[$field];
		}
		
		public function secure($string, $default = false){
			//$string = strip_tags($string);
			if($default !== false && !isset($string)){
				return $default;
			}
			if(is_array($string)){
				foreach($string as &$s){
					$s = $this -> secure($s);
				}
				return $string;
			} else {
				$string = urldecode($string);
				$string = htmlspecialchars($string);
				$string = trim($string);
				$string = stripslashes($string);
				$string = $this -> mysqli -> real_escape_string($string);
			}
			return $string;
		}
		
		public function query($statement){
			$this -> queries++;
			// ATTN : die() is too invasive, change fallback
			$query = $this -> mysqli -> query($statement) or die($this -> query_error($statement));
			return $query;
		}
		
		public function query_error($query){
			$debug = debug_backtrace();
			$debug = array(
				$debug[2]["line"],
				$debug[2]["function"],
				$debug[2]["file"]
			);
			$cid = $this -> cid;
			$zbid = $this -> zbid;
			$url = $this -> url;
			$ip = $_SERVER['REMOTE_ADDR'];
			$time = time();
			$query = $this -> mysqli -> real_escape_string($query);
			$error = $this -> mysqli -> real_escape_string($this -> mysqli -> error);
			// do not use $this -> query as we need different error logging system here!
			$this -> mysqli -> query("INSERT INTO errors (cid, zbid, url, query, error, line, file, time) VALUES('$cid', '$zbid', '$url', '$query', '$error', '$debug[0]', '$debug[2]', '$time')") or die($this -> error_fallback());
			$this -> output("db-error", array(), true);
		}
		
		public function debug($message) {
			if(!($this -> debugged)) {
				$this -> query("TRUNCATE `debug`");
				$this -> debugged = true;
			}
			$time = time();
			return $this -> query("INSERT INTO `debug` (`msg`, `time`) VALUES('$message', '$time')");
		}
		
		public function error_fallback(){ 
			$this -> output(0, array(), true); // Error encountered when trying to record previous error!
			/* TODO: Add to log (file) and send email */
		}
		
		public function validate_forum($domains, $zb_info){
			require_once("./board_tools.php");
			$board_tools = new BoardTools();
			$info = $board_tools -> clean($this -> url);
			$url = strtolower($info["url"]);
			$zb = $info["zb"];
			foreach($domains as $key => $d){
				if($zb_info[$key] == $zb && $url == strtolower($d)){
					return true;
				}
			}
			return false;
			/*
			$url = preg_replace('/^www[\s|\d]?\./', "", $this -> url);
			foreach($domains as $key => $d){
				$url_match = strtolower($url);
				if($zb_info[$key] == 1){ // default zb address
					$domain1 = strtolower("http://s" . $d . "/");
					$domain2 = strtolower("http://w" . $d . "/");
					if(count(explode($domain1,$url_match)) > 1 || count(explode($domain2,$url_match)) > 1){
						return true;
						break;
					}
				} else { // custom domain
					$domain = strtolower("http://" . $d . "/");
					if(count(explode($domain,$url_match)) > 1){
						return true;
						break;
					}
				}
			}*/
			return false;
		}
		
		public function module_accessible($mid) {
			return isset($this -> modules[$mid]); // if it returns false, this means that it was not returned in the db call (doesn't exist, not allowed access etc)
		}
		
		public function &get_user($zbid, $force = false){
			if(isset($this -> users["u-" . $zbid])){
				$user = &$this -> users["u-" . $zbid];
				return $user;
			} else if($force) {
				$this -> output_vars["updated"] = 1;
				$this -> get_users(array($zbid));
				return $this -> get_user($zbid, false); // do not force it to find user (infinite loop if it doesn't work)!
			} else {
				return false;
			}
		}
		
		public function password(){
			$cid = $this -> cid;
			$zbid = $this -> zbid;
			$pass = substr(sha1($this -> salt . $zbid . $cid), 0, 8);
			return $pass;
		}
		
		public function create_menu_file($modules) {
			sort($modules);
			$secure_name = substr(sha1(implode("_", $modules)), 0, 10);
			$fname = "../menus/" . $secure_name . ".js";
			if(!file_exists($fname)){
				$contents = "var menu_info = [], holder, tab_holder, sub_holder, sub_tab_holder;";
				$acp_contents = "";
				foreach($modules as $m){
					if(file_exists("../modules/".$m."/menu.js")){
						$contents .= "\n\n" . file_get_contents("../modules/".$m."/menu.js");
					}
					if(file_exists("../modules/".$m."/menu_acp.js")) {
						$acp_contents .= "\n\n" . file_get_contents("../modules/".$m."/menu_acp.js");
					}
				}
				$contents = preg_replace('/\/% ACP MENUS HERE %\//', $acp_contents, $contents);
				$fh = fopen($fname, 'w');
				fwrite($fh, $contents);
				fclose($fh);
			}
			return $secure_name;
		}
		
		public function create_afterload_file($modules) {
			sort($modules);
			$secure_name = substr(sha1(implode("_", $modules)), 0, 10);
			$fname = "../afterload/" . $secure_name . ".js";
			if(!file_exists($fname) || $this -> developer){ // developers should always see new file contents
				$contents = "";
				foreach($modules as $m){
					if(file_exists("../modules/".$m."/afterload.js")){
						$contents .= file_get_contents("../modules/".$m."/afterload.js");
					}
				}
				$fh = fopen($fname, 'w');
				fwrite($fh, $contents);
				fclose($fh);
			}
			return filesize($fname) == 0 ? "" : $secure_name;
		}
		
		public function generate_secure_string() {
			return sha1($this -> salt . $this -> zbid . $this -> cid . time());
		}
		
		private function get_events() {
			require_once("../modules/iEvent.php");
			foreach($this -> mids as $mid) {
				$file = "../modules/$mid/events.php";
				if(file_exists($file)) {
					require_once($file);
					$event_class = $mid . "_events";
					$event = new $event_class();
					$event -> ini();
				}
			}
		}
		
		public function fire_event($mid, $name, $data = array()) {
			if(!$this -> events_scraped) {
				$this -> get_events();
				$this -> events_scraped = true;
			}
			if(isset($this -> events[$mid][$name])) {
				$events = $this -> events[$mid][$name];
				foreach($events as $e) {
					$e($data);
				}
			}
		}
		
		public function load_module_class($name, $file = "") {
			if(!isset($this -> module_class -> $name)) {
				if($file == ""){
					require_once("../modules/$name/core.php");
				} else {
					require_once($file);
				}
				$this -> module_class[$name] = new $name();
			}
		}

	}
	
	$database = new Database;
?>