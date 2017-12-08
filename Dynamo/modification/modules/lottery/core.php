<?php
	class lottery {
	
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
			$this -> settings = $this -> db -> modules["lottery"]["settings"];
			$this -> user_settings = $this -> db -> my["config"]["lottery"]; // settings specific to user
			$this -> group_settings = $this -> db -> groups["id-" . $this -> db -> my["gid"]]["config"]["lottery"]; // settings specific to user's group
			$this -> info = $this -> db -> secure($_GET['info']);
		}
		
		public function winnings($pot, $r){
			if($r < 1) {
				return array();
			}
			$matches = array();
			$biggest = $pot * ((1 - exp(-1)) / (1 - exp(-$r)));
			for($i = 1; $i < $r; $i++){
				$matches[] = round($biggest * exp($i - $r));
			}
			$matches[] = round($biggest);
			return $matches;
		}
		
	}
?>