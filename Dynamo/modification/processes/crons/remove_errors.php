<?php
	function pathToArray($path , $separator = '/') {
		if (($pos = strpos($path, $separator)) === false) {
			return array($path);
		}
		return array(substr($path, 0, $pos) => pathToArray(substr($path, $pos + 1)));
	}
	$dir = '../';
	$results = array();
	if (is_dir($dir)) {
		$iterator = new RecursiveDirectoryIterator($dir);
		foreach ( new RecursiveIteratorIterator($iterator, RecursiveIteratorIterator::CHILD_FIRST) as $file ) {
			if ($file->isFile()) {
				$thispath = str_replace('\\', '/', $file);
				$thisfile = utf8_encode($file->getFilename());
				echo $thispath . " - " . $thisfile . "<br>";
				if($thisfile == "error_log") {
					unlink($thispath);
				}
				$results = array_merge_recursive($results, pathToArray($thispath));
			}
		}
	}
?>