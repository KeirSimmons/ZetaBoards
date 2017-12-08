<?php
	class page implements iPage {
	
		private $info;
	
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> db -> notice_id = "acp-ad-stats";
			$this -> cid = $this -> db -> cid;
			
			// load advert.php
			require_once("./advert.php"); // we are actually in tasks.php file here
			$this -> advert = new Advert();
		}
	
		public function load() {
			$this -> show();
		}
		
		private function show() {
			$cid = $this -> cid;
			try {$this -> db -> output_vars["info"]["ad"] = $this -> advert -> get($cid);}
			catch(Exception $e) {} // ad was not found -> don't populate "ad" output
			$this -> db -> cb = "dynamo.acp.ad.stats";
		}
		
	}
?>