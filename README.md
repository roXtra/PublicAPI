# PublicAPI


Examples can be found in the `/Examples` folder.  
The VSCode module [httpYac](https://open.vscode.dev/Anweber/httpyac) is used to execute all requests inline.

All examples are `http` files but markdown code blocks with the `http` tag are also recognized.


An authorization request could be done like this, additional information can be found in the [introduction](./Introduction.http):

```http
@host = {{protocol}}://{{baseurl}}/Roxtra/api/roxApi.svc/rest

GET /Authenticate
Accept: application/json
Authorization: Basic {{username}} {{password}}
```