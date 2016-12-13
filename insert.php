<?php

$desc = $_POST['desc'];
$volume = $_POST['volume'];
$contact = $_POST['contact'];
$geom = $_POST['y'] . ' ' . $_POST['x'];
$img =  $_FILES['file']['tmp_name'];
$targetPath = 'upload/'.$_FILES['file']['name'];
move_uploaded_file($img, $targetPath);

try {
    $config = parse_ini_file('config/db_pgsql.ini');
    
    $connection = new PDO('pgsql:dbname='.$config['dbname'].
            ';host='.$config['host'].
            ';user='.$config['username'].
            ';password='.$config['password']);
    $sql = "INSERT INTO site (description, date_added, volume, path, contact, geom) VALUES (:description, LOCALTIMESTAMP, :volume, :path, :contact, ST_GeomFromText('POINT($geom)', 3857))";
    
    $stmt = $connection->prepare($sql);
    
    $stmt->bindParam('path', $targetPath);
    $stmt->bindParam('description', $desc);
    $stmt->bindParam('volume', $volume);
    $stmt->bindParam('contact', $contact);
    //$stmt->bindParam('geom', $geom);
    $success = $stmt->execute();
    
    if ($success) {
        $retMsg = '{"success": true}';
    } else {
        $retMsg = '{"success": false}';
    }
    echo $retMsg;
} catch (\PDOException $e) {
    print $e->getMessage();
}