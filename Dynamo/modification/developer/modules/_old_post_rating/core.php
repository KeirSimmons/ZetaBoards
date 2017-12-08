<?php
	if(in_array("/home/viralsmo/public_html/dynamo/database.class.php",get_included_files())){
		class post_rating {
			public function __construct(){
				global $database;
				$this -> db = $database;
				if(!defined(sha1(($this -> db -> cid) . "post_rating"))){
					$this -> db -> output_vars["error"][] = 36;
					$this -> db -> output();
				}
			}
			public function get_ratings($pids){
				$cid = $this -> db -> cid;
				$zbid = $this -> db -> zbid;
				$gid = $this -> db -> my["gid"];
				$group = $this -> db -> groups["g-" . $gid];
				$this -> db -> output_vars["pids"] = array();
				$query = $this -> db -> query("SELECT zbid,pid,rating,0 as post_order,time FROM posts WHERE cid='$cid' AND (pid=".implode(" OR pid=",$pids).") AND zbid!='$zbid' UNION SELECT zbid,pid,rating,1 as post_order,time FROM posts WHERE cid='$cid' AND (pid=".implode(" OR pid=",$pids).") AND zbid='$zbid' ORDER BY post_order DESC, time DESC",__LINE__,__FILE__);
				while($q = $query -> fetch_assoc()){
					if(!isset($this -> db -> output_vars["pids"]["p-".$q['pid']])){
						$this -> db -> output_vars["pids"]["p-".$q['pid']] = array(
							"id" => $q['pid'],
							"up" => array(
								"amount" => 0,
								"users" => array()
							),
							"down" => array(
								"amount" => 0,
								"users" => array()
							)
						);
					}
					$which = $q['rating'] == 1 ? "up" : "down";
					$this -> db -> output_vars["pids"]["p-".$q['pid']][$which]["amount"]++;
					if(count($this -> db -> output_vars["pids"]["p-".$q['pid']][$which]["users"]) < max(1,min(MAX_POST_RATING_NAMES,$this -> db -> settings["post_rating_names_amount"]))){
						$q_user = $this -> db -> get_user($q['zbid']);
						$this -> db -> output_vars["pids"]["p-".$q['pid']][$which]["users"][] = array(
							$q['zbid'],
							($q_user === false ? "Unknown" : $q_user["username"])
						);
					}
					$this -> db -> output_vars["total"] = count($this -> db -> output_vars["pids"]);
				}
			}
			public function rate(){
				$cid = $this -> db -> cid;
				$zbid = $this -> db -> zbid;
				$post_id = $this -> db -> secure($_GET['id']);
				$tid = $this -> db -> secure($_GET['tid']);
				$pzbid = $this -> db -> secure($_GET['pid']);
				$rating = $this -> db -> secure($_GET['rating']);
				if($post_id && $tid && $pzbid){
					if($rating){
						$rating = $rating == 1 ? 1 : -1;
						$time = time();
						$rating_it = false;
						$gid = $this -> db -> my["gid"];
						$group = $this -> db -> groups["g-".$gid];
						if($pzbid == $zbid && !$group["post_rating_own"]){
							$this -> db -> cb = "dynamo.post_rating.unavailable";
							$this -> db -> output_vars["state"] = 5;
						} else {
							$query = $this -> db -> query("SELECT id FROM posts WHERE cid='$cid' AND zbid='$zbid' AND pid='$post_id'",__LINE__,__FILE__);
							if($query -> num_rows){
								$rating_it = true;
								$query = $this -> db -> query("UPDATE posts SET rating=$rating,time=$time WHERE cid='$cid' AND zbid='$zbid' AND pid=$post_id LIMIT 1",__LINE__,__FILE__);
							} else {
								$hours24 = $time - 86400;
								$query = $this -> db -> query("SELECT time FROM topics WHERE cid='$cid' AND zbid='$zbid' AND time>=$hours24",__LINE__,__FILE__);
								$ratings_today = $query -> num_rows;
								$perday = $group["post_rating_perday"];
								$minrep = $group["post_rating_minrep"];
								$minrepcheck = $group["post_rating_minrep_check"];
								$extrarep = $minrep - ($this -> db -> my["reputation_add"] - $this -> db -> my["reputation_minus"]);
								if($perday == -1){
									$this -> db -> cb = "dynamo.post_rating.unavailable";
									$this -> db -> output_vars["state"] = 1;
								} elseif($ratings_today >= $perday && $perday != 0){
									$this -> db -> cb = "dynamo.post_rating.unavailable";
									$this -> db -> output_vars["state"] = 2;
									$this -> db -> output_vars["reason"] = $perday;
								} elseif($minrepcheck && $extrarep > 0 && $this -> db -> gear_on("reputation")){
									$this -> db -> cb = "dynamo.post_rating.unavailable";
									$this -> db -> output_vars["state"] = 3;
									$this -> db -> output_vars["reason"] = $extrarep;
								} else {
									$can_rate = 0;
									if($group["post_rating_own"]){
										$can_rate = 1;
									} else {
										$check = $this -> db -> query("SELECT id FROM posts WHERE pid='$post_id' AND pzbid='$zbid' LIMIT 1",__LINE__,__FILE__);
										if($check -> num_rows){
											$this -> db -> cb = "dynamo.post_rating.unavailable";
											$this -> db -> output_vars["state"] = 4;
										} else {
											$can_rate = 1;
										}
									}
									if($can_rate){
										$rating_it = true;
										$query = $this -> db -> query("INSERT INTO posts (cid,pid,tid,pzbid,zbid,rating,time) VALUES('$cid','$post_id','$tid','$pzbid','$zbid','$rating','$time')",__LINE__,__FILE__);
									}
								}
							}
						}
						if($rating_it === true){
							$p_user = $this -> db -> get_user($pzbid);
							if($pzbid && $pzbid != $zbid && $p_user !== false && ($this -> db -> settings["notifications_postrating"])*1===1 && $this -> db -> gear_on("notifications")){
								$delete_previous = $this -> db -> query("DELETE FROM notifications WHERE cid='$cid' AND type=5 AND data LIKE '%$zbid|$tid|$post_id' LIMIT 1",__LINE__,__FILE__);
								$this -> db -> new_notification($pzbid,5,"$rating|$zbid|$tid|$post_id");
							}
							$ratings = $this -> get_ratings(array($post_id));
							$this -> db -> cb = "dynamo.post_rating.update";
						}
					} else {
						if($this -> db -> gear_on("notifications")){
							$delete_previous = $this -> db -> query("DELETE FROM notifications WHERE cid='$cid' AND type=5 AND data LIKE '%$zbid|$tid|$post_id' LIMIT 1",__LINE__,__FILE__);
						}
						$delete = $this -> db -> query("DELETE FROM posts WHERE cid='$cid' AND pid='$post_id' AND zbid='$zbid' AND pzbid='$pzbid' LIMIT 1",__LINE__,__FILE__);
						$ratings = $this -> get_ratings(array($post_id));
						$this -> db -> cb = "dynamo.post_rating.update";
					}
					$this -> db -> output_vars["pid"] = $post_id;
				} else {
					$this -> db -> output_vars["error"][] = 39;
					$this -> db -> output();
				}
			}
			public function show_all(){
				$cid = $this -> db -> cid;
				$zbid = $this -> db -> zbid;
				$pid = $this -> db -> secure($_GET['pid']);
				$type = $this -> db -> secure($_GET['type']);
				$page = $this -> db -> secure($_GET['page']);
				if($pid && $page){
					$rating = $type == 1 ? 1 : -1;
					$per_page = min(MAX_POST_RATING_PAGE,max(1,$this -> db -> settings["post_rating_perpage"]));
					$ratings = $this -> db -> query("SELECT id FROM posts WHERE cid='$cid' AND pid='$pid' AND rating=$rating",__LINE__,__FILE__);
					$num_rows = $ratings -> num_rows;
					if(!$num_rows){
						$this -> db -> output_vars["ratings"] = array();
					} else {
						$total_pages = ceil($num_rows / $per_page);
						$page = min(max(1,$page),$total_pages);
						$start = ($page - 1) * $per_page;
						$ratings2 = $this -> db -> query("SELECT zbid,time,0 as post_order FROM posts WHERE cid='$cid' AND pid='$pid' AND zbid!='$zbid' UNION SELECT zbid,time,1 as post_order FROM posts WHERE cid='$cid' AND pid='$pid' AND zbid='$zbid' ORDER BY post_order DESC, time DESC LIMIT $start,$per_page",__LINE__,__FILE__);
						while($r = $ratings2 -> fetch_assoc()){
							$r_user = $this -> db -> get_user($r['zbid']);
							$r['username'] = $r_user === false
								? "Unknown"
								: $r_user["username"];
							$this -> db -> output_vars["ratings"][] = $r;
						}
						$this -> db -> output_vars["page"] = $page;
						$this -> db -> output_vars["total_pages"] = $total_pages;
					}
					$this -> db -> output_vars["pid"] = $pid;
					$this -> db -> output_vars["type"] = $type;
					$this -> db -> cb = "dynamo.post_rating.show_all";
				} else {
					$this -> db -> cb = "dynamo.post_rating.unavailable";
					$this -> db -> output_vars["state"] = 1;
				}
			}
		}
		$post_rating = new post_rating;
	} else {
		require_once("../database.class.php");
		$database -> output_vars["error"][] = 37;
		$database -> output();
	}
	
?>