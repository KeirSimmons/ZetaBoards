<?php
	if(in_array("/home/viralsmo/public_html/dynamo/database.class.php",get_included_files())){
		class shop {
			public function __construct(){
				global $database;
				$this -> db = $database;
				$this -> cf = $this -> db -> config;
				if(!defined(sha1(($this -> db -> cid) . "shop"))){
					$this -> db -> output_vars["error"][] = 46;
					$this -> db -> output();
				}
			}
			public function main(){
				$cid = $this -> db -> cid;
				$zbid = $this -> db -> zbid;
				$gid = $this -> db -> my["gid"];
				$group = $this -> db -> groups["g-".$gid];
				$shop_query = $this -> db -> query("SELECT a.name, a.open,(SELECT EXISTS (SELECT 1 FROM shop_items b WHERE b.cid=a.cid AND b.szbid=a.zbid AND b.deleted=0)) items FROM shops a WHERE a.cid=$cid AND a.zbid=0 LIMIT 1",__LINE__,__FILE__);
				if($shop_query -> num_rows){
					/* 1 = open, with items, 2 = open, no items, 3 = closed, 4 = does not exist */
					$forum_shop = $shop_query -> fetch_assoc();
					$this -> db -> output_vars["forum_shop"] = $forum_shop['open'] == 0
						? 3
						: ($forum_shop['items'] == 1
							? 1
							: 2);
					$this -> db -> output_vars["forum_shop_name"] = $forum_shop["name"];
				} else {
					$this -> db -> output_vars["forum_shop"] = 4;
				}
				$other_query = $this -> db -> query("SELECT EXISTS(SELECT 1 FROM shops WHERE cid=$cid AND zbid!=0)",__LINE__,__FILE__);
				$this -> db -> output_vars["other_shops"] = $this -> db -> get_result($other_query); // 1 = there are other shops, 0 = no other shops
				if($group["shop_create"] == 0){
					$my_shop = 3;
				} else {
					$my_shop_query = $this -> db -> query("SELECT EXISTS(SELECT 1 FROM shops WHERE cid=$cid AND zbid=$zbid LIMIT 1)",__LINE__,__FILE__);
					$my_shop = $this -> db -> get_result($my_shop_query) == 1 ? 1 : 2;
				}
				$this -> db -> output_vars["my_shop"] = $my_shop; // 1 = manage, 2 = open, 3 = no permission
				$inventory_query = $this -> db -> query("SELECT EXISTS(SELECT 1 FROM shop_inventory WHERE cid=$cid AND zbid=$zbid LIMIT 1)",__LINE__,__FILE__);
				$this -> db -> output_vars["inventory"] = $this -> db -> get_result($inventory_query); // 1 = view, 0 = no items
				$this -> db -> cb = "dynamo.shop.main";
			}
			public function enter(){
				$cid = $this -> db -> cid;
				$zbid = $this -> db -> zbid;
				$gid = $this -> db -> my["gid"];
				$group = $this -> db -> groups["g-".$gid];
				$premium = $this -> db -> premium;
				$this -> db -> output_vars["items"] = array();
				$shop_zbid = $this -> db -> secure($_GET['shop_zbid']);
				$this -> db -> output_vars["shop_zbid"] = $shop_zbid;
				//$query = $this -> db -> query("SELECT COUNT(a.id) amount, COUNT(b.cid) `exists`, b.logo logo, b.name name FROM shop_items a JOIN shops b ON b.cid=a.cid AND b.zbid=a.szbid WHERE a.cid=$cid AND a.szbid=$shop_zbid AND a.deleted=0",__LINE__,__FILE__);
				$query = $this -> db -> query("SELECT open, name, description, logo, (SELECT COUNT(id) FROM shop_items WHERE cid=$cid AND szbid=$shop_zbid AND deleted=0 AND (stock=0 OR (stock-purchased)>0)) amount FROM shops WHERE cid=$cid AND zbid=$shop_zbid",__LINE__,__FILE__);
				if($query -> num_rows){
					$query = $query -> fetch_assoc();
					$this -> db -> output_vars["name"] = $query['name'];
					if($query['open'] || $zbid == $shop_zbid || ($shop_zbid == 0 && $group['admin'])){ // if shop is open OR you are the shop owner OR you are an admin and this is the official shop
						$items_in_shop = $query['amount'];
						if($items_in_shop){
							$this -> db -> output_vars["state"] = 3; // shop created, open and with items!
							$per_page = min($this -> cf -> MAX_SHOP_ITEMS_PER_PAGE[$premium],max(1,$this -> db -> settings["shop_items_perpage"]));
							$this -> db -> output_vars["money"] = $this -> db -> my["money_hand"];
							$this -> db -> output_vars["logo"] = $query['logo'];
							$this -> db -> output_vars["per_page"] = $per_page;
							$this -> db -> output_vars["total_pages"] = $total_pages = ceil($items_in_shop / $per_page);
							$page = $this -> db -> secure(isset($_GET['page']) ? $_GET['page'] : 1);
							$this -> db -> output_vars["page"] = $page = min(max(1,$page),$total_pages);
							$start = ($page - 1) * $per_page;
							$query = $this -> db -> query("SELECT a.id,name,description,price,stock,max_per_user,SUM(COALESCE(b.quantity,0)) owned, purchased, img, preview, watermark FROM shop_items a LEFT JOIN shop_inventory b ON b.iid=a.id AND b.cid=a.cid WHERE a.cid=$cid AND a.szbid=$shop_zbid AND a.deleted=0 AND (a.stock=0 OR (a.stock-a.purchased)>0) GROUP BY a.id ORDER BY added DESC LIMIT $start,$per_page",__LINE__,__FILE__);
							while($q = $query -> fetch_assoc()){
								$this -> db -> output_vars["items"][] = $q;
							}
						} else {
							$this -> db -> output_vars["state"] = 2; // shop created and open but no items!
						}
					} else {
						$this -> db -> output_vars["state"] = 1; // shop created but not open
					}
				} else {
					$this -> db -> output_vars["state"] = 0; // shop not yet created
				}
				$this -> db -> cb = "dynamo.shop.enter.show_items";
			}
			public function enter_checkout(){
				$cid = $this -> db -> cid;
				$zbid = $this -> db -> zbid;
				$temp_items = $this -> db -> secure($_GET['i']);
				$shop_zbid = $this -> db -> secure($_GET['shop_zbid']);
				$can_buy = true;
				$bought = time();
				$shop_user = $this -> db -> get_user($shop_zbid);
				if($shop_zbid == $zbid){
					$this -> db -> output_vars["checkout"] = 7;
				} elseif($shop_zbid > 0 && $shop_user !== false){
					$this -> db -> output_vars["checkout"] = 6;
				} else {
					$items = array();
					$item_ids = array();
					foreach($temp_items as $item){
						$items["i-".$item[0]] = array(
							"quantity" => $item[1],
							"owned" => 0
						);
						$item_ids[] = $item[0];
					}
					unset($temp_items);
					//print_r($items);exit;
					$this -> db -> cb = "dynamo.shop.enter.checkout_return";
					if(is_array($items) && count($items)){
						$query = $this -> db -> query("SELECT a.id id, a.name item_name, a.price, a.stock, a.max_per_user, a.purchased, a.notify_me, a.notify_them, SUM(COALESCE(b.quantity,0)) owned FROM shop_items a LEFT JOIN shop_inventory b ON b.iid=a.id WHERE a.cid=$cid AND a.szbid=$shop_zbid AND a.deleted=0 AND a.id IN(".implode(",",$item_ids).") GROUP BY a.id",__LINE__,__FILE__);
						if($query -> num_rows == count($items)){
							$total_price = 0;
							while($q = $query -> fetch_assoc()){
								$quantity = $items["i-".$q['id']]["quantity"];
								$owned = $items["i-".$q['id']]["owned"] = $q['owned'];
								if($q['stock'] != 0 && $quantity > ($q['stock'] - $q['purchased'])){
									$this -> db -> output_vars["checkout"] = 3;
									$can_buy = false;
									break;
								} elseif(($owned + $quantity) > $q['max_per_user'] && $q['max_per_user'] != 0){
									$this -> db -> output_vars["checkout"] = 4;
									$can_buy = false;
									break;
								} else {
									$total_price += $q['price'] * $quantity;
								}
								if($q['notify_me'] == 1){
									$data = $quantity . "|" . $zbid . "|" . $this -> db -> mysqli -> real_escape_string($q['item_name']);
									if($shop_zbid == 0){
										// admin task!!!! $notifications_to_send[] = "($cid,1,'$data',$bought)";
									} else {
										$this -> db -> new_notification($shop_zbid,6,$data);
									}
								}
							}
							if($total_price > $this -> db -> my["money_hand"]){
								$this -> db -> output_vars["checkout"] = 5;
									$can_buy = false;
							}
							if($can_buy){
								$inventories = array();
								$case_statement = array();
								foreach($items as $key => $value){
									$iid = str_replace("i-","",$key);
									$quantity = $value["quantity"];
									$inventories[] = "($cid,$zbid,$iid,$quantity,$bought)";
									$case_statement[] = "WHEN id=$iid THEN $quantity";
								}
								$case_statement = implode(" ",$case_statement);
								$to_update = count($items);
								$in_statement = implode(",",$item_ids);
								if($total_price > 0){
									$update_me = $this -> db -> query("UPDATE users SET money_hand=money_hand-$total_price WHERE zbid=$zbid AND cid=$cid LIMIT 1",__LINE__,__FILE__);
									$this -> db -> my["money_hand"] -= $total_price;
								}
								if($this -> db -> mysqli -> affected_rows || $total_price == 0){
									if($shop_zbid != 0 && $total_price > 0){
										$update_other = $this -> db -> query("UPDATE users SET money_hand=money_hand+$total_price WHERE zbid=$shop_zbid AND cid=$cid LIMIT 1",__LINE__,__FILE__);
										$this -> db -> users["u-" . $shop_zbid]["money_hand"] += $total_price;
										$shop_user["money_hand"] += $total_price;
									}
									$this -> db -> history_log($zbid,8,$total_price,$shop_zbid);
									if($shop_zbid != 0){
										$values[] = "($cid,$shop_zbid,9,$total_price,$zbid,$bought)";
										$this -> db -> history_log($shop_zbid,9,$total_price,$zbid);
									}
									$values = implode(",",$values);
									if($shob_zbid == 0 || $this -> db -> mysqli -> affected_rows){
										$update_item = $this -> db -> query("UPDATE shop_items SET purchased=purchased+(CASE $case_statement ELSE 0 END) WHERE cid=$cid AND szbid=$shop_zbid AND deleted=0 AND id IN($in_statement) LIMIT $to_update",__LINE__,__FILE__);
										$inventory_add = $this -> db -> query("INSERT DELAYED INTO shop_inventory (cid,zbid,iid,quantity,bought) VALUES " . implode(",",$inventories),__LINE__,__FILE__);
										$this -> db -> output_vars["checkout"] = 0; // finally completed!
									}
								}
							}
						} else {
							$this -> db -> output_vars["checkout"] = 2;
						}
					} else {
						$this -> db -> output_vars["checkout"] = 1;
					}
				}
				$this -> enter();
			}
			public function update_shop(){
				$cid = $this -> db -> cid;
				$zbid = $this -> db -> zbid;
				$time = time();
				$update_shop = $this -> db -> query("UPDATE shops SET last_updated=$time WHERE cid=$cid AND zbid=$zbid LIMIT 1",__LINE__,__FILE__);
			}
			public function settings(){
				$cid = $this -> db -> cid;
				$zbid = $this -> db -> zbid;
				$name = $this -> db -> secure($_GET['name']);
				$description = $this -> db -> secure($_GET['description']);
				$logo = $this -> db -> secure($_GET['logo']);
				$time = time();
				$check_query = $this -> db -> query("INSERT INTO shops (cid,zbid,name,description,logo,created,last_updated) VALUES ($cid,$zbid,'$name','$description','$logo',$time,$time) ON DUPLICATE KEY UPDATE name='$name',description='$description',logo='$logo',last_updated=$time",__LINE__,__FILE__);
				$this -> control_panel(1);
			}
			public function control_panel($stage=0){
				$cid = $this -> db -> cid;
				$zbid = $this -> db -> zbid;
				$stage = $stage == 0 ? $this -> db -> secure($_GET['stage']) : $stage;
				$query = $this -> db -> query("SELECT name,description,logo FROM shops WHERE cid=$cid AND zbid=$zbid LIMIT 1",__LINE__,__FILE__);
				if($query -> num_rows == 1){
					if($stage == 1){
						$this -> db -> output_vars["name"] = $this -> db -> get_result($query);
						$edit_query = $this -> db -> query("SELECT EXISTS(SELECT 1 FROM shop_items WHERE cid=$cid AND szbid=$zbid AND deleted=0 LIMIT 1)");
						$purchase_query = $this -> db -> query("SELECT EXISTS (SELECT 1 FROM shop_inventory a JOIN shop_items b ON a.iid=b.id WHERE b.szbid=$zbid AND a.cid=$cid GROUP BY a.bought,a.zbid LIMIT 1)",__LINE__,__FILE__);
						$this -> db -> output_vars["edit_items"] = $this -> db -> get_result($edit_query);
						$this -> db -> output_vars["purchase"] = $this -> db -> get_result($purchase_query);
						$this -> db -> cb = "dynamo.shop.mine.main";
					} else {
						$this -> db -> output_vars["name"] = $this -> db -> get_result($query);
						$this -> db -> output_vars["description"] = $this -> db -> get_result($query,0,1);
						$this -> db -> output_vars["logo"] = $this -> db -> get_result($query,0,2);
						$this -> db -> cb = "dynamo.shop.mine.settings.page";
					}
				} else {
					$this -> db -> cb = "dynamo.shop.mine.settings.page";
				}
			}
			public function add(){
				$cid = $this -> db -> cid;
				$zbid = $this -> db -> zbid;
				$stage = $this -> db -> secure($_GET['stage']);
				if($stage == 1){ // form
					$query = $this -> db -> query("SELECT name FROM shops WHERE cid=$cid AND zbid=$zbid LIMIT 1",__LINE__,__FILE__);
				} else { // complete
					$iid = $this -> db -> secure($_GET['id']);
					$name = $this -> db -> secure($_GET['name']);
					$description = $this -> db -> secure($_GET['desc']);
					$price = $this -> db -> secure($_GET['price']);
					$stock = $this -> db -> secure($_GET['stock']);
					$max_per_user = $this -> db -> secure($_GET['max']);
					$image = $this -> db -> secure($_GET['image']);
					$watermark = $this -> db -> secure($_GET['watermark']);
					$preview = $this -> db -> secure($_GET['preview']);
					$notify_me = $this -> db -> secure($_GET['notify']);
					$buyer_message = $this -> db -> secure($_GET['msg']);
					if(!strlen($name) || !strlen($price) || !strlen($stock) || !strlen($max_per_user) || !strlen($image) || !strlen($watermark) || !strlen($notify_me) || !$this -> db -> is_number($price) || !$this -> db -> is_number($stock) || !$this -> db -> is_number($max_per_user) || !($price * 1 >= 0) || !($stock * 1 >= 0) || !($max_per_user * 1 >= 0)){
						$this -> db -> output_vars["error"][] = 48;
					} else {
						$price *= 1;
						$stock *= 1;
						$max_per_user *= 1;
						$query = $this -> db -> query("SELECT name FROM shops WHERE cid=$cid AND zbid=$zbid LIMIT 1",__LINE__,__FILE__);
						if($query -> num_rows == 1){
							if(strlen($iid)){ // we're actually editing an existing item here!
								$edit = $this -> db -> query("UPDATE shop_items SET name='$name',description='$description',price=$price,stock=$stock+purchased,max_per_user=$max_per_user,img='$image',watermark=$watermark,preview='$preview',notify_me=$notify_me,notify_them='$buyer_message' WHERE cid=$cid AND szbid=$zbid AND id=$iid LIMIT 1",__LINE__,__FILE__);
								$this -> db -> output_vars["success"] = $this -> db -> mysqli -> affected_rows;
								$this -> db -> cb = "dynamo.shop.mine.edit.success";
							} else { // add item
								$added = time();
								$add = $this -> db -> query("INSERT INTO shop_items (cid,szbid,notify_me,notify_them,name,description,price,stock,max_per_user,img,preview,watermark,added) VALUES($cid,$zbid,$notify_me,'$buyer_message','$name','$description',$price,$stock,$max_per_user,'$image','$preview',$watermark,$added)",__LINE__,__FILE__);
								$this -> db -> output_vars["success"] = $this -> db -> mysqli -> affected_rows;
								$this -> db -> cb = "dynamo.shop.mine.add.success";
							}
							if($this -> db -> mysqli -> affected_rows){ // change shop's last_updated parameter
								$this -> update_shop();
							}
						} else {
							$this -> db -> cb = "dynamo.shop.mine.settings.page";
						}
					}
				}
			}
			public function edit($stage=0){
				$cid = $this -> db -> cid;
				$zbid = $this -> db -> zbid;
				$premium = $this -> db -> premium;
				$stage = $stage == 0 ? $this -> db -> secure($_GET['stage']) : 1;
				if($stage == 1){ // show items
					$per_page = min($this -> cf -> MAX_SHOP_EDIT_ITEMS_PER_PAGE[$premium],max(1,$this -> db -> settings["shop_edit_items_perpage"]));
					$total_items = $this -> db -> query("SELECT COUNT(id) FROM shop_items WHERE cid=$cid AND szbid=$zbid AND deleted=0",__LINE__,__FILE__);
					$this -> db -> output_vars["items"] = array();
					$number_of_items = $this -> db -> get_result($total_items);
					if($number_of_items){
						$total_pages = ceil($number_of_items / $per_page);
						$page = min(max(1,$this -> db -> secure($_GET['page'])),$total_pages);
						$start = ($page - 1) * $per_page;
						$items = $this -> db -> query("SELECT id,name,description,stock,purchased,img,preview,watermark FROM shop_items WHERE cid=$cid AND szbid=$zbid AND deleted=0 ORDER BY added DESC LIMIT $start,$per_page",__LINE__,__FILE__);
						while($i = $items -> fetch_assoc()){
							if(!strlen($i['preview'])){
								unset($i['preview']);
							}
							$this -> db -> output_vars["items"][] = $i;
						}
						$this -> db -> output_vars["page"] = $page;
						$this -> db -> output_vars["total_pages"] = $total_pages;
						$this -> db -> cb = "dynamo.shop.mine.edit.show_page";
					} else { // go back to main control panel page
						$this -> control_panel(1);
					}
				} else { // edit form (which uses add item form!)
					$iid = $this -> db -> secure($_GET['id']);
					$item_info = $this -> db -> query("SELECT name,description,price,stock,purchased,max_per_user,img,watermark,preview,notify_me,notify_them FROM shop_items WHERE cid=$cid AND szbid=$zbid AND id=$iid AND deleted=0 LIMIT 1",__LINE__,__FILE__);
					if($item_info -> num_rows){
						$item_info = $item_info -> fetch_assoc();
						$item_info["id"] = $iid;
						$item_info["stock"] = $item_info["stock"] - $item_info["purchased"];
						unset($item_info["purchased"]);
						$this -> db -> output_vars["item_info"] = $item_info;
						$this -> db -> cb = "dynamo.shop.mine.add.ini";
					} else {
						$this -> edit(1);
					}
				}
			}
			public function delete(){
				$cid = $this -> db -> cid;
				$zbid = $this -> db -> zbid;
				$iid = $this -> db -> secure($_GET['id']);
				if($iid){
					$this -> db -> query("UPDATE shop_items SET deleted=1 WHERE id=$iid AND cid=$cid AND szbid=$zbid LIMIT 1",__LINE__,__FILE__);
					$this -> update_shop();
				}
				$this -> edit(1);
			}
			public function purchase($stage=0){
				$cid = $this -> db -> cid;
				$zbid = $this -> db -> zbid;
				$premium = $this -> db -> premium;
				$stage = $stage == 0 ? $this -> db -> secure($_GET['stage']) : 1;
				if($stage == 1){ // list of grouped transactions
					$per_page = min($this -> cf -> MAX_SHOP_PURCHASES_ITEMS_PER_PAGE[$premium],max(1,$this -> db -> settings["shop_purchases_items_perpage"]));
					$total_purchases = $this -> db -> query("SELECT COUNT(DISTINCT a.bought) FROM shop_inventory a JOIN shop_items b ON b.id=a.iid AND b.szbid=$zbid AND b.cid=a.cid",__LINE__,__FILE__);
					$this -> db -> output_vars["purchases"] = array();
					$number_of_purchases = $this -> db -> get_result($total_purchases);
					if($number_of_purchases){
						$total_pages = ceil($number_of_purchases / $per_page);
						$page = min(max(1,$this -> db -> secure($_GET['page'])),$total_pages);
						$start = ($page - 1) * $per_page;
						$purchases = $this -> db -> query("SELECT SUM(a.quantity) quantity,SUM(b.price*a.quantity) price,a.zbid,a.bought time FROM shop_inventory a JOIN shop_items b ON a.iid=b.id WHERE b.szbid=$zbid AND a.cid=$cid GROUP BY a.bought,a.zbid ORDER BY a.bought DESC LIMIT $start,$per_page",__LINE__,__FILE__);
						while($p = $purchases -> fetch_assoc()){
							$p_user = $this -> db -> get_user($p['zbid']);
							$p['username'] = $p_user === false ? "Unknown" : $p_user["username"];
							$this -> db -> output_vars["purchases"][] = $p;
						}
						$this -> db -> output_vars["page"] = $page;
						$this -> db -> output_vars["total_pages"] = $total_pages;
						$this -> db -> cb = "dynamo.shop.mine.purchase.show_page";
					} else { // go back to main control panel page
						$this -> control_panel(1);
					}
				} else { // specific grouped transaction
					$page = $this -> db -> secure($_GET['page']);
					$bought = $this -> db -> secure($_GET['bought']);
					$buyer_zbid = $this -> db -> secure($_GET['buyer_zbid']);
					$purchases = $this -> db -> query("SELECT b.id, b.name, a.quantity, b.price, (a.quantity*b.price) total_price, b.img, b.preview, b.watermark, b.description FROM shop_inventory a JOIN shop_items b ON a.iid=b.id WHERE b.szbid=$zbid AND a.cid=$cid AND a.bought=$bought AND a.zbid=$buyer_zbid ORDER BY quantity DESC, total_price DESC",__LINE__,__FILE__);
					$this -> db -> output_vars["purchases"] = array();
					$number_of_purchases = $purchases -> num_rows;
					if($number_of_purchases){
						while($p = $purchases -> fetch_assoc()){
							if(!strlen($p['preview'])){
								unset($p['preview']);
							}
							$this -> db -> output_vars["purchases"][] = $p;
						}
						$this -> db -> output_vars["page"] = $page;
						$this -> db -> cb = "dynamo.shop.mine.purchase.specific.show";
					} else {
						$this -> purchase(1);
					}
				}
			}
			public function members(){
				$cid = $this -> db -> cid;
				$zbid = $this -> db -> zbid;
				$premium = $this -> db -> premium;
				$this -> db -> output_vars["order_by"] = $order_by = $this -> db -> secure(isset($_GET['order_by']) ? $_GET['order_by'] : 1); // 1 = last updated, 2 = average price, 3 = no. of items, 4 = no .of purchases made, 5 = no. of unique buyers
				switch($order_by){
					case 1: $order_by = "rating"; break;
					case 2: $order_by = "last_updated"; break;
					case 3: $order_by = "items"; break;
					case 4: $order_by = "average_price"; break;
					case 5: $order_by = "purchased"; break;
					case 6: $order_by = "unique_buyers"; break;
					default: $order_by = "rating"; break;
				}
				$this -> db -> output_vars["order_type"] = $order_type = $this -> db -> secure(isset($_GET['order_type']) ? $_GET['order_type'] : 1);
				$order_type = $order_type == 1 ? "DESC" : "ASC";
				$per_page = min($this -> cf -> MAX_SHOP_SHOPS_PER_PAGE[$premium],max(1,$this -> db -> settings["shop_shops_perpage"]));
				$total_shops = $this -> db -> query("SELECT COUNT(1) AS shops, b.buyers unique_buyers, b.quantity purchased, c.items items, c.price price FROM shops a JOIN ( SELECT COUNT(DISTINCT zbid) buyers, ROUND(COALESCE(SUM(quantity),0)) quantity FROM shop_inventory WHERE cid = $cid) b JOIN (SELECT COUNT(c.id) items,ROUND(COALESCE(SUM(c.price),0)) price FROM shop_items c WHERE c.cid=$cid) c WHERE a.zbid != 0 AND a.cid = 1",__LINE__,__FILE__);
				$this -> db -> output_vars["shops"] = array();
				$total_shops = $total_shops -> fetch_assoc();
				$number_of_shops = max(1,$total_shops["shops"]);
				$avg_unique_buyers = max(1,$total_shops["unique_buyers"])/$number_of_shops;
				$avg_items = max(1,$total_shops["items"])/$number_of_shops;
				$avg_purchased = max(1,$total_shops["purchased"])/$number_of_shops;
				$avg_price = max(1,$total_shops["price"])/max(1,$total_shops["items"]);
				if($number_of_shops){
					$total_pages = ceil($number_of_shops / $per_page);
					$page = min(max(1,$this -> db -> secure(isset($_GET['page']) ? $_GET['page'] : 1)),$total_pages);
					$start = ($page - 1) * $per_page;
					$shops = $this -> db -> query("SELECT d.*, ROUND((((items/$avg_items)*(100/9))+(CASE average_price WHEN 0 THEN 0 ELSE ($avg_price/average_price)*(200/9) END)+((purchased/$avg_purchased)*(100/3))+((unique_buyers/$avg_unique_buyers)*(100/3)))/2) rating FROM (SELECT a.name, a.description shop_desc, a.zbid, a.last_updated, a.logo,COALESCE(b.item_cnt,0) AS items,ROUND(COALESCE(b.avg_price,0)) AS average_price,COALESCE(b.buyer_cnt, 0) AS unique_buyers,COALESCE(b.quantity,0)  AS purchased FROM shops a LEFT JOIN (SELECT a.cid, a.szbid, COUNT(*) AS item_cnt, AVG(a.price) AS avg_price,b.buyer_cnt,b.quantity FROM shop_items a LEFT JOIN (SELECT cid,iid,COUNT(DISTINCT zbid) AS buyer_cnt,SUM(quantity) AS quantity FROM shop_inventory WHERE cid = $cid GROUP BY cid,iid) b ON a.cid = b.cid AND a.id = b.iid WHERE a.cid = $cid AND a.szbid <> 0 GROUP BY  a.cid,a.szbid) b ON a.cid = b.cid AND a.zbid = b.szbid WHERE a.cid = $cid AND a.zbid <> 0 ) d ORDER BY $order_by $order_type LIMIT $start,$per_page",__LINE__,__FILE__);
					while($s = $shops -> fetch_assoc()){
						$s['rating'] = max(0,$s['rating']);
						$s_user = $this -> db -> get_user($s['zbid']);
						$s['username'] = $s_user === false ? "Unknown" : $s_user["username"];
						if(!strlen($s['logo'])){
							unset($s['logo']);
						}
						$this -> db -> output_vars["shops"][] = $s;
					}
					$this -> db -> output_vars["page"] = $page;
					$this -> db -> output_vars["total_pages"] = $total_pages;
					$this -> db -> cb = "dynamo.shop.members.show_page";
				} else { // go back to main control panel page
					$this -> main();
				}
			}
			public function inventory($stage=0){
				$cid = $this -> db -> cid;
				$zbid = $this -> db -> zbid;
				$premium = $this -> db -> premium;
				$stage = $stage == 0 ? $this -> db -> secure($_GET['stage']) : 1;
				if($stage == 1){ // get inventory, list items
					$i_zbid = $this -> db -> secure(isset($_GET['i_zbid']) ? $_GET['i_zbid'] : $zbid);
					$per_page = min($this -> cf -> MAX_SHOP_INVENTORY_PER_PAGE[$premium],max(1,$this -> db -> settings["shop_inventory_perpage"]));
					$total_items = $this -> db -> query("SELECT COUNT(DISTINCT a.iid) `total_items`,b.name FROM shop_inventory a LEFT JOIN shops b ON b.cid=a.cid AND b.zbid=0 WHERE a.cid=$cid AND a.zbid=$i_zbid",__LINE__,__FILE__);
					$total_items = $total_items -> fetch_assoc();
					$forum_shop_name = $total_items["name"];
					$forum_shop_name = is_null($forum_shop_name) ? "Forum " . $this -> db -> settings["shop_name"] : $forum_shop_name;
					$total_items = $total_items["total_items"];
					$this -> db -> output_vars["items"] = array();
					$this -> db -> output_vars["i_zbid"] = $i_zbid;
					if($i_zbid != $zbid){
						$i_user = $this -> db -> get_user($i_zbid);
						$this -> db -> output_vars["i_username"] = $i_user === false ? "Unknown" : $i_user["username"];
					}
					if($total_items){
						$total_pages = ceil($total_items / $per_page);
						$page = min(max(1,$this -> db -> secure($_GET['page'])),$total_pages);
						$start = ($page - 1) * $per_page;
						$items = $this -> db -> query("SELECT a.iid id,b.szbid seller, b.name,b.description,b.img, b.preview, b.watermark, SUM(a.quantity) quantity, MAX(a.bought) bought FROM shop_inventory a JOIN shop_items b ON b.id=a.iid WHERE a.cid=$cid AND a.zbid=$i_zbid GROUP BY a.iid ORDER BY a.bought DESC LIMIT $start,$per_page",__LINE__,__FILE__);
						while($i = $items -> fetch_assoc()){
							if(!strlen($i['preview'])){
								unset($i['preview']);
							}
							if($i['seller'] != 0){
								$i_user = $this -> db -> get_user($i['seller']);
								$i['username'] = $i_user === false ? "Unknown" : $i_user["username"];
							} else {
								$i['username'] = $forum_shop_name;
								unset($i['seller']);
							}
							$this -> db -> output_vars["items"][] = $i;
						}
						$this -> db -> output_vars["page"] = $page;
						$this -> db -> output_vars["total_pages"] = $total_pages;
					}
					$this -> db -> cb = "dynamo.shop.inventory.show_page";
				} else { // get attached message
					$iid = $this -> db -> secure($_GET['iid']);
					$item = $this -> db -> query("SELECT b.name,b.notify_them FROM shop_inventory a JOIN shop_items b ON b.id=a.iid AND b.id=$iid WHERE a.cid=$cid AND a.zbid=$zbid GROUP BY a.iid LIMIT 1",__LINE__,__FILE__);
					$this -> db -> output_vars["iid"] = $iid;
					if($item -> num_rows){
						$this -> db -> output_vars["name"] = $this -> db -> get_result($item);
						$this -> db -> output_vars["message"] = $this -> db -> get_result($item,0,1);
						$this -> db -> output_vars["page"] = $this -> db -> secure($_GET['page']);
						$this -> db -> cb = "dynamo.shop.inventory.specific.show";
					} else {
						$this -> inventory(1);
					}
				}
			}
		}
		$shop = new shop;
	} else {
		require_once("../database.class.php");
		$database -> output_vars["error"][] = 47;
		$database -> output();
	}
	
?>