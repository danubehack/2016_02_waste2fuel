<?php

$imageId = 10;
if (array_key_exists('id', $_POST)) {
    $imageId = $_POST['id'];
}

try {
    $config = parse_ini_file('config/db_pgsql.ini');
    
    $connection = new PDO('pgsql:dbname='.$config['dbname'].
            ';host='.$config['host'].
            ';user='.$config['username'].
            ';password='.$config['password']);
    IF (isset($imageId)) {
        $sql = 'SELECT image FROM site WHERE id = :id';
    } else {
        $sql = 'SELECT image FROM site';
    }
    
    $stmt = $connection->prepare($sql);
    
    if (isset($imageId)) {
        $stmt->bindParam('id', $imageId);
    }
    
    $success = $stmt->execute();
    if ($success) {
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    //return $result;
    var_dump($result);
} catch (\PDOException $e) {
    print $e->getMessage();
}