<?php
	if(in_array("/home/viralsmo/public_html/dynamo/main/database.class.php",get_included_files())){
		class post {
			public function __construct(){
				global $database;
				$this -> db = $database;
				if(!defined(sha1(($this -> db -> cid) . "post"))){
					$this -> db -> output_vars["error"][] = 16;
					$this -> db -> output();
				}
			}
			public function ini($t){
				switch($t){
					case "current": $this -> current(); break;
					case "past": $this -> past(); break;
					case "winners": $this -> winners(); break;
					default: // throw error;
				}
			}
			public function current(){
				$cid = $this -> db -> cid;
				$zbid = $this -> db -> zbid;
				$post_end = $this -> db -> settings["post_end"];
				if($post_end != 0){
					$this -> db -> output_vars["post_comp"] = array();
					$query = $this -> db -> query("SELECT COUNT(zbid),SUM(post_comp) FROM users WHERE cid=$cid AND post_comp>0 GROUP BY cid",__LINE__,__FILE__);
					if($this -> db -> get_result($query)){
						if($post_end > time()){
							$total_posts = $this -> db -> get_result($query,0,1);
							$per_page = min(max_post_page,max(1,$this -> db -> settings["post_perpage"]));
							$total_pages = ceil($this -> db -> get_result($query) / $per_page);
							$page = min(max(1,$this -> db -> secure($_GET['page'])),$total_pages);
							$start = ($page - 1) * $per_page;
							$query = $this -> db -> query("SELECT * FROM users WHERE cid=$cid AND post_comp>0 ORDER BY post_comp DESC, posted_last ASC LIMIT $start,$per_page",__LINE__,__FILE__);
							$included = false;
							while($q = $query -> fetch_assoc()){
								$this -> db -> output_vars["post_comp"][] = array(
									"zbid" => $q['zbid'],
									"username" => $q['username'],
									"posts" => $q['post_comp']
								);
								if($q['zbid'] == $zbid){
									$included = true;
								}
							}
							if(!$included){
								if($this -> db -> my["post_comp"] == 0){
									$this -> db -> output_vars["my_info"] = array(
										"my_pos" => 0,
										"posts" => 0
									);
								}
								$query = $this -> db -> query("SELECT * FROM (SELECT u.post_comp, @curRow := @curRow + 1 AS row, IF(u.zbid=$zbid,1,0) AS me FROM users u, (SELECT @curRow := 0) r WHERE cid=$cid AND post_comp > 0 ORDER BY post_comp DESC, posted_last ASC) a WHERE me=1 LIMIT 1",__LINE__,__FILE__);
								$this -> db -> output_vars["my_info"] = array(
									"my_pos" => $query -> num_rows ? $this -> db -> get_result($query,0,1) : 0,
									"posts" => $query -> num_rows ? $this -> db -> get_result($query) : 0
								);
							}
							$this -> db -> output_vars["total_posts"] = $total_posts;
							$this -> db -> output_vars["first_order"] = $start;
							$this -> db -> output_vars["total_pages"] = $total_pages;
							$this -> db -> output_vars["page"] = $page;
							$this -> db -> cb = "dynamo.post.current.show";
						} else {
							$this -> db -> output_vars["reason"] = 1;
							$this -> db -> cb = "dynamo.post.current.none";
						}
					}
				} else {
					$this -> db -> output_vars["reason"] = 2;
					$this -> db -> cb = "dynamo.post.current.none";
				}
			}
			public function past(){
				$cid = $this -> db -> cid;
				$per_page = min(max_post_page,max(1,$this -> db -> settings["post_perpage"]));
				$query = $this -> db -> query("SELECT SUM(total_posts) total_posts, COUNT(total_posts) past_comps FROM past_post_comps WHERE cid=$cid",__LINE__,__FILE__);
				if($query -> num_rows){
					$total_posts = $this -> db -> get_result($query);
					$count = $this -> db -> get_result($query,0,1);
					$total_pages = ceil($count / $per_page);
					if($total_pages){
						$page = min(max(1,$this -> db -> secure($_GET['page'])),$total_pages);
						$start = ($page - 1) * $per_page;
						$query = $this -> db -> query("SELECT id,comp_number,total_posts,ended FROM past_post_comps WHERE cid=$cid ORDER BY ended DESC LIMIT $start,$per_page",__LINE__,__FILE__);
						if($query -> num_rows){
							$this -> db -> output_vars["past"] = array();
							while($q = $query -> fetch_assoc()){
								$this -> db -> output_vars["past"][] = array(
									"id" => $q['id'],
									"total_posts" => $q['total_posts'],
									"comp_number" => $q['comp_number'],
									"ended" => $q['ended']
								);
							}
							$this -> db -> output_vars["total_posts"] = $total_posts;
							$this -> db -> output_vars["total_pages"] = $total_pages;
							$this -> db -> output_vars["page"] = $page;
							$this -> db -> cb = "dynamo.post.past.show";
						} else {
							$this -> db -> cb = "dynamo.post.past.none";
						}
					} else {
						$this -> db -> cb = "dynamo.post.past.none";
					}
				} else {
					$this -> main();
				}
			}
			public function winners(){
				$cid = $this -> db -> cid;
				$id = $this -> db -> secure($_GET['id']);
				$query = $this -> db -> query("SELECT * FROM past_post_winners WHERE cid=$cid AND ppcid=$id ORDER BY position ASC",__LINE__,__FILE__);
				if($query -> num_rows){
					$this -> db -> output_vars["state"] = 1;
					$this -> db -> output_vars["winners"] = array();
					while($q = $query -> fetch_assoc()){
						$q_user = $this -> db -> get_user($q['zbid']);
						$winner_username = $q_user === false ? "Unknown" : $q_user['username'];
						$this -> db -> output_vars["winners"][] = array(
							"zbid" => $q['zbid'],
							"username" => $winner_username,
							"posts" => $q['posts'],
							"position" => $q['position']
						);
					}
				} else {
					$this -> db -> output_vars["state"] = 2;
				}
				$this -> db -> output_vars["id"] = $id;
				$this -> db -> cb = "dynamo.post.past.winners.show";
			}
		}
		$post = new post;
	} else {
		require_once("../main/database.class.php");
		$database -> output_vars["error"][] = 13;
		$database -> output();
	}
	
?>