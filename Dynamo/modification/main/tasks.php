<?php
	header("Content-type: application/x-javascript");
	define("FROM","tasks");
	require_once("database.class.php");
	
	$m = $database -> output_vars["m"] = $database -> secure($_GET['m']);
	
	if(isset($m)){
	
		if($m == "refresh") {
			// user wanting to input pin
			$zbid = $database -> secure($_GET['zbid']);
			$cid = $database -> secure($_GET['cid']);
			$info = $database -> secure($_GET['info']);
			$pin = $info['pin'];
			$query = $database -> query("SELECT `setup_pin`, `setup_first_try`, `setup_tries` FROM `users` WHERE `cid`='$cid' AND `zbid`='$zbid' AND `setup`='2' LIMIT 1");
			if($query -> num_rows == 1) {
				$time = time();
				$result = $query -> fetch_assoc();
				if($result["setup_first_try"] + 86400 < $time) { // first pin attempt was more than 1 day ago
					// reset attempt stats
					$result["setup_first_try"] = $time;
					$result["setup_tries"] = 0;
				}
				if($result["setup_tries"] < $database -> config -> SETUP_TRIES) {
					if($pin == $result["setup_pin"]) {
						$update = $database -> query("UPDATE `users` SET `setup`='1', `setup_first_try`='0', `setup_tries`='0', `setup_pin`='0' WHERE `cid`='$cid' AND `zbid`='$zbid' AND `setup`='2' LIMIT 1");
						$database -> output(15);
					} else {
						$result["setup_tries"]++;
						$update = $database -> query("UPDATE `users` SET `setup_first_try`='{$result["setup_first_try"]}', `setup_tries`='{$result["setup_tries"]}' WHERE `cid`='$cid' AND `zbid`='$zbid' AND `setup`='2' LIMIT 1");
						if($result["setup_tries"] < $database -> config -> SETUP_TRIES) {
							// can try again
							$database -> output(16);
						} else {
							$database -> output(17, array(
								"to_wait" => $result["setup_first_try"] + 86400 - $time
							));
						}
					}
				} else {
					$database -> output(14, array(
						"to_wait" => $result["setup_first_try"] + 86400 - $time
					));
				}
			} else {
				// account does not need refreshed
				$database -> output(13);
			}
		} else {
		
			$database -> get_settings();
			$database -> get_modules();
			$database -> get_groups(); // requires mids from get_modules
			$database -> get_users();
			
			
			$ad = +$database -> secure($_GET['ad']);
			
			if($database -> ad_removal || (strlen($ad) && $ad == 1)) {
		
				if($m == "update_post") { // update post count (for post validation)
					$cid = $database -> cid;
					$zbid = $database -> zbid;
					$info = $database -> secure($_GET['info']);
					$posts = $info["posts"];
					if(strlen($posts)) {
						$database -> query("UPDATE `users` SET `temp_posts`='$posts' WHERE `cid`='$cid' AND `zbid`='$zbid' LIMIT 1");
					}
				} elseif($m == "advert") { // get url from advert
					$info = $database -> secure($_GET['info']);
					$aid = $info['cid'];
					if(strlen($aid)) {
						// check ad exists
						$ad_q = $database -> query("SELECT `url` FROM `adverts` WHERE `cid`='$aid' LIMIT 1");
						if($ad_q -> num_rows == 0) {
							$database -> output(22);
						}
						
						// add hit count and then redirect
						require_once("./advert.php");
						$advert = new Advert();
						$advert -> hit($aid);
						$url = $database -> get_result($ad_q);
						echo 'window.location.href="' . $url . '";';
					} else {
						$database -> output(21);
					}
				} else {
					
					$page_interface = "../modules/iPage.php";
					
					if($database -> module_accessible($m)) {
						require_once($page_interface);
						$p = $database -> output_vars["p"] = array();
						$current = 1;
						$path = "../modules/" . $m . "/pages";
						
						while($current < 5) { // allow p1 -> p5 (this is perfectly fine for the current implementation
							if(isset($_GET['p' . $current])) {
								$temp = $p[] = $database -> output_vars["p"][] = $database -> secure($_GET['p' . ($current++)]);
								$path .= "/" . $temp;
							} else {
								break;
							}
						}
						
						$path .= ".php";
						
						if(file_exists($path)) {
							require_once($path);
							$database -> output_vars["info"] = array();
							$page = new page;
							$page -> load();
						} else {
							$database -> output(36);
						}

					} else {
						$database -> output(37);
					}
				
				}
			
			} else {
			
				$cid = $database -> cid;
				$zbid = $database -> zbid;
				$url = $database -> url;
				$error = $database -> mysqli -> real_escape_string("Advert could not be found.");
				$time = time();
				// advert was not on the forum...	
				require_once("BrowserDetection.php");
				$browser = new BrowserDetection();
				$query = $database -> secure($browser -> getBrowser() . " - " . $browser -> getVersion());
				$database -> query("INSERT INTO errors (cid, zbid, url, query, error, time) VALUES('$cid', '$zbid', '$url', '$query', '$error', '$time')");
				$database -> output(11);
			
			}
			
		}
		
		$database -> output();
	} else {
		$database -> output(45);
	}
?>