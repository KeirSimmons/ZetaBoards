<?php
	class Image {
	
		private $img;
	
		private $strings = array(
			"The Ultimate Modification",
			"Money Code with Donations",
			"Money Code with a Lottery",
			"Level & Experience Mod",
			"Money Code with a Shop!",
			"Money Code with Interest",
			"Advanced Notification Center",
			"Used on over 160 forums!",
			"Used by over 2,500 members!"
		);
		
		private $offset = 23;
		private $spacing = 12;
		
		public function __construct() {
			header('Content-Type: image/png');
			$this -> img = $this -> getImage();
			$this -> getStrings();	
		}
		
		public function __destruct() {
			imagepng($this -> img);
			imagedestroy($this -> img);
		}
		
		private function getImage() {
			$image = '3.png';
			$img = @imagecreatefrompng($image);
			return $img;
		}
		
		private function getStrings($x = 5) { // x = number of strings
			$img = $this -> img;
			for($i = 0; $i < $x; $i++) {
				$string = $this -> randomString();
				if(strlen($string)) {
					$text_color = imagecolorallocate($img, 242, 185, 101);
					$drop_color = imagecolorallocate($img, 0, 0, 0);
					imagestring($img, 3, 275, $this -> offset + 1, $string, $drop_color);
					imagestring($img, 3, 275, $this -> offset, $string, $text_color);
					$this -> offset += $this -> spacing;
				} else {
					break;
				}
			}
		}
		
		private function randomString() {
			$count = count($this -> strings);
			if($count == 0) {
				return "";
			}
			$ind = rand(0, $count - 1);
			$arr = array_splice($this -> strings, $ind, 1);
			return $arr[0];
		}
		
	}
	$image = new Image();
?>