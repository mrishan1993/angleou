# Angelou 
This is the backend microservice for handling login functionality. This has to be a plug and play service. First used to be with Stuti :heart: project for social network. It handles Facebook OAuth, Google OAuth and Native logins. 

It contains routes to create end points for the front end services and controllers to create business logic. Configurations store all the key and passwords. 

Migrations are needed to be regularly updated when there are changes in the database schema. Will employ MySQL and Mongo. 

#### Coding Conventions 

- Functions are to be named with PascalCasing. 
	- Functions are controllers and routes. 
- Variables are to be named with camelCasing. 
	- Variables are to be declared at the top of the function scope. 
	- Global variables are to be declared at the top of the file. 
- API keys from third parties are handled with snake_casing .
- Use proper meaningful names. 
- Remember to put sanity checks. 
- Comment as much as you can. Comments are the soul of the application. 

***Inception by Ishan Gupta. That's all folks for now!***