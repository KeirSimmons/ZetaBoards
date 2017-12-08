<?php

	class topic_rating_events implements iEvent {
		
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
			$this -> settings = $this -> db -> modules["topic_rating"]["settings"];
			$this -> db -> load_module_class("topic_rating");
		}
		
		public function ini() {
		
			$that = $this;
			
			// core - output
			$this -> db -> events["core"]["output"][] = function($data) use($that) {
				if(isset($_GET['tids'])) {
					$topics = $that -> db -> secure($_GET['tids']);
					if(count($topics)) {
						$that -> db -> output_vars["info"]["topic_rating"]["ratings"] = $that -> db -> module_class["topic_rating"] -> get_stats($topics);
						$that -> db -> output_vars["info"]["topic_rating"]["display_type"] = +$that -> settings["display_type"];
						$that -> db -> output_vars["info"]["topic_rating"]["rate_type"] = +$that -> settings["rate_type"];
						$that -> db -> output_vars["info"]["topic_rating"]["no_rating"] = $that -> settings["no_rating"];
						$that -> db -> output_vars["info"]["topic_rating"]["max"] = +$that -> settings["max"];
					}
				}
			};
			
		}
	}

?>