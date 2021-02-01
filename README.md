# GESCO care Backend

## Description

The Gesco care backend consists of _Nodejs_ running an _Express_ web server. A RESTful API is exposed through this web server.  
Behind the scenes it is using _Lowdb_ to store data locally in a json format. This is very usefull for testing and demonstration purposes, but should be replaced by a real database (i.e. _MongoDB_ or _MySQL_) in a production environment.

## Running the Server

To actually run the server you need to have _Nodejs_ installed. Then simply run the command `npm install` and then start the server with either `npm start` or `npm run dev`.

## API Overview

### Open Endpoints

Open endpoints require no authentication.

- Register: `POST /register`
- Login: `POST /login`

### Endpoints that require Authentication

Closed endpoints require a valid token to be included in the request. A token can be acquired from the _Register_ or _Login_ calls above.

- Show personal info: `GET /me`

## API Details

### Login

Used to get a recieve a token for a registered user.

URL: `/login`  
Method: `POST`  
Authentication required: NO

**Data Constraints**

```json
{
  "usernameOrEmail": "[valid username or email address]",
  "password": "[password in plain text]"
}
```

**Data Example**

```json
{
  "usernameOrEmail": "bob@gmail.com",
  "password": "abcdefg12345"
}
```

**Success Response**  
Code: `200 OK`  
Content example:

```json
{
  "token": "93144b288eb1fdccbe46d6fc0f241a51766ecd3d"
}
```

**Error Response**  
Condition: If _usernameOrEmail_ or _password_ is wrong in combination or the user does not exsist.  
Code: `400 BAD REQUEST`  
Content example:

```json
{
  "error": "user does not exist"
}
```
