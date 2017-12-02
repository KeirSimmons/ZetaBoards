/*
Open-source, free to use. Find more modifications at https://github.com/KeirSimmons/ZetaBoards
Modification: Remove "Users Viewing" from forum view
*/

$("td.c_cat-views").each(function(){
  $(this).html(
    $(this).html().replace(/<br>.*/,"")
  );
});
