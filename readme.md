# Tic Tac Toe Assembler
To test my code and software skills I was given the assignment to create a tic tac toe game you can play in the browser that will save the played game in a database so that it can be fed to a machine learning algorithm.

In this readme I will try to explain basic thoughts about how I solved the assignment.

## Thoughts
When I read through the assignment I saw that it should be able to be played by two players with a turn based game. Of course the game ends when either one of the two players (X or O) wins or when the game ends in a draw.

This instantly made me think about using websockets to make the game real-time. This way both players will see the changes instantly and made sure the game is only for that specific session. In order to make this game dynamic I made sure that you can start a new game yourself or join a game by entering a game id. 

To make sure that not all the connections listen to all the messages the websocket sends I made sure that the messages are only sent to the specific game id. This way the game is only for the players that are in that specific game. By using the game id I also made sure that once both player slots are filled you are not able to join anymore.

For the database I decided to use MongoDB. Why i went for a non relational database is because it can store data very quickly and does not require different SQL rules. This way I can store the game data in a very simple way and can easily retrieve it when needed.

The ID is generated using UUID making sure it will be unique for every game!

The front-end is build using React and javascript and for the back-end I used Node.js and Typescript.

> Made by: [Jules Koster](https://github.com/julesk1702) on 2024-27-11