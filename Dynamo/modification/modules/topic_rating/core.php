<?php
	class topic_rating {
	
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
			$this -> settings = $this -> db -> modules["topic_rating"]["settings"];
		}
		
		public function get_stats($topics) {
			// assumes $topics is not empty
			$cid = $this -> cid;
			$query = $this -> db -> query("SELECT `id`, `rating` FROM `topics` WHERE `cid`='$cid' AND `id` IN (".implode(", ", $topics).")");
			$to_return = array();
			$topics_found = array();
			while($q = $query -> fetch_assoc()) {
				$q['rating'] *= 1;
				$to_return[] = $q;
				$topics_found[] = $q['id'];
			}
			foreach(array_diff($topics, $topics_found) as $topic) {
				$to_return[] = array(
					"id" => $topic,
					"rating" => false
				);
			}
			return $to_return;
		}
		
	}
?>