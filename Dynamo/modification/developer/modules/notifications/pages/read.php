<?php
	class page implements iPage {
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> db -> notice_id = "notifications-log";
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
			$this -> settings = $this -> db -> modules["notifications"]["settings"];
			$this -> info = $this -> db -> secure($_GET['info']);
		}
	
		public function load() {
			$this -> ini();
		}
		
		private function ini() {
			$id = $this -> info["id"];
			if(
				strlen($id) &&
				$id > 0
			){
				$cid = $this -> cid;
				$zbid = $this -> zbid;
				$query = $this -> db -> query("UPDATE `notifications` SET `read`='1' WHERE `cid`='$cid' AND `zbid`='$zbid' AND `id`='$id' AND `read`='0' LIMIT 1");
			}
		}
		
	}
		
?>