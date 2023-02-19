# Permissions Plugin

## Permissions

Permissions are defined are strings with dots for categorization.

For example:

```js
"dosomething"
"posts.create"
"posts.comments.reply"
```

Permissions can have a "*" to signify the user has every permission in a category:

```js
"posts.*"
    includes:
    - "posts.comments"
    - "posts.create"
    - "posts.likes.remove"
```

## Using the middleware

First, import the plugin. Then register it using `CommandHandler#use`

```js
import { Permissions } from "string-commands/permissions";

// ...

handler.use(Permissions());
```

By default, the plugin fetches user permissions from CustomContext. If the permissions are in any of these paths:

-

Then you can skip the next part.

### Get user permissions using CustomContext

When creating the middleware, you can pass an object of options into `Permissions`.

```js
handler.use(Permissions({
    getPermissions: async () => {},
}));
```

The `getPermissions` function property should return the user/entity's posessed permissions.

For example:

```js
handler.use(Permissions({
    getPermissions: async () => {},
}));
```
