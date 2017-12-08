<?php
	class page implements iPage {
		public function __construct() {
			global $database;
			$this -> db = $database;
			$this -> db -> notice_id = "shop-mine";
			$this -> cid = $this -> db -> cid;
			$this -> zbid = $this -> db -> zbid;
			$this -> settings = $this -> db -> modules["shop"]["settings"];
			$this -> info = $this -> db -> secure($_GET['info']);
		}
	
		public function load() {
			$c = $this -> db -> secure($_GET['c']);
			switch($c) { // don't use $this -> $c to prevent someone passing in their own c method...
				case "view":
					$this -> view();
					break;
				case "old":
					$this -> logs(1);
					break;
				case "read":
					$this -> read();
					break;
				case "mark_all":
					$this -> mark_all();
					break;
				default:
					unset($this -> db -> notice_id);
					$this -> db -> output(19);
					break;
			}
		}
		
		private function view() {
			$cid = $this -> cid;
			$zbid = $this -> zbid;
			$per_page = 1;
			$item_q = $this -> db -> query("SELECT COUNT(`id`) FROM `shops` WHERE cid='$cid' AND zbid='$zbid'");
			$num_rows = $this -> db -> get_result($item_q);
			$page = $this -> info["page"];
			$page = strlen($page) ? $page : 1;
			$items = array();
			if($num_rows){
				$total_pages = ceil($num_rows / $per_page);
				$page = min(max(1, $page), $total_pages);
				$start = ($page - 1) * $per_page;
				$item_q = $this -> db -> query("SELECT * FROM `shops` WHERE cid='$cid' AND zbid='$zbid' ORDER BY `added` DESC LIMIT $start, $per_page");
				while($item = $item_q -> fetch_assoc()) {
					$items[] = $item;
				}
			} else {
				$total_pages = 1;
				$page = 1;
			}
			$this -> db -> output_vars["info"]["items"] = $items;
			$this -> db -> output_vars["info"]["total_pages"] = $total_pages;
			$this -> db -> output_vars["info"]["page"] = $page;
			$this -> db -> cb = "dynamo.shop.view.ini";
		}
		
	}
		
?>