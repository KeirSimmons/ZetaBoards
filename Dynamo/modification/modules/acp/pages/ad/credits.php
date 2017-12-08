<?php
	class page implements iPage {
	
		private $info;
	
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> db -> notice_id = "acp-ad-credits";
			$this -> cid = $this -> db -> cid;
			
			// load advert.php
			require_once("./advert.php"); // we are actually in tasks.php file here
			$this -> advert = new Advert();
		}
	
		public function load() {
			$this -> show();
		}
		
		private function show() {
			try {
				$ad_info = $this -> advert -> get($this -> cid);
				$credits = $ad_info['credits'];
			} catch(Exception $e) {
				$credits = Advert :: INITIAL_CREDITS;
			}
			$this -> db -> output_vars["info"]["credits"] = $credits;
			$this -> db -> output_vars["info"]["credits_per_view"] = Advert :: VIEW_CREDITS;
			$this -> db -> cb = "dynamo.acp.ad.credits";
		}
		
	}
?>