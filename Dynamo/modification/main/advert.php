<?php
	class Advert {
	
		const PRICE_PER_CREDIT   = 0.01; // in USD (1 USD = 10,000 views or 1,000 clicks or 100 unique clicks)
		const VIEW_CREDITS       = 0.01;
		const HIT_CREDITS        = 0.10;
		const UNIQUE_HIT_CREDITS = 0.25;
		const INITIAL_CREDITS    = 50; // credits we give initially for free =D
	
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
		}
		
		/*
		* Retrieves one random advert from the database with positive credits
		* Params: $count_as_view -> reduces credits if equal to true
		*/
		public function getRandom($count_as_view = true) {
			$info = array();
			// select a random advert that still has credits left
			$ad_q = $this -> db -> query("SELECT `cid`, `image` FROM `adverts` WHERE `credits`>0.00 AND `active`='1'ORDER BY RAND()  LIMIT 1");
			if($ad_q -> num_rows == 1) {
				$info["type"] = 1; // show button
				$info += $ad_q -> fetch_assoc();
				if($count_as_view) {
					$this -> view($info["cid"]);
				}
				return $info;
			} else {
				$info["type"] = 2; // none to show
				return $info;
			}
		}
		
		/*
		* Gets information on the advert associated with cid (passed as parameter)
		* Throws Exception if no advert can be found relating to the passed `cid`
		*/
		public function get($cid) {
			$ad_q = $this -> db -> query("SELECT * FROM `adverts` WHERE `cid`='$cid' LIMIT 1");
			if($ad_q -> num_rows == 1) {
				return $ad_q -> fetch_assoc();
			} else {
				throw new Exception("No advert found");
			}
		}
		
		/*
		* Increments view counter and reduces credits by VIEW_CREDITS
		*/
		public function view($cid) {
			$this -> db -> query("UPDATE `adverts` SET `views`=`views`+1, `credits`=GREATEST(0.00, `credits`-" . self::VIEW_CREDITS . ") WHERE `cid`='$cid'");
		}
		
		/*
		* Increments hit counter and reduces credits by HIT_CREDITS or UNIQUE_HITS_CREDITS
		*/
		public function hit($cid) {
			$zbid = $this -> zbid;
			$log = $this -> db -> query("INSERT INTO `advert_hits` (`aid`, `zbid`) VALUES('$id', '$zbid') ON DUPLICATE KEY UPDATE `amount`=`amount`+1");
			if($this -> db -> mysqli -> affected_rows == 1) { // insert (unique)
				$unique = 1;
				$credits = self :: UNIQUE_HIT_CREDITS;
			} else { // update (not unique)
				$unique = 0;
				$credits = self :: HIT_CREDITS;
			}
			$this -> db -> query("UPDATE `adverts` SET `hits`=`hits`+1, `unique_hits`=`unique_hits`+$unique, `credits`=GREATEST(0.00, `credits`-$credits) WHERE `cid`='$cid'");
		}
		
		/*
		* Reduces ad removal credits by VIEW_CREDITS
		*/
		public function reduce_removal_credits() {
			$cid = $this -> cid;
			$this -> db -> query("UPDATE `core` SET `ad_removal`=GREATEST(0.00, `ad_removal`-" . self :: VIEW_CREDITS . ") WHERE `id`='$cid' LIMIT 1");
		}
		
		/*
		* Gets stats of all adverts
		*/
		public function getStats() {
			$query = $this -> db -> query("SELECT COUNT(*) total, SUM(`views`) views, SUM(`hits`) hits, (SELECT COUNT(*) FROM `adverts` WHERE `active`='1' AND `credits`>0) active FROM `adverts`");
			return $query -> fetch_assoc();
		}
		
	}
?>