<?php
	if(in_array("/home/viralsmo/public_html/dynamo/database.class.php",get_included_files())){
		class awards {
			public function __construct(){
				global $database;
				$this -> db = $database;
				$this -> cf = $this -> db -> config;
				if(!defined(sha1(($this -> db -> cid) . "awards"))){
					$this -> db -> output_vars["error"][] = 40;
					$this -> db -> output();
				}
			}
			public function achieved(){
				$cid = $this -> db -> cid;
				$zbid = $this -> db -> zbid;
				$award_zbid = $this -> db -> secure(isset($_GET['award_zbid']) ? $_GET['award_zbid'] : $zbid);
				$this -> db -> output_vars["awards"] = array();
				$award_user = $this -> db -> get_user($award_zbid);
				if($award_user !== false){
					$page = $this -> db -> secure($_GET['page']);
					$page = $page ? $page : 1;
					$premium = $this -> db -> premium;
					$per_page = min($this -> cf -> MAX_AWARDS_PER_PAGE[$premium],max(1,$this -> db -> settings["awards_perpage"]));
					$awarded = $this -> db -> query("SELECT id FROM awarded WHERE cid=$cid AND zbid=$award_zbid",__LINE__,__FILE__);
					$this -> db -> output_vars["a_username"] = $award_user["username"];
					$num_rows = $awarded -> num_rows;
					if($num_rows){
						$total_pages = ceil($num_rows / $per_page);
						$page = min(max(1,$page),$total_pages);
						$start = ($page - 1) * $per_page;
						$awarded2 = $this -> db -> query("SELECT b.image,b.name,b.description,a.time FROM awarded a JOIN awards b ON b.id = a.aid WHERE a.zbid='$award_zbid' AND a.cid='$cid' ORDER BY a.time DESC LIMIT $start,$per_page",__LINE__,__FILE__);
						while($a = $awarded2 -> fetch_assoc()){
							$this -> db -> output_vars["awards"][] = $a;
						}
						$this -> db -> output_vars["page"] = $page;
						$this -> db -> output_vars["total_pages"] = $total_pages;
					}
				} else {
					$this -> db -> output_vars["a_username"] = "Unknown User";
				}
				$this -> db -> output_vars["a_zbid"] = $award_zbid;
				$this -> db -> cb = "dynamo.awards.achieved";
			}
			public function all(){
				$cid = $this -> db -> cid;
				$zbid = $this -> db -> zbid;
				$this -> db -> output_vars["awards"] = array();
				$page = $this -> db -> secure($_GET['page']);
				$page = $page ? $page : 1;
				$premium = $this -> db -> premium;
				$per_page = min($this -> cf -> MAX_AWARDS_PER_PAGE[$premium],max(1,$this -> db -> settings["awards_perpage"]));
				$awards = $this -> db -> query("SELECT COUNT(id) FROM awards WHERE cid=$cid",__LINE__,__FILE__);
				$num_rows = $this -> db -> get_result($awards);
				if($num_rows){
					$total_pages = ceil($num_rows / $per_page);
					$page = min(max(1,$page),$total_pages);
					$start = ($page - 1) * $per_page;
					$awards2 = $this -> db -> query("SELECT image,name,description FROM awards WHERE cid=$cid ORDER BY name ASC LIMIT $start,$per_page",__LINE__,__FILE__);
					while($a = $awards2 -> fetch_assoc()){
						$this -> db -> output_vars["awards"][] = $a;
					}
					$this -> db -> output_vars["page"] = $page;
					$this -> db -> output_vars["total_pages"] = $total_pages;
				}
				$this -> db -> cb = "dynamo.awards.full_list";
			}
			public function get_awards($posters){
				$cid = $this -> db -> cid;
				$premium = $this -> db -> premium;
				$this -> db -> output_vars["awards"] = array();
				$query = $this -> db -> query("SELECT a.zbid,a.id,b.image,b.name,b.description FROM awarded a JOIN awards b ON b.id = a.aid WHERE (a.zbid=".implode(" OR a.zbid=",$posters).") AND a.cid='$cid' ORDER BY a.zbid,a.time DESC",__LINE__,__FILE__);
				while($q = $query -> fetch_assoc()){
					if(!isset($this -> db -> output_vars["awards"]["u-".$q['zbid']])){
						$this -> db -> output_vars["awards"]["u-".$q['zbid']] = array(
							"total" => 0,
							"list" => array()
						);
					}
					if(count($this -> db -> output_vars["awards"]["u-".$q['zbid']]["list"]) < max(1,min($this -> cf -> MAX_AWARDS_USER_INFO[$premium],$this -> db -> settings["awards_userinfo"])))
					$this -> db -> output_vars["awards"]["u-".$q['zbid']]["list"][] = array(
						"id" => $q['id'],
						"image" => $q['image']
					);
					$this -> db -> output_vars["awards"]["u-".$q['zbid']]["total"]++;
				}
			}
			public function get_info(){
				$cid = $this -> db -> cid;
				$aid = $this -> db -> secure($_GET['aid']);
				$counter = $this -> db -> secure($_GET['counter']);
				if($aid && $counter){
					$query = $this -> db -> query("SELECT b.image,b.name,b.description,a.time, (SELECT COUNT(id) FROM awarded c WHERE c.aid=b.id AND c.cid=$cid) AS total FROM awarded a JOIN awards b ON b.id = a.aid WHERE a.id=$aid AND a.cid=$cid LIMIT 1",__LINE__,__FILE__);
					if($query -> num_rows){
						$q = $query -> fetch_assoc();
						$this -> db -> output_vars["login"] = 1;
						$this -> db -> output_vars["counter"] = $counter;
						$this -> db -> output_vars["id"] = $aid;
						$this -> db -> output_vars["info"] = array(
							"name" => $q['name'],
							"desc" => $q['description'],
							"image" => $q['image'],
							"total" => $q['total']-1,
							"time" => $q['time']
						);
						$this -> db -> cb = "dynamo.awards.tooltip.show_info";
					} else {
						$this -> db -> output_vars["error"][] = 43;
					}
				} else {
					$this -> db -> output_vars["error"][] = 42;
				}
			}
		}
		$awards = new awards;
	} else {
		require_once("../database.class.php");
		$database -> output_vars["error"][] = 41;
		$database -> output();
	}
	
?>