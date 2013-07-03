<?php

include("../formats.php");

$aa = file_get_contents('index.html');

$example = "";
if (array_key_exists('e', $_GET)) {
  $sections = explode("\n@\n", file_get_contents('../materials.html'));
  $ix = 1;
  while ($ix <= $_GET['e']) {
    $a = explode("/@", $sections[$ix]);
    $example = $a[0];
    $ix++;
  }
}

$example = format_argument_as_source($example);

$aa = str_replace('</textarea>', $example.'</textarea>', $aa);
echo $aa;

?>
