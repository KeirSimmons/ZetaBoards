<?php
	class level {
	
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
			$this -> settings = $this -> db -> modules["level"]["settings"];
			$this -> user_settings = $this -> db -> users["u-" . $this -> zbid]["config"]["level"];
		}
		
		public function get_info($exp) {
			$profile_type = $this -> settings["profile_type"];
			$max_level = $this -> settings["max_level"];
			$max_exp = $this -> settings["max_exp"];
			$type = $this -> settings["type"]; 
			$epsilon = 0.0000000000001;
						
			switch(+$type) {
				case 1: // linear
					$m = ($max_level - 1) / $max_exp;
					$level = min($max_level, floor($epsilon + $m * $exp + 1));
					if($level < $max_level) { 
						$next_level = $level + 1;
						$exp_next_level = ceil(($next_level - 1) / $m);
						$exp_current_level = ceil(($level - 1) / $m);
						$exp_needed = $exp_next_level - $exp;
						$percent = floor(100 * ($exp - $exp_current_level) / ($exp_next_level - $exp_current_level));
					} else {
						$exp_next_level = $exp_current_level = ceil(($level - 1) / $m);
					}
					break;
				case 2: // quadratic
					$a = ($max_level - 1) / sqrt($max_exp);
					$level = min($max_level, floor($epsilon + $a * sqrt($exp) + 1));
					if($level < $max_level) {
						$next_level = $level + 1;
						$exp_next_level = ceil(pow(($next_level - 1) / $a, 2));
						$exp_current_level = ceil(pow(($level - 1) / $a, 2));
						$exp_needed = $exp_next_level - $exp;
						$percent = floor(100 * ($exp - $exp_current_level) / ($exp_next_level - $exp_current_level));
					} else {
						$exp_next_level = $exp_current_level = ceil(pow(($level - 1) / $a, 2));
					}
					break;
				case 3: // cubic
					$level = min($max_level, floor($epsilon + pow(((pow($max_level, 3) - 1) / $max_exp) * $exp + 1, 1 / 3)));
					if($level < $max_level) {
						$next_level = $level + 1;
						$exp_next_level = ceil(($max_exp / (pow($max_level, 3) - 1)) * (pow($next_level, 3) - 1));
						$exp_current_level = ceil(($max_exp / (pow($max_level, 3) - 1)) * (pow($level, 3) - 1));
						$exp_needed = $exp_next_level - $exp;
						$percent = floor(100 * ($exp - $exp_current_level) / ($exp_next_level - $exp_current_level));
					} else {
						$exp_next_level = $exp_current_level = ceil(($max_exp / (pow($max_level, 3) - 1)) * (pow($level, 3) - 1));
					}
					break;
			}
			
			if($level >= $max_level) {
				$next_level = $level;
				$exp_needed = 0;
				$percent = 0;
			}
			
			return array(
				"level" => $level,
				"next_level" => $next_level,
				"max_level" => $max_level,
				"exp" => $exp,
				"exp_next_level" => $exp_next_level,
				"exp_current_level" => $exp_current_level,
				"exp_needed" => $exp_needed,
				"max_exp" => $max_exp,
				"percent" => $percent,
				"profile_type" => $profile_type
			);
			
		}
		
	}
?>