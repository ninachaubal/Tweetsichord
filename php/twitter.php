<?
header('Content-type: application/json');
if(isset($_GET['q'])){
    $url = "http://search.twitter.com/search.json?q=" . urlencode($_GET['q]);
    $json = file_get_contents($url);
    echo $json;
}
?>