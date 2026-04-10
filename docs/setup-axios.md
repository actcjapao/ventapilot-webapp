# Setting up Axios

In wiring up the frontend(React.js) and backend(Laravel), we might need a plain JavaScript route call similar to plain
SPA applications in integrating backend services instead on relying on form submissions. To achieve this, the recommended approach is to use `axios`. While Laravel installs `axios` by default, we need to ensure that everything is setup properly.

### 1) Add `csrf meta` tag in `app.blade.php`

```html
<!DOCTYPE html>
<html lang="en">
   <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="ie=edge" />
      <!-- Add this meta tag 👇 -->
      <meta name="csrf-token" content="{{ csrf_token() }}" />
      <title>Document</title>
      @viteReactRefresh @vite('resources/js/app.tsx') @inertiaHead
      @vite('resources/css/app.css')
   </head>

   <body>
      @inertia
   </body>
</html>
```

### 2) Make sure this exists:

`resources/js/bootstrap.js`:

This is the default `/bootstrap.js` file:

```js
import axios from "axios";
window.axios = axios;

window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
```

So, we need to add extra blocks below to assign the CSRF token from the `csrf meta` tag from `app.blade.php`.

```js
import axios from "axios";
window.axios = axios;

window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

const token = document
   .querySelector('meta[name="csrf-token"]')
   ?.getAttribute("content");

if (token) {
   window.axios.defaults.headers.common["X-CSRF-TOKEN"] = token;
}
```

### 2) Usage

Then, in React.js or any frontend route call:

```js
import axios from "axios";

const handleClick = async () => {
   const { data } = await axios.post("/example-action", {
      foo: "bar",
   });

   console.log(data);
};
```

🔥 No manual CSRF handling per request

## When to use Inertia router instead

### If the action:

- changes page data
- redirects
- returns props
- behaves like a form

👉 use Inertia:

```js
import { router } from "@inertiajs/react";

router.post("/example-action", {
   foo: "bar",
});
```

This keeps history, loading states, errors, etc.

## Quick decision guide

| Use case                          | Best choice    |
| --------------------------------- | -------------- |
| Page navigation                   | Inertia router |
| Form submissions                  | Inertia router |
| Toggle / save / background action | Axios / fetch  |
| Polling / useEffect               | Axios / fetch  |
| Public API                        | `api.php`      |
