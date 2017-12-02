# Simple ZetaBoards Modifications

## Introduction

All modifications here are 100% open-source and free to use. These were created by me for the ZetaBoards forum community between 2007-2014 period both as a member and volunteer on the "Code Team".

Over this period, I created 100+ modifications and I will be slowly porting these to GitHub over time.

## Installation Instructions

Each modification exists within its own directory, for example `RemoveUsersViewing`. There is a `README.md` file in each of these directories which have installation instructions, usually pertaining to the where the modification needs to be placed in the `Admin CP`. Note that `.js` (JavaScript) files need to be wrapped in `script` tags.

For example, if the code in the `.js` file is:

~~~~
console.log("Hello, world!");
~~~~

Then it must be wrapped as such:

~~~~
<script>
//<![CDATA[

console.log("Hello, world!");

//]]>
</script>
~~~~

## Support

Please use the [Official ZetaBoards Support Forum][1] if you require assistance with installation.

If you find a bug, or have a update suggestion, please open an issue.

## Contributions

Please feel free to fork, make your own changes and submit a pull request for open issues. That being said, if you have a suggestion that you want to implement, please first open the issue before making the changes.

[1]: http://support.zathyus.com/
