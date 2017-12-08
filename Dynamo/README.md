## Information

ZetaBoards Dynamo, or Dynamo for short, is the most advanced and largest modification I created for ZetaBoards. It started out in 2008 when I first began to dabble in PHP and JavaScript, and through many iterations ended in this version of Dynamo. The source code was never originally released, however in an effort to make everything open-sourced, I am uploading it here to GitHub for those who may be interested.

Dynamo's core functionality adds an advanced plug-and-play module capability to ZetaBoards forums. Various modules and plugins were added alongside this, such as money systems, reputation systems, etc etc and gave admins complete flexibility over which modules they wanted to incorporate on their forum. The most difficult part about this code is, PHP is not allowed on ZetaBoards. Instead, the main JavaScript file does the grunt work, scraping the page for necessary data, and 'throwing' this over to an external PHP script which handles database management etc. Various tricks were incorporated over the years to make this as smooth as possible, and the final system worked flawlessly with over half a million people using the script. Unfortunately a recent change in the database structure of ZetaBoards (unforeseeable) resulted in a bug across some forums. Technical details: The ID number of members was no longer kept unique over the entire ZetaBoards system, but rather over each server (of which ZetaBoards has approximately 16). Dynamo treats member IDs as 100% unique, and so unfortunately this can prevent data from being stored accurately for some members. This is a bug that I have wanted to fix, but due to the way the database was handled, is quite difficult without much restructuring. If I ever have the time to do this myself, I would much prefer to re-write the code using Python rather than PHP, and fix this issue at the same time.

## Usage

Please note that this repository is far from complete. The codes have literally just been downloaded via FTP and dumped here, there has been no effort in cleaning up unused/redundant code, adding additional comments etc. However, please feel free to use this for learning purposes (note the PHP code is far from perfect, but the JavaScript is much cleaner). Note also that this code has been developed to store multiple instances of Dynamo in parallel (i.e. support for multiple forums using the code). In the future if I have the time I will add in the database table creation queries, and maybe also release a forum-specific version that you can host yourself. For now, the code is here just for learning and documentation purposes.

Any questions, shoot me a message.

## Stats

* Over 500,000 people using a version of Dynamo currently.
* Almost 50,000 lines of PHP and JavaScript code
* Culmination of over 6 years of work, with the code-base re-written from scratch 5 times
* Proof I will never be content
* My first modification in PHP - 'deep-end' (started around age of 14/15)
