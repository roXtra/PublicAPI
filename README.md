# PublicAPI

This repo uses [httpYac](https://httpyac.github.io) to make REST calls to the roXtra API.  
Requests can be made with ease and can be exexcuted from VSCode.  
  
An introduction on how to perform requests and what else is possible, can be found [here](./Introduction.http).

### Short Intro

* [httpYac](https://marketplace.visualstudio.com/items?itemName=anweber.vscode-httpyac) is a VSCode Extension which can be used to directly send requests from the editor.
* [httpBook](https://marketplace.visualstudio.com/items?itemName=anweber.httpbook) allows editing http files as a jupyter notebook. Markdown comments can be mixed with REST requests and responses will be saved. Responses can be cleared by deleting their cell.

Examples can be found in the [/Examples](/Examples) folder.  

All examples are `http` files but markdown code blocks with the `http` tag are also recognized.


An authorization request could be done like this, additional information can be found in the [introduction](./Introduction.http):

```http
@protocol = https
@baseurl = localhost
@username = administrator
@password = admin

@host = {{protocol}}://{{baseurl}}/Roxtra/api/roxApi.svc/rests

GET /Authenticate
Accept: application/json
Authorization: Basic {{username}} {{password}}
```


## Authentication Flow

If you want to test the authentication flow with Azure and roXtra, you can follow [this](/Examples/AzureAuthentication/README.md) example.