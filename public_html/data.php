<?php 

include("../db.php");

try {
	$pdo = new PDO("mysql:host=$db[host];dbname=$db[dbname];port=$db[port];charset=$db[charset]", $db["username"], $db["password"]);
} catch (PDOException $e) {
	echo "Database connection failed";
	exit;
}

$year = date("Y");
$month = date("m");

// load all events
$sql = "SELECT * FROM events WHERE year=:year AND month=:month ORDER BY `date`, start_time ASC";
$statement = $pdo->prepare($sql);
$statement->bindValue(":year", $year, PDO::PARAM_INT);
$statement->bindValue(":month", $month, PDO::PARAM_INT);
$statement->execute();
$events = $statement->fetchAll(PDO::FETCH_ASSOC);
// 10:00:00->10:00
foreach ($events as $key => $event) {
	$events[$key]["start_time"] = substr($event["start_time"], 0, 5);
}



$dates = [];
for ($i=1; $i<=31; $i++){
	$dates[] = $i;
};

$dates[] = null;
$dates[] = null;
$dates[] = null;
$dates[] = null;

?>

<script>
	var events = <?= json_encode($events, JSON_NUMERIC_CHECK) ?>
</script>