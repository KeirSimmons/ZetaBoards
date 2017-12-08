<?php
	class page implements iPage {
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> db -> notice_id = "notifications-add";
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
			$this -> settings = $this -> db -> modules["notifications"]["settings"];
			$this -> info = $this -> db -> secure($_GET['info']);
		}
	
		public function load() {
			$this -> add();
		}
		
		private function add() {
			$cid = $this -> cid;
			$zbid = $this -> zbid;
			$message = $this -> info["message"];
			if(strlen($message)) {
				$premium = $this -> db -> premium;
				$max_length = $premium == 1 ? 255 : 100;
				$message = substr($message, 0, $max_length);
				$user_zbid = $this -> info["zbid"];
				$user_zbid = strlen($user_zbid) ? $user_zbid : $zbid;
				$this -> db -> load_module_class("notifications");
				$this -> db -> module_class["notifications"] -> notify(array(
					"type" => "custom",
					"zbid" => $user_zbid,
					"data" => $message
				));
			}
		}
		
	}
		
?>