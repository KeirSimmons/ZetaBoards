<?php
				$rating = round(max(1,min(5,$this -> db -> secure($_GET['rating']))));
				if($topic_id && $rating){
					$time = time();
					$rating_it = false;
					$pid = $this -> db -> secure($_GET['pid']);
					$gid = $this -> db -> my["gid"];
					$group = $this -> db -> groups["g-".$gid];
					if($pid == $zbid && !$group["topic_rating_own"]){
						$this -> db -> cb = "dynamo.topic_rating.unavailable";
						$this -> db -> output_vars["state"] = 5;
					} else {
						$query = $this -> db -> query("SELECT id FROM topics WHERE cid='$cid' AND zbid='$zbid' AND tid='$topic_id'",__LINE__,__FILE__);
						if($query -> num_rows){
							$rating_it = true;
							$query = $this -> db -> query("UPDATE topics SET rating=$rating,time=$time WHERE cid='$cid' AND zbid='$zbid' AND tid=$topic_id LIMIT 1",__LINE__,__FILE__);
						} else {
							$hours24 = $time - 86400;
							$query = $this -> db -> query("SELECT time FROM topics WHERE cid='$cid' AND zbid='$zbid' AND time>=$hours24",__LINE__,__FILE__);
							$ratings_today = $query -> num_rows;
							$perday = $group["topic_rating_perday"];
							$minposts = $group["topic_rating_minposts"];
							$minrep = $group["topic_rating_minrep"];
							$minrepcheck = $group["topic_rating_minrep_check"];
							$extraposts = $minposts - $this -> db -> my["posts"];
							$extrarep = $minrep - ($this -> db -> my["reputation_add"] - $this -> db -> my["reputation_minus"]);
							if($perday == -1){
								$this -> db -> cb = "dynamo.topic_rating.unavailable";
								$this -> db -> output_vars["state"] = 1;
							} elseif($ratings_today >= $perday && $perday != 0){
								$this -> db -> cb = "dynamo.topic_rating.unavailable";
								$this -> db -> output_vars["state"] = 2;
								$this -> db -> output_vars["reason"] = $perday;
							} elseif($extraposts > 0){
								$this -> db -> cb = "dynamo.topic_rating.unavailable";
								$this -> db -> output_vars["state"] = 3;
								$this -> db -> output_vars["reason"] = $extraposts;
							} elseif($minrepcheck && $extrarep > 0 && $this -> db -> gear_on("reputation")){
								$this -> db -> cb = "dynamo.topic_rating.unavailable";
								$this -> db -> output_vars["state"] = 4;
								$this -> db -> output_vars["reason"] = $extrarep;
							} else {
								$can_rate = 0;
								if($group["topic_rating_own"]){
									$can_rate = 1;
								} else {
									$check = $this -> db -> query("SELECT id FROM topics WHERE tid='$topic_id' AND pid='$zbid' LIMIT 1",__LINE__,__FILE__);
									if($check -> num_rows){
										$this -> db -> cb = "dynamo.topic_rating.unavailable";
										$this -> db -> output_vars["state"] = 5;
									} else {
										$can_rate = 1;
									}
								}
								if($can_rate){
									$rating_it = true;
									$query = $this -> db -> query("INSERT INTO topics (cid,tid,pid,zbid,rating,time) VALUES('$cid','$topic_id','$pid','$zbid','$rating','$time')",__LINE__,__FILE__);
								}
							}
						}
					}
					if($rating_it === true){
						$p_user = $this -> db -> get_user($pid);
						if($pid != $zbid && $pid && $p_user !== false && ($this -> db -> settings["notifications_topicrating"])*1===1 && $this -> db -> gear_on("notifications")){
							$delete_previous = $this -> db -> query("DELETE FROM notifications WHERE cid='$cid' AND type=4 AND data LIKE '%$zbid|$topic_id' LIMIT 1",__LINE__,__FILE__);
							$this -> db -> new_notification($pid,4,"$rating|$zbid|$topic_id");
						}
						$ratings = $this -> get_rating(array($topic_id));
						$this -> db -> cb = "dynamo.topic_rating.update";
						$this -> db -> output_vars["rating"] = array(
							"id" => $topic_id,
							"rating" => $ratings["r-" . $topic_id]["rating"],
							"rated" => $ratings["r-" . $topic_id]["rated"]
						);
					} else {
						$this -> db -> output_vars["tid"] = $topic_id;
					}
				} else {
					$this -> db -> output_vars["error"][] = 31;
					$this -> db -> output();
				}
			}
			public function get_rating($ids){
				$cid = $this -> db -> cid;
				$zbid = $this -> db -> zbid;
				$ratings = array();
				$query = $this -> db -> query("SELECT zbid,tid FROM topics WHERE cid='$cid' AND zbid='$zbid'",__LINE__,__FILE__);
				while($q = $query -> fetch_assoc()){
					$ratings["r-".$q['tid']]["rated"] = 1;
				}
				$query_form = implode(" OR tid=",$ids);
				$query = $this -> db -> query("SELECT tid, count(tid) AS votes, avg(rating) AS avg_rating, (SELECT count(DISTINCT tid) FROM topics WHERE cid='$cid') AS total_topics, (SELECT count(tid) FROM topics WHERE cid='$cid') AS total_votes, (SELECT avg(rating) FROM topics WHERE cid='$cid') AS avg_total_rating FROM topics WHERE cid='$cid' AND (tid=$query_form) GROUP BY tid",__LINE__,__FILE__);
				while($q = $query -> fetch_assoc()){
					if(!$q['votes'] || !$q['total_votes'] || !$q['total_topics']){
						$rating = 0;
					} else {
						$averageVotesPerTopic = $q['total_votes'] / max(1,$q['total_topics']);
						$minimumVotes = $averageVotesPerTopic * RATING_DEPENDANCY;
						$rating = ($q['votes'] / ($q['votes'] + $minimumVotes)) * $q['avg_rating'] + ($minimumVotes / ($q['votes'] + $minimumVotes)) * $q['avg_total_rating'];
					}
					$ratings["r-" . $q['tid']] = array("rating" => $rating,"rated" => isset($ratings["r-" . $q['tid']]["rated"]) ? 1 : 0);
				}
				return $ratings;
			}
		}
		$topic_rating = new topic_rating;
	} else {
		require_once("../database.class.php");
		$database -> output_vars["error"][] = 29;
		$database -> output();
	}
	
?>