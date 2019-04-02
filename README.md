# Express Chess

Express chess uses Vue for the front end and Node, Express, and Mongo on the back end.

## The Pieces
### Classes and Objects
Each piece has it's own class, inheriting from the Piece class which holds the shared functions and data. All the pieces use a Check Once and Check Recursively function within Piece to gather an array of their possible moves / moves they could make if not blocked. 
### Possible Moves and Blocked Paths
After every move, the back-end runs through every piece to determine if the move's start and end are included in each pieces possible or blocked, if so they're recalculated. This way data is only updated when needed and we don't have to wait for every piece to recalculate it's path.

## Rest API

The Mongo data base holds a few different sets of information. To begin with, Match-Makers are created when a player searches for a game. Each has a unique ID which is saved on both front-ends and used to identify the right Game Data, Chat, Active-Tracker and Opponent Selection Data. Each of which has their own collection within the Database.

## End Game
### Check and Stalemate
With an array of the opposing teams possible moves, Check is returned true if any of their moves attack the king's position. Stalemate is simply when the team has no possible moves.
### Check Mate
Check Mate is a bit more complicated. It involves not only checking if the king is safe and if his possible moves are safe, but also checking if his team can either kill the endangering piece, or block its path. Finding the endangering piece and it's path is crucial. 
### The Invisible King
An issue arrose when I was simply checking if a king could move to adjacent squares where his opponent couldn't. Say a Queen is on the bottom left, and the enemy King is on the bottom center. The program might THINK the King can move one space away from her, since the Queen's possible moves doesn't include the square after the king.

As a result I edited the Check Recursively function to store one more value past it's end, and only accessed that data when checking for king's possible moves. This allowed the program to understand that if the king moves, his move would endanger him.

## Previous Data Structures
### Array of Arrays
When I first started this project, the data for piece positions used for all logic was just an array of arrays of strings, with piece ID's. This made switching pawns to queens very easy, but presented a huge issue for deciding if a team was in Check Mate. Heavy calculations were made each move to decide if it was a valid move. It allowed me to easily move the piece, check if the king was safe, and deny the move if he wasn't.

However after so much frustration with the disorganized nature of that method, I opted to refactor and start from scratch with a new system. It was well worth it to work with Classes, although I discovered my Objects were getting stripped down to their instance variables when transfered to the API, so I had to create a system by which I could transform objects into sendable data, and reinstance them as Objects of a Class when they reached either end. Can't even say how long it took me to realize that was the issue.

## CS 260 BYU
I've only been a CS major for eight months now but I've been loving every second. I put my time and passion into each project and hope you enjoy! My web design class has really been the creative unleash that I've needed with this major. Be sure to check out my other game!

[Sovereign 2](http://sovereign2.andrewdanielyoung.com/)

Hope to release a lot more this upcoming summer.

## Additional Functionality

I'm working on updating the code to include the following.

- Tracking that both players are present.
- Rejoining Games by ID
- Spectating Games - (Chat Available if joined with ID)
