<?php
	class page implements iPage {
	
		private $info;
	
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> db -> notice_id = "acp-ad-mine";
			$this -> cid = $this -> db -> cid;
			$this -> info = $this -> db -> secure($_GET['info']);
			
			// load advert.php
			require_once("./advert.php"); // we are actually in tasks.php file here
			$this -> advert = new Advert();
		}
	
		public function load() {
			$c = $this -> db -> secure($_GET['c']);
			switch($c) { // don't use $this -> $c to prevent someone passing in their own c method...
				case "form": $this -> form(); break;
				case "submit": $this -> submit(); break;
				default:
					unset($this -> db -> notice_id);
					$this -> db -> output(19);
					break;
			}
		}
		
		private function form() {
			$cid = $this -> cid;
			try {$this -> db -> output_vars["info"]["ad"] = $this -> advert -> get($cid);}
			catch(Exception $e) {} // ad was not found -> don't populate "ad" output
			$this -> db -> cb = "dynamo.acp.ad.mine.form";
		}
		
		private function submit() {
			$active = $this -> info["active"];
			$url = $this -> info["url"];
			$image = $this -> info["image"];
			if(
				!strlen($active) ||
				strlen($url) > 255 ||
				strlen($url) < 12 ||
				strlen($image) > 255 ||
				strlen($image) < 12 ||
				!filter_var($url, FILTER_VALIDATE_URL) ||
				!filter_var($image, FILTER_VALIDATE_URL) ||
				$active > 1 ||
				$active < 0
			) {
				$this -> form();
			} else {
				$cid = $this -> cid;
				
				require_once("./board_tools.php");
				
				$tools = new BoardTools();
				list($domain, $zb) = array_values($tools -> clean($url));
				$url_check = $this -> db -> query("SELECT COUNT(*) FROM `domains` WHERE `zb`='$zb' AND `domain`='$domain' AND `cid`='$cid' LIMIT 1");
				
				if($this -> db -> get_result($url_check) == 1) {
					$time = time();
					$initial_credits = Advert :: INITIAL_CREDITS;
					$this -> db -> query("INSERT INTO `adverts` (`cid`, `image`, `url`, `credits`, `added`) VALUES ('$cid', '$image', '$url', '$initial_credits', '$time') ON DUPLICATE KEY UPDATE `image`='$image', `url`='$url', `active`='$active'");
					$this -> db -> output(2);
				} else {
					$this -> db -> output(1);
				}
			}
		}
		
	}
?>