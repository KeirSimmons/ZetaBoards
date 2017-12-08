<?php
	class post extends acp {
		public function current(){
			$this -> db -> output_vars["cb"] = "dynamo.acp.post.current(data)";
		}
		public function past(){
			$this -> db -> output_vars["cb"] = "dynamo.acp.post.current(data)";
		}
	}
	$post = new post;
?>